<template>
  <div class="dict-manage">
    <a-row :gutter="16">
      <!-- 左侧：字典类型 -->
      <a-col :span="10">
        <a-card title="字典类型" :bordered="true">
          <!-- 搜索栏 -->
          <a-form layout="inline" class="search-form" style="margin-bottom: 16px">
            <a-form-item>
              <a-input v-model:value="typeSearchForm.dictName" placeholder="类型名称" allowClear style="width: 150px" />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" size="small" @click="loadTypeData">查询</a-button>
              <a-button size="small" style="margin-left: 8px" @click="handleTypeReset">重置</a-button>
              <a-button type="primary" size="small" style="margin-left: 8px" @click="handleTypeAdd">新增</a-button>
            </a-form-item>
          </a-form>

          <!-- 字典类型表格 -->
          <ResponsiveTable
            :columns="typeColumns"
            :data-source="typeTableData"
            :pagination="typePagination"
            :loading="typeLoading"
            :row-class-name="(record) => selectedType?.id === record.id ? 'selected-row' : ''"
            :custom-row="(record) => ({ onClick: () => handleTypeRowClick(record) })"
            @change="handleTypeTableChange"
            row-key="id"
            size="small"
            :scroll="{ y: 400 }"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'action'">
                <a-space size="small">
                  <a @click.stop="handleTypeEdit(record)">编辑</a>
                  <a-popconfirm title="确定删除？" @confirm.stop="handleTypeDelete(record.id)">
                    <a style="color: red" @click.stop>删除</a>
                  </a-popconfirm>
                </a-space>
              </template>
            </template>
          </ResponsiveTable>
        </a-card>
      </a-col>

      <!-- 右侧：字典项 -->
      <a-col :span="14">
        <a-card :bordered="true">
          <template #title>
            <span>字典项管理</span>
            <span v-if="selectedType" style="margin-left: 10px; color: #1890ff; font-size: 14px">
              （{{ selectedType.dictName }}）
            </span>
          </template>
          <template #extra>
            <a-button 
              type="primary" 
              size="small" 
              @click="handleItemAdd" 
              :disabled="!selectedType"
            >
              新增字典项
            </a-button>
          </template>

          <div v-if="!selectedType" style="text-align: center; padding: 60px 0; color: #999">
            <a-empty description="请先选择左侧的字典类型" />
          </div>

          <div v-else>
            <!-- 字典项搜索 -->
            <a-form layout="inline" class="search-form" style="margin-bottom: 16px">
              <a-form-item>
                <a-input v-model:value="itemSearchForm.label" placeholder="字典项标签" allowClear style="width: 200px" />
              </a-form-item>
              <a-form-item>
                <a-button type="primary" size="small" @click="loadItemData">查询</a-button>
                <a-button size="small" style="margin-left: 8px" @click="handleItemReset">重置</a-button>
              </a-form-item>
            </a-form>

            <!-- 字典项表格 -->
            <ResponsiveTable
              :columns="itemColumns"
              :data-source="itemTableData"
              :pagination="itemPagination"
              :loading="itemLoading"
              @change="handleItemTableChange"
              row-key="id"
              size="small"
              :scroll="{ y: 400 }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'action'">
                  <a-space size="small">
                    <a @click="handleItemEdit(record)">编辑</a>
                    <a-popconfirm title="确定删除？" @confirm="handleItemDelete(record.id)">
                      <a style="color: red">删除</a>
                    </a-popconfirm>
                  </a-space>
                </template>
              </template>
            </ResponsiveTable>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 字典类型新增/编辑对话框 -->
    <a-modal
      v-model:open="typeModalVisible"
      :title="typeModalTitle"
      @ok="handleTypeSubmit"
      @cancel="handleTypeCancel"
    >
      <a-form :model="typeFormData" :label-col="{ span: 6 }">
        <a-form-item label="字典类型名称" required>
          <a-input v-model:value="typeFormData.dictName" />
        </a-form-item>
        <a-form-item label="字典类型编码" required>
          <a-input v-model:value="typeFormData.dictCode" :disabled="!!typeFormData.id" />
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea v-model:value="typeFormData.description" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 字典项新增/编辑对话框 -->
    <a-modal
      v-model:open="itemModalVisible"
      :title="itemModalTitle"
      @ok="handleItemSubmit"
      @cancel="handleItemCancel"
    >
      <a-form :model="itemFormData" :label-col="{ span: 6 }">
        <a-form-item label="字典项标签" required>
          <a-input v-model:value="itemFormData.label" placeholder="显示值" />
        </a-form-item>
        <a-form-item label="字典项值" required>
          <a-input v-model:value="itemFormData.value" placeholder="实际值" />
        </a-form-item>
        <a-form-item label="排序号">
          <a-input-number v-model:value="itemFormData.sort" :min="0" style="width: 100%" />
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model:value="itemFormData.remark" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import ResponsiveTable from '@/components/ResponsiveTable.vue'
import { 
  getDictTypePage, 
  addDictType, 
  updateDictType, 
  deleteDictType,
  getDictItemPage,
  addDictItem,
  updateDictItem,
  deleteDictItem
} from '@/api/dict'

