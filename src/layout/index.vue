<template>
  <a-config-provider :theme="antdTheme">
    <a-layout class="layout-container" :class="{ 'dark-mode': themeStore.mode === 'dark', 'mobile': isMobile }">
      <!-- 移动端：抽屉式侧边栏 -->
      <a-drawer
        v-if="isMobile"
        v-model:open="mobileMenuVisible"
        placement="left"
        :closable="false"
        :width="250"
        :bodyStyle="{ padding: 0 }"
      >
        <div class="logo">
          <img src="@/assets/logo.png" alt="NotionHub" class="logo-image">
        </div>
        <a-menu
          v-model:selectedKeys="selectedKeys"
          v-model:openKeys="openKeys"
          :theme="themeStore.mode"
          mode="inline"
          :items="menuItems"
          @click="handleMobileMenuClick"
        />
      </a-drawer>

      <!-- 桌面端：固定侧边栏 -->
      <a-layout-sider
        v-if="!isMobile"
        v-model:collapsed="themeStore.layoutConfig.sidebarCollapsed" 
        :trigger="null" 
        collapsible
        :theme="themeStore.mode"
        :breakpoint="'lg'"
        @breakpoint="handleBreakpoint"
      >
        <div class="logo">
          <img v-if="!themeStore.layoutConfig.sidebarCollapsed" src="@/assets/logo.png" alt="NotionHub" class="logo-image">
          <img v-else src="@/assets/logo.png" alt="NotionHub" class="logo-image" />
        </div>
        
        <a-menu
          v-model:selectedKeys="selectedKeys"
          v-model:openKeys="openKeys"
          :theme="themeStore.mode"
          mode="inline"
          :items="menuItems"
          @click="handleMenuClick"
        />
      </a-layout-sider>

    <a-layout>
      <a-layout-header class="layout-header" :class="{ 'fixed-header': themeStore.layoutConfig.fixedHeader }">
        <div class="header-left">
          <!-- 移动端：显示菜单按钮 -->
          <menu-outlined
            v-if="isMobile"
            class="trigger mobile-menu-trigger"
            @click="mobileMenuVisible = true"
          />
          <!-- 桌面端：折叠/展开侧边栏 -->
          <template v-else>
            <menu-unfold-outlined
              v-if="themeStore.layoutConfig.sidebarCollapsed"
              class="trigger"
              @click="themeStore.toggleSidebar"
            />
            <menu-fold-outlined
              v-else
              class="trigger"
              @click="themeStore.toggleSidebar"
            />
          </template>
          
          <!-- 面包屑（桌面端显示） -->
          <a-breadcrumb v-if="!isMobile && themeStore.layoutConfig.showBreadcrumb" class="breadcrumb">
            <a-breadcrumb-item>首页</a-breadcrumb-item>
            <a-breadcrumb-item>{{ currentRoute.meta?.title || '页面' }}</a-breadcrumb-item>
          </a-breadcrumb>
        </div>

        <div class="header-right">
          <!-- 主题切换按钮 -->
          <a-tooltip :title="themeStore.mode === 'light' ? '切换至暗色' : '切换至亮色'">
            <a-button 
              type="text" 
              class="theme-toggle"
              @click="themeStore.toggleTheme"
            >
              <template #icon>
                <BulbOutlined v-if="themeStore.mode === 'light'" />
                <BulbFilled v-else />
              </template>
            </a-button>
          </a-tooltip>

          <!-- 主题设置按钮（桌面端显示） -->
          <a-tooltip v-if="!isMobile" title="主题设置">
            <a-button 
              type="text" 
              class="theme-settings-btn"
              @click="openThemeSettings"
            >
              <template #icon>
                <SettingOutlined />
              </template>
            </a-button>
          </a-tooltip>
          
          <a-dropdown>
            <a class="user-info" @click.prevent>
              <a-avatar :size="isMobile ? 28 : 32" :src="userStore.userInfo?.avatar ? '/api/' + userStore.userInfo.avatar : null">
                <template #icon><UserOutlined /></template>
              </a-avatar>
              <span v-if="!isMobile" class="username">{{ userStore.userInfo?.realName || userStore.userInfo?.username }}</span>
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item @click="handleGoProfile">
                  <UserOutlined />
                  个人中心
                </a-menu-item>
                <a-divider style="margin: 4px 0" />
                <a-menu-item @click="handleLogout">
                  <LogoutOutlined />
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <a-layout-content class="layout-content" :class="{ 'with-fixed-header': themeStore.layoutConfig.fixedHeader }">
        <!-- 标签页（桌面端显示） -->
        <div v-if="!isMobile && themeStore.layoutConfig.showTabs" class="tabs-container">
          <a-tabs v-model:activeKey="activeTab" type="card" @change="handleTabChange">
            <a-tab-pane key="dashboard" tab="首页" />
            <a-tab-pane v-if="currentRoute.path !== '/dashboard'" :key="currentRoute.path" :tab="currentRoute.meta?.title" />
          </a-tabs>
        </div>
        
        <div class="content-wrapper">
          <router-view />
        </div>
      </a-layout-content>
      </a-layout>
    </a-layout>
    
    <!-- 主题设置抽屉 -->
    <ThemeSettings ref="themeSettingsRef" />
  </a-config-provider>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useResponsive } from '@/composables/useResponsive'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  SettingOutlined,
  TeamOutlined,
  MenuOutlined,
  BulbOutlined,
  BulbFilled
} from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'
import ThemeSettings from '@/components/ThemeSettings.vue'
import { message, theme } from 'ant-design-vue'
import { getUserMenuTree } from '@/api/menu'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const themeStore = useThemeStore()

