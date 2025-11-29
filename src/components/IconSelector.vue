<template>
  <div class="icon-selector">
    <a-input
      :value="displayValue"
      placeholder="请选择图标"
      readonly
      @click="showModal"
      style="cursor: pointer;"
    >
      <template #prefix>
        <component v-if="isPresetIcon" :is="getIconComponent(modelValue)" />
        <img v-else-if="isUrlIcon" :src="modelValue" alt="icon" class="custom-icon-preview" />
        <span v-else-if="isSvgIcon" v-html="modelValue" class="custom-icon-preview"></span>
      </template>
      <template #suffix>
        <component :is="AntIcons.SearchOutlined" style="cursor: pointer" />
      </template>
    </a-input>

    <a-modal
      v-model:open="visible"
      title="选择图标"
      width="1200px"
      :footer="null"
      @cancel="handleCancel"
    >
      <div class="icon-selector-modal">
        <!-- 切换模式 -->
        <a-segmented v-model:value="iconMode" :options="modeOptions" size="large" style="margin-bottom: 16px" />

        <!-- 预设图标模式 -->
        <div v-if="iconMode === 'preset'">
          <!-- 搜索框 -->
          <a-input
            v-model:value="searchText"
            placeholder="搜索图标名称"
            allow-clear
            size="large"
            style="margin-bottom: 16px"
          >
            <template #prefix>
              <component :is="AntIcons.SearchOutlined" />
            </template>
          </a-input>

          <!-- 风格切换 -->
          <div class="style-selector" style="margin-bottom: 16px">
            <a-radio-group v-model:value="activeStyle" button-style="solid" size="large">
              <a-radio-button v-for="style in styleOptions" :key="style.value" :value="style.value">
                <component :is="AntIcons[style.icon]" /> {{ style.label }}
              </a-radio-button>
            </a-radio-group>
            <a-tag color="blue" style="margin-left: 12px">
              共 {{ filteredIcons.length }} 个图标
            </a-tag>
          </div>

          <!-- 图标分类标签 -->
          <a-tabs v-model:activeKey="activeCategory" style="margin-bottom: 16px">
            <a-tab-pane v-for="category in categoryOptions" :key="category.key" :tab="category.label" />
          </a-tabs>

          <!-- 图标网格 -->
          <div class="icon-list" v-if="filteredIcons.length > 0">
            <div
              v-for="icon in filteredIcons"
              :key="icon.name"
              class="icon-item"
              :class="{ active: selectedIcon === icon.name }"
              @click="selectIcon(icon.name)"
              :title="`${icon.base} (${icon.name})`"
            >
              <component :is="icon.component" class="icon" />
              <div class="icon-name">{{ icon.base }}</div>
            </div>
          </div>

          <a-empty v-else description="未找到匹配的图标" />
        </div>

        <!-- 自定义图标模式 -->
        <div v-else class="custom-icon-mode">
          <a-alert
            message="自定义图标说明"
            description="您可以输入自定义图标的 URL 地址（支持 SVG、PNG、JPG 等格式），或者粘贴 SVG 代码"
            type="info"
            show-icon
            style="margin-bottom: 16px"
          />
          
          <a-radio-group v-model:value="customType" button-style="solid" style="margin-bottom: 16px">
            <a-radio-button value="url">图标 URL</a-radio-button>
            <a-radio-button value="svg">SVG 代码</a-radio-button>
          </a-radio-group>

          <a-form-item v-if="customType === 'url'" label="图标 URL" style="margin-bottom: 16px">
            <a-input
              v-model:value="customIconUrl"
              placeholder="请输入图标 URL，例如：https://example.com/icon.svg"
            />
            <div v-if="customIconUrl" class="custom-preview" style="margin-top: 12px">
              <span style="margin-right: 8px">预览：</span>
              <img :src="customIconUrl" alt="custom icon" style="width: 32px; height: 32px; object-fit: contain;" @error="handleImageError" />
            </div>
          </a-form-item>

          <a-form-item v-else label="SVG 代码" style="margin-bottom: 16px">
            <a-textarea
              v-model:value="customIconSvg"
              placeholder="请粘贴 SVG 代码"
              :rows="8"
            />
            <div v-if="customIconSvg && isValidSvg" class="custom-preview" style="margin-top: 12px">
              <span style="margin-right: 8px">预览：</span>
              <span v-html="customIconSvg" style="width: 32px; height: 32px; display: inline-block;"></span>
            </div>
            <a-alert v-else-if="customIconSvg && !isValidSvg" message="SVG 格式不正确" type="error" show-icon style="margin-top: 8px" />
          </a-form-item>
        </div>

        <!-- 底部操作栏 -->
        <div class="icon-selector-footer">
          <div class="selected-info">
            <span v-if="iconMode === 'preset' && selectedIcon">
              已选择: <strong>{{ getIconBaseName(selectedIcon) }}</strong>
              <a-tag color="processing" style="margin-left: 8px">{{ styleLabel }}</a-tag>
            </span>
            <span v-else-if="iconMode === 'custom'">
              <a-tag color="orange">自定义图标</a-tag>
              <span v-if="customType === 'url' && customIconUrl" style="margin-left: 8px">{{ customIconUrl.substring(0, 40) }}...</span>
              <span v-else-if="customType === 'svg' && isValidSvg" style="margin-left: 8px">SVG 代码</span>
            </span>
          </div>
          <a-space>
            <a-button @click="handleCancel">取消</a-button>
            <a-button type="primary" @click="handleOk" :disabled="!canConfirm">确定</a-button>
          </a-space>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, watch, shallowRef } from 'vue'
