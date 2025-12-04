/**
 * 音频解析相关常量配置
 */

// 音频文件上传限制
export const FILE_LIMITS = {
  // 单个文件最大大小（200MB）
  MAX_FILE_SIZE: 300 * 1024 * 1024,
  // 批量上传最大文件数
  MAX_FILE_COUNT: 50,
  // 超时时间（10分钟）
  UPLOAD_TIMEOUT: 600000
}

// 支持的音频格式
export const AUDIO_FORMATS = {
  // 支持的格式列表
  SUPPORTED: ['mp3', 'flac', 'wav', 'aiff', 'ape', 'm4a', 'aac', 'ogg', 'wma'],
  // 无损格式
  LOSSLESS: ['flac', 'wav', 'aiff', 'ape'],
  // MIME类型前缀
  MIME_PREFIX: 'audio/'
}

// 音质标签
export const QUALITY_LABELS = {
  HI_RES: 'Hi-Res',
  CD_PLUS: 'CD+',
  STANDARD: '标准'
}

// 音质图标（Base64）
export const QUALITY_ICONS = {
  HI_RES: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCA0OCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iMjQiIHJ4PSI0IiBmaWxsPSIjRkZENzAwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMwMDAwMDAiPkhpLVJlczwvdGV4dD48L3N2Zz4=',
  CD_PLUS: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCA0OCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iMjQiIHJ4PSI0IiBmaWxsPSIjNDA5RUZGIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNGRkZGRkYiPkNEKzwvdGV4dD48L3N2Zz4=',
  STANDARD: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCA0OCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iMjQiIHJ4PSI0IiBmaWxsPSIjNTJDNDFBIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNGRkZGRkYiPlNEPC90ZXh0Pjwvc3ZnPg=='
}

// 表格列配置
export const TABLE_COLUMNS = [
  {
    title: '音轨号',
    key: 'index',
    width: 60,
    align: 'center'
  },
  {
    title: '歌曲名称',
    key: 'title',
    ellipsis: true
  },
  {
    title: '音质',
    key: 'quality',
    width: 100,
    align: 'center'
  },
  {
    title: '流派',
    key: 'genre',
    width: 100,
    align: 'center'
  },
  {
    title: '语种',
    key: 'language',
    width: 100,
    align: 'center'
  },
  {
    title: '时长',
    key: 'duration',
    width: 100,
    align: 'center'
  },
  {
    title: '音频参数',
    key: 'technical',
    width: 280,
    align: 'center'
  },
  {
    title: '文件大小',
    key: 'fileSize',
    width: 120,
    align: 'center'
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
    align: 'center'
  }
]

// 提示消息
export const MESSAGES = {
  NO_FILES: '请先上传音频文件',
  UPLOAD_HINT: '支持多个音频文件上传，支持 MP3、FLAC、WAV 等格式',
  PARSING: '正在上传和解析文件，请耐心等待...',
  PARSE_SUCCESS: '成功解析 {count} 个专辑',
  PARSE_ERROR: '解析失败，请检查文件格式或网络连接',
  TIMEOUT_ERROR: '请求超时，文件可能太大，请尝试减少文件数量',
  INVALID_FILE: '{filename} 不是音频文件'
}
