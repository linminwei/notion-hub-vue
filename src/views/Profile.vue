<template>
  <div class="profile-container">
    <a-row :gutter="24">
      <!-- 左侧：个人信息 -->
      <a-col :xs="24" :sm="24" :md="8" :lg="6">
        <a-card title="个人信息" :bordered="false">
          <div class="profile-avatar">
            <a-upload
              :show-upload-list="false"
              :custom-request="handleUpload"
              :before-upload="beforeUpload"
              accept="image/*"
            >
              <template #default>
                <div class="avatar-upload-wrapper">
                  <a-spin :spinning="uploading">
                    <a-avatar 
                      :src="avatarUrl" 
                      :size="120" 
                      style="background-color: #1890ff; font-size: 48px; cursor: pointer;"
                    >
                      <template v-if="!avatarUrl" #icon><UserOutlined /></template>
                    </a-avatar>
                  </a-spin>
                  <div class="avatar-upload-hint">点击上传头像</div>
                </div>
              </template>
            </a-upload>
          </div>
          
          <a-form :model="userInfoForm" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
            <a-form-item label="用户名">
              <a-input v-model:value="userInfoForm.username" disabled />
            </a-form-item>
            <a-form-item label="昵称">
              <a-input v-model:value="userInfoForm.realName" placeholder="请输入昵称" />
            </a-form-item>
            <a-form-item label="手机号">
              <a-input v-model:value="userInfoForm.phone" placeholder="请输入手机号" />
            </a-form-item>
            <a-form-item label="邮箱">
              <a-input v-model:value="userInfoForm.email" placeholder="请输入邮箱" />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" block @click="handleUpdateUserInfo" :loading="updatingInfo">
                保存修改
              </a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>

      <!-- 右侧：修改密码 -->
      <a-col :xs="24" :sm="24" :md="16" :lg="18">
        <a-card title="修改密码" :bordered="false">
          <a-form :model="passwordForm" :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }" @finish="handleChangePassword">
            <!-- 第一步：验证旧密码 -->
            <a-form-item v-if="!step1Valid" label="当前密码" required>
              <a-input-password 
                v-model:value="passwordForm.oldPassword" 
                placeholder="请输入当前密码"
              />
            </a-form-item>

            <br>
            <a-form-item v-if="!step1Valid" label="">
              <a-button 
                type="primary" 
                @click="verifyOldPassword"
                :loading="verifying"
              >
                验证密码
              </a-button>
            </a-form-item>

            <!-- 第二步：输入新密码 -->
            <a-divider v-if="step1Valid" style="margin: 12px 0" />

            <a-form-item v-if="step1Valid" label="新密码" required>
              <a-input-password 
                v-model:value="passwordForm.newPassword" 
                placeholder="请输入新密码（至少8个字符）"
              />
              <div class="password-hint-container">
                <div v-if="passwordForm.newPassword" class="password-strength-hint">
                  密码强度：
                  <a-progress 
                    :percent="passwordStrength" 
                    :status="passwordStrengthStatus"
                    :show-info="false"
                    style="margin-top: 4px;"
                  />
                </div>
                <div v-else class="password-strength-hint-placeholder"></div>
              </div>
            </a-form-item>

            <!-- 第三步：确认新密码 -->
            <a-form-item v-if="step1Valid" label="确认新密码" required>
              <a-input-password 
                v-model:value="passwordForm.confirmPassword" 
                placeholder="请再次输入新密码"
              />
              <div class="password-hint-container">
                <div v-if="passwordForm.confirmPassword && passwordForm.newPassword" class="password-validate-hint">
                  <span v-if="passwordForm.newPassword === passwordForm.confirmPassword" style="color: #52c41a;">
                    <CheckCircleOutlined /> 两次密码输入一致
                  </span>
                  <span v-else style="color: #f5222d;">
                    <CloseCircleOutlined /> 两次密码输入不一致
                  </span>
                </div>
                <div v-else class="password-validate-hint-placeholder"></div>
              </div>
            </a-form-item>

            <br>
            <a-form-item v-if="step1Valid" label="">
              <a-space>
                <a-button 
                  type="primary" 
                  @click="handleChangePassword"
                  :loading="changing"
                  :disabled="!passwordForm.newPassword || !passwordForm.confirmPassword || passwordForm.newPassword !== passwordForm.confirmPassword"
                >
                  修改密码
                </a-button>
                <a-button @click="resetForm">取消</a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'