// ========== 字典类型相关 ==========
const typeColumns = [
  { title: '类型名称', dataIndex: 'dictName', key: 'dictName', width: 120 },
  { title: '类型编码', dataIndex: 'dictCode', key: 'dictCode', width: 120 },
  { title: '操作', key: 'action', width: 100 }
]

const typeLoading = ref(false)
const typeTableData = ref([])
const typeSearchForm = reactive({
  dictName: ''
})

const typePagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: false,
  showTotal: total => `共 ${total} 条`,
  size: 'small'
})

const typeModalVisible = ref(false)
const typeModalTitle = ref('')
const typeFormData = reactive({
  id: null,
  dictName: '',
  dictCode: '',
  description: '',
  status: 1
})

const selectedType = ref(null)

// 加载字典类型数据
const loadTypeData = async () => {
  typeLoading.value = true
  try {
    const params = {
      pageNum: typePagination.current,
      pageSize: typePagination.pageSize,
      dictName: typeSearchForm.dictName
    }
    const res = await getDictTypePage(params)
    if (res.code === 200) {
      typeTableData.value = res.data.records
      typePagination.total = res.data.total
    }
  } catch (error) {
    message.error(error.message || '加载字典类型失败')
  } finally {
    typeLoading.value = false
  }
}

// 字典类型表格分页改变
const handleTypeTableChange = (pag) => {
  typePagination.current = pag.current
  typePagination.pageSize = pag.pageSize
  loadTypeData()
}

// 重置字典类型搜索
const handleTypeReset = () => {
  typeSearchForm.dictName = ''
  typePagination.current = 1
  loadTypeData()
}

// 新增字典类型
const handleTypeAdd = () => {
  typeModalTitle.value = '新增字典类型'
  typeFormData.id = null
  typeFormData.dictName = ''
  typeFormData.dictCode = ''
  typeFormData.description = ''
  typeFormData.status = 1
  typeModalVisible.value = true
}

// 编辑字典类型
const handleTypeEdit = (record) => {
  typeModalTitle.value = '编辑字典类型'
  typeFormData.id = record.id
  typeFormData.dictName = record.dictName
  typeFormData.dictCode = record.dictCode
  typeFormData.description = record.description
  typeFormData.status = record.status
  typeModalVisible.value = true
}

// 提交字典类型
const handleTypeSubmit = async () => {
  try {
    if (!typeFormData.dictName) {
      message.warning('请输入字典类型名称')
      return
    }
    if (!typeFormData.dictCode) {
      message.warning('请输入字典类型编码')
      return
    }

    const data = {
      id: typeFormData.id,
      dictName: typeFormData.dictName,
      dictCode: typeFormData.dictCode,
      description: typeFormData.description,
      status: typeFormData.status
    }

    if (typeFormData.id) {
      await updateDictType(data)
      message.success('更新成功')
    } else {
      await addDictType(data)
      message.success('新增成功')
    }

    typeModalVisible.value = false
    loadTypeData()
  } catch (error) {
    message.error(error.message || '操作失败')
  }
}

// 取消字典类型操作
const handleTypeCancel = () => {
  typeModalVisible.value = false
}

// 删除字典类型
const handleTypeDelete = async (id) => {
  try {
    await deleteDictType(id)
    message.success('删除成功')
    // 如果删除的是当前选中的类型，清空选中
    if (selectedType.value?.id === id) {
      selectedType.value = null
      itemTableData.value = []
    }
    loadTypeData()
  } catch (error) {
    message.error(error.message || '删除失败')
  }
}

// 点击字典类型行
const handleTypeRowClick = (record) => {
  console.log('点击字典类型行:', record)
  selectedType.value = record
  itemPagination.current = 1
  console.log('开始加载字典项, dictTypeId:', record.id)
  loadItemData()
}

