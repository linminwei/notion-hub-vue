/**
 * 用户相关API
 */
import request from '@/utils/request'
import { API_PATHS } from '@/constants'

/**
 * 分页查询用户列表
 */
export function getUserPage(params) {
  return request({
    url: API_PATHS.USER.PAGE,
    method: 'get',
    params
  })
}

/**
 * 新增用户
 */
export function addUser(data) {
  return request({
    url: API_PATHS.USER.BASE,
    method: 'post',
    data
  })
}

/**
 * 更新用户
 */
export function updateUser(data) {
  return request({
    url: API_PATHS.USER.BASE,
    method: 'put',
    data
  })
}

/**
 * 删除用户
 */
export function deleteUser(id) {
  return request({
    url: `${API_PATHS.USER.BASE}/${id}`,
    method: 'delete'
  })
}

/**
 * 查询用户角色
 */
export function getUserRoles(userId) {
  return request({
    url: API_PATHS.USER.ROLES(userId),
    method: 'get'
  })
}

/**
 * 重置用户密码
 */
export function resetUserPassword(userId) {
  return request({
    url: API_PATHS.USER.RESET_PASSWORD(userId),
    method: 'put'
  })
}

/**
 * 验证当前用户密码
 */
export function verifyPassword(password) {
  return request({
    url: API_PATHS.USER.VERIFY_PASSWORD,
    method: 'post',
    data: { password }
  })
}

/**
 * 修改当前用户密码
 */
export function changePassword(changePasswordDTO) {
  return request({
    url: API_PATHS.USER.CHANGE_PASSWORD,
    method: 'post',
    data: changePasswordDTO
  })
}

/**
 * 上传用户头像
 */
export function uploadAvatar(formData) {
  return request({
    url: API_PATHS.USER.UPLOAD_AVATAR,
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
    url: API_PATHS.USER.UPDATE_INFO,
    method: 'put',
    data
  })
}
