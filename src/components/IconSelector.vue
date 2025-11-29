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
        <component v-if="modelValue && isPresetIcon" :is="getIconComponent(modelValue)" />
        <img v-else-if="modelValue && isUrlIcon" :src="modelValue" alt="icon" class="custom-icon-preview" />
        <span v-else-if="modelValue && isSvgIcon" v-html="modelValue" class="custom-icon-preview"></span>
      </template>
      <template #suffix>
        <SearchOutlined style="cursor: pointer" />
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
            placeholder="搜索图标名称（支持中英文）"
            allow-clear
            size="large"
            style="margin-bottom: 16px"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>

          <!-- 风格切换 -->
          <div class="style-selector" style="margin-bottom: 16px">
            <a-radio-group v-model:value="activeStyle" button-style="solid" size="large">
              <a-radio-button value="outlined">
                <BorderOutlined /> 线性 (Outlined)
              </a-radio-button>
              <a-radio-button value="filled">
                <BgColorsOutlined /> 面性 (Filled)
              </a-radio-button>
              <a-radio-button value="twoTone">
                <SmileOutlined /> 双色 (TwoTone)
              </a-radio-button>
            </a-radio-group>
            <a-tag color="blue" style="margin-left: 12px">
              共 {{ filteredIcons.length }} 个图标
            </a-tag>
          </div>

          <!-- 图标分类标签 -->
          <a-tabs v-model:activeKey="activeCategory" style="margin-bottom: 16px">
            <a-tab-pane key="all" tab="全部" />
            <a-tab-pane key="directional" tab="方向性" />
            <a-tab-pane key="suggested" tab="提示建议" />
            <a-tab-pane key="editor" tab="编辑类" />
            <a-tab-pane key="data" tab="数据类" />
            <a-tab-pane key="brand" tab="品牌标识" />
            <a-tab-pane key="application" tab="网站通用" />
          </a-tabs>

          <!-- 图标网格 -->
          <div class="icon-list" v-if="filteredIcons.length > 0">
            <div
              v-for="icon in filteredIcons"
              :key="icon.name"
              class="icon-item"
              :class="{ active: selectedIcon === icon.name }"
              @click="selectIcon(icon.name)"
              :title="`${icon.title} (${icon.name})`"
            >
              <component :is="getIconComponent(icon.name)" class="icon" />
              <div class="icon-name">{{ icon.title }}</div>
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
              已选择: <strong>{{ getIconTitle(selectedIcon) }}</strong>
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
import { ref, computed, watch } from 'vue'
import { SearchOutlined, BorderOutlined, BgColorsOutlined, SmileOutlined } from '@ant-design/icons-vue'
import * as antIcons from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const visible = ref(false)
const searchText = ref('')
const selectedIcon = ref(props.modelValue)
const activeCategory = ref('all')
const activeStyle = ref('outlined')
const iconMode = ref('preset')
const modeOptions = [
  { label: '预设图标', value: 'preset' },
  { label: '自定义图标', value: 'custom' }
]
const customType = ref('url')
const customIconUrl = ref('')
const customIconSvg = ref('')
const isValidSvg = ref(false)

const isPresetIcon = computed(() => {
  if (!props.modelValue) return false
  return !props.modelValue.startsWith('http') && !props.modelValue.startsWith('<svg')
})

const isUrlIcon = computed(() => {
  if (!props.modelValue) return false
  return props.modelValue.startsWith('http')
})

const isSvgIcon = computed(() => {
  if (!props.modelValue) return false
  return props.modelValue.startsWith('<svg')
})

const canConfirm = computed(() => {
  if (iconMode.value === 'preset') {
    return !!selectedIcon.value
  } else {
    return customType.value === 'url' ? !!customIconUrl.value : isValidSvg.value
  }
})

const styleLabel = computed(() => {
  if (activeStyle.value === 'outlined') return '线性'
  if (activeStyle.value === 'filled') return '面性'
  if (activeStyle.value === 'twoTone') return '双色'
  return ''
})

