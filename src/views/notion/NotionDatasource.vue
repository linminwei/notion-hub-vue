<template>
  <div class="user-manage">
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
            新增
          </a-button>
        </a-form-item>
      </a-form>

      <!-- 表格 -->
      <ResponsiveTable
        :columns="columns"
        :data-source="tableData"
        :pagination="pagination"
        :loading="loading"
        :scroll="{ x: 'max-content', y: 400 }"
        @change="handleTableChange"
        row-key="id"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'success' : 'error'">
              {{ getDictLabel(userStatusDict, record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a v-if="userStore.hasPermission('notion:datasource:edit')" @click="handleEdit(record)">编辑</a>
              <a v-if="userStore.hasPermission('notion:datasource:edit')" @click="handleResetPassword(record)">重置密码</a>
              <a-popconfirm 
                v-if="userStore.hasPermission('notion:datasource:delete')"
                title="确定删除?" 
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleDelete(record.id)"
              >
                <a style="color: red">删除</a>
              </a-popconfirm>
            
              <span v-if="!userStore.hasPermission('notion:datasource:edit') && !userStore.hasPermission('notion:datasource:delete')" style="color: #999;">
                无操作权限
              </span>
            </a-space>
          </template>
        </template>
      </ResponsiveTable>
    </a-card>

    <!-- 新增/编辑对话框 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      ok-text="确定"
      cancel-text="取消"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form :model="formData" :label-col="{ span: 6 }">
        <a-form-item label="数据源名称" required>
          <a-input v-model:value="formData.name" :disabled="!!formData.id" />
        </a-form-item>
        <a-form-item label="数据源ID" required>
          <a-input v-model:value="formData.datasourceId" :disabled="!!formData.id" />
        </a-form-item>
        <a-form-item label="Token">
          <a-input v-model:value="formData.token" :disabled="!!formData.id" />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="formData.status">
            <a-select-option 
              v-for="item in userStatusDict" 
              :key="item.value" 
              :value="parseInt(item.value)"
            >
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, h } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { pageDatasource,addDatasource,updateDatasource} from '@/api/notion.js'
import ResponsiveTable from '@/components/ResponsiveTable.vue'
import { getAllRoles } from '@/api/role'
import { dict } from '@/composables/dict.js'
import { useUserStore } from '@/stores/user'

// 用户权限store
const userStore = useUserStore()

// 使用字典 Hook
const { getDictByCode, getDictLabel } = dict()

// 字典数据
const userStatusDict = ref([])

const columns = [
  { title: '数据源名称', dataIndex: 'name', key: 'name' },
  { title: '数据源ID', dataIndex: 'datasourceId', key: 'datasourceId' },
  { title: 'Token', dataIndex: 'token', key: 'token' },
  { title: '状态', key: 'status' },
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
  username: '',
  realName: '',
  phone: '',
  email: '',
  status: 1,
  password: '',
  roleIds: []
})

const allRoles = ref([])

const loadRoles = async () => {
  try {
    const res = await getAllRoles()
    if (res.data) {
      allRoles.value = res.data
    }
  } catch (error) {
    console.error(error)
  }
}

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
  await loadRoles()
}

const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

const handleReset = () => {
  searchForm.name = ''
  pagination.current = 1
  loadData()
}

const handleAdd = () => {
  modalTitle.value = '新增数据源'
  Object.assign(formData, {
    id: null,
    name: '',
    datasourceId: '',
    token: '',
    status: 1,
  })
  modalVisible.value = true
}

const handleEdit = async (record) => {
  modalTitle.value = '编辑数据源'
  Object.assign(formData, record)
  // 加载用户角色
  try {
    const res = await getUserRoles(record.id)
    if (res.data) {
      formData.roleIds = res.data.map(role => role.id)
    }
  } catch (error) {
    console.error(error)
  }
  modalVisible.value = true
}

const handleSubmit = async () => {
  try {
    if (formData.id) {
      await updateUser(formData)
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

const handleCancel = () => {
  modalVisible.value = false
}

// 生成随机密码
const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  formData.password = password
  
  // 弹窗展示生成的密码
  Modal.success({
    title: '密码已生成',
    content: h('div', [
      h('p', '生成的密码为：'),
      h('div', {
        style: {
          backgroundColor: '#f0f0f0',
          padding: '12px',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '14px',
          wordBreak: 'break-all'
        }
      }, password),
      h('p', {
        style: { marginTop: '12px', fontSize: '12px', color: '#666' }
      }, '请妥善保管此密码，用户登录时使用')
    ]),
    okText: '关闭',
    centered: true
  })
}

// 重置用户密码
const handleResetPassword = (record) => {
  Modal.confirm({
    title: '重置密码',
    content: `确定要为用户 "${record.username}" 重置密码吗？系统将生成一个新的随机密码。`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        const res = await resetUserPassword(record.id)
        if (res.data) {
          message.success('密码已重置')
          // 弹窗展示新密码
          Modal.success({
            title: '密码已重置',
            content: h('div', [
              h('p', [
                '用户 ',
                h('strong', record.username),
                ' 的新密码为：'
              ]),
              h('div', {
                style: {
                  backgroundColor: '#f0f0f0',
                  padding: '12px',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  wordBreak: 'break-all'
                }
              }, res.data),
              h('p', {
                style: { marginTop: '12px', fontSize: '12px', color: '#666' }
              }, '请妥善保管此密码，并通知用户。用户可在登录后修改密码。')
            ]),
            okText: '关闭',
            centered: true
          })
        }
      } catch (error) {
        message.error('重置密码失败')
        console.error(error)
      }
    }
  })
}

const handleDelete = async (id) => {
  try {
    await deleteUser(id)
    message.success('删除成功')
    loadData()
  } catch (error) {
    console.error(error)
  }
}

onMounted(async () => {
  // 加载字典数据
  userStatusDict.value = await getDictByCode('status')
  // 加载表格数据
  loadData()
})
</script>

<style scoped>
.search-form {
  margin-bottom: 16px;
}
</style>
