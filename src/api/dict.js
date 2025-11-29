import request from '@/utils/request'

/**
 * 分页查询字典类型列表
 */
export function getDictTypePage(params) {
  return request({
    url: '/dict/type/page',
    method: 'get',
    params
  })
}

/**
 * 获取所有字典类型列表（不分页）
 */
export function getAllDictTypes() {
  return request({
    url: '/dict/type/list',
    method: 'get'
  })
}

/**
 * 根据ID获取字典类型
 */
export function getDictTypeById(id) {
  return request({
    url: `/dict/type/${id}`,
    method: 'get'
  })
}

/**
 * 根据字典类型编码获取字典类型
 */
export function getDictTypeByCode(dictCode) {
  return request({
    url: `/dict/type/code/${dictCode}`,
    method: 'get'
  })
}

/**
 * 新增字典类型
 */
export function addDictType(data) {
  return request({
    url: '/dict/type',
    method: 'post',
    data
  })
}

/**
 * 更新字典类型
 */
export function updateDictType(data) {
  return request({
    url: '/dict/type',
    method: 'put',
    data
  })
}

/**
 * 删除字典类型
 */
export function deleteDictType(id) {
  return request({
    url: `/dict/type/${id}`,
    method: 'delete'
  })
}

/**
 * 分页查询字典项列表
 */
export function getDictItemPage(params) {
  return request({
    url: '/dict/item/page',
    method: 'get',
    params
  })
}

/**
 * 根据字典类型ID获取所有字典项（不分页）
 */
export function getDictItemsByTypeId(dictTypeId) {
  return request({
    url: `/dict/item/type/${dictTypeId}`,
    method: 'get'
  })
}

/**
 * 根据ID获取字典项
 */
export function getDictItemById(id) {
  return request({
    url: `/dict/item/${id}`,
    method: 'get'
  })
}

/**
 * 新增字典项
 */
export function addDictItem(data) {
  return request({
    url: '/dict/item',
    method: 'post',
    data
  })
}

/**
 * 更新字典项
 */
export function updateDictItem(data) {
  return request({
    url: '/dict/item',
    method: 'put',
    data
  })
}

/**
 * 删除字典项
 */
export function deleteDictItem(id) {
  return request({
    url: `/dict/item/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除字典项
 */
export function batchDeleteDictItems(ids) {
  return request({
    url: '/dict/item/batch',
    method: 'delete',
    data: ids
  })
}