// 使用全局响应式
const { isMobile, isTablet, isDesktop } = useResponsive()

const selectedKeys = ref(['/dashboard'])
const openKeys = ref([])
const activeTab = ref('dashboard')
const themeSettingsRef = ref(null)
const currentRoute = computed(() => route)
const loading = ref(false)

// 移动端菜单状态
const mobileMenuVisible = ref(false)

// 动态菜单项
const menuItems = ref([])

// 从后端加载用户有权限的菜单
const loadUserMenus = async () => {
  loading.value = true
  try {
    const result = await getUserMenuTree()
    if (result.data) {
      menuItems.value = buildMenuItems(result.data)
    }
  } catch (error) {
    console.error('加载菜单失败:', error)
  } finally {
    loading.value = false
  }
}

// 将菜单数据转换为Ant Design Menu需要的格式
const buildMenuItems = (menus) => {
  const iconMap = {
    'DashboardOutlined': DashboardOutlined,
    'SettingOutlined': SettingOutlined,
    'UserOutlined': UserOutlined,
    'TeamOutlined': TeamOutlined,
    'MenuOutlined': MenuOutlined
  }

  return menus
    .filter(menu => menu.menuType !== 3) // 过滤掉按钮类型的菜单
    .filter(menu => menu.path) // 只保留有path的菜单
    .map(menu => {
      // 递归处理子菜单
      const children = menu.children && menu.children.length > 0 
        ? buildMenuItems(menu.children) 
        : undefined
      
      return {
        key: menu.path,
        icon: menu.icon ? () => h(iconMap[menu.icon] || DashboardOutlined) : undefined,
        label: menu.menuName,
        title: menu.menuName,
        // 只有当children存在且不为空数组时才设置children（过滤后可能为空）
        children: children && children.length > 0 ? children : undefined
      }
    })
}

const handleMenuClick = ({ key }) => {
  router.push(key)
}

// 移动端菜单点击：点击后自动关闭抽屉
const handleMobileMenuClick = ({ key }) => {
  router.push(key)
  mobileMenuVisible.value = false
}

// 响应式断点
const handleBreakpoint = (broken) => {
  if (broken) {
    themeStore.layoutConfig.sidebarCollapsed = true
  }
}

const handleLogout = () => {
  userStore.logout()
  message.success('退出成功')
  router.push('/login')
}

const handleGoProfile = () => {
  router.push('/profile')
}

// Ant Design Vue 主题配置
const antdTheme = computed(() => {
  const { defaultAlgorithm, darkAlgorithm } = theme
  return {
    algorithm: themeStore.mode === 'dark' ? darkAlgorithm : defaultAlgorithm,
    token: {
      colorPrimary: themeStore.currentColors.primary,
      colorSuccess: themeStore.currentColors.success,
      colorWarning: themeStore.currentColors.warning,
      colorError: themeStore.currentColors.error,
      colorInfo: themeStore.currentColors.info
    }
  }
})

// 打开主题设置
const openThemeSettings = () => {
  themeSettingsRef.value?.open()
}

// 标签页切换
const handleTabChange = (key) => {
  router.push(key)
}

// 监听路由变化
watch(() => route.path, (newPath) => {
  selectedKeys.value = [newPath]
  if (newPath !== '/dashboard') {
    activeTab.value = newPath
  } else {
    activeTab.value = 'dashboard'
  }
})

onMounted(() => {
  selectedKeys.value = [router.currentRoute.value.path]
  themeStore.initTheme()
  loadUserMenus()
})

// 导入h函数用于渲染图标
import { h } from 'vue'
</script>

