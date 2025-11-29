<template>
  <div class="workspace-container">
    <a-card :bordered="false">
      <!-- 搜索栏 -->
      <a-row :gutter="16" style="margin-bottom: 16px">
        <a-col :xs="24" :sm="12" :md="8">
          <a-input
            v-model:value="searchForm.name"
            placeholder="输入工作区名称搜索"
            allow-clear
            @pressEnter="handleSearch"
          />
        </a-col>
        <a-col :xs="24" :sm="12" :md="8">
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
        <a-col :xs="24" :sm="24" :md="8">
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
          新增工作区
        </a-button>
      </template>

      <!-- 列表 -->
      <a-table
        :columns="columns"
        :data-source="workspaceList"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        :bordered="false"
        :scroll="{ x: 1200 }"
      >
        <!-- 图标列 -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'icon'">
            <!-- Ant Design 图标 -->
            <component 
              v-if="record.icon && isPresetIcon(record.icon)" 
              :is="getIconComponent(record.icon)" 
              style="font-size: 24px; color: #1890ff;" 
            />
            <!-- URL 图标 -->
            <img 
              v-else-if="record.icon && isUrlIcon(record.icon)" 
              :src="record.icon" 
              alt="icon" 
              class="workspace-icon-img" 
            />
            <!-- SVG 图标 -->
            <span 
              v-else-if="record.icon && isSvgIcon(record.icon)" 
              v-html="record.icon" 
              class="workspace-icon-svg"
            ></span>
            <!-- 默认图标 -->
            <span v-else style="font-size: 24px"></span>
          </template>

          <!-- 状态列 -->
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'success' : 'error'">
              {{ getDictLabel(statusDict, record.status) }}
            </a-tag>
          </template>

          <!-- 所属用户列 -->
          <template v-else-if="column.key === 'username'">
            {{ getUsernameById(record.userId) }}
          </template>

          <!-- 操作列 -->
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="openEditDialog(record)">
                编辑
              </a-button>
              <a-popconfirm
                title="删除工作区"
                description="确定要删除该工作区吗？"
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
      :title="isEdit ? '编辑工作区' : '新增工作区'"
      ok-text="确定"
      cancel-text="取消"
      @ok="handleSave"
      :confirmLoading="saveLoading"
      width="600px"
    >
      <a-form :model="formData" :rules="rules" ref="formRef" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="工作区名称" name="name" required>
          <a-input v-model:value="formData.name" placeholder="请输入工作区名称" />
        </a-form-item>

        <a-form-item label="图标" name="icon">
          <IconSelector v-model="formData.icon" />
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
import * as AntIcons from '@ant-design/icons-vue'
import { getWorkspacePage, addWorkspace, updateWorkspace, deleteWorkspace, getWorkspace } from '@/api/notion.js'
import { getUserPage } from '@/api/user.js'
import { useUserStore } from '@/stores/user.js'
import IconSelector from '@/components/IconSelector.vue'
import { dict } from '@/composables/dict.js'

