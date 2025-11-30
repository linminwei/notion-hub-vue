/**
 * HTTP请求工具类
 * 基于axios封装，统一管理请求和响应拦截
 */
import axios from 'axios'
import { message } from 'ant-design-vue'
import router from '@/router'
import { HTTP_STATUS, SYSTEM_CONFIG, ERROR_MESSAGES, STORAGE_KEYS } from '@/constants'
import storage from './storage'

// 创建axios实例
const request = axios.create({
  baseURL: '/api',
  timeout: SYSTEM_CONFIG.TIMEOUT
})

// ============ 请求拦截器 ============
request.interceptors.request.use(
  config => {
    const token = storage.getToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// ============ 响应拦截器 ============
request.interceptors.response.use(
  response => handleSuccessResponse(response),
  error => handleErrorResponse(error)
)

/**
 * 处理成功响应
 */
function handleSuccessResponse(response) {
  const res = response.data

  if (res.code !== HTTP_STATUS.SUCCESS) {
    handleBusinessError(res.code, res.message)
    return Promise.reject(new Error(res.message || ERROR_MESSAGES.REQUEST_FAILED))
  }

  return res
}

/**
 * 处理业务错误
 */
function handleBusinessError(code, msg) {
  message.error(msg || ERROR_MESSAGES.REQUEST_FAILED)

  if (code === HTTP_STATUS.UNAUTHORIZED) {
    handleUnauthorized()
  }
}

/**
 * 处理错误响应
 */
function handleErrorResponse(error) {
  console.error('响应错误:', error)

  if (error.response) {
    const { status, data } = error.response

    switch (status) {
      case HTTP_STATUS.UNAUTHORIZED:
        message.error(ERROR_MESSAGES.LOGIN_EXPIRED)
        handleUnauthorized()
        break
      case HTTP_STATUS.FORBIDDEN:
        message.error(ERROR_MESSAGES.PERMISSION_DENIED)
        break
      case HTTP_STATUS.NOT_FOUND:
        message.error('请求的资源不存在')
        break
      case HTTP_STATUS.SERVER_ERROR:
        message.error(data?.message || '服务器错误')
        break
      default:
        message.error(data?.message || ERROR_MESSAGES.NETWORK_ERROR)
    }
  } else if (error.request) {
    message.error(ERROR_MESSAGES.NETWORK_ERROR)
  } else {
    message.error(error.message || ERROR_MESSAGES.REQUEST_FAILED)
  }

  return Promise.reject(error)
}

/**
 * 处理未授权情况
 */
function handleUnauthorized() {
  storage.clearAuth()
  router.push('/login')
}

export default request
