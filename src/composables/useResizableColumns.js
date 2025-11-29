import { reactive, computed } from 'vue'

/**
 * 为表格列增加可拖拽调整宽度与响应式适配
 * 使用方式：const { resizedColumns, onResizeStart } = useResizableColumns(columns)
 */
export function useResizableColumns(columnsRef) {
  const state = reactive({
    widths: {},
    minWidth: 80,
    maxWidth: 600
  })

  // 初始化宽度
  const initWidths = (cols) => {
    cols.forEach((col, idx) => {
      const key = col.key || col.dataIndex || idx
      if (!state.widths[key]) {
        // 基于标题与内容长度估算初始宽度
        const titleLen = String(col.title || '').length
        const base = Math.max(state.minWidth, Math.min(200, titleLen * 16))
        state.widths[key] = col.width || base
      }
    })
  }

  const resizedColumns = computed(() => {
    const cols = columnsRef.value || columnsRef
    if (!cols) return []
    initWidths(cols)
    return cols.map((col, idx) => {
      const key = col.key || col.dataIndex || idx
      const width = state.widths[key]
      return {
        ...col,
        width,
        // 头部单元格自定义属性（用于拖拽）
        customHeaderCell: () => ({
          style: { position: 'relative' }
        })
      }
    })
  })

  const onResizeStart = (e, column, index) => {
    e.stopPropagation()
    const key = column.key || column.dataIndex || index
    const startX = e.clientX
    const startWidth = state.widths[key] || state.minWidth

    const onMouseMove = (ev) => {
      const delta = ev.clientX - startX
      const next = Math.max(state.minWidth, Math.min(state.maxWidth, startWidth + delta))
      state.widths[key] = next
    }
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  return { resizedColumns, onResizeStart }
}
