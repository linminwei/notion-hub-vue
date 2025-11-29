import request from '@/utils/request'

/**
 * 分页查询用户列表
 */
export function getUserPage(params) {
  return request({
    url: '/user/page',
    method: 'get',
    params
  })
}

/**
 * 新增用户
 */
export function addUser(data) {
  return request({
    url: '/user',
    method: 'post',
    data
  })
}

/**
 * 更新用户
 */
export function updateUser(data) {
  return request({
    url: '/user',
    method: 'put',
    data
  })
}

/**
 * 删除用户
 */
export function deleteUser(id) {
  return request({
    url: `/user/${id}`,
    method: 'delete'
  })
}

/**
 * 查询用户角色
 */
export function getUserRoles(userId) {
  return request({
    url: `/user/${userId}/roles`,
    method: 'get'
  })
}

/**
 * 重置用户密码
 */
export function resetUserPassword(userId) {
  return request({
    url: `/user/${userId}/reset-password`,
    method: 'put'
  })
}

/**
 * 验证当前用户密码
 */
export function verifyPassword(password) {
  return request({
    url: '/user/verify-password',
    method: 'post',
    data: { password }
  })
}

/**
 * 修改当前用户密码
 */
export function changePassword(changePasswordDTO) {
  return request({
    url: '/user/change-password',
    method: 'post',
    data: changePasswordDTO
  })
}

/**
 * 上传用户头像
 */
export function uploadAvatar(formData) {
  return request({
    url: '/user/upload-avatar',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 更新当前用户信息
 */
export function updateCurrentUserInfo(data) {
  return request({
    url: '/user/update-info',
    method: 'put',
    data
  })
}