<style scoped>
/* 全局主题变量 */
.layout-container {
  min-height: 100vh;
  background: var(--theme-background, #f0f2f5);
  transition: background 0.3s ease;
}

.layout-container.dark-mode {
  background: var(--theme-background, #141414);
}

/* 侧边栏样式 */
.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  margin: 0;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo h3 {
  color: #ffffff;
  margin: 0;
  font-weight: 600;
  letter-spacing: 2px;
  font-size: 20px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* 暗色模式下的 logo */
.dark-mode .logo {
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

/* Logo 图片样式 */
.logo-image {
  max-width: 25px;
  max-height: 25px;
  width: auto;
  height: auto;
  object-fit: contain;
}

/* 侧边栏背景 - 亮色模式 */
:deep(.ant-layout-sider-light) {
  background: linear-gradient(180deg, #f5f7fa 0%, #f0f2f5 100%);
}

:deep(.ant-layout-sider) {
  background: linear-gradient(180deg, #f5f7fa 0%, #f0f2f5 100%);
  transition: background 0.3s ease;
}

/* 侧边栏背景 - 暗色模式 */
.dark-mode :deep(.ant-layout-sider) {
  background: #1f1f1f !important;
}

.dark-mode :deep(.ant-layout-sider-dark) {
  background: #1f1f1f !important;
}

/* Logo 文字颜色 - 亮色模式 */
:deep(.ant-layout-sider-light) .logo h3,
.logo h3 {
  color: #000000;
}

.dark-mode :deep(.ant-layout-sider-dark) .logo h3,
.dark-mode .logo h3 {
  color: #ffffff;
}

/* 头部样式 */
.layout-header {
  background: var(--theme-cardBackground, #ffffff);
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  z-index: 10;
  height: 64px;
}

.layout-header.fixed-header {
  position: sticky;
  top: 0;
}

.dark-mode .layout-header {
  background: var(--theme-cardBackground, #1f1f1f);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.trigger {
  font-size: 18px;
  cursor: pointer;
  transition: color 0.3s;
  color: var(--theme-textPrimary, #000000d9);
}

.trigger:hover {
  color: var(--theme-primary, #1890ff);
}

.breadcrumb {
  margin-left: 16px;
}

.theme-toggle,
.theme-settings-btn {
  font-size: 18px;
  color: var(--theme-textPrimary, #000000d9);
  transition: all 0.3s;
}

.theme-toggle:hover,
.theme-settings-btn:hover {
  color: var(--theme-primary, #1890ff);
  transform: rotate(20deg);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 20px;
  transition: background 0.3s;
  color: var(--theme-textPrimary, #000000d9);
}

.user-info:hover {
  background: var(--theme-background, #f0f2f5);
}

.user-info span {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 内容区域样式 */
.layout-content {
  margin: 0;
  padding: 0;
  background: transparent;
  min-height: auto;
  border-radius: 0;
  box-shadow: none;
  transition: all 0.3s ease;
}

.layout-content.with-fixed-header {
  margin-top: 0;
  padding-top: 0;
}

.dark-mode .layout-content {
  background: transparent;
}

/* 标签页样式 */
.tabs-container {
  margin: 16px 16px 0 16px;
  padding: 12px 24px;
  background: var(--theme-cardBackground, #ffffff);
  border-radius: 8px 8px 0 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
}

.dark-mode .tabs-container {
  background: var(--theme-cardBackground, #1f1f1f);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
}

.content-wrapper {
  margin: 16px 16px 16px 16px;
  padding: 24px;
  background: var(--theme-cardBackground, #ffffff);
  border-radius: 0 0 8px 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  min-height: 280px;
  animation: fadeIn 0.3s ease-in;
}

.dark-mode .content-wrapper {
  background: var(--theme-cardBackground, #1f1f1f);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 菜单项样式增强 */
:deep(.ant-menu-dark) {
  background: transparent;
}

:deep(.ant-menu-light) {
  background: transparent;
}

:deep(.ant-layout-sider-dark) {
  background: #1f1f1f !important;
}

:deep(.ant-layout-sider-light) {
  background: linear-gradient(180deg, #f5f7fa 0%, #f0f2f5 100%);
}

/* 菜单项均态样式 */
:deep(.ant-menu-item),
:deep(.ant-menu-submenu-title) {
  transition: all 0.3s;
  margin: 4px 8px;
  border-radius: 4px;
  color: var(--theme-textPrimary, #000000d9) !important;
}

/* 暗色模式菜单项 */
.dark-mode :deep(.ant-menu-item),
.dark-mode :deep(.ant-menu-submenu-title) {
  color: rgba(255, 255, 255, 0.85) !important;
}

/* 暗色模式预根 */
.dark-mode :deep(.ant-menu:not(.ant-menu-horizontal)) .ant-menu-item::before {
  background-color: transparent;
}

/* 暗色模式按预根 */
.dark-mode :deep(.ant-menu-item::before) {
  background-color: var(--theme-primary, #1890ff) !important;
}

/* 亮色模式按预根 */
:deep(.ant-menu-item::before) {
  background-color: var(--theme-primary, #1890ff) !important;
}

/* 暗色模式深芙 */
.dark-mode :deep(.ant-menu-item:hover),
.dark-mode :deep(.ant-menu-submenu-title:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
}

/* 亮色模式深芙 */
:deep(.ant-menu-item:hover),
:deep(.ant-menu-submenu-title:hover) {
  background: rgba(24, 144, 255, 0.08) !important;
  color: var(--theme-primary, #1890ff) !important;
}

/* 选中样式 */
:deep(.ant-menu-item-selected) {
  background: linear-gradient(90deg, var(--theme-primary, #1890ff) 0%, rgba(24, 144, 255, 0.6) 100%) !important;
  color: #ffffff !important;
}

:deep(.ant-menu-item-selected .anticon),
:deep(.ant-menu-item-selected span) {
  color: #ffffff !important;
}

/* 菜单图标样式 */
:deep(.ant-menu-item .anticon),
:deep(.ant-menu-submenu-title .anticon) {
  font-size: 16px;
  margin-right: 10px;
}

/* 子菜单样式 - 暗色模式 */
.dark-mode :deep(.ant-menu-sub) {
  background: rgba(0, 0, 0, 0.2) !important;
}

.dark-mode :deep(.ant-menu-submenu-open > .ant-menu-submenu-title) {
  background: rgba(255, 255, 255, 0.05) !important;
}

/* 子菜单样式 - 亮色模式 */
:deep(.ant-menu-sub) {
  background: rgba(24, 144, 255, 0.05) !important;
}

:deep(.ant-menu-submenu-open > .ant-menu-submenu-title) {
  background: rgba(24, 144, 255, 0.1) !important;
}

/* Tabs 组件样式 优化 */
:deep(.ant-tabs-nav) {
  margin-bottom: 0 !important;
}

:deep(.ant-tabs) {
  color: var(--theme-textPrimary, #000000d9);
}

.dark-mode :deep(.ant-tabs) {
  color: rgba(255, 255, 255, 0.85);
}

/* 暗色模式下的菜单 */
.dark-mode :deep(.ant-layout-sider-dark) {
  background: linear-gradient(180deg, #001529 0%, #000c17 100%);
}

/* 响应式设计 */

/* 移动端优化 (<768px) */
@media (max-width: 768px) {
  .layout-container.mobile {
    overflow-x: hidden;
  }
  
  .layout-header {
    padding: 0 12px;
    height: 56px;
  }
  
  .header-left,
  .header-right {
    gap: 8px;
  }
  
  .mobile-menu-trigger {
    font-size: 20px;
  }
  
  .breadcrumb {
    display: none;
  }
  
  .username {
    display: none;
  }
  
  .layout-content {
    margin: 8px;
    padding: 12px;
  }
  
  .content-wrapper {
    padding: 16px 8px;
  }
  
  .tabs-container {
    display: none;
  }
  
  /* 移动端抽屉 */
  :deep(.ant-drawer-body) {
    padding: 0;
  }
  
  :deep(.ant-drawer-header) {
    display: none;
  }
}

/* 平板端 (768px - 1024px) */
@media (min-width: 768px) and (max-width: 1024px) {
  .layout-header {
    padding: 0 20px;
  }
  
  .header-left,
  .header-right {
    gap: 12px;
  }
  
  .breadcrumb {
    font-size: 14px;
  }
  
  .layout-content {
    margin: 16px;
    padding: 20px;
  }
  
  .content-wrapper {
    padding: 20px;
  }
}

/* 小型桌面 (1024px - 1440px) */
@media (min-width: 1024px) and (max-width: 1440px) {
  .layout-content {
    margin: 20px;
    padding: 24px;
  }
}

/* 大型桌面 (>1440px) */
@media (min-width: 1440px) {
  .layout-content {
    margin: 24px;
    padding: 24px;
  }
  
  .content-wrapper {
    max-width: 1600px;
    margin-left: auto;
    margin-right: auto;
  }
}

/* 触摸屏优化 */
@media (hover: none) and (pointer: coarse) {
  .trigger,
  .theme-toggle,
  .theme-settings-btn,
  :deep(.ant-menu-item),
  :deep(.ant-menu-submenu-title) {
    min-height: 44px;
    min-width: 44px;
    display: flex;
    align-items: center;
  }
  
  :deep(.ant-btn) {
    min-height: 40px;
  }
}

/* 横屏移动设备 */
@media (max-width: 768px) and (orientation: landscape) {
  .layout-header {
    height: 48px;
  }
  
  .logo {
    height: 48px;
    padding: 8px;
  }
}
</style>
