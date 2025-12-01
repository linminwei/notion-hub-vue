<template>
  <div class="notion-config">
    <a-card>
      <!-- 搜索栏 -->
      <a-form layout="inline" class="search-form">
        <a-form-item>
          <a-input v-model:value="searchForm.name" placeholder="数据源名称" allowClear />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="loadData">查询</a-button>
          <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
          <a-button
            v-if="userStore.hasPermission('notion:datasource:add')"
            type="primary"
            style="margin-left: 8px"
            @click="handleAdd"
          >
            新增数据源
          </a-button>
        </a-form-item>
      </a-form>

      <!-- 表格 -->
      <a-table
        :columns="columns"
        :data-source="tableData"
        :pagination="pagination"
        :loading="loading"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'success' : 'error'">
              {{ getDictLabel(statusDict, record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'token'">
            <span>{{ maskToken(record.token) }}</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a v-if="userStore.hasPermission('notion:datasource:test-connection')" @click="handleTestConnection(record)">测试连接</a>
              <a v-if="userStore.hasPermission('notion:field:list')" @click="handleFieldMapping(record)">字段映射</a>
              <a v-if="userStore.hasPermission('notion:datasource:edit')" @click="handleEdit(record)">编辑</a>
              <a-popconfirm
                v-if="userStore.hasPermission('notion:datasource:delete')"
                title="确定删除?"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleDelete(record.id)"
              >
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
      ok-text="确定"
      cancel-text="取消"
      @ok="handleSubmit"
      width="600px"
    >
      <a-form :model="formData" :label-col="{ span: 6 }">
        <a-form-item label="数据源名称" required>
          <a-input v-model:value="formData.name" placeholder="请输入数据源名称" />
        </a-form-item>
        <a-form-item label="数据源ID" required>
          <a-input v-model:value="formData.datasourceId" placeholder="请输入Notion数据库ID" />
        </a-form-item>
        <a-form-item label="Token" required>
          <a-input-password
            v-model:value="formData.token"
            placeholder="请输入Notion API Token"
            :maxlength="200"
          />
        </a-form-item>
        <a-form-item label="状态">
          <a-radio-group v-model:value="formData.status">
            <a-radio
                v-for="item in statusDict"
                :key="item.value"
                :value="parseInt(item.value)"
            >
              {{ item.label }}
            </a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 字段映射对话框 -->
    <a-modal
      v-model:open="mappingVisible"
      ok-text="保存"
      cancel-text="取消"
      @ok="handleSaveMappings"
      width="900px"
    >
      <div class="mapping-content">
        <a-button type="primary" @click="handleAddMapping" style="margin-bottom: 16px">
          新增字段映射
        </a-button>
        <a-table
          :columns="mappingColumns"
          :data-source="mappingData"
          :pagination="false"
          row-key="id"
          size="small"
        >
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'fieldName'">
              <a-input 
                v-model:value="record.fieldName"
                placeholder="如: title"
                size="small"
              />
            </template>
            <template v-else-if="column.key === 'propertyName'">
              <a-input 
                v-model:value="record.propertyName"
                placeholder="如: 标题"
                size="small"
              />
            </template>
            <template v-else-if="column.key === 'propertyType'">
              <a-select
                  v-model:value="record.propertyType"
                  placeholder="请选择"
                  size="small"
                  style="width: 100%">
                <a-select-option
                    v-for="item in propertyTypeDict"
                    :key="item.value"
                    :value="item.value"
                >
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-button 
                type="link" 
                danger 
                size="small"
                @click="handleDeleteMapping(index)"
              >
                删除
              </a-button>
            </template>
          </template>
        </a-table>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { 
  pageDatasource, 
  addDatasource, 
  updateDatasource, 
  deleteDatasource,
  testConnection,
  listMappings,
  batchSaveMappings
} from '@/api/notion.js'
import { useUserStore } from '@/stores/user.js'
import { dict } from '@/composables/dict.js'

// 使用字典 Hook
const { getDictByCode, getDictLabel } = dict()

// 字典数据
const statusDict = ref([])
const propertyTypeDict = ref([])

// 用户权限store
const userStore = useUserStore()

const columns = [
  { title: '数据源名称', dataIndex: 'name', key: 'name' },
  { title: '数据源ID', dataIndex: 'datasourceId', key: 'datasourceId' },
  { title: 'Token', dataIndex: 'token', key: 'token' },
  { title: '状态', key: 'status', width: 100 },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180,
    customRender: ({ text }) => text ? text.replace('T', ' ').substring(0, 19) : '-'
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    key: 'updateTime',
    width: 180,
    customRender: ({ text }) => text ? text.replace('T', ' ').substring(0, 19) : '-'
  },
  { title: '操作', key: 'action', width: 260 }
]

const searchForm = reactive({ name: '' })
const tableData = ref([])
const loading = ref(false)
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const modalVisible = ref(false)
const modalTitle = ref('新增数据源')
const formData = reactive({
  id: null,
  name: '',
  datasourceId: '',
  token: '',
  status: 1
})

// 字段映射相关
const mappingVisible = ref(false)
const currentDatasource = ref(null)
const mappingData = ref([])
let mappingIdCounter = 1
const mappingColumns = [
  { title: '前端字段', key: 'fieldName', width: 200 },
  { title: 'Notion属性', key: 'propertyName', width: 200 },
  { title: 'Notion属性类型', key: 'propertyType', width: 180 },
  { title: '操作', key: 'action', width: 100 }
]

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await pageDatasource({
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      name: searchForm.name
    })
    if (res.data) {
      tableData.value = res.data.records
      pagination.total = res.data.total
    }
  } finally {
    loading.value = false
  }
}

