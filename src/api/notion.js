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
 * 查询字段映射列表
 */
export function listMappings(datasourceId) {
  return request({
    url: `/notion/field/list/${datasourceId}`,
    method: 'get'
  })
}

/**
 * 批量保存字段映射
 */
export function batchSaveMappings(datasourceId, data) {
  return request({
    url: `/notion/field/batch/${datasourceId}`,
    method: 'post',
    data
  })
}
