/**
 * 分页组合式函数
 * 统一管理表格分页逻辑
 */
import { reactive } from 'vue'
import { SYSTEM_CONFIG } from '@/constants'

export function usePagination(options = {}) {
  const pagination = reactive({
    current: options.current || 1,
    pageSize: options.pageSize || SYSTEM_CONFIG.PAGE_SIZE,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条`,
    pageSizeOptions: SYSTEM_CONFIG.PAGE_SIZES.map(String),
    ...options
  })

  /**
   * 处理表格变化
   */
  const handleTableChange = (paginationData, filters, sorter) => {
    pagination.current = paginationData.current
    pagination.pageSize = paginationData.pageSize
  }

  /**
   * 重置分页
   */
  const resetPagination = () => {
    pagination.current = 1
    pagination.total = 0
  }

  /**
   * 设置总数
   */
  const setTotal = (total) => {
    pagination.total = total
  }

  /**
   * 获取分页参数
   */
  const getPaginationParams = () => ({
    pageNum: pagination.current,
    pageSize: pagination.pageSize
  })

  return {
    pagination,
    handleTableChange,
    resetPagination,
    setTotal,
    getPaginationParams
  }
}
