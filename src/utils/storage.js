/**
 * 存储工具类
 * 统一管理localStorage和sessionStorage操作
 */
import { STORAGE_KEYS } from '@/constants'

class StorageUtil {
  /**
   * 设置localStorage
   */
  setLocal(key, value) {
    try {
      const data = JSON.stringify(value)
      localStorage.setItem(key, data)
    } catch (error) {
      console.error('localStorage设置失败:', error)
    }
  }

  /**
   * 获取localStorage
   */
  getLocal(key) {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('localStorage获取失败:', error)
      return null
    }
  }

  /**
   * 删除localStorage
   */
  removeLocal(key) {
    localStorage.removeItem(key)
  }

  /**
   * 清空localStorage
   */
  clearLocal() {
    localStorage.clear()
  }

  /**
   * 设置sessionStorage
   */
  setSession(key, value) {
    try {
      const data = JSON.stringify(value)
      sessionStorage.setItem(key, data)
    } catch (error) {
      console.error('sessionStorage设置失败:', error)
    }
  }

  /**
   * 获取sessionStorage
   */
  getSession(key) {
    try {
      const data = sessionStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('sessionStorage获取失败:', error)
      return null
    }
  }

  /**
   * 删除sessionStorage
   */
  removeSession(key) {
    sessionStorage.removeItem(key)
  }

  /**
   * 清空sessionStorage
   */
  clearSession() {
    sessionStorage.clear()
  }

  // ============ 业务相关便捷方法 ============

  /**
   * 获取Token
   */
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN)
  }

  /**
   * 设置Token
   */
  setToken(token) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token)
  }

  /**
   * 删除Token
   */
  removeToken() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
  }

  /**
   * 获取用户信息
   */
  getUserInfo() {
    return this.getLocal(STORAGE_KEYS.USER_INFO)
  }

  /**
   * 设置用户信息
   */
  setUserInfo(userInfo) {
    this.setLocal(STORAGE_KEYS.USER_INFO, userInfo)
  }

  /**
   * 删除用户信息
   */
  removeUserInfo() {
    this.removeLocal(STORAGE_KEYS.USER_INFO)
  }

  /**
   * 清除所有认证信息
   */
  clearAuth() {
    this.removeToken()
    this.removeUserInfo()
  }
}

export default new StorageUtil()
