/**
 * 权限指令
 * 用于控制元素的显示/隐藏基于用户权限
 */
import { useUserStore } from '@/stores/user'

export default {
  mounted(el, binding) {
    const { value } = binding
    
    if (!value) {
      return
    }
    
    const userStore = useUserStore()
    const permissions = userStore.permissions || []
    
    // 支持字符串或数组
    const hasPermission = Array.isArray(value)
      ? value.some(permission => permissions.includes(permission))
      : permissions.includes(value)
    
    if (!hasPermission) {
      el.parentNode?.removeChild(el)
    }
  }
}
