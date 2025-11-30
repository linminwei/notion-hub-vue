import request from '@/utils/request'

/**
 * 分页查询工作区列表
 * - 管理员可查看所有工作区
 * - 普通用户只能查看自己的工作区
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页记录数
 * @param {string} params.name - 工作区名称（不一定需要）
 * @param {number} params.status - 工作区状态（不一定需要）
 */
export function getWorkspacePage(params) {
  return request({
    url: '/notion/workspace/page',
    method: 'get',
    params
  })
}

/**
 * 列出所有工作区
 */
export function listWorkspace() {
  return request({
    url: '/notion/workspace/list',
    method: 'get'
  })
}

/**
 * 查询工作区详情
 */
export function getWorkspace(id) {
  return request({
    url: `/notion/workspace/${id}`,
    method: 'get'
  })
}

/**
 * 新增工作区
 */
export function addWorkspace(data) {
  return request({
    url: '/notion/workspace',
    method: 'post',
    data
  })
}

/**
 * 更新工作区
 */
export function updateWorkspace(data) {
  return request({
    url: '/notion/workspace',
    method: 'put',
    data
  })
}

/**
 * 删除工作区
 */
export function deleteWorkspace(id) {
  return request({
    url: `/notion/workspace/${id}`,
    method: 'delete'
  })
}

/**
 * 分页查询集成区列表
 */
export function pageIntegration(params) {
  return request({
    url: '/notion/integration/page',
    method: 'get',
    params
  })
}

/**
 * 查询集成详情
 */
export function getIntegration(id) {
  return request({
    url: `/notion/integration/${id}`,
    method: 'get'
  })
}

/**
 * 新增集成
 */
export function addIntegration(data) {
  return request({
    url: '/notion/integration',
    method: 'post',
    data
  })
}

/**
 * 更新集成
 */
export function updateIntegration(data) {
  return request({
    url: '/notion/integration',
    method: 'put',
    data
  })
}

/**
 * 删除集成
 */
export function deleteIntegration(id) {
  return request({
    url: `/notion/integration/${id}`,
    method: 'delete'
  })
}
