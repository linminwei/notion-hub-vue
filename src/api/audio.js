import request from '@/utils/request'
import { FILE_LIMITS } from '@/constants/audio'

/**
 * 解析音频文件元数据
 */
export function parseAudioFiles(files) {
  const formData = new FormData()
  files.forEach(file => {
    formData.append('files', file)
  })
  
  return request({
    url: '/audio/analysis',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: FILE_LIMITS.UPLOAD_TIMEOUT
  })
}

