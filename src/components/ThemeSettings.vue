<template>
  <a-drawer
    v-model:open="visible"
    title="主题设置"
    placement="right"
    :width="320"
  >
    <div class="theme-settings">
      <!-- 主题模式切换 -->
      <div class="setting-item">
        <div class="setting-label">
          <BulbOutlined />
          <span>主题模式</span>
        </div>
        <a-segmented
          v-model:value="themeStore.mode"
          :options="[
            { label: '亮色', value: 'light' },
            { label: '暗色', value: 'dark' }
          ]"
          @change="handleThemeChange"
        />
      </div>

      <a-divider />

      <!-- 主题色配置 -->
      <div class="setting-item">
        <div class="setting-label">
          <BgColorsOutlined />
          <span>主题颜色</span>
        </div>
        <div class="color-picker-group">
          <div class="color-item">
            <label>主色调</label>
            <input
              type="color"
              :value="themeStore.currentColors.primary"
              @change="(e) => updateColor('primary', e.target.value)"
            />
          </div>
          <div class="color-item">
            <label>成功色</label>
            <input
              type="color"
              :value="themeStore.currentColors.success"
              @change="(e) => updateColor('success', e.target.value)"
            />
          </div>
          <div class="color-item">
            <label>警告色</label>
            <input
              type="color"
              :value="themeStore.currentColors.warning"
              @change="(e) => updateColor('warning', e.target.value)"
            />
          </div>
          <div class="color-item">
            <label>错误色</label>
            <input
              type="color"
              :value="themeStore.currentColors.error"
              @change="(e) => updateColor('error', e.target.value)"
            />
          </div>
        </div>
      </div>

      <a-divider />

      <!-- 布局配置 -->
      <div class="setting-item">
        <div class="setting-label">
          <LayoutOutlined />
          <span>布局设置</span>
        </div>
        <div class="layout-settings">
          <div class="layout-option">
            <span>固定头部</span>
            <a-switch
              v-model:checked="themeStore.layoutConfig.fixedHeader"
              @change="updateLayout"
            />
          </div>
          <div class="layout-option">
            <span>显示面包屑</span>
            <a-switch
              v-model:checked="themeStore.layoutConfig.showBreadcrumb"
              @change="updateLayout"
            />
          </div>
          <div class="layout-option">
            <span>显示标签页</span>
            <a-switch
              v-model:checked="themeStore.layoutConfig.showTabs"
              @change="updateLayout"
            />
          </div>
        </div>
      </div>

      <a-divider />

      <!-- 预设主题 -->
      <div class="setting-item">
        <div class="setting-label">
          <FormatPainterOutlined />
          <span>预设主题</span>
        </div>
        <div class="preset-themes">
          <div
            v-for="preset in presetThemes"
            :key="preset.name"
            class="preset-item"
            :class="{ active: isActivePreset(preset) }"
            @click="applyPreset(preset)"
          >
            <div class="preset-color" :style="{ background: preset.primary }"></div>
            <span>{{ preset.name }}</span>
          </div>
        </div>
      </div>

      <!-- 重置按钮 -->
      <div class="reset-wrapper">
        <a-button block @click="resetTheme">
          <template #icon><RedoOutlined /></template>
          重置默认设置
        </a-button>
      </div>
    </div>
  </a-drawer>
</template>

<script setup>
import { ref } from 'vue'
import { useThemeStore } from '@/stores/theme'
import {
  BulbOutlined,
  BgColorsOutlined,
  LayoutOutlined,
  FormatPainterOutlined,
  RedoOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const themeStore = useThemeStore()
const visible = ref(false)

// 预设主题
const presetThemes = [
  { name: '默认蓝', primary: '#1890ff' },
  { name: '薄暮', primary: '#f5222d' },
  { name: '火山', primary: '#fa541c' },
  { name: '日暮', primary: '#faad14' },
  { name: '明青', primary: '#13c2c2' },
  { name: '极光绿', primary: '#52c41a' },
  { name: '拂晓蓝', primary: '#1890ff' },
  { name: '极客蓝', primary: '#2f54eb' },
  { name: '酱紫', primary: '#722ed1' }
]

// 打开设置面板
const open = () => {
  visible.value = true
}

// 主题模式切换
const handleThemeChange = () => {
  themeStore.applyTheme()
  message.success(`已切换至${themeStore.mode === 'light' ? '亮色' : '暗色'}主题`)
}

// 更新颜色
const updateColor = (type, color) => {
  themeStore.updateThemeColor(type, color)
}

// 更新布局
const updateLayout = () => {
  themeStore.updateLayoutConfig(themeStore.layoutConfig)
}

// 判断是否为当前激活的预设
const isActivePreset = (preset) => {
  return themeStore.currentColors.primary === preset.primary
}

// 应用预设主题
const applyPreset = (preset) => {
  themeStore.updateThemeColor('primary', preset.primary)
  message.success(`已应用${preset.name}主题`)
}

// 重置主题
const resetTheme = () => {
  themeStore.setTheme('light')
  themeStore.updateLayoutConfig({
    sidebarCollapsed: false,
    fixedHeader: true,
    showBreadcrumb: true,
    showTabs: true
  })
  message.success('已重置为默认设置')
}

// 暴露方法给父组件
defineExpose({
  open
})
</script>

<style scoped>
.theme-settings {
  padding: 8px 0;
}

.setting-item {
  margin-bottom: 24px;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  margin-bottom: 16px;
  font-size: 14px;
}

.color-picker-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.color-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.color-item label {
  font-size: 12px;
  color: var(--theme-textSecondary, #00000073);
}

.color-item input[type="color"] {
  width: 100%;
  height: 36px;
  border: 1px solid var(--theme-border, #d9d9d9);
  border-radius: 4px;
  cursor: pointer;
}

.layout-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.layout-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preset-themes {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.preset-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 8px;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.preset-item:hover {
  background: var(--theme-background, #f0f2f5);
}

.preset-item.active {
  border-color: var(--theme-primary, #1890ff);
  background: var(--theme-background, #f0f2f5);
}

.preset-color {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.preset-item span {
  font-size: 12px;
  text-align: center;
}

.reset-wrapper {
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid var(--theme-border, #d9d9d9);
}
</style>
