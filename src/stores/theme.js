import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 主题模式：light 或 dark
  const mode = ref(localStorage.getItem('theme-mode') || 'light')
  
  // 布局配置
  const layoutConfig = ref({
    // 侧边栏是否折叠
    sidebarCollapsed: JSON.parse(localStorage.getItem('sidebar-collapsed') || 'false'),
    // 固定头部
    fixedHeader: true,
    // 显示面包屑
    showBreadcrumb: true,
    // 显示标签页
    showTabs: true
  })

  // 主题颜色配置
  const themeColors = ref({
    light: {
      primary: '#1890ff',
      success: '#52c41a',
      warning: '#faad14',
      error: '#f5222d',
      info: '#1890ff',
      background: '#f0f2f5',
      cardBackground: '#ffffff',
      textPrimary: '#000000d9',
      textSecondary: '#00000073',
      border: '#d9d9d9'
    },
    dark: {
      primary: '#177ddc',
      success: '#49aa19',
      warning: '#d89614',
      error: '#d32029',
      info: '#177ddc',
      background: '#141414',
      cardBackground: '#1f1f1f',
      textPrimary: '#ffffffd9',
      textSecondary: '#ffffff73',
      border: '#434343'
    }
  })

  // 当前主题颜色
  const currentColors = computed(() => themeColors.value[mode.value])

  // 切换主题模式
  const toggleTheme = () => {
    mode.value = mode.value === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme-mode', mode.value)
    applyTheme()
  }

  // 设置主题模式
  const setTheme = (newMode) => {
    mode.value = newMode
    localStorage.setItem('theme-mode', newMode)
    applyTheme()
  }

  // 应用主题
  const applyTheme = () => {
    const html = document.documentElement
    const colors = currentColors.value

    if (mode.value === 'dark') {
      html.classList.add('dark')
      html.setAttribute('data-theme', 'dark')
    } else {
      html.classList.remove('dark')
      html.setAttribute('data-theme', 'light')
    }

    // 设置 CSS 变量
    Object.entries(colors).forEach(([key, value]) => {
      html.style.setProperty(`--theme-${key}`, value)
    })
  }

  // 更新主题颜色
  const updateThemeColor = (colorType, color) => {
    themeColors.value[mode.value][colorType] = color
    applyTheme()
  }

  // 切换侧边栏折叠状态
  const toggleSidebar = () => {
    layoutConfig.value.sidebarCollapsed = !layoutConfig.value.sidebarCollapsed
    localStorage.setItem('sidebar-collapsed', JSON.stringify(layoutConfig.value.sidebarCollapsed))
  }

  // 更新布局配置
  const updateLayoutConfig = (config) => {
    layoutConfig.value = { ...layoutConfig.value, ...config }
    localStorage.setItem('layout-config', JSON.stringify(layoutConfig.value))
  }

  // 初始化主题
  const initTheme = () => {
    // 恢复保存的布局配置
    const savedLayout = localStorage.getItem('layout-config')
    if (savedLayout) {
      layoutConfig.value = JSON.parse(savedLayout)
    }
    applyTheme()
  }

  return {
    mode,
    layoutConfig,
    themeColors,
    currentColors,
    toggleTheme,
    setTheme,
    applyTheme,
    updateThemeColor,
    toggleSidebar,
    updateLayoutConfig,
    initTheme
  }
})
