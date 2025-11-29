import axios from 'axios'
import { message } from 'ant-design-vue'
import router from '@/router'

// ============ 常量定义 ============
const TIMEOUT = 15000
const HTTP_CODE_UNAUTHORIZED = 401
const HTTP_CODE_SUCCESS = 200
const ERROR_MESSAGE = '请求失败'

// ============ 创建 axios 实例 ============
const request = axios.create({
  baseURL: '/api',
  timeout: TIMEOUT
})

// ============ 请求拦截器 ============
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// ============ 响应拦截器 ============
request.interceptors.response.use(
  response => handleResponse(response),
  error => handleError(error)
)

/**
 * 处理成功响应
 */
function handleResponse(response) {
  const res = response.data
  
  if (res.code !== HTTP_CODE_SUCCESS) {
    handleResponseError(res.code, res.message)
    return Promise.reject(new Error(res.message || ERROR_MESSAGE))
  }
  
  return res
}

/**
 * 处理响应错误
 */
function handleResponseError(code, msg) {
  message.error(msg || ERROR_MESSAGE)
  
  if (code === HTTP_CODE_UNAUTHORIZED) {
    clearAuthAndRedirect()
  }
}

/**
 * 处理请求错误
 */
function handleError(error) {
  if (error.response?.status === HTTP_CODE_UNAUTHORIZED) {
    message.error('登录已过期,请重新登录')
    clearAuthAndRedirect()
  } else {
    message.error(error.message || '网络错误')
  }
  
  return Promise.reject(error)
}

/**
 * 清除认证信息并跳转到登录页
 */
function clearAuthAndRedirect() {
  localStorage.removeItem('token')
  router.push('/login')
}

export default request
