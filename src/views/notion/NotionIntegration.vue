<template>
  <div class="integration-container">
    <a-card :bordered="false">
      <!-- 搜索栏 -->
      <a-row :gutter="16" style="margin-bottom: 16px">
        <a-col :xs="24" :sm="12" :md="6">
          <a-input
            v-model:value="searchForm.name"
            placeholder="输入集成名称搜索"
            allow-clear
            @pressEnter="handleSearch"
          />
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <a-select
            v-model:value="searchForm.workspaceId"
            placeholder="请选择工作区"
            allow-clear
            style="width: 100%"
            @change="handleSearch"
          >
            <a-select-option 
              v-for="workspace in workspaceOptions" 
              :key="workspace.id" 
              :value="workspace.id"
            >
              {{ workspace.name }}
            </a-select-option>
          </a-select>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <a-select
            v-model:value="searchForm.status"
            placeholder="请选择状态"
            allow-clear
            style="width: 100%"
            @change="handleSearch"
          >
            <a-select-option 
              v-for="item in statusDict" 
              :key="item.value" 
              :value="parseInt(item.value)"
            >
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-col>
        <a-col :xs="24" :sm="24" :md="6">
          <a-space>
            <a-button type="primary" @click="handleSearch">搜索</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-col>
      </a-row>

      <!-- 操作按钮 -->
      <template #extra>
        <a-button type="primary" @click="openAddDialog">
          <template #icon><PlusOutlined /></template>
          新增集成
        </a-button>
      </template>

      <!-- 列表 -->
      <a-table
        :columns="columns"
        :data-source="integrationList"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        :bordered="false"
        :scroll="{ x: 1200 }"
      >
        <template #bodyCell="{ column, record }">
          <!-- 状态列 -->
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'success' : 'error'">
              {{ getDictLabel(statusDict, record.status) }}
            </a-tag>
          </template>

          <!-- 所属工作区列 -->
          <template v-else-if="column.key === 'workspaceName'">
            {{ getWorkspaceNameById(record.workspaceId) }}
          </template>

          <!-- 所属用户列 -->
          <template v-else-if="column.key === 'username'">
            {{ getUsernameById(record.userId) }}
          </template>

          <!-- Token列 -->
          <template v-else-if="column.key === 'token'">
            <a-typography-paragraph
              :copyable="{ text: record.token }"
              :ellipsis="{ rows: 1, expandable: false }"
              style="margin: 0; max-width: 200px;"
            >
              {{ record.token }}
            </a-typography-paragraph>
          </template>

          <!-- 操作列 -->
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="openEditDialog(record)">
                编辑
              </a-button>
              <a-popconfirm
                title="删除集成"
                description="确定要删除该集成吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleDelete(record.id)"
              >
                <a-button type="link" danger size="small">
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑对话框 -->
    <a-modal
      v-model:visible="dialogVisible"
      :title="isEdit ? '编辑集成' : '新增集成'"
      ok-text="确定"
      cancel-text="取消"
      @ok="handleSave"
      :confirmLoading="saveLoading"
      width="600px"
    >
      <a-form :model="formData" :rules="rules" ref="formRef" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="集成名称" name="name" required>
          <a-input v-model:value="formData.name" placeholder="请输入集成名称" />
        </a-form-item>

        <a-form-item label="Token" name="token" required>
          <a-textarea 
            v-model:value="formData.token" 
            placeholder="请输入Notion Token"
            :rows="3"
            allow-clear
          />
        </a-form-item>

        <a-form-item label="所属工作区" name="workspaceId" required>
          <a-select
            v-model:value="formData.workspaceId"
            placeholder="请选择工作区"
            style="width: 100%"
          >
            <a-select-option 
              v-for="workspace in workspaceOptions" 
              :key="workspace.id" 
              :value="workspace.id"
            >
              {{ workspace.name }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="状态" name="status" required>
          <a-select v-model:value="formData.status" placeholder="请选择状态">
            <a-select-option 
              v-for="item in statusDict" 
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

<script>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { pageIntegration, addIntegration, updateIntegration, deleteIntegration, getIntegration } from '@/api/notion.js'
import { listWorkspace } from '@/api/notion.js'
import { getUserPage } from '@/api/user.js'
import { useUserStore } from '@/stores/user.js'
import { dict } from '@/composables/dict.js'

export default {
  name: 'NotionIntegration',
  components: {
    PlusOutlined
  },
  setup() {
    const userStore = useUserStore()
    const integrationList = ref([])
    const loading = ref(false)
    const saveLoading = ref(false)
    const dialogVisible = ref(false)
    const isEdit = ref(false)
    const formRef = ref()
    const userOptions = ref([])
    const workspaceOptions = ref([])

    // 使用字典 Hook
    const { getDictByCode, getDictLabel } = dict()

    // 字典数据
    const statusDict = ref([])

    const searchForm = reactive({
      name: '',
      workspaceId: undefined,
      status: undefined
    })

    const formData = reactive({
      id: null,
      name: '',
      token: '',
      workspaceId: null,
      status: 1,
      userId: null
    })

    const pagination = reactive({
      current: 1,
      pageSize: 10,
      total: 0,
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: ['5', '10', '20', '50'],
      showTotal: (total) => `共 ${total} 条`
    })

    const rules = {
      name: [{ required: true, message: '请输入集成名称' }],
      token: [{ required: true, message: '请输入Token' }],
      workspaceId: [{ required: true, message: '请选择工作区' }],
      status: [{ required: true, message: '请选择状态' }]
    }

    const isAdmin = computed(() => {
      return userStore.userInfo?.roles?.some(role => 
        role.roleCode === 'admin' || 
        role.roleCode === 'ADMIN' || 
        role.roleCode === 'SUPER_ADMIN'
      )
    })

    // 动态列定义（管理员显示所属用户列）
    const columns = computed(() => {
      const baseColumns = [
        {
          title: '集成名称',
          dataIndex: 'name',
          key: 'name',
          width: 150
        },
        {
          title: 'Token',
          dataIndex: 'token',
          key: 'token',
          width: 200
        },
        {
          title: '所属工作区',
          dataIndex: 'workspaceName',
          key: 'workspaceName',
          width: 150
        },
        {
          title: '状态',
          dataIndex: 'status',
          key: 'status',
          width: 100
        }
      ]

      // 管理员显示所属用户列
      if (isAdmin.value) {
        baseColumns.push({
          title: '所属用户',
          dataIndex: 'username',
          key: 'username',
          width: 120
        })
      }

      baseColumns.push(
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
        {
          title: '操作',
          key: 'action',
          width: 120,
          align: 'center'
        }
      )

      return baseColumns
    })

    // 根据workspaceId获取工作区名称
    const getWorkspaceNameById = (workspaceId) => {
      if (!workspaceId) return '-'
      const workspace = workspaceOptions.value.find(w => w.id === workspaceId)
      return workspace ? workspace.name : '-'
    }

    // 根据userId获取用户名
    const getUsernameById = (userId) => {
      if (!userId) return '-'
      const user = userOptions.value.find(u => u.id === userId)
      return user ? user.realName : '-'
    }

    // 获取集成列表
    const fetchIntegrationList = async () => {
      loading.value = true
      try {
        const res = await pageIntegration({
          pageNum: pagination.current,
          pageSize: pagination.pageSize,
          name: searchForm.name,
          workspaceId: searchForm.workspaceId,
          status: searchForm.status
        })
        if (res.code === 200) {
          integrationList.value = res.data.records || []
          pagination.total = res.data.total || 0
        } else {
          message.error(res.message || '获取集成列表失败')
        }
      } catch (error) {
        message.error('获取集成列表失败')
        console.error(error)
      } finally {
        loading.value = false
      }
    }

    // 获取工作区列表
    const fetchWorkspaceList = async () => {
      try {
        const res = await listWorkspace()
        if (res.code === 200) {
          workspaceOptions.value = res.data || []
        }
      } catch (error) {
        console.error('获取工作区列表失败', error)
      }
    }

    // 获取用户列表（仅管理员）
    const fetchUserList = async () => {
      if (!isAdmin.value) return
      try {
        const res = await getUserPage({
          pageNum: 1,
          pageSize: 100
        })
        if (res.code === 200) {
          userOptions.value = res.data.records || []
        }
      } catch (error) {
        console.error('获取用户列表失败', error)
      }
    }

    // 打开新增对话框
    const openAddDialog = () => {
      isEdit.value = false
      formData.id = null
      formData.name = ''
      formData.token = ''
      formData.workspaceId = null
      formData.status = 1
      formData.userId = userStore.userInfo?.id
      dialogVisible.value = true
      nextTick(() => formRef.value?.clearValidate())
    }

    // 打开编辑对话框
    const openEditDialog = async (record) => {
      isEdit.value = true
      try {
        const res = await getIntegration(record.id)
        if (res.code === 200) {
          const integration = res.data
          formData.id = integration.id
          formData.name = integration.name
          formData.token = integration.token
          formData.workspaceId = integration.workspaceId
          formData.status = integration.status
          formData.userId = integration.userId
          dialogVisible.value = true
          nextTick(() => formRef.value?.clearValidate())
        } else {
          message.error(res.message || '获取集成详情失败')
        }
      } catch (error) {
        message.error('获取集成详情失败')
        console.error(error)
      }
    }

    // 保存（新增/编辑）
    const handleSave = async () => {
      try {
        await formRef.value?.validate()
        saveLoading.value = true

        const data = {
          name: formData.name,
          token: formData.token,
          workspaceId: formData.workspaceId,
          status: formData.status,
          userId: formData.userId || userStore.userInfo?.id
        }

        let res
        if (isEdit.value) {
          data.id = formData.id
          res = await updateIntegration(data)
        } else {
          res = await addIntegration(data)
        }

        if (res.code === 200) {
          message.success(isEdit.value ? '更新成功' : '新增成功')
          dialogVisible.value = false
          fetchIntegrationList()
        } else {
          message.error(res.message || '操作失败')
        }
      } catch (error) {
        console.error(error)
      } finally {
        saveLoading.value = false
      }
    }

    // 删除
    const handleDelete = async (id) => {
      try {
        const res = await deleteIntegration(id)
        if (res.code === 200) {
          message.success('删除成功')
          fetchIntegrationList()
        } else {
          message.error(res.message || '删除失败')
        }
      } catch (error) {
        message.error('删除失败')
        console.error(error)
      }
    }

    // 表格变化（分页、排序等）
    const handleTableChange = (pag) => {
      pagination.current = pag.current
      pagination.pageSize = pag.pageSize
      fetchIntegrationList()
    }

    // 搜索
    const handleSearch = () => {
      pagination.current = 1
      fetchIntegrationList()
    }

    // 重置
    const handleReset = () => {
      searchForm.name = ''
      searchForm.workspaceId = undefined
      searchForm.status = undefined
      pagination.current = 1
      fetchIntegrationList()
    }

    onMounted(async () => {
      // 确保用户信息已加载
      if (!userStore.userInfo) {
        await userStore.getUserInfo()
      }
      // 加载字典数据
      statusDict.value = await getDictByCode('status')
      // 加载工作区列表
      fetchWorkspaceList()
      // 加载集成列表
      fetchIntegrationList()
      // 加载用户列表（仅管理员）
      fetchUserList()
    })

    return {
      columns,
      integrationList,
      loading,
      saveLoading,
      dialogVisible,
      isEdit,
      formRef,
      formData,
      pagination,
      rules,
      userOptions,
      workspaceOptions,
      isAdmin,
      searchForm,
      openAddDialog,
      openEditDialog,
      handleSave,
      handleDelete,
      handleTableChange,
      handleSearch,
      handleReset,
      PlusOutlined,
      statusDict,
      getDictLabel,
      getUsernameById,
      getWorkspaceNameById
    }
  }
}
</script>

<style scoped>
.integration-container {
  padding: 20px;
}
</style>
