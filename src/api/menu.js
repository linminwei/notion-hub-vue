import request from '@/utils/request'

/**
 * 查询菜单树
 */
export function getMenuTree() {
  return request({
    url: '/menu/tree',
    method: 'get'
  })
}

/**
 * 查询当前用户的菜单树
 */
export function getUserMenuTree() {
  return request({
    url: '/menu/user/tree',
    method: 'get'
  })
}

/**
 * 查询所有菜单
 */
export function getAllMenus() {
  return request({
    url: '/menu/all',
    method: 'get'
  })
}

/**
 * 新增菜单
 */
export function addMenu(data) {
  return request({
    url: '/menu',
    method: 'post',
    data
  })
}

/**
 * 更新菜单
 */
export function updateMenu(data) {
  return request({
    url: '/menu',
    method: 'put',
    data
  })
}

/**
 * 删除菜单
 */
export function deleteMenu(id) {
  return request({
    url: `/menu/${id}`,
    method: 'delete'
  })
}