import * as AntIcons from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// ============ 常量定义 ============
const ICON_SUFFIX = {
  OUTLINED: 'Outlined',
  FILLED: 'Filled',
  TWO_TONE: 'TwoTone'
}

const ICON_STYLES = [
  { label: '线性', value: 'outlined', suffix: ICON_SUFFIX.OUTLINED, icon: 'BorderOutlined' },
  { label: '实心', value: 'filled', suffix: ICON_SUFFIX.FILLED, icon: 'BgColorsOutlined' },
  { label: '双色', value: 'twoTone', suffix: ICON_SUFFIX.TWO_TONE, icon: 'SmileOutlined' }
]

// 图标分类关键词映射（基于 Ant Design 官方分类）
const CATEGORY_KEYWORDS = {
  directional: [
    'step', 'fast', 'shrink', 'arrows', 'arrow', 'caret', 'double', 'vertical', 'up', 'down',
    'left', 'right', 'forward', 'backward', 'enter', 'rollback', 'retweet', 'swap', 'login',
    'logout', 'menu', 'border', 'pic', 'radius', 'fullscreen'
  ],
  suggested: [
    'question', 'plus', 'minus', 'info', 'exclamation', 'close', 'check', 'clock', 'warning',
    'pause', 'stop', 'issues'
  ],
  editor: [
    'edit', 'form', 'copy', 'scissor', 'delete', 'snippets', 'diff', 'highlight', 'align',
    'bgcolor', 'bold', 'italic', 'underline', 'strikethrough', 'redo', 'undo', 'zoom',
    'fontcolor', 'fontsize', 'lineheight', 'dash', 'sort', 'drag', 'ordered', 'unordered',
    'column', 'row'
  ],
  data: [
    'area', 'pie', 'bar', 'dot', 'line', 'radar', 'heat', 'box', 'fall', 'rise', 'stock',
    'fund', 'sliders', 'table', 'partition', 'insert', 'merge', 'split', 'chart'
  ],
  brand: [
    'android', 'apple', 'windows', 'chrome', 'github', 'gitlab', 'twitter', 'wechat',
    'weibo', 'alipay', 'taobao', 'qq', 'dingtalk', 'youtube', 'linkedin', 'facebook',
    'instagram', 'medium', 'slack', 'reddit', 'behance', 'dribbble', 'codepen', 'yuque',
    'alibaba', 'ant', 'google', 'amazon', 'skype', 'html'
  ],
  application: [
    'account', 'alert', 'api', 'appstore', 'audio', 'audit', 'bank', 'barcode', 'bell',
    'book', 'bug', 'bulb', 'calculator', 'calendar', 'camera', 'car', 'carry', 'code',
    'compass', 'contacts', 'container', 'credit', 'crown', 'customer', 'dashboard',
    'database', 'desktop', 'dollar', 'download', 'upload', 'environment', 'euro', 'eye',
    'file', 'filter', 'fire', 'flag', 'folder', 'fork', 'gift', 'global', 'heart',
    'history', 'home', 'hourglass', 'idcard', 'inbox', 'insurance', 'key', 'laptop',
    'layout', 'like', 'lock', 'mail', 'message', 'mobile', 'money', 'notification',
    'phone', 'picture', 'printer', 'profile', 'project', 'qrcode', 'read', 'robot',
    'rocket', 'safety', 'save', 'scan', 'schedule', 'search', 'security', 'setting',
    'share', 'shop', 'shopping', 'skin', 'smile', 'star', 'tag', 'team', 'tool',
    'trophy', 'user', 'video', 'wallet', 'wifi'
  ]
}