// Ant Design 图标完整列表 - 基于官方文档
const iconCategories = {
  directional: [
    'StepBackward', 'StepForward', 'FastBackward', 'FastForward', 'Shrink', 'ArrowsAlt', 'Down', 'Up', 'Left', 'Right',
    'CaretUp', 'CaretDown', 'CaretLeft', 'CaretRight', 'UpCircle', 'DownCircle', 'LeftCircle', 'RightCircle',
    'DoubleRight', 'DoubleLeft', 'VerticalLeft', 'VerticalRight', 'VerticalAlignTop', 'VerticalAlignMiddle',
    'VerticalAlignBottom', 'Forward', 'Backward', 'Rollback', 'Enter', 'Retweet', 'Swap', 'SwapLeft', 'SwapRight',
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PlayCircle', 'UpSquare', 'DownSquare', 'LeftSquare',
    'RightSquare', 'Login', 'Logout', 'MenuFold', 'MenuUnfold', 'BorderBottom', 'BorderHorizontal', 'BorderInner',
    'BorderOuter', 'BorderLeft', 'BorderRight', 'BorderTop', 'BorderVerticle', 'PicCenter', 'PicLeft', 'PicRight',
    'RadiusBottomleft', 'RadiusBottomright', 'RadiusUpleft', 'RadiusUpright', 'Fullscreen', 'FullscreenExit'
  ],
  suggested: [
    'Question', 'QuestionCircle', 'Plus', 'PlusCircle', 'Pause', 'PauseCircle', 'Minus', 'MinusCircle',
    'PlusSquare', 'MinusSquare', 'Info', 'InfoCircle', 'Exclamation', 'ExclamationCircle', 'Close',
    'CloseCircle', 'CloseSquare', 'Check', 'CheckCircle', 'CheckSquare', 'ClockCircle', 'Warning',
    'IssuesClose', 'Stop'
  ],
  editor: [
    'Edit', 'Form', 'Copy', 'Scissor', 'Delete', 'Snippets', 'Diff', 'Highlight', 'AlignCenter', 'AlignLeft',
    'AlignRight', 'BgColors', 'Bold', 'Italic', 'Underline', 'Strikethrough', 'Redo', 'Undo', 'ZoomIn', 'ZoomOut',
    'FontColors', 'FontSize', 'LineHeight', 'Dash', 'SmallDash', 'SortAscending', 'SortDescending', 'Drag',
    'OrderedList', 'UnorderedList', 'RadiusBottomleft', 'RadiusBottomright', 'RadiusUpleft', 'RadiusUpright',
    'RadiusSetting', 'ColumnWidth', 'ColumnHeight'
  ],
  data: [
    'Area', 'AreaChart', 'PieChart', 'BarChart', 'DotChart', 'LineChart', 'RadarChart', 'HeatMap',
    'Fall', 'Rise', 'Stock', 'BoxPlot', 'Fund', 'Sliders', 'FundProjectionScreen', 'FundView',
    'InsertRowAbove', 'InsertRowBelow', 'InsertRowLeft', 'InsertRowRight', 'MergeCells', 'SubNode',
    'SplitCells', 'DeleteColumn', 'DeleteRow', 'Table', 'TableOutlined', 'Partition'
  ],
  brand: [
    'Android', 'Apple', 'Windows', 'Ie', 'Chrome', 'Github', 'Aliwangwang', 'Dingding', 'WeiboSquare',
    'WeiboCircle', 'Taobao', 'Html5', 'Weibo', 'Twitter', 'Wechat', 'Youtube', 'AlipayCircle', 'Taobao',
    'Skype', 'Qq', 'MediumWorkmark', 'Gitlab', 'Medium', 'Linkedin', 'GooglePlus', 'Dropbox', 'Facebook',
    'Codepen', 'CodeSandbox', 'Amazon', 'Google', 'CodepenCircle', 'Alipay', 'AntDesign', 'AntCloud',
    'Aliyun', 'Zhihu', 'Slack', 'SlackSquare', 'Behance', 'BehanceSquare', 'Dribbble', 'DribbbleSquare',
    'Instagram', 'Yuque', 'Alibaba', 'Yahoo', 'Reddit', 'Sketch'
  ],
  application: [
    'Account', 'Alert', 'Api', 'Appstore', 'AppstoreAdd', 'Audio', 'Audit', 'Bank', 'Barcode', 'Bars',
    'Bell', 'Block', 'Book', 'Border', 'BorderlessTable', 'Branches', 'Bug', 'Build', 'Bulb', 'Calculator',
    'Calendar', 'Camera', 'Car', 'CarryOut', 'CiCircle', 'Ci', 'Clear', 'Cloud', 'CloudDownload', 'CloudServer',
    'CloudSync', 'CloudUpload', 'Cluster', 'Code', 'Coffee', 'Comment', 'Compass', 'Compress', 'Contacts',
    'Container', 'Control', 'CreditCard', 'Crown', 'CustomerService', 'Dashboard', 'Database', 'DeleteColumn',
    'DeleteRow', 'DeliveredProcedure', 'Deployment', 'Desktop', 'Disconnect', 'Dislike', 'Dollar', 'Download',
    'Ellipsis', 'Environment', 'Euro', 'Exception', 'Exclamation', 'Expand', 'Experiment', 'Export', 'Eye',
    'EyeInvisible', 'FieldBinary', 'FieldNumber', 'FieldString', 'FieldTime', 'FileAdd', 'FileDone',
    'FileExcel', 'FileExclamation', 'File', 'FileImage', 'FileJpg', 'FileMarkdown', 'FilePdf', 'FilePpt',
    'FileProtect', 'FileSearch', 'FileSync', 'FileText', 'FileUnknown', 'FileWord', 'FileZip', 'Filter',
    'Fire', 'Flag', 'Folder', 'FolderAdd', 'FolderOpen', 'FolderView', 'Fork', 'FormatPainter', 'Frown',
    'Function', 'FundProjectionScreen', 'FundView', 'Funnel', 'Gateway', 'Gif', 'Gift', 'Global', 'Gold',
    'Group', 'Hdd', 'Heart', 'HeatMap', 'Highlight', 'History', 'Home', 'Hourglass', 'Html5', 'Idcard',
    'Import', 'Inbox', 'InsertRowAbove', 'InsertRowBelow', 'InsertRowLeft', 'InsertRowRight', 'Insurance',
    'Interaction', 'Key', 'Laptop', 'Layout', 'Like', 'Line', 'Link', 'Loading', 'Lock', 'MacCommand',
    'Mail', 'Man', 'Medicine', 'Meh', 'Menu', 'MergeCells', 'Message', 'Mobile', 'Money', 'Monitor',
    'More', 'Node', 'Notification', 'Number', 'Paperclip', 'Partition', 'PayCircle', 'Percentage',
    'Phone', 'Picture', 'PlaySquare', 'Pound', 'Poweroff', 'Printer', 'Profile', 'Project', 'Property',
    'PullRequest', 'Pushpin', 'QrCode', 'Read', 'Reconciliation', 'RedEnvelope', 'Reload', 'Rest',
    'Robot', 'Rocket', 'Rotate', 'Safety', 'SafetyCertificate', 'Save', 'Scan', 'Schedule', 'Search',
    'Security', 'Select', 'Send', 'Setting', 'Shake', 'Share', 'Shop', 'Shopping', 'ShoppingCart',
    'Signal', 'Skin', 'Smile', 'Solution', 'Sound', 'Split', 'Star', 'Streamline', 'Strikethrough',
    'SubNode', 'Switcher', 'Sync', 'Tab', 'Tag', 'Tags', 'Team', 'Thunderbolt', 'ToTop', 'Tool',
    'Trademark', 'Transaction', 'Translation', 'Trophy', 'Umbrella', 'Underline', 'Undo', 'Ungroup',
    'Unlock', 'Upload', 'Usb', 'User', 'UserAdd', 'UserDelete', 'UserSwitch', 'Usergroup', 'UsergroupAdd',
    'UsergroupDelete', 'Verified', 'VerticalAlignBottom', 'VerticalAlignMiddle', 'VerticalAlignTop',
    'Video', 'Wallet', 'Warning', 'Wifi', 'Woman'
  ]
}

