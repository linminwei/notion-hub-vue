/**
 * Notion相关API
 */
import request from '@/utils/request'
import { API_PATHS } from '@/constants/index'

/**
 * 分页查询数据源
 */
export function pageDatasource(data) {
  return request({
    url: API_PATHS.NOTION.DATASOURCE.PAGE,
    method: 'get',
    data
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
