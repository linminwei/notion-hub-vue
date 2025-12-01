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
              {{ record.status === 1 ? '启用' : '禁用' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'token'">
            <span v-if="!visibleToken">{{ maskToken(record.token) }}</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
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
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { pageDatasource, addDatasource, updateDatasource, deleteDatasource } from '@/api/notion.js'
import { useUserStore } from '@/stores/user.js'

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
  { title: '操作', key: 'action', width: 150 }
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

// 切换Token可见性
const toggleTokenVisibility = (recordId) => {
  visibleTokens[recordId] = !visibleTokens[recordId]
}

// 复制Token
const copyToken = (token) => {
  if (!token) return
  navigator.clipboard.writeText(token).then(() => {
    message.success('Token已复制到剪贴板')
  }).catch(() => {
    message.error('复制失败')
  })
}

onMounted(() => {
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

</style>