// ========== 字典项相关 ==========
const itemColumns = [
  { title: '标签', dataIndex: 'label', key: 'label', width: 100 },
  { title: '值', dataIndex: 'value', key: 'value', width: 80 },
  { title: '排序', dataIndex: 'sort', key: 'sort', width: 60 },
  { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true },
  { title: '操作', key: 'action', width: 100 }
]

const itemLoading = ref(false)
const itemTableData = ref([])
const itemSearchForm = reactive({
  label: ''
})

const itemPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: false,
  showTotal: total => `共 ${total} 条`,
  size: 'small'
})

const itemModalVisible = ref(false)
const itemModalTitle = ref('')
const itemFormData = reactive({
  id: null,
  dictTypeId: null,
  label: '',
  value: '',
  sort: 0,
  status: 1,
  remark: ''
})

// 加载字典项数据
const loadItemData = async () => {
  if (!selectedType.value) {
    console.log('未选择字典类型，跳过加载')
    return
  }

  console.log('加载字典项数据，参数:', {
    dictTypeId: selectedType.value.id,
    pageNum: itemPagination.current,
    pageSize: itemPagination.pageSize
  })

  itemLoading.value = true
  try {
    const params = {
      pageNum: itemPagination.current,
      pageSize: itemPagination.pageSize,
      dictTypeId: selectedType.value.id,
      label: itemSearchForm.label
    }
    const res = await getDictItemPage(params)
    console.log('字典项数据响应:', res)
    if (res.code === 200) {
      itemTableData.value = res.data.records
      itemPagination.total = res.data.total
      console.log('字典项加载成功，数量:', res.data.records.length)
    }
  } catch (error) {
    console.error('加载字典项失败:', error)
    message.error(error.message || '加载字典项失败')
  } finally {
    itemLoading.value = false
  }
}

// 字典项表格分页改变
const handleItemTableChange = (pag) => {
  itemPagination.current = pag.current
  itemPagination.pageSize = pag.pageSize
  loadItemData()
}

// 重置字典项搜索
const handleItemReset = () => {
  itemSearchForm.label = ''
  itemPagination.current = 1
  loadItemData()
}

// 新增字典项
const handleItemAdd = () => {
  if (!selectedType.value) {
    message.warning('请先选择字典类型')
    return
  }
  itemModalTitle.value = '新增字典项'
  itemFormData.id = null
  itemFormData.dictTypeId = selectedType.value.id
  itemFormData.label = ''
  itemFormData.value = ''
  itemFormData.sort = 0
  itemFormData.status = 1
  itemFormData.remark = ''
  itemModalVisible.value = true
}

// 编辑字典项
const handleItemEdit = (record) => {
  itemModalTitle.value = '编辑字典项'
  itemFormData.id = record.id
  itemFormData.dictTypeId = record.dictTypeId
  itemFormData.label = record.label
  itemFormData.value = record.value
  itemFormData.sort = record.sort
  itemFormData.status = record.status
  itemFormData.remark = record.remark
  itemModalVisible.value = true
}

// 提交字典项
const handleItemSubmit = async () => {
  try {
    if (!itemFormData.label) {
      message.warning('请输入字典项标签')
      return
    }
    if (!itemFormData.value) {
      message.warning('请输入字典项值')
      return
    }

    const data = {
      id: itemFormData.id,
      dictTypeId: itemFormData.dictTypeId,
      label: itemFormData.label,
      value: itemFormData.value,
      sort: itemFormData.sort,
      status: itemFormData.status,
      remark: itemFormData.remark
    }

    if (itemFormData.id) {
      await updateDictItem(data)
      message.success('更新成功')
    } else {
      await addDictItem(data)
      message.success('新增成功')
    }

    itemModalVisible.value = false
    loadItemData()
  } catch (error) {
    message.error(error.message || '操作失败')
  }
}

// 取消字典项操作
const handleItemCancel = () => {
  itemModalVisible.value = false
}

// 删除字典项
const handleItemDelete = async (id) => {
  try {
    await deleteDictItem(id)
    message.success('删除成功')
    loadItemData()
  } catch (error) {
    message.error(error.message || '删除失败')
  }
}

onMounted(() => {
  loadTypeData()
})
</script>

<style scoped>
.dict-manage {
  padding: 20px;
}

.search-form {
  margin-bottom: 0;
}

:deep(.selected-row) {
  background-color: #e6f7ff;
}

:deep(.selected-row:hover > td) {
  background-color: #bae7ff !important;
}

:deep(.ant-table-row) {
  cursor: pointer;
}
</style>