// ============ Props & Emits ============
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

// ============ 响应式状态 ============
const visible = ref(false)
const searchText = ref('')
const selectedIcon = ref(props.modelValue)
const activeCategory = ref('all')
const activeStyle = ref('outlined')
const iconMode = ref('preset')
const customType = ref('url')
const customIconUrl = ref('')
const customIconSvg = ref('')
const isValidSvg = ref(false)

// 使用 shallowRef 优化性能，避免深度响应式
const iconCache = shallowRef(new Map())

// ============ 工具函数 ============
/**
 * 获取图标的基础名称（去除后缀）
 */
const getIconBaseName = (iconName) => {
  return iconName.replace(/(Outlined|Filled|TwoTone)$/, '')
}

/**
 * 根据基础名称和样式生成完整图标名
 */
const buildIconName = (baseName, style = 'outlined') => {
  if (baseName.endsWith(ICON_SUFFIX.OUTLINED) || 
      baseName.endsWith(ICON_SUFFIX.FILLED) || 
      baseName.endsWith(ICON_SUFFIX.TWO_TONE)) {
    return baseName
  }
  const styleConfig = ICON_STYLES.find(s => s.value === style)
  return `${baseName}${styleConfig?.suffix || ICON_SUFFIX.OUTLINED}`
}

/**
 * 检查是否为有效的图标组件
 */
const isValidIconComponent = (iconName) => {
  return iconName && AntIcons[iconName] !== undefined
}

/**
 * 获取图标组件
 */
const getIconComponent = (iconName) => {
  if (!iconName) return null
  
  // 使用缓存提升性能
  if (iconCache.value.has(iconName)) {
    return iconCache.value.get(iconName)
  }
  
  const component = AntIcons[iconName] || null
  iconCache.value.set(iconName, component)
  return component
}

/**
 * 判断图标类型
 */
const getIconType = (icon) => {
  if (!icon) return null
  if (icon.startsWith('http') || icon.startsWith('/')) return 'url'
  if (icon.startsWith('<svg')) return 'svg'
  if (isValidIconComponent(icon)) return 'preset'
  return null
}

// ============ 图标数据处理 ============
/**
 * 从 AntIcons 对象中提取所有图标
 */
const extractAllIcons = () => {
  return Object.keys(AntIcons).filter(key => {
    // 只过滤出以图标后缀结尾的 key
    return key.endsWith(ICON_SUFFIX.OUTLINED) || 
           key.endsWith(ICON_SUFFIX.FILLED) || 
           key.endsWith(ICON_SUFFIX.TWO_TONE)
  })
}

