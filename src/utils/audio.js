import { AUDIO_FORMATS, QUALITY_ICONS, QUALITY_LABELS } from '@/constants/audio'

/**
 * 音频相关工具函数
 */

/**
 * 格式化时长（秒 -> MM:SS）
 * @param {number} seconds 时长（秒）
 * @returns {string} 格式化后的时长
 */
export function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '--'
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

/**
 * 格式化文件大小
 * @param {number} bytes 文件大小（字节）
 * @returns {string} 格式化后的文件大小
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return '--'
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`
}

/**
 * 获取文件扩展名
 * @param {string} filename 文件名
 * @returns {string} 文件扩展名（小写）
 */
export function getFileExtension(filename) {
  if (!filename) return ''
  const lastDotIndex = filename.lastIndexOf('.')
  if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
    return ''
  }
  return filename.substring(lastDotIndex + 1).toLowerCase()
}

/**
 * 验证是否为支持的音频格式
 * @param {string} filename 文件名
 * @returns {boolean} 是否支持
 */
export function isSupportedAudioFormat(filename) {
  const extension = getFileExtension(filename)
  return AUDIO_FORMATS.SUPPORTED.includes(extension)
}

/**
 * 验证是否为无损音频格式
 * @param {string} filename 文件名
 * @returns {boolean} 是否为无损格式
 */
export function isLosslessFormat(filename) {
  const extension = getFileExtension(filename)
  return AUDIO_FORMATS.LOSSLESS.includes(extension)
}

/**
 * 获取音质图标
 * @param {string} quality 音质标签
 * @returns {string} 音质图标Base64
 */
export function getQualityIcon(quality) {
  switch (quality) {
    case QUALITY_LABELS.HI_RES:
      return QUALITY_ICONS.HI_RES
    case QUALITY_LABELS.CD_PLUS:
      return QUALITY_ICONS.CD_PLUS
    default:
      return QUALITY_ICONS.STANDARD
  }
}

/**
 * 计算总时长
 * @param {Array} tracks 音轨列表
 * @returns {string} 格式化后的总时长
 */
export function calculateTotalDuration(tracks) {
  if (!tracks || tracks.length === 0) return '--'
  const total = tracks.reduce((sum, track) => sum + (track.duration || 0), 0)
  return formatDuration(total)
}

/**
 * 计算总大小
 * @param {Array} tracks 音轨列表
 * @returns {string} 格式化后的总大小
 */
export function calculateTotalSize(tracks) {
  if (!tracks || tracks.length === 0) return '--'
  const total = tracks.reduce((sum, track) => sum + (track.fileSize || 0), 0)
  return formatFileSize(total)
}

/**
 * 格式化比特率
 * @param {string|number} bitrate 比特率
 * @returns {string} 格式化后的比特率
 */
export function formatBitrate(bitrate) {
  if (!bitrate) return '--'
  return typeof bitrate === 'string' ? `${bitrate} kbps` : `${bitrate} kbps`
}

/**
 * 格式化采样率
 * @param {string|number} sampleRate 采样率
 * @returns {string} 格式化后的采样率
 */
export function formatSampleRate(sampleRate) {
  if (!sampleRate) return '--'
  const rate = typeof sampleRate === 'string' ? parseInt(sampleRate) : sampleRate
  
  // 转换为 kHz
  if (rate >= 1000) {
    return `${(rate / 1000).toFixed(1)} kHz`
  }
  return `${rate} Hz`
}

/**
 * 格式化位深度
 * @param {string|number} bitDepth 位深度
 * @returns {string} 格式化后的位深度
 */
export function formatBitDepth(bitDepth) {
  if (!bitDepth) return '--'
  return typeof bitDepth === 'string' ? `${bitDepth} bit` : `${bitDepth} bit`
}

/**
 * 生成专辑封面占位图
 * @param {string} albumName 专辑名称
 * @returns {string} 占位图SVG（Base64）
 */
export function generateCoverPlaceholder(albumName = '未知专辑') {
  const firstChar = albumName.charAt(0)
  const svg = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#f0f0f0"/>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
            font-size="80" font-family="Arial, sans-serif" fill="#999">
        ${firstChar}
      </text>
    </svg>
  `
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
}

/**
 * 验证文件大小
 * @param {File} file 文件对象
 * @param {number} maxSize 最大大小（字节）
 * @returns {boolean} 是否符合要求
 */
export function validateFileSize(file, maxSize) {
  return file && file.size <= maxSize
}

/**
 * 批量验证文件
 * @param {FileList|Array} files 文件列表
 * @param {Object} options 验证选项
 * @returns {Object} 验证结果
 */
export function validateFiles(files, options = {}) {
  const { maxSize, maxCount } = options
  const errors = []
  
  if (!files || files.length === 0) {
    errors.push('未选择任何文件')
    return { valid: false, errors }
  }
  
  if (maxCount && files.length > maxCount) {
    errors.push(`文件数量超过限制（最多${maxCount}个）`)
  }
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    
    if (maxSize && !validateFileSize(file, maxSize)) {
      errors.push(`${file.name} 文件大小超过限制（最大${formatFileSize(maxSize)}）`)
    }
    
    if (!isSupportedAudioFormat(file.name)) {
      errors.push(`${file.name} 不是支持的音频格式`)
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
