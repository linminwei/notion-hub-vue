import request from '@/utils/request'

/**
 * 分页查询角色列表
 */
export function getRolePage(params) {
  return request({
    url: '/role/page',
    method: 'get',
    params
  })
}

/**
 * 查询所有角色
 */
export function getAllRoles() {
  return request({
    url: '/role/all',
    method: 'get'
  })
}

/**
 * 新增角色
 */
export function addRole(data) {
  return request({
    url: '/role',
    method: 'post',
    data
  })
}

/**
 * 更新角色
 */
export function updateRole(data) {
  return request({
    url: '/role',
    method: 'put',
    data
  })
}

/**
 * 删除角色
 */
export function deleteRole(id) {
  return request({
    url: `/role/${id}`,
    method: 'delete'
  })
}

/**
 * 为角色分配权限
 */
export function assignPermissions(roleId, menuIds) {
  return request({
    url: `/role/${roleId}/permissions`,
    method: 'post',
    data: menuIds
  })
}

/**
 * 获取角色已分配的菜单ID列表
 */
export function getRoleMenuIds(roleId) {
  return request({
    url: `/role/${roleId}/menuIds`,
    method: 'get'
  })
}