export default {
  name: 'NotionWorkspace',
  components: {
    PlusOutlined,
    IconSelector
  },
  setup() {
    const userStore = useUserStore()
    const workspaceList = ref([])
    const loading = ref(false)
    const saveLoading = ref(false)
    const dialogVisible = ref(false)
    const isEdit = ref(false)
    const formRef = ref()
    const userOptions = ref([])

    // 使用字典 Hook
    const { getDictByCode, getDictLabel } = dict()

    // 字典数据
    const statusDict = ref([])

    const searchForm = reactive({
      name: '',
      status: undefined
    })

    const formData = reactive({
      id: null,
      name: '',
      icon: '📝',
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
      name: [{ required: true, message: '请输入工作区名称' }],
      icon: [{ required: false }],
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
          title: '图标',
          dataIndex: 'icon',
          key: 'icon',
          width: 80,
          align: 'center'
        },
        {
          title: '工作区名称',
          dataIndex: 'name',
          key: 'name',
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

    // 图标类型检测函数
    const isPresetIcon = (icon) => {
      if (!icon) return false
      return !icon.startsWith('http') && !icon.startsWith('<svg') && AntIcons[icon]
    }

    const isUrlIcon = (icon) => {
      if (!icon) return false
      return icon.startsWith('http') || icon.startsWith('/')
    }

    const isSvgIcon = (icon) => {
      if (!icon) return false
      return icon.startsWith('<svg')
    }

    const getIconComponent = (iconName) => {
      return AntIcons[iconName] || null
    }

    // 根据userId获取用户名
    const getUsernameById = (userId) => {
      if (!userId) return '-'
      const user = userOptions.value.find(u => u.id === userId)
      return user ? user.realName : '-'
    }

    // 获取工作区列表
    const fetchWorkspaceList = async () => {
      loading.value = true
      try {
        const res = await getWorkspacePage({
          pageNum: pagination.current,
          pageSize: pagination.pageSize,
          name: searchForm.name,
          status: searchForm.status
        })
        if (res.code === 200) {
          workspaceList.value = res.data.records || []
          pagination.total = res.data.total || 0
        } else {
          message.error(res.message || '获取工作区列表失败')
        }
      } catch (error) {
        message.error('获取工作区列表失败')
        console.error(error)
      } finally {
        loading.value = false
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
      formData.icon = '📝'
      formData.status = 1
      formData.userId = userStore.userInfo?.id
      dialogVisible.value = true
      nextTick(() => formRef.value?.clearValidate())
    }

    // 打开编辑对话框
    const openEditDialog = async (record) => {
      isEdit.value = true
      try {
        const res = await getWorkspace(record.id)
        if (res.code === 200) {
          const workspace = res.data
          formData.id = workspace.id
          formData.name = workspace.name
          formData.icon = workspace.icon
          formData.status = workspace.status
          formData.userId = workspace.userId
          dialogVisible.value = true
          nextTick(() => formRef.value?.clearValidate())
        } else {
          message.error(res.message || '获取工作区详情失败')
        }
      } catch (error) {
        message.error('获取工作区详情失败')
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
          icon: formData.icon,
          status: formData.status,
          userId: formData.userId || userStore.userInfo?.id
        }

        let res
        if (isEdit.value) {
          data.id = formData.id
          res = await updateWorkspace(data)
        } else {
          res = await addWorkspace(data)
        }

        if (res.code === 200) {
          message.success(isEdit.value ? '更新成功' : '新增成功')
          dialogVisible.value = false
          fetchWorkspaceList()
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
        const res = await deleteWorkspace(id)
        if (res.code === 200) {
          message.success('删除成功')
          fetchWorkspaceList()
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
      fetchWorkspaceList()
    }

    // 搜索
    const handleSearch = () => {
      pagination.current = 1
      fetchWorkspaceList()
    }

    // 重置
    const handleReset = () => {
      searchForm.name = ''
      searchForm.status = undefined
      pagination.current = 1
      fetchWorkspaceList()
    }

    onMounted(async () => {
      // 确保用户信息已加载
      if (!userStore.userInfo) {
        await userStore.getUserInfo()
      }
      // 加载字典数据
      statusDict.value = await getDictByCode('status')
      // 加载表格数据
      fetchWorkspaceList()
      fetchUserList()
    })

    return {
      columns,
      workspaceList,
      loading,
      saveLoading,
      dialogVisible,
      isEdit,
      formRef,
      formData,
      pagination,
      rules,
      userOptions,
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
      isPresetIcon,
      isUrlIcon,
      isSvgIcon,
      getIconComponent,
      statusDict,
      getDictLabel,
      getUsernameById
    }
  }
}
</script>

<style scoped>
.workspace-container {
  padding: 20px;
}

/* 工作区图标样式 */
.workspace-icon-img {
  width: 24px;
  height: 24px;
  object-fit: contain;
  vertical-align: middle;
}

.workspace-icon-svg {
  display: inline-block;
  width: 24px;
  height: 24px;
  vertical-align: middle;
}

.workspace-icon-svg :deep(svg) {
  width: 100% !important;
  height: 100% !important;
  max-width: 24px !important;
  max-height: 24px !important;
}
</style>