import { verifyPassword, changePassword, uploadAvatar, updateCurrentUserInfo } from '@/api/user'
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons-vue'

const userStore = useUserStore()

const userInfoForm = reactive({
  username: '',
  realName: '',
  phone: '',
  email: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const step1Valid = ref(false)
const verifying = ref(false)
const changing = ref(false)
const avatarUrl = ref('')
const uploading = ref(false)
const updatingInfo = ref(false)

// 获取用户信息的 computed 属性，确保疟楰反应
const currentUser = computed(() => userStore.userInfo || {})

// 计算密码强度
const passwordStrength = computed(() => {
  if (!passwordForm.newPassword) return 0
  
  let strength = 0
  if (passwordForm.newPassword.length >= 8) strength += 25
  if (passwordForm.newPassword.length >= 12) strength += 25
  if (/[a-z]/.test(passwordForm.newPassword)) strength += 10
  if (/[A-Z]/.test(passwordForm.newPassword)) strength += 10
  if (/[0-9]/.test(passwordForm.newPassword)) strength += 10
  if (/[!@#$%^&*()_+\-=\[\]{};:'",.<>?/\\|`~]/.test(passwordForm.newPassword)) strength += 10
  
  return Math.min(strength, 100)
})

const passwordStrengthStatus = computed(() => {
  const strength = passwordStrength.value
  if (strength < 40) return 'exception'
  if (strength < 70) return 'normal'
  return 'success'
})

// 验证旧密码
const verifyOldPassword = async () => {
  if (!passwordForm.oldPassword) {
    message.error('请输入当前密码')
    return
  }

  verifying.value = true
  try {
    // 调用后端验证接口
    await verifyPassword(passwordForm.oldPassword)
    message.success('密码验证成功')
    step1Valid.value = true
  } catch (error) {
    if(error.response?.data?.message) {
        message.error(error.response.data.message)
    }
    step1Valid.value = false
  } finally {
    verifying.value = false
  }
}

// 修改密码
const handleChangePassword = async () => {
  if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
    message.error('请输入新密码')
    return
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    message.error('两次输入的密码不一致')
    return
  }

  if (passwordForm.newPassword === passwordForm.oldPassword) {
    message.error('新密码不能与旧密码相同')
    return
  }

  changing.value = true
  try {
    await changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword
    })
    message.success('密码修改成功，请重新登录')
    // 修改成功后，清除用户信息并跳转到登录页面
    userStore.logout()
    window.location.href = '/login'
  } catch (error) {
    message.error(error.response?.data?.message || '密码修改失败')
  } finally {
    changing.value = false
  }
}

// 重置表单
const resetForm = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  step1Valid.value = false
}

// 头像上传前验证
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('只能上传图片文件')
    return false
  }
  
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    message.error('图片大小不能超过10MB')
    return false
  }
  
  return true
}

// 自定义上传处理
const handleUpload = async ({ file, onSuccess, onError }) => {
  uploading.value = true
  
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await uploadAvatar(formData)
    if (response.data) {
      // 后端返回: uploads/avatars/xxx.jpg
      // 前端需要加上 /api/ 前缀: /api/uploads/avatars/xxx.jpg
      avatarUrl.value = '/api/' + response.data
      message.success('头像上传成功')
      onSuccess(response.data)
      
      // 更新用户信息中的头像
      await userStore.getUserInfo()
    }
  } catch (error) {
    message.error(error.response?.data?.message || '头像上传失败')
    onError(error)
  } finally {
    uploading.value = false
  }
}

