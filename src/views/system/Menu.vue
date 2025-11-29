<template>
  <div class="menu-manage">
    <a-card>
      <a-space class="mb-16">
        <a-button type="primary" @click="handleAdd">新增菜单</a-button>
      </a-space>

      <a-table
        :columns="columns"
        :data-source="tableData"
        :loading="loading"
        :pagination="false"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'icon'">
            <!-- 预设图标 -->
            <component v-if="record.icon && isPresetIcon(record.icon)" :is="getIconComponent(record.icon)" style="font-size: 18px; color: #1890ff;" />
            <!-- URL 图标 -->
            <img v-else-if="record.icon && isUrlIcon(record.icon)" :src="record.icon" alt="icon" class="menu-custom-icon" />
            <!-- SVG 图标 -->
            <span v-else-if="record.icon && isSvgIcon(record.icon)" v-html="record.icon" class="menu-custom-icon"></span>
            <span v-else style="color: #ccc;">-</span>
          </template>
          <template v-else-if="column.key === 'menuType'">
            <a-tag :color="record.menuType === 1 ? 'blue' : record.menuType === 2 ? 'green' : 'orange'">
              {{getDictLabel(menuTypeDict,record.menuType)}}
            </a-tag>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'success' : 'error'">
              {{ getDictLabel(menuStatusDict, record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a @click="handleEdit(record)">编辑</a>
              <a-popconfirm title="确定删除?" @confirm="handleDelete(record.id)">
                <a style="color: red">删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑对话框 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      @ok="handleSubmit"
      width="600px"
    >
      <a-form :model="formData" :label-col="{ span: 6 }">
        <a-form-item label="上级菜单">
          <a-tree-select
            v-model:value="formData.parentId"
            :tree-data="parentMenuOptions"
            :field-names="{ children: 'children', label: 'menuName', value: 'id' }"
            placeholder="请选择上级菜单"
          />
        </a-form-item>
        <a-form-item label="菜单名称" required>
          <a-input v-model:value="formData.menuName" />
        </a-form-item>
        <a-form-item label="菜单类型">
          <a-radio-group v-model:value="formData.menuType">
            <a-radio
                v-for="item in menuTypeDict"
                :key="item.value"
                :value="parseInt(item.value)"
            >
              {{ item.label }}
            </a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="路由地址">
          <a-input v-model:value="formData.path" />
        </a-form-item>
        <a-form-item label="组件路径">
          <a-input v-model:value="formData.component" />
        </a-form-item>
        <a-form-item label="权限标识">
          <a-input v-model:value="formData.permission" />
        </a-form-item>
        <a-form-item label="图标">
          <IconSelector v-model="formData.icon" />
        </a-form-item>
        <a-form-item label="排序">
          <a-input-number v-model:value="formData.sort" :min="0" />
        </a-form-item>
        <a-form-item label="状态">
          <a-radio-group v-model:value="formData.status">
            <a-radio
                v-for="item in menuStatusDict"
                :key="item.value"
                :value="parseInt(item.value)"
            >
              {{ item.label }}
            </a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { getMenuTree, addMenu, updateMenu, deleteMenu } from '@/api/menu'
import IconSelector from '@/components/IconSelector.vue'
import * as antIcons from '@ant-design/icons-vue'
import { dict } from '@/composables/dict.js'


// 使用字典 Hook
const { getDictByCode, getDictLabel } = dict()

// 字典数据
const menuStatusDict = ref([])
const menuTypeDict = ref([])

const columns = [
  { title: '菜单名称', dataIndex: 'menuName', key: 'menuName', width: 200 },
  { title: '图标', key: 'icon', width: 80 },
  { title: '菜单类型', key: 'menuType', width: 100 },
  { title: '路由地址', dataIndex: 'path', key: 'path' },
  { title: '权限标识', dataIndex: 'permission', key: 'permission' },
  { title: '排序', dataIndex: 'sort', key: 'sort', width: 80 },
  { title: '状态', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 150 }
]

const tableData = ref([])
const loading = ref(false)

const modalVisible = ref(false)
const modalTitle = ref('新增菜单')
const formData = reactive({
  id: null,
  parentId: 0,
  menuName: '',
  menuType: 1,
  path: '',
  component: '',
  permission: '',
  icon: '',
  sort: 0,
  status: 1
})

const parentMenuOptions = ref([
  { id: 0, menuName: '根目录', children: [] }
])

// 获取图标组件
const getIconComponent = (iconName) => {
  return antIcons[iconName] || null
}

// 判断图标类型
const isPresetIcon = (icon) => {
  if (!icon) return false
  return !icon.startsWith('http') && !icon.startsWith('<svg')
}

const isUrlIcon = (icon) => {
  if (!icon) return false
  return icon.startsWith('http')
}

const isSvgIcon = (icon) => {
  if (!icon) return false
  return icon.startsWith('<svg')
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getMenuTree()
    if (res.data) {
      tableData.value = res.data
      // 更新父菜单选项
      parentMenuOptions.value = [
        { id: 0, menuName: '根目录', children: res.data }
      ]
    }
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  modalTitle.value = '新增菜单'
  Object.assign(formData, {
    id: null,
    parentId: 0,
    menuName: '',
    menuType: 1,
    path: '',
    component: '',
    permission: '',
    icon: '',
    sort: 0,
    status: 1
  })
  modalVisible.value = true
}

const handleEdit = (record) => {
  modalTitle.value = '编辑菜单'
  Object.assign(formData, record)
  modalVisible.value = true
}

const handleSubmit = async () => {
  try {
    if (formData.id) {
      await updateMenu(formData)
      message.success('更新成功')
    } else {
      await addMenu(formData)
      message.success('新增成功')
    }
    modalVisible.value = false
    loadData()
  } catch (error) {
    console.error(error)
  }
}

const handleDelete = async (id) => {
  try {
    await deleteMenu(id)
    message.success('删除成功')
    loadData()
  } catch (error) {
    console.error(error)
  }
}

onMounted(async () => {
  // 加载字典数据
  menuStatusDict.value = await getDictByCode('status')
  menuTypeDict.value = await getDictByCode("menu_type")
  loadData()
})
</script>

<style scoped>
.mb-16 {
  margin-bottom: 16px;
}

/* 自定义图标样式 */
.menu-custom-icon {
  width: 18px;
  height: 18px;
  display: inline-block;
  object-fit: contain;
  vertical-align: middle;
}

.menu-custom-icon :deep(svg) {
  width: 100% !important;
  height: 100% !important;
  max-width: 18px !important;
  max-height: 18px !important;
  vertical-align: middle;
}
</style>
