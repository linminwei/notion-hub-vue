<template>
  <div class="dashboard">
    <a-row :gutter="16">
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="用户总数"
            :value="112893"
            :value-style="{ color: '#3f8600' }"
          >
            <template #prefix>
              <UserOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="角色数量"
            :value="25"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <TeamOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="菜单数量"
            :value="48"
            :value-style="{ color: '#cf1322' }"
          >
            <template #prefix>
              <MenuOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="在线用户"
            :value="328"
            :value-style="{ color: '#faad14' }"
          >
            <template #prefix>
              <GlobalOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" style="margin-top: 16px">
      <a-col :span="24">
        <a-card title="欢迎使用 Notion Hub 权限管理系统">
          <div class="welcome-content">
            <h2>系统简介</h2>
            <p>Notion Hub 是一个基于 RBAC (基于角色的访问控制) 模型的权限管理系统</p>
            
            <h3>核心功能</h3>
            <ul>
              <li>✅ 用户管理：支持用户的增删改查操作</li>
              <li>✅ 角色管理：灵活的角色配置和权限分配</li>
              <li>✅ 菜单管理：树形结构的菜单配置</li>
              <li>✅ 权限控制：基于JWT的认证和接口级权限验证</li>
            </ul>

            <h3>技术栈</h3>
            <p><strong>后端：</strong>Spring Boot + MyBatis Plus + Druid + JWT</p>
            <p><strong>前端：</strong>Vue 3 + Ant Design Vue + Pinia + Vite</p>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { UserOutlined, TeamOutlined, MenuOutlined, GlobalOutlined } from '@ant-design/icons-vue'
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.welcome-content {
  line-height: 1.8;
}

.welcome-content h2 {
  color: #1890ff;
  margin-bottom: 16px;
}

.welcome-content h3 {
  color: #333;
  margin-top: 24px;
  margin-bottom: 12px;
}

.welcome-content ul {
  list-style: none;
  padding-left: 0;
}

.welcome-content li {
  margin: 8px 0;
  font-size: 14px;
}
</style>