const getIconName = (base, style) => {
  if (base.endsWith('Outlined') || base.endsWith('Filled') || base.endsWith('TwoTone')) {
    return base
  }
  const suffix = style === 'outlined' ? 'Outlined' : style === 'filled' ? 'Filled' : 'TwoTone'
  return `${base}${suffix}`
}

const getIconsByCategory = (category) => {
  const categories = category === 'all' ? Object.values(iconCategories).flat() : iconCategories[category] || []
  return categories
    .map(base => {
      const name = getIconName(base, activeStyle.value)
      return {
        name,
        title: base,
        base
      }
    })
    .filter(icon => getIconComponent(icon.name))
}

const getIconComponent = (iconName) => {
  return antIcons[iconName] || null
}

const getIconTitle = (iconName) => {
  return iconName.replace(/Outlined$|Filled$|TwoTone$/, '')
}

const displayValue = computed(() => {
  if (!props.modelValue) return ''
  if (isPresetIcon.value) return getIconTitle(props.modelValue)
  if (isUrlIcon.value) return '自定义URL图标'
  if (isSvgIcon.value) return '自定义SVG图标'
  return ''
})

const filteredIcons = computed(() => {
  let icons = getIconsByCategory(activeCategory.value)
  if (!searchText.value) return icons
  const keyword = searchText.value.toLowerCase()
  return icons.filter(icon => 
    icon.name.toLowerCase().includes(keyword) ||
    icon.title.toLowerCase().includes(keyword)
  )
})

