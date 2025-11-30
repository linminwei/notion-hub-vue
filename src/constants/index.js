/**
 * 前端常量配置文件
 * 统一管理API路径、HTTP状态码、系统配置等常量
 */

// ============ HTTP状态码 ============
export const HTTP_STATUS = {
  SUCCESS: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
}

// ============ API基础路径 ============
export const API_BASE_URL = '/api'

// ============ API路径常量 ============
export const API_PATHS = {
  // 认证相关
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    CURRENT_USER: '/auth/current'
  },
  
  // 用户相关
  USER: {
    PAGE: '/user/page',
    BASE: '/user',
    ROLES: (userId) => `/user/${userId}/roles`,
    RESET_PASSWORD: (userId) => `/user/${userId}/reset-password`,
    VERIFY_PASSWORD: '/user/verify-password',
    CHANGE_PASSWORD: '/user/change-password',
    UPLOAD_AVATAR: '/user/upload-avatar',
    UPDATE_INFO: '/user/update-info'
  },
  
  // 角色相关
  ROLE: {
    PAGE: '/role/page',
    BASE: '/role',
    ALL: '/role/all',
    PERMISSIONS: (roleId) => `/role/${roleId}/permissions`,
    MENU_IDS: (roleId) => `/role/${roleId}/menuIds`
  },
  
  // 菜单相关
  MENU: {
    TREE: '/menu/tree',
    USER_TREE: '/menu/user/tree',
    ALL: '/menu/all',
    BASE: '/menu'
  },
  
  // 字典相关
  DICT: {
    TYPE: {
      PAGE: '/dict/type/page',
      LIST: '/dict/type/list',
      BASE: '/dict/type',
      BY_ID: (id) => `/dict/type/${id}`,
      BY_CODE: (code) => `/dict/type/code/${code}`
    },
    ITEM: {
      PAGE: '/dict/item/page',
      BASE: '/dict/item',
      BY_TYPE: (typeId) => `/dict/item/type/${typeId}`,
      BY_ID: (id) => `/dict/item/${id}`,
      BATCH: '/dict/item/batch'
    }
  }
}

// ============ 存储键名 ============
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  THEME: 'theme',
  COLLAPSED: 'sidebarCollapsed'
}

// ============ 系统配置 ============
export const SYSTEM_CONFIG = {
  TIMEOUT: 15000,
  PAGE_SIZE: 10,
  PAGE_SIZES: [10, 20, 50, 100]
}

// ============ 用户状态 ============
export const USER_STATUS = {
  ENABLE: 1,
  DISABLE: 0
}

// ============ 菜单类型 ============
export const MENU_TYPE = {
  DIRECTORY: 0,
  MENU: 1,
  BUTTON: 2
}

// ============ 错误消息 ============
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络错误，请稍后重试',
  REQUEST_FAILED: '请求失败',
  LOGIN_EXPIRED: '登录已过期，请重新登录',
  UNAUTHORIZED: '未授权，请先登录',
  PERMISSION_DENIED: '权限不足'
}

// ============ 成功消息 ============
export const SUCCESS_MESSAGES = {
  OPERATION_SUCCESS: '操作成功',
  SAVE_SUCCESS: '保存成功',
  DELETE_SUCCESS: '删除成功',
  UPDATE_SUCCESS: '更新成功',
  ADD_SUCCESS: '添加成功'
}

// ============ 表单验证规则 ============
export const VALIDATION_RULES = {
  REQUIRED: { required: true, message: '此项为必填项', trigger: 'blur' },
  USERNAME: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  PASSWORD: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  EMAIL: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  PHONE: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

// ============ 文件上传配置 ============
export const UPLOAD_CONFIG = {
  MAX_SIZE: 20 * 1024 * 1024, // 20MB
  ACCEPT_IMAGES: ['image/jpeg', 'image/png', 'image/gif'],
  ACCEPT_IMAGES_EXT: ['.jpg', '.jpeg', '.png', '.gif']
}
