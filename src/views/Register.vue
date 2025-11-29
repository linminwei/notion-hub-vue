<template>
  <div class="register-container">
    <!-- 左侧注册区域 -->
    <div class="register-left">
      <!-- Logo -->
      <div class="logo">
        <img src="@/assets/logo.png" alt="Logo" />
      </div>

      <!-- 注册表单区域 -->
      <div class="register-form-wrapper">
        <h1 class="register-title">注册新账号<br /></h1>
        <p class="register-subtitle">已有账号？ <router-link to="/login" class="login-link">返回登录</router-link></p>

        <a-form
          :model="registerForm"
          :rules="rules"
          @finish="handleRegister"
          class="register-form"
        >
          <!-- 用户名输入框 -->
          <a-form-item name="username">
            <a-input
              v-model:value="registerForm.username"
              placeholder="请输入用户名（3-32个字符）"
              size="large"
            >
              <template #prefix>
                <UserOutlined />
              </template>
            </a-input>
          </a-form-item>

          <!-- 密码输入框 -->
          <a-form-item name="password">
            <a-input-password
              v-model:value="registerForm.password"
              placeholder="请输入密码（6-32个字符）"
              size="large"
            >
              <template #prefix>
                <LockOutlined />
              </template>
            </a-input-password>
          </a-form-item>

          <!-- 确认密码输入框 -->
          <a-form-item name="confirmPassword">
            <a-input-password
              v-model:value="registerForm.confirmPassword"
              placeholder="请再次输入密码"
              size="large"
            >
              <template #prefix>
                <LockOutlined />
              </template>
            </a-input-password>
          </a-form-item>

          <!-- 注册按钮 -->
          <a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              size="large"
              block
              :loading="loading"
              class="register-button"
            >
              注册账号
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
    <div class="register-right">
      <div class="decoration-wrapper">
        <img src="@/assets/register_background.svg" alt="register background" class="register-bg-img" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { register } from '@/api/auth'

const router = useRouter()

const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 3, message: '用户名至少3个字符' },
    { max: 32, message: '用户名最多32个字符' }
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, message: '密码至少6个字符' },
    { max: 32, message: '密码最多32个字符' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码' },
    {
      validator: (rule, value) => {
        if (!value) return Promise.reject(new Error('请再次输入密码'))
        if (value !== registerForm.value.password) {
          return Promise.reject(new Error('两次输入的密码不一致，请重新输入'))
        }
        return Promise.resolve()
      }
    }
  ]
}

const loading = ref(false)

const handleRegister = async () => {
  loading.value = true
  try {
    await register({
      username: registerForm.value.username,
      password: registerForm.value.password,
      confirmPassword: registerForm.value.confirmPassword
    })
    message.success('注册成功，请登录')
    // ... existing code ...
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } catch (error) {
    // 仅在实际的API错误时显示后端返回的错误信息
    if (error.response?.data?.message) {
      message.error(error.response.data.message)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 容器样式 */
.register-container {
  width: 100%;
  height: 100vh;
  display: flex;
  background: #f5f5f5;
  overflow: hidden;
}

/* 左侧注册区域 */
.register-left {
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

/* 注册表单区域 */
.register-form-wrapper {
  width: 100%;
  max-width: 400px;
  margin: auto;
  padding: 0 24px;
}

/* 标题样式 */
.register-title {
  font-size: 28px;
  font-weight: 600;
  color: #000000;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

/* 副标题样式 */
.register-subtitle {
  font-size: 14px;
  color: #999999;
  margin: 0 0 32px 0;
}

.register-subtitle a {
  color: #0052d9;
  text-decoration: none;
}

.register-subtitle a:hover {
  text-decoration: underline;
}

/* 表单样式 */
.register-form {
  width: 100%;
}

.register-form :deep(.ant-form-item) {
  margin-bottom: 20px;
}

/* 输入框样式 */
.register-form :deep(.ant-input),
.register-form :deep(.ant-input-affix-wrapper) {
  height: 48px;
  border-radius: 8px;
  border: 1.5px solid rgba(0, 0, 0, 0.08);
  background: #ffffff;
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.02),
    inset 0 0 0 1px rgba(255, 255, 255, 0.9);
  font-size: 14px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
}

.register-form :deep(.ant-input-affix-wrapper) {
  padding: 0 16px;
}

.register-form :deep(.ant-input-affix-wrapper .ant-input) {
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

.register-form :deep(.ant-input) {
  padding: 0 16px;
}

/* 悬停状态 */
.register-form :deep(.ant-input:hover),
.register-form :deep(.ant-input-affix-wrapper:hover) {
  border-color: rgba(0, 0, 0, 0.15);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.04),
    inset 0 0 0 1px rgba(255, 255, 255, 0.9);
}

/* 聚焦状态 */
.register-form :deep(.ant-input:focus),
.register-form :deep(.ant-input-affix-wrapper:focus),
.register-form :deep(.ant-input-affix-wrapper-focused) {
  border-color: #0052d9;
  background: #ffffff;
  box-shadow: 
    0 0 0 3px rgba(0, 82, 217, 0.1),
    0 2px 8px rgba(0, 82, 217, 0.08),
    inset 0 0 0 1px rgba(0, 82, 217, 0.15);
}

/* 占位符文字 */
.register-form :deep(.ant-input::placeholder),
.register-form :deep(.ant-input-password input::placeholder) {
  color: rgba(0, 0, 0, 0.3);
  font-size: 14px;
  font-weight: 400;
}

/* 前缀图标 */
.register-form :deep(.ant-input-prefix) {
  color: rgba(0, 0, 0, 0.3);
  font-size: 16px;
  margin-right: 0;
  display: flex;
  align-items: center;
  transition: color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 聚焦时图标变色 */
.register-form :deep(.ant-input-affix-wrapper:focus .ant-input-prefix),
.register-form :deep(.ant-input-affix-wrapper-focused .ant-input-prefix) {
  color: #0052d9;
}

/* 注册按钮 */
.register-button {
  height: 48px;
  background: linear-gradient(135deg, #0052d9 0%, #0041b8 100%);
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.3px;
  color: #ffffff;
  box-shadow: 
    0 2px 6px rgba(0, 82, 217, 0.2),
    0 1px 2px rgba(0, 82, 217, 0.1);
  margin-top: 8px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.register-button:hover {
  background: linear-gradient(135deg, #003ea8 0%, #00339a 100%);
  box-shadow: 
    0 4px 12px rgba(0, 82, 217, 0.3),
    0 2px 4px rgba(0, 82, 217, 0.15);
  transform: translateY(-1px);
}

.register-button:active {
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
.register-right {
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

/* 注册背景图片 */
.register-bg-img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  object-position: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-left {
    width: 100%;
  }

  .register-right {
    display: none;
  }

  .register-form-wrapper {
    max-width: 100%;
    padding: 0 40px;
  }
}
</style>
