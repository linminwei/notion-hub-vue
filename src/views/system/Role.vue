<template>
  <div class="role-manage">
    <a-card>
      <a-space class="mb-16">
        <a-button type="primary" @click="handleAdd">新增角色</a-button>
      </a-space>

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
              {{ getDictLabel(roleStatusDict, record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a @click="handleEdit(record)">编辑</a>
              <a @click="handlePermission(record)">分配权限</a>
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
    >
      <a-form :model="formData" :label-col="{ span: 6 }">
        <a-form-item label="角色名称" required>
          <a-input v-model:value="formData.roleName" />
        </a-form-item>
        <a-form-item label="角色编码" required>
          <a-input v-model:value="formData.roleCode" />
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea v-model:value="formData.description" />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="formData.status">
            <a-select-option
                v-for="item in roleStatusDict"
                :key="item.value"
                :value="parseInt(item.value)"
            >
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 权限分配对话框 -->
    <a-modal
      v-model:open="permissionVisible"
      title="分配权限"
      @ok="handlePermissionSubmit"
      width="600px"
    >
      <a-tree
        v-model:checked-keys="checkedKeys"
        checkable
        :tree-data="menuTree"
        :field-names="{ children: 'children', title: 'menuName', key: 'id' }"
      />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { getRolePage, addRole, updateRole, deleteRole, assignPermissions, getRoleMenuIds } from '@/api/role'
import { getMenuTree } from '@/api/menu'
import { dict } from '@/composables/dict.js'


// 使用字典 Hook
const { getDictByCode, getDictLabel } = dict()

// 字典数据
const roleStatusDict = ref([])

const columns = [
  { title: '角色名称', dataIndex: 'roleName', key: 'roleName' },
  { title: '角色编码', dataIndex: 'roleCode', key: 'roleCode' },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { title: '状态', key: 'status' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
  { title: '操作', key: 'action', width: 200 }
]

const tableData = ref([])
const loading = ref(false)
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const modalVisible = ref(false)
const modalTitle = ref('新增角色')
const formData = reactive({
  id: null,
  roleName: '',
  roleCode: '',
  description: '',
  status: 1
})

const permissionVisible = ref(false)
const currentRoleId = ref(null)
const menuTree = ref([])
const checkedKeys = ref([])

const loadData = async () => {
  loading.value = true
  try {
    const res = await getRolePage({
      pageNum: pagination.current,
      pageSize: pagination.pageSize
    })
    if (res.data) {
      tableData.value = res.data.records
      pagination.total = res.data.total
    }
  } finally {
    loading.value = false
  }
}

const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

const handleAdd = () => {
  modalTitle.value = '新增角色'
  Object.assign(formData, {
    id: null,
    roleName: '',
    roleCode: '',
    description: '',
    status: 1
  })
  modalVisible.value = true
}

const handleEdit = (record) => {
  modalTitle.value = '编辑角色'
  Object.assign(formData, record)
  modalVisible.value = true
}

const handleSubmit = async () => {
  try {
    if (formData.id) {
      await updateRole(formData)
      message.success('更新成功')
    } else {
      await addRole(formData)
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
    await deleteRole(id)
    message.success('删除成功')
    loadData()
  } catch (error) {
    console.error(error)
  }
}

const handlePermission = async (record) => {
  currentRoleId.value = record.id
  
  // 加载菜单树
  const menuRes = await getMenuTree()
  if (menuRes.data) {
    menuTree.value = menuRes.data
  }
  
  // 加载已分配的权限
  const permRes = await getRoleMenuIds(record.id)
  if (permRes.data) {
    checkedKeys.value = permRes.data
  }
  
  permissionVisible.value = true
}

const handlePermissionSubmit = async () => {
  try {
    await assignPermissions(currentRoleId.value, checkedKeys.value)
    message.success('权限分配成功')
    permissionVisible.value = false
  } catch (error) {
    console.error(error)
  }
}

onMounted(async () => {
  // 加载字典数据
  roleStatusDict.value = await getDictByCode('status')
  loadData()
})
</script>

<style scoped>
.mb-16 {
  margin-bottom: 16px;
}
</style>
