/**
 * 表单验证工具类
 */
import { VALIDATION_RULES } from '@/constants'

/**
 * 创建表单规则
 */
export function createFormRules(config) {
  const rules = {}
  
  Object.keys(config).forEach(key => {
    const ruleConfig = config[key]
    
    if (typeof ruleConfig === 'string') {
      rules[key] = VALIDATION_RULES[ruleConfig] || VALIDATION_RULES.REQUIRED
    } else if (Array.isArray(ruleConfig)) {
      rules[key] = ruleConfig.map(r => 
        typeof r === 'string' ? VALIDATION_RULES[r] : r
      )
    } else {
      rules[key] = ruleConfig
    }
  })
  
  return rules
}

/**
 * 常用验证器
 */
export const validators = {
  /**
   * 用户名验证
   */
  username: (rule, value) => {
    if (!value) {
      return Promise.reject('请输入用户名')
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(value)) {
      return Promise.reject('用户名只能包含字母、数字、下划线，长度3-20')
    }
    return Promise.resolve()
  },

  /**
   * 手机号验证
   */
  phone: (rule, value) => {
    if (!value) {
      return Promise.resolve()
    }
    if (!/^1[3-9]\d{9}$/.test(value)) {
      return Promise.reject('请输入正确的手机号')
    }
    return Promise.resolve()
  },

  /**
   * 邮箱验证
   */
  email: (rule, value) => {
    if (!value) {
      return Promise.resolve()
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return Promise.reject('请输入正确的邮箱格式')
    }
    return Promise.resolve()
  },

  /**
   * 密码强度验证
   */
  strongPassword: (rule, value) => {
    if (!value) {
      return Promise.reject('请输入密码')
    }
    if (value.length < 8) {
      return Promise.reject('密码长度不能少于8位')
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return Promise.reject('密码必须包含大小写字母和数字')
    }
    return Promise.resolve()
  },

  /**
   * 确认密码验证
   */
  confirmPassword: (password) => (rule, value) => {
    if (!value) {
      return Promise.reject('请再次输入密码')
    }
    if (value !== password) {
      return Promise.reject('两次输入的密码不一致')
    }
    return Promise.resolve()
  }
}

/**
 * 动态规则生成器
 */
export const ruleGenerators = {
  /**
   * 必填规则
   */
  required: (message = '此项为必填项') => ({
    required: true,
    message,
    trigger: 'blur'
  }),

  /**
   * 长度限制规则
   */
  length: (min, max, message) => ({
    min,
    max,
    message: message || `长度在 ${min} 到 ${max} 个字符`,
    trigger: 'blur'
  }),

  /**
   * 正则验证规则
   */
  pattern: (pattern, message) => ({
    pattern,
    message,
    trigger: 'blur'
  }),

  /**
   * 自定义验证规则
   */
  custom: (validator, trigger = 'blur') => ({
    validator,
    trigger
  })
}
