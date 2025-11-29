<template>
  <div class="login-container">
    <!-- 左侧登录区域 -->
    <div class="login-left">
      <!-- Logo -->
      <div class="logo">
        <img src="@/assets/logo.png" alt="Logo" />
      </div>

      <!-- 登录表单区域 -->
      <div class="login-form-wrapper">
        <h1 class="login-title">登录到<br />Notion Hub</h1>
        <p class="login-subtitle">没有账号？ <router-link to="/register" class="register-link">注册新账号</router-link></p>

        <a-form
          :model="loginForm"
          :rules="rules"
          @finish="handleLogin"
          class="login-form"
        >
          <!-- 用户名输入框 -->
          <a-form-item name="username">
            <a-input
              v-model:value="loginForm.username"
              placeholder="请输入用户名"
              size="large"
            >
              <template #prefix>
                <UserOutlined />
              </template>
            </a-input>
          </a-form-item>

          <!-- 密码输入框 -->
          <a-form-item name="password" class="password-item">
            <a-input-password
              v-model:value="loginForm.password"
              placeholder="请输入密码"
              size="large"
            >
              <template #prefix>
                <LockOutlined />
              </template>
            </a-input-password>
          </a-form-item>

          <!-- 登录按钮 -->
          <a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              size="large"
              block
              :loading="loading"
              class="login-button"
            >
              登录
            </a-button>
          </a-form-item>
        </a-form>
      </div>

      <!-- 版权信息 -->
      <div class="copyright">
        Copyright © 2024-2025 Notion Hub. All Rights Reserved
      </div>
    </div>

    <!-- 右侧装饰区域 -->
    <div class="login-right">
      <div class="decoration-wrapper">
        <img src="@/assets/login_background.svg" alt="login background" class="login-bg-img" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const loginForm = ref({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名' }],
  password: [{ required: true, message: '请输入密码' }]
}

const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  try {
    const success = await userStore.userLogin(loginForm.value)
    if (success) {
      message.success('登录成功')
      router.push('/')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 容器样式 */
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  background: #f5f5f5;
  overflow: hidden;
}

/* 左侧登录区域 */
.login-left {
  width: 50%;
  height: 100%;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 0;
}

/* Logo样式 */
.logo {
  position: absolute;
  top: 24px;
  left: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo img {
  width: 50px;
  height: 50px;
}


/* 登录表单区域 */
.login-form-wrapper {
  width: 100%;
  max-width: 400px;
  margin: auto;
  padding: 0 24px;
}

/* 标题样式 */
.login-title {
  font-size: 28px;
  font-weight: 600;
  color: #000000;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

/* 副标题样式 */
.login-subtitle {
  font-size: 14px;
  color: #999999;
  margin: 0 0 32px 0;
}

.login-subtitle a {
  color: #0052d9;
  text-decoration: none;
}

.login-subtitle a:hover {
  text-decoration: underline;
}

/* ==================== 输入框设计系统 ==================== */

/* 表单样式 */
.login-form {
  width: 100%;
}

.login-form :deep(.ant-form-item) {
  margin-bottom: 20px;
}

/* ===== 核心输入框设计 ===== */
.login-form :deep(.ant-input),
.login-form :deep(.ant-input-affix-wrapper) {
  /* 尺寸与形状 */
  height: 48px;
  border-radius: 8px;
  
  /* 边框设计 - 细腻的描边 */
  border: 1.5px solid rgba(0, 0, 0, 0.08);
  
  /* 背景设计 - 纯净白色 */
  background: #ffffff;
  
  /* 阴影设计 - 微妙深度 */
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.02),
    inset 0 0 0 1px rgba(255, 255, 255, 0.9);
  
  /* 字体设计 */
  font-size: 14px;
  
  /* 过渡动画 - 流畅自然 */
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* 移除默认样式 */
  outline: none;
}

/* 输入框容器内边距 */
.login-form :deep(.ant-input-affix-wrapper) {
  padding: 0 16px;
}

/* 内部输入元素 */
.login-form :deep(.ant-input-affix-wrapper .ant-input) {
  background: transparent;
  border: none;
  outline: none;
  box-shadow: none;
  height: 100%;
  padding: 0;
  margin-left: 12px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.88);
}

/* 普通输入框内边距 */
.login-form :deep(.ant-input) {
  padding: 0 16px;
}

/* ===== 交互状态设计 ===== */

/* 悬停状态 - 边框加深 */
.login-form :deep(.ant-input:hover),
.login-form :deep(.ant-input-affix-wrapper:hover) {
  border-color: rgba(0, 0, 0, 0.15);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.04),
    inset 0 0 0 1px rgba(255, 255, 255, 0.9);
}

/* 聚焦状态 - 品牌色强调 */
.login-form :deep(.ant-input:focus),
.login-form :deep(.ant-input-affix-wrapper:focus),
.login-form :deep(.ant-input-affix-wrapper-focused) {
  border-color: #0052d9;
  background: #ffffff;
  box-shadow: 
    0 0 0 3px rgba(0, 82, 217, 0.1),
    0 2px 8px rgba(0, 82, 217, 0.08),
    inset 0 0 0 1px rgba(0, 82, 217, 0.15);
}

/* ===== 文字与图标设计 ===== */

/* 占位符文字 */
.login-form :deep(.ant-input::placeholder),
.login-form :deep(.ant-input-password input::placeholder) {
  color: rgba(0, 0, 0, 0.3);
  font-size: 14px;
  font-weight: 400;
}

/* 输入文字 */
.login-form :deep(.ant-input),
.login-form :deep(.ant-input-password input) {
  color: rgba(0, 0, 0, 0.88);
  font-weight: 400;
  line-height: 1.5715;
}

/* 前缀图标 */
.login-form :deep(.ant-input-prefix) {
  color: rgba(0, 0, 0, 0.3);
  font-size: 16px;
  margin-right: 0;
  display: flex;
  align-items: center;
  transition: color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 聚焦时图标变色 */
.login-form :deep(.ant-input-affix-wrapper:focus .ant-input-prefix),
.login-form :deep(.ant-input-affix-wrapper-focused .ant-input-prefix) {
  color: #0052d9;
}

/* ===== 清除冲突样式 ===== */

/* 移除伪元素 */
.login-form :deep(.ant-input-affix-wrapper):before,
.login-form :deep(.ant-input-affix-wrapper):after,
.login-form :deep(.ant-input):before,
.login-form :deep(.ant-input):after {
  display: none;
}

/* 确保所有组件统一样式 */
.login-form :deep(.ant-input-password),
.login-form :deep(.ant-input-password-icon),
.login-form :deep(.ant-input-suffix),
.login-form :deep(.ant-input-clear-icon) {
  border: none;
  outline: none;
}

/* 密码输入框样式 */
.password-item {
  position: relative;
}

.password-item :deep(.ant-form-item-control-input) {
  position: relative;
}

/* 密码可见性图标优化 */
.password-item :deep(.ant-input-password-icon) {
  color: rgba(0, 0, 0, 0.3);
  font-size: 14px;
  transition: all 0.2s;
}

.password-item :deep(.ant-input-password-icon:hover) {
  color: rgba(0, 0, 0, 0.6);
}

/* ==================== 登录按钮设计 ==================== */

.login-button {
  /* 尺寸与形状 */
  height: 48px;
  border-radius: 8px;
  
  /* 背景设计 - 渐变品牌色 */
  background: linear-gradient(135deg, #0052d9 0%, #0041b8 100%);
  border: none;
  
  /* 文字设计 */
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.3px;
  color: #ffffff;
  
  /* 阴影设计 - 立体感 */
  box-shadow: 
    0 2px 6px rgba(0, 82, 217, 0.2),
    0 1px 2px rgba(0, 82, 217, 0.1);
  
  /* 间距 */
  margin-top: 8px;
  
  /* 过渡 */
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.login-button:hover {
  background: linear-gradient(135deg, #003ea8 0%, #00339a 100%);
  box-shadow: 
    0 4px 12px rgba(0, 82, 217, 0.3),
    0 2px 4px rgba(0, 82, 217, 0.15);
  transform: translateY(-1px);
}

.login-button:active {
  transform: translateY(0);
  box-shadow: 
    0 1px 4px rgba(0, 82, 217, 0.2),
    0 1px 2px rgba(0, 82, 217, 0.1);
}

/* 版权信息 */
.copyright {
  position: absolute;
  bottom: 24px;
  left: 24px;
  font-size: 12px;
  color: #999999;
}

/* 右侧装饰区域 */
.login-right {
  width: 50%;
  height: 100%;
  background: #ffffff;
  position: relative;
  overflow: hidden;
}

.decoration-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 登录背景图片 */
.login-bg-img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  object-position: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-left {
    width: 100%;
  }

  .login-right {
    display: none;
  }

  .login-form-wrapper {
    max-width: 100%;
    padding: 0 40px;
  }
}
</style>
