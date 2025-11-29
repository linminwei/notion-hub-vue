<template>
  <div class="user-manage">
    <a-card>
      <!-- 搜索栏 -->
      <a-form layout="inline" class="search-form">
        <a-form-item>
          <a-input v-model:value="searchForm.username" placeholder="用户名" allowClear />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="loadData">查询</a-button>
          <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
          <a-button type="primary" style="margin-left: 8px" @click="handleAdd">新增</a-button>
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
              <a @click="handleEdit(record)">编辑</a>
              <a @click="handleResetPassword(record)">重置密码</a>
              <a-popconfirm title="确定删除?" @confirm="handleDelete(record.id)">
                <a style="color: red">删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </ResponsiveTable>
    </a-card>

    <!-- 新增/编辑对话框 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form :model="formData" :label-col="{ span: 6 }">
        <a-form-item label="用户名" required>
          <a-input v-model:value="formData.username" :disabled="!!formData.id" />
        </a-form-item>
        <a-form-item label="真实姓名">
          <a-input v-model:value="formData.realName" :disabled="!!formData.id" />
        </a-form-item>
        <a-form-item label="手机号">
          <a-input v-model:value="formData.phone" :disabled="!!formData.id" />
        </a-form-item>
        <a-form-item label="邮箱">
          <a-input v-model:value="formData.email" :disabled="!!formData.id" />
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
        <!-- 新增用户：按钮生成密码 -->
        <a-form-item v-if="!formData.id" label="密码">
          <a-space>
            <span v-if="formData.password" style="font-family: monospace; background: #f0f0f0; padding: 4px 8px; border-radius: 4px;">{{ formData.password }}</span>
            <span v-else style="color: #999;">未生成</span>
            <a-button @click="generatePassword" type="primary" size="small">生成密码</a-button>
          </a-space>
        </a-form-item>
        <a-form-item label="角色">
          <a-select v-model:value="formData.roleIds" mode="multiple" placeholder="请选择角色">
            <a-select-option v-for="role in allRoles" :key="role.id" :value="role.id">
              {{ role.roleName }}
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
import { getUserPage, addUser, updateUser, deleteUser, getUserRoles, resetUserPassword } from '@/api/user'
import ResponsiveTable from '@/components/ResponsiveTable.vue'
import { getAllRoles } from '@/api/role'
import { dict } from '@/composables/dict.js'

// 使用字典 Hook
const { getDictByCode, getDictLabel } = dict()

// 字典数据
const userStatusDict = ref([])

const columns = [
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '真实姓名', dataIndex: 'realName', key: 'realName' },
  { title: '手机号', dataIndex: 'phone', key: 'phone' },
  { title: '邮箱', dataIndex: 'email', key: 'email' },
  { title: '状态', key: 'status' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
  { title: '操作', key: 'action', width: 150 }
]

const searchForm = reactive({ username: '' })
const tableData = ref([])
const loading = ref(false)
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const modalVisible = ref(false)
const modalTitle = ref('新增用户')
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
    const res = await getUserPage({
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      username: searchForm.username
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
  searchForm.username = ''
  pagination.current = 1
  loadData()
}

const handleAdd = () => {
  modalTitle.value = '新增用户'
  Object.assign(formData, {
    id: null,
    username: '',
    realName: '',
    phone: '',
    email: '',
    status: 1,
    password: '',
    roleIds: []
  })
  modalVisible.value = true
}

const handleEdit = async (record) => {
  modalTitle.value = '编辑用户'
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
      await addUser(formData)
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