// 分页改变
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

// 重置搜索
const handleReset = () => {
  searchForm.name = ''
  pagination.current = 1
  loadData()
}

// 新增
const handleAdd = () => {
  modalTitle.value = '新增数据源'
  Object.assign(formData, {
    id: null,
    name: '',
    datasourceId: '',
    token: '',
    status: 1
  })
  modalVisible.value = true
}

// 编辑
const handleEdit = (record) => {
  modalTitle.value = '编辑数据源'
  Object.assign(formData, record)
  modalVisible.value = true
}

// 提交
const handleSubmit = async () => {
  try {
    if (!formData.name) {
      message.warning('请输入数据源名称')
      return
    }
    if (!formData.datasourceId) {
      message.warning('请输入数据源ID')
      return
    }
    if (!formData.token) {
      message.warning('请输入Token')
      return
    }

    if (formData.id) {
      await updateDatasource(formData)
      message.success('更新成功')
    } else {
      await addDatasource(formData)
      message.success('新增成功')
    }
    modalVisible.value = false
    loadData()
  } catch (error) {
    console.error(error)
  }
}

// 删除
const handleDelete = async (id) => {
  try {
    await deleteDatasource(id)
    message.success('删除成功')
    loadData()
  } catch (error) {
    console.error(error)
  }
}

// Token脱敏显示
const maskToken = (token) => {
  if (!token) return '-'
  if (token.length <= 8) return token
  return token.substring(0, 8) + '****' + token.substring(token.length - 4)
}

// 测试连接
const handleTestConnection = async (record) => {
  const loading = message.loading('正在测试连接...', 0)
  try {
    const res = await testConnection({
      datasourceId: record.datasourceId,
      token: record.token
    })
    loading()
    message.success('数据源连接测试成功！' )
  } catch (error) {
    loading()
    console.error(error)
  }
}

// 打开字段映射对话框
const handleFieldMapping = async (record) => {
  currentDatasource.value = record
  try {
    const res = await listMappings(record.id)
    if (res.data && res.data.length > 0) {
      // 加载已有映射
      mappingData.value = res.data.map(item => ({
        ...item
      }))
    } else {
      // 没有映射，初始化空数组
      mappingData.value = []
    }
    mappingVisible.value = true
  } catch (error) {
    console.error(error)
  }
}

// 新增字段映射
const handleAddMapping = () => {
  mappingData.value.push({
    id: `temp_${mappingIdCounter++}`,
    fieldName: '',
    propertyName: '',
    propertyType: null
  })
}

// 删除字段映射
const handleDeleteMapping = (index) => {
  mappingData.value.splice(index, 1)
}

// 保存字段映射
const handleSaveMappings = async () => {
  try {
    // 校验必填字段
    for (let i = 0; i < mappingData.value.length; i++) {
      const item = mappingData.value[i]
      if (!item.fieldName) {
        message.warning(`第${i + 1}行的前端字段不能为空`)
        return
      }
      if (!item.propertyName) {
        message.warning(`第${i + 1}行的Notion属性不能为空`)
        return
      }
      if (!item.propertyType) {
        message.warning(`第${i + 1}行的Notion属性类型不能为空`)
        return
      }
    }

    // 转换数据格式
    const saveData = mappingData.value.map((item, index) => ({
      fieldName: item.fieldName,
      propertyName: item.propertyName,
      propertyType: item.propertyType,
    }))

    await batchSaveMappings(currentDatasource.value.id, saveData)
    message.success('字段映射保存成功')
    mappingVisible.value = false
  } catch (error) {
    message.error('保存失败: ' + (error.message || '网络错误'))
    console.error(error)
  }
}

onMounted(async () => {
  // 加载字典数据
  statusDict.value = await getDictByCode('status')
  propertyTypeDict.value = await getDictByCode('notion_property_type')
  loadData()
})
</script>

<style scoped>
.search-form {
  margin-bottom: 16px;
}


.token-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.visible-token {
  font-family: 'Courier New', monospace;
  color: #ff7a45;
  word-break: break-all;
}

.token-actions {
  display: flex;
  gap: 0;
}

.token-actions :deep(.ant-btn) {
  padding: 2px 6px;
  color: #1890ff;
}

.token-actions :deep(.ant-btn:hover) {
  color: #40a9ff;
}

.mapping-content {
  max-height: 500px;
  overflow-y: auto;
}
</style>