// 更新用户信息
const handleUpdateUserInfo = async () => {
  // 验证手机号格式
  if (userInfoForm.phone && !/^1[3-9]\d{9}$/.test(userInfoForm.phone)) {
    message.error('请输入正确的手机号')
    return
  }
  
  // 验证邮箱格式
  if (userInfoForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfoForm.email)) {
    message.error('请输入正确的邮箱地址')
    return
  }
  
  updatingInfo.value = true
  try {
    await updateCurrentUserInfo({
      realName: userInfoForm.realName,
      phone: userInfoForm.phone,
      email: userInfoForm.email
    })
    message.success('信息更新成功')
    // 更新用户信息
    await userStore.getUserInfo()
  } catch (error) {
    message.error(error.response?.data?.message || '信息更新失败')
  } finally {
    updatingInfo.value = false
  }
}

// 页面加载时确保用户信息已加载
onMounted(async () => {
  // 如果用户信息开空，鲍取最新的用户信息
  if (!userStore.userInfo) {
    await userStore.getUserInfo()
  }
  
  // 初始化用户信息表单
  if (userStore.userInfo) {
    userInfoForm.username = userStore.userInfo.username || ''
    userInfoForm.realName = userStore.userInfo.realName || ''
    userInfoForm.phone = userStore.userInfo.phone || ''
    userInfoForm.email = userStore.userInfo.email || ''
  }
  
  // 加载用户头像
  if (userStore.userInfo?.avatar) {
    // 后端返回: uploads/avatars/xxx.jpg
    // 需要加上 /api/ 前缀
    avatarUrl.value = '/api/' + userStore.userInfo.avatar
  }
})
</script>

<style scoped>
.profile-container {
  padding: 24px;
}

.profile-avatar {
  text-align: center;
  margin-bottom: 24px;
}

.avatar-upload-wrapper {
  position: relative;
  display: inline-block;
}

.avatar-upload-wrapper:hover .avatar-upload-hint {
  opacity: 1;
}

.avatar-upload-hint {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.45);
  color: white;
  font-size: 12px;
  padding: 4px 0;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 0 0 120px 120px;
}

/* 表单样式 */
:deep(.ant-form-item) {
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
  transition: all 0.3s ease;
  overflow: hidden;
}

:deep(.ant-form-item-label) {
  padding-bottom: 0;
  margin-right: 12px;
  margin-top: 0;
  flex-shrink: 0;
  width: 100px;
  height: 32px;
  line-height: 32px;
  display: flex;
  align-items: center;
}

:deep(.ant-form-item-label > label) {
  color: #333;
  font-weight: 500;
  height: 32px;
  line-height: 32px;
  margin: 0;
  display: flex;
  align-items: center;
  padding: 0;
}

:deep(.ant-form-item-required::before) {
  display: inline-block;
  margin-right: 4px;
  color: #ff4d4f;
  font-size: 14px;
  font-family: SimSun, sans-serif;
  line-height: 32px;
  content: '*';
  flex-shrink: 0;
  width: 14px;
  text-align: center;
  height: 32px;
}

:deep(.ant-form-item-control) {
  flex: none;
  width: 300px;
}

/* 限制输入框宽度 */
:deep(.ant-form-item-control-input) {
  width: 100%;
}

:deep(.ant-input-password) {
  width: 100%;
}

:deep(.ant-divider) {
  transition: all 0.3s ease;
}

/* 密码提示信息容器 */
.password-hint-container {
  min-height: 36px;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.password-strength-hint {
  font-size: 12px;
  color: #666;
  line-height: 1.5;
}

.password-strength-hint-placeholder {
  height: 28px;
}

.password-validate-hint {
  font-size: 12px;
  line-height: 1.5;
}

.password-validate-hint-placeholder {
  height: 18px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-container {
    padding: 12px;
  }
}
</style>