/**
 * 智能分类图标
 */
const categorizeIcons = () => {
  const allIcons = extractAllIcons()
  const categories = {
    all: allIcons,
    directional: [],
    suggested: [],
    editor: [],
    data: [],
    brand: [],
    application: []
  }

  allIcons.forEach(iconName => {
    const baseName = getIconBaseName(iconName).toLowerCase()
    let categorized = false

    // 遍历分类关键词进行匹配
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      // 优化：使用 some 提前退出
      if (keywords.some(keyword => baseName.includes(keyword))) {
        categories[category].push(iconName)
        categorized = true
        break
      }
    }

    // 未分类的归入应用类
    if (!categorized) {
      categories.application.push(iconName)
    }
  })

  return categories
}

// 生成图标分类数据
const iconCategories = categorizeIcons()

// ============ 配置选项 ============
const modeOptions = [
  { label: '预设图标', value: 'preset' },
  { label: '自定义图标', value: 'custom' }
]

const styleOptions = computed(() => {
  return ICON_STYLES.filter(style => isValidIconComponent(style.icon))
})

const categoryOptions = computed(() => {
  return [
    { key: 'all', label: '全部', count: iconCategories.all?.length || 0 },
    { key: 'directional', label: '方向性', count: iconCategories.directional?.length || 0 },
    { key: 'suggested', label: '提示建议', count: iconCategories.suggested?.length || 0 },
    { key: 'editor', label: '编辑类', count: iconCategories.editor?.length || 0 },
    { key: 'data', label: '数据类', count: iconCategories.data?.length || 0 },
    { key: 'brand', label: '品牌标识', count: iconCategories.brand?.length || 0 },
    { key: 'application', label: '网站通用', count: iconCategories.application?.length || 0 }
  ].filter(cat => cat.count > 0)
})

// ============ 计算属性 ============
const iconType = computed(() => getIconType(props.modelValue))

const isPresetIcon = computed(() => iconType.value === 'preset')
const isUrlIcon = computed(() => iconType.value === 'url')
const isSvgIcon = computed(() => iconType.value === 'svg')

const canConfirm = computed(() => {
  if (iconMode.value === 'preset') {
    return !!selectedIcon.value && isValidIconComponent(selectedIcon.value)
  }
  return customType.value === 'url' ? !!customIconUrl.value : isValidSvg.value
})

const styleLabel = computed(() => {
  return styleOptions.value.find(opt => opt.value === activeStyle.value)?.label || ''
})

const displayValue = computed(() => {
  if (!props.modelValue) return ''
  if (isPresetIcon.value) return getIconBaseName(props.modelValue)
  if (isUrlIcon.value) return '自定义URL图标'
  if (isSvgIcon.value) return '自定义SVG图标'
  return ''
})

/**
 * 根据分类和样式获取图标列表
 */
const getIconsByCategory = computed(() => {
  const category = activeCategory.value
  const style = activeStyle.value
  
  // 获取当前分类的图标
  let icons = iconCategories[category] || []
  
  // 根据选中的样式过滤
  const targetSuffix = ICON_STYLES.find(s => s.value === style)?.suffix
  if (targetSuffix) {
    icons = icons.filter(icon => icon.endsWith(targetSuffix))
  }
  
  // 转换为显示格式
  return icons.map(iconName => ({
    name: iconName,
    base: getIconBaseName(iconName),
    component: getIconComponent(iconName)
  }))
})

/**
 * 搜索过滤图标
 */
const filteredIcons = computed(() => {
  const icons = getIconsByCategory.value
  
  if (!searchText.value) return icons
  
  const keyword = searchText.value.toLowerCase().trim()
  return icons.filter(icon => 
    icon.name.toLowerCase().includes(keyword) ||
    icon.base.toLowerCase().includes(keyword)
  )
})

