import { ref } from 'vue'
import { getDictItemsByTypeId, getDictTypeByCode } from '@/api/dict'

/**
 * 字典数据管理 Composable
 * 用于在组件中方便地使用字典数据
 */
export function dict() {
  // 字典数据缓存
  const dictCache = ref(new Map())

  /**
   * 根据字典类型编码获取字典项列表
   * @param {string} dictCode - 字典类型编码，如 'user_status'
   * @returns {Promise<Array>} 字典项列表
   */
  const getDictByCode = async (dictCode) => {
    try {
      // 先检查缓存
      if (dictCache.value.has(dictCode)) {
        return dictCache.value.get(dictCode)
      }

      // 1. 根据字典类型编码获取字典类型信息
      const typeRes = await getDictTypeByCode(dictCode)
      if (typeRes.code !== 200 || !typeRes.data) {
        console.warn(`字典类型 ${dictCode} 不存在`)
        return []
      }

      // 2. 根据字典类型ID获取字典项列表
      const itemsRes = await getDictItemsByTypeId(typeRes.data.id)
      if (itemsRes.code !== 200) {
        console.warn(`获取字典项失败: ${dictCode}`)
        return []
      }

      const items = itemsRes.data || []
      
      // 缓存数据
      dictCache.value.set(dictCode, items)
      
      return items
    } catch (error) {
      console.error(`获取字典数据失败 (${dictCode}):`, error)
      return []
    }
  }

  /**
   * 根据字典值获取字典标签
   * @param {Array} dictItems - 字典项列表
   * @param {string|number} value - 字典值
   * @returns {string} 字典标签
   */
  const getDictLabel = (dictItems, value) => {
    if (!dictItems || dictItems.length === 0) {
      return value
    }
    const item = dictItems.find(item => item.value === String(value))
    return item ? item.label : value
  }

  /**
   * 清除字典缓存
   */
  const clearDictCache = () => {
    dictCache.value.clear()
  }

  /**
   * 清除指定字典的缓存
   * @param {string} dictCode - 字典类型编码
   */
  const clearDictCacheByCode = (dictCode) => {
    dictCache.value.delete(dictCode)
  }

  return {
    getDictByCode,
    getDictLabel,
    clearDictCache,
    clearDictCacheByCode
  }
}
