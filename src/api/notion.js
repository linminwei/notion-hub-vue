/**
 * Notion相关API
 */
import request from '@/utils/request'
import { API_PATHS } from '@/constants/index'

/**
 * 分页查询数据源
 */
export function pageDatasource(params) {
  return request({
    url: API_PATHS.NOTION.DATASOURCE.PAGE,
    method: 'get',
    params
  })
}

/**
 * 新增数据源
 */
export function addDatasource(data) {
  return request({
    url: API_PATHS.NOTION.DATASOURCE.ADD,
    method: 'post',
    data
  })
}

/**
 * 更新数据源
 */
export function updateDatasource(data) {
  return request({
    url: API_PATHS.NOTION.DATASOURCE.UPDATE,
    method: 'put',
    data
  })
}

/**
 * 删除数据源
 */
export function deleteDatasource(id) {
  return request({
    url: `/notion/datasource/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 测试连接
 */
export function testConnection(data) {
  return request({
    url: '/notion/datasource/test',
    method: 'post',
    data
  })
}

/**
 * 音乐同步到Notion
 */
export function syncMusicToNotion(formData) {
  return request({
    url: '/notion/music/sync',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 60000 // 60秒超时，因为可能需要上传多个文件
  })
}