// ============ 监听器 ============
watch(() => props.modelValue, (newVal) => {
  selectedIcon.value = newVal
})

watch(activeStyle, () => {
  // 切换样式时，如果已选择图标，自动切换到对应样式的图标
  if (selectedIcon.value && iconMode.value === 'preset') {
    const baseName = getIconBaseName(selectedIcon.value)
    const newIconName = buildIconName(baseName, activeStyle.value)
    if (isValidIconComponent(newIconName)) {
      selectedIcon.value = newIconName
    }
  }
})

watch(customIconSvg, (val) => {
  const trimmed = val.trim()
  isValidSvg.value = trimmed.startsWith('<svg') && trimmed.endsWith('</svg>')
})

// ============ 方法 ============
const showModal = () => {
  selectedIcon.value = props.modelValue
  searchText.value = ''
  activeCategory.value = 'all'
  
  const type = getIconType(props.modelValue)
  
  if (type === 'url' || type === 'svg') {
    iconMode.value = 'custom'
    if (type === 'url') {
      customType.value = 'url'
      customIconUrl.value = props.modelValue
    } else {
      customType.value = 'svg'
      customIconSvg.value = props.modelValue
    }
  } else {
    iconMode.value = 'preset'
    if (props.modelValue) {
      // 自动检测图标样式
      if (props.modelValue.endsWith(ICON_SUFFIX.FILLED)) {
        activeStyle.value = 'filled'
      } else if (props.modelValue.endsWith(ICON_SUFFIX.TWO_TONE)) {
        activeStyle.value = 'twoTone'
      } else {
        activeStyle.value = 'outlined'
      }
    }
  }
  
  visible.value = true
}

const selectIcon = (iconName) => {
  selectedIcon.value = iconName
}

const handleOk = () => {
  let value = ''
  
  if (iconMode.value === 'preset') {
    value = selectedIcon.value
  } else {
    value = customType.value === 'url' ? customIconUrl.value : customIconSvg.value
  }
  
  emit('update:modelValue', value)
  visible.value = false
}

const handleCancel = () => {
  selectedIcon.value = props.modelValue
  customIconUrl.value = ''
  customIconSvg.value = ''
  isValidSvg.value = false
  visible.value = false
}

const handleImageError = () => {
  message.error('图标加载失败，请检查 URL')
}
</script>

<style scoped>
.icon-selector { width: 100%; }
.style-selector { display: flex; align-items: center; justify-content: space-between; }
.custom-icon-mode { min-height: 300px; }
.custom-preview { padding: 12px; background: #fafafa; border: 1px solid #e8e8e8; border-radius: 4px; }
.icon-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  max-height: 450px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  background: #fafafa;
}
.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;
}
.icon-item:hover {
  border-color: #40a9ff;
  background: #f0f9ff;
  transform: translateY(-2px);
}
.icon-item.active {
  border-color: #1890ff;
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.12);
}
.icon {
  font-size: 24px;
  color: #1890ff;
  margin-bottom: 4px;
}
.icon-name {
  font-size: 10px;
  color: #8c8c8c;
  text-align: center;
  word-break: break-all;
  line-height: 1.2;
}
.icon-selector-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.selected-info { color: #595959; font-size: 14px; }
.selected-info strong { color: #1890ff; }
.icon-list::-webkit-scrollbar { width: 8px; }
.icon-list::-webkit-scrollbar-track { background: #f0f0f0; border-radius: 4px; }
.icon-list::-webkit-scrollbar-thumb { background: #bfbfbf; border-radius: 4px; }
.icon-list::-webkit-scrollbar-thumb:hover { background: #8c8c8c; }

/* 自定义图标预览样式 */
.custom-icon-preview {
  width: 16px;
  height: 16px;
  display: inline-block;
  object-fit: contain;
}

.custom-icon-preview :deep(svg) {
  width: 100% !important;
  height: 100% !important;
  max-width: 16px !important;
  max-height: 16px !important;
}
</style>