const validateSvg = (svg) => {
  const trimmed = svg.trim()
  isValidSvg.value = trimmed.startsWith('<svg') && trimmed.endsWith('</svg>')
}

const handleImageError = () => {
  message.error('图标加载失败，请检查 URL')
}

watch(() => props.modelValue, (newVal) => {
  selectedIcon.value = newVal
})

watch(activeStyle, (newStyle) => {
  if (selectedIcon.value && iconMode.value === 'preset') {
    const baseName = getIconTitle(selectedIcon.value)
    const newIconName = getIconName(baseName, newStyle)
    if (getIconComponent(newIconName)) {
      selectedIcon.value = newIconName
    }
  }
})

watch(customIconSvg, () => validateSvg(customIconSvg.value))

const showModal = () => {
  selectedIcon.value = props.modelValue
  searchText.value = ''
  activeCategory.value = 'all'
  
  if (props.modelValue && (props.modelValue.startsWith('http') || props.modelValue.startsWith('<svg'))) {
    iconMode.value = 'custom'
    if (props.modelValue.startsWith('http')) {
      customType.value = 'url'
      customIconUrl.value = props.modelValue
    } else {
      customType.value = 'svg'
      customIconSvg.value = props.modelValue
    }
  } else {
    iconMode.value = 'preset'
    if (props.modelValue) {
      if (props.modelValue.endsWith('Filled')) activeStyle.value = 'filled'
      else if (props.modelValue.endsWith('TwoTone')) activeStyle.value = 'twoTone'
      else activeStyle.value = 'outlined'
    }
  }
  visible.value = true
}

const selectIcon = (iconName) => {
  selectedIcon.value = iconName
}

const handleOk = () => {
  if (iconMode.value === 'preset') {
    emit('update:modelValue', selectedIcon.value)
  } else {
    emit('update:modelValue', customType.value === 'url' ? customIconUrl.value : customIconSvg.value)
  }
  visible.value = false
}

const handleCancel = () => {
  selectedIcon.value = props.modelValue
  customIconUrl.value = ''
  customIconSvg.value = ''
  isValidSvg.value = false
  visible.value = false
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
