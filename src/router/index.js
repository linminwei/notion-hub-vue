import { createRouter, createWebHistory } from 'vue-router'
import { hasToken } from '@/utils/auth'
import { useUserStore } from '@/stores/user'
import { message } from 'ant-design-vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'system/user',
        name: 'UserManage',
        component: () => import('@/views/system/User.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'system/role',
        name: 'RoleManage',
        component: () => import('@/views/system/Role.vue'),
        meta: { title: '角色管理' }
      },
      {
        path: 'system/menu',
        name: 'MenuManage',
        component: () => import('@/views/system/Menu.vue'),
        meta: { title: '菜单管理' }
      },
      {
        path: 'system/dict-type',
        name: 'DictManage',
        component: () => import('@/views/system/DictType.vue'),
        meta: { title: '字典管理' }
      },
      {
        path: 'notion/workspace',
        name: 'NotionWorkspace',
        component: () => import('@/views/notion/NotionWorkspace.vue'),
        meta: { title: 'Notion工作区管理' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: { title: '个人中心' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const token = hasToken()
  const userStore = useUserStore()

  if (to.meta.requiresAuth) {
    if (token) {
      // 如果用户路由还没加载，先加载
      if (userStore.accessRoutes.length === 0) {
        await userStore.loadUserRoutes()
      }

      // 检查是否有访问权限
      if (userStore.canAccessRoute(to.path)) {
        next()
      } else {
        message.error('您没有权限访问该页面')
        next('/dashboard') // 跳转到首页
      }
    } else {
      next('/login')
    }
  } else {
    if (token && (to.path === '/login' || to.path === '/register')) {
      next('/')
    } else {
      next()
    }
  }
})

export default router
