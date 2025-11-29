/**
 * 响应式设计组合式函数
 * 提供全局的响应式状态和工具方法
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'

// 断点定义
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1440
}

// 全局响应式状态（单例模式）
let globalScreenWidth = null
let globalIsMobile = null
let globalIsTablet = null
let globalIsDesktop = null

export function useResponsive() {
  // 初始化全局状态（只在第一次调用时）
  if (globalScreenWidth === null) {
    globalScreenWidth = ref(window.innerWidth)
    globalIsMobile = computed(() => globalScreenWidth.value < BREAKPOINTS.MOBILE)
    globalIsTablet = computed(() => 
      globalScreenWidth.value >= BREAKPOINTS.MOBILE && 
      globalScreenWidth.value < BREAKPOINTS.TABLET
    )
    globalIsDesktop = computed(() => globalScreenWidth.value >= BREAKPOINTS.TABLET)

    // 窗口大小改变监听
    const handleResize = () => {
      globalScreenWidth.value = window.innerWidth
    }

    // 添加监听器
    window.addEventListener('resize', handleResize)
    
    // 清理函数（在应用卸载时调用）
    window.__removeResizeListener = () => {
      window.removeEventListener('resize', handleResize)
    }
  }

  return {
    // 响应式状态
    screenWidth: globalScreenWidth,
    isMobile: globalIsMobile,
    isTablet: globalIsTablet,
    isDesktop: globalIsDesktop,
    
    // 工具方法
    /**
     * 检查是否为移动设备
     */
    checkIsMobile: () => globalIsMobile.value,
    
    /**
     * 检查是否为平板
     */
    checkIsTablet: () => globalIsTablet.value,
    
    /**
     * 检查是否为桌面
     */
    checkIsDesktop: () => globalIsDesktop.value,
    
    /**
     * 获取当前设备类型
     * @returns {'mobile' | 'tablet' | 'desktop'}
     */
    getDeviceType: () => {
      if (globalIsMobile.value) return 'mobile'
      if (globalIsTablet.value) return 'tablet'
      return 'desktop'
    },
    
    /**
     * 根据设备类型返回不同的值
     * @param {Object} values - { mobile, tablet, desktop }
     */
    responsive: (values) => {
      if (globalIsMobile.value) return values.mobile
      if (globalIsTablet.value) return values.tablet || values.mobile
      return values.desktop || values.tablet || values.mobile
    },
    
    /**
     * 获取表格滚动配置
     */
    getTableScroll: () => {
      if (globalIsMobile.value) return { x: 'max-content' }
      if (globalIsTablet.value) return { x: 1000 }
      return undefined
    },
    
    /**
     * 获取表格列配置（移动端隐藏某些列）
     * @param {Array} columns - 表格列配置
     * @param {Array} hideOnMobile - 在移动端隐藏的列key
     * @param {Array} hideOnTablet - 在平板端隐藏的列key
     */
    getResponsiveColumns: (columns, hideOnMobile = [], hideOnTablet = []) => {
      return columns.map(col => {
        const newCol = { ...col }
        
        if (globalIsMobile.value && hideOnMobile.includes(col.key)) {
          newCol.className = 'hide-on-mobile'
        } else if (globalIsTablet.value && hideOnTablet.includes(col.key)) {
          newCol.className = 'hide-on-tablet'
        }
        
        return newCol
      })
    },
    
    /**
     * 获取分页配置
     */
    getPaginationConfig: (total, current = 1, pageSize = 10) => {
      const baseConfig = {
        total,
        current,
        pageSize,
        showSizeChanger: !globalIsMobile.value,
        showQuickJumper: !globalIsMobile.value,
      }
      
      if (globalIsMobile.value) {
        return {
          ...baseConfig,
          simple: true,
          size: 'small'
        }
      }
      
      return baseConfig
    }
  }
}

/**
 * 媒体查询Hook
 * @param {string} query - CSS媒体查询字符串
 * @returns {ref<boolean>}
 */
export function useMediaQuery(query) {
  const matches = ref(false)
  let mediaQuery = null

  const updateMatches = (e) => {
    matches.value = e.matches
  }

  onMounted(() => {
    mediaQuery = window.matchMedia(query)
    matches.value = mediaQuery.matches
    mediaQuery.addEventListener('change', updateMatches)
  })

  onUnmounted(() => {
    if (mediaQuery) {
      mediaQuery.removeEventListener('change', updateMatches)
    }
  })

  return matches
}

/**
 * 触摸设备检测
 */
export function useTouchDevice() {
  const isTouchDevice = ref(false)

  onMounted(() => {
    isTouchDevice.value = (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    )
  })

  return {
    isTouchDevice
  }
}
