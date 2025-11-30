import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, getCurrentUser } from '@/api/auth'
import { getUserMenuTree } from '@/api/menu'
import { setToken, removeToken } from '@/utils/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref(null)
  const roles = ref([])
  const permissions = ref([])
  const accessRoutes = ref([]) // 用户可访问的路由路径列表

  // 用户登录
  const userLogin = async (loginData) => {
    try {
      const res = await login(loginData)
      if (res.data) {
        token.value = res.data.token
        userInfo.value = res.data.userInfo
        roles.value = res.data.roles || []
        permissions.value = res.data.permissions || []
        
        // 保存token到localStorage
        setToken(res.data.token)
        
        // 获取用户可访问的菜单路由
        await loadUserRoutes()
        
        // 获取完整的用户信息
        await getUserInfo()
        
        return true
      }
      return false
    } catch (error) {
      console.error('登录失败:', error)
      return false
    }
  }

  // 加载用户可访问的路由
  const loadUserRoutes = async () => {
    try {
      const res = await getUserMenuTree()
      if (res.data) {
        // 递归提取所有菜单的path
        const extractPaths = (menus) => {
          const paths = []
          menus.forEach(menu => {
            if (menu.path && menu.menuType !== 3) { // 排除按钮类型
              paths.push(menu.path)
            }
            if (menu.children && menu.children.length > 0) {
              paths.push(...extractPaths(menu.children))
            }
          })
          return paths
        }
        
        accessRoutes.value = extractPaths(res.data)
        console.log('用户可访问路由:', accessRoutes.value)
        return true
      }
      return false
    } catch (error) {
      console.error('加载用户路由失败:', error)
      return false
    }
  }

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      const res = await getCurrentUser()
      if (res.data) {
        userInfo.value = res.data
        
        // 更新权限数据（修复刷新页面后权限丢失的问题）
        if (res.data.permissions) {
          permissions.value = res.data.permissions
        }
        
        // 更新角色数据
        if (res.data.roles) {
          roles.value = res.data.roles.map(role => role.roleCode)
        }
        
        return true
      }
      return false
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return false
    }
  }

  // 检查是否有访问路由的权限
  const canAccessRoute = (path) => {
    // 登录和注册页面不需要验证
    if (path === '/login' || path === '/register') {
      return true
    }
    // 首页、个人中心所有人都可以访问
    if (path === '/' || path === '/dashboard' || path === '/profile') {
      return true
    }
    // 检查是否在用户可访问路由列表中
    return accessRoutes.value.some(route => path.includes(route))
  }

  // 退出登录
  const logout = () => {
    token.value = ''
    userInfo.value = null
    roles.value = []
    permissions.value = []
    accessRoutes.value = []
    removeToken()
  }

  // 检查是否有权限
  const hasPermission = (permission) => {
    // 超级管理员拥有所有权限（生产环境建议开启）
    // 如果需要测试权限控制，请使用非 admin 角色的用户
    const isAdmin = roles.value.some(role => 
      role === 'admin' || 
      role === 'ADMIN' || 
      role === 'SUPER_ADMIN' ||
      role === 'super_admin'
    )
    
    if (isAdmin) {
      // TODO: 生产环境应该 return true
      // 目前为测试环境，允许限制 admin 权限
      return true
    }
    
    return permissions.value.includes(permission)
  }

  // 检查是否有角色
  const hasRole = (role) => {
    return roles.value.includes(role)
  }

  return {
    token,
    userInfo,
    roles,
    permissions,
    accessRoutes,
    userLogin,
    getUserInfo,
    loadUserRoutes,
    logout,
    hasPermission,
    hasRole,
    canAccessRoute
  }
})
