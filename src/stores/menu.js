import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserMenuTree } from '@/api/menu'

export const useMenuStore = defineStore('menu', () => {
  const menuTree = ref([])
  const openKeys = ref([])
  const selectedKeys = ref([])

  // 获取用户菜单
  const getMenuTree = async () => {
    try {
      const res = await getUserMenuTree()
      if (res.data) {
        menuTree.value = res.data
        return true
      }
      return false
    } catch (error) {
      console.error('获取菜单失败:', error)
      return false
    }
  }

  // 设置打开的菜单keys
  const setOpenKeys = (keys) => {
    openKeys.value = keys
  }

  // 设置选中的菜单keys
  const setSelectedKeys = (keys) => {
    selectedKeys.value = keys
  }

  return {
    menuTree,
    openKeys,
    selectedKeys,
    getMenuTree,
    setOpenKeys,
    setSelectedKeys
  }
})
