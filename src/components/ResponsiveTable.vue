<template>
  <div class="responsive-table">
    <a-table
      :columns="resizedColumns"
      :data-source="dataSource"
      :pagination="pagination"
      :loading="loading"
      :scroll="computedScroll"
      :row-key="rowKey"
      :size="size"
      v-bind="$attrs"
      @change="(pag, filters, sorter) => $emit('change', pag, filters, sorter)"
    >
      <!-- 透传 bodyCell 插槽 -->
      <template #bodyCell="slotProps">
        <slot name="bodyCell" v-bind="slotProps" />
      </template>
      <!-- 统一添加列宽拖拽手柄 -->
      <template #headerCell="{ column, index }">
        <div class="th-wrapper">
          <span class="th-title">{{ column.title }}</span>
          <span class="col-resizer" @mousedown="(e) => onResizeStart(e, column, index)"></span>
        </div>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useResizableColumns } from '@/composables/useResizableColumns'

const props = defineProps({
  columns: { type: Array, required: true },
  dataSource: { type: Array, default: () => [] },
  pagination: { type: [Object, Boolean], default: () => ({}) },
  loading: { type: Boolean, default: false },
  scroll: { type: Object, default: () => ({}) },
  rowKey: { type: [String, Function], default: 'id' },
  size: { type: String, default: 'small' }
})

const emit = defineEmits(['change'])

const { resizedColumns, onResizeStart } = useResizableColumns(computed(() => props.columns))

// 根据容器自动适配，横向滚动为内容宽度
const computedScroll = computed(() => {
  const x = 'max-content'
  // 保留传入的纵向滚动设置
  return { x, ...(props.scroll || {}) }
})
</script>

<style scoped>
.responsive-table :deep(.ant-table table) {
  table-layout: auto; /* 自适应列宽 */
}
.th-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.th-title {
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.col-resizer {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 6px;
  cursor: col-resize;
}
.col-resizer:hover {
  background: rgba(0,0,0,0.06);
}
</style>
