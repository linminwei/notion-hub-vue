import request from '@/utils/request'

/**
 * 解析音频文件元数据
 */
export function parseAudioFiles(files) {
  const formData = new FormData()
  files.forEach(file => {
    formData.append('files', file)
  })
  
  return request({
    url: '/audio/parse',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 600000 // 10分钟超时，适用于大文件上传
  })
}

