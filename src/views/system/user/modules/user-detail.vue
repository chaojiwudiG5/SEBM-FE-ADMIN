<template>
  <ElDialog
    v-model="visible"
    :title="title"
    width="800px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <div class="user-detail">
      <ElCard class="user-info-card" shadow="never">
        <template #header>
          <div class="card-header">
            <ElIcon><User /></ElIcon>
            <span>基本信息</span>
          </div>
        </template>
        
        <ElRow :gutter="24">
          <ElCol :span="8">
            <div class="avatar-section">
              <ElImage
                :src="userData.avatar || '/src/assets/img/avatar/default.png'"
                class="user-avatar"
                fit="cover"
              />
              <div class="user-name">{{ userData.userName }}</div>
              <ElTag :type="getRoleType(userData.userRole || 0)" size="small">
                {{ getRoleText(userData.userRole || 0) }}
              </ElTag>
            </div>
          </ElCol>
          
          <ElCol :span="16">
            <ElDescriptions :column="2" border>
              <ElDescriptionsItem label="用户ID">{{ userData.id }}</ElDescriptionsItem>
              <ElDescriptionsItem label="用户名">{{ userData.username }}</ElDescriptionsItem>
              <ElDescriptionsItem label="邮箱">{{ userData.email }}</ElDescriptionsItem>
              <ElDescriptionsItem label="手机号">{{ userData.phone }}</ElDescriptionsItem>
              <ElDescriptionsItem label="性别">{{ getGenderText(userData.gender || 0) }}</ElDescriptionsItem>
              <ElDescriptionsItem label="年龄">{{ userData.age || '未设置' }}</ElDescriptionsItem>
              <ElDescriptionsItem label="等级">{{ userData.level || '未设置' }}</ElDescriptionsItem>
              <ElDescriptionsItem label="状态">
                <ElTag :type="getStatusType(userData.userStatus || 0)">
                  {{ getStatusText(userData.userStatus || 0) }}
                </ElTag>
              </ElDescriptionsItem>
            </ElDescriptions>
          </ElCol>
        </ElRow>
      </ElCard>

      <ElCard class="device-info-card" shadow="never">
        <template #header>
          <div class="card-header">
            <ElIcon><Monitor /></ElIcon>
            <span>设备借用信息</span>
          </div>
        </template>
        
        <ElRow :gutter="24">
          <ElCol :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ userData.borrowedDeviceCount || 0 }}</div>
              <div class="stat-label">已借设备数</div>
            </div>
          </ElCol>
          <ElCol :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ userData.maxBorrowedDeviceCount || 0 }}</div>
              <div class="stat-label">最大可借数</div>
            </div>
          </ElCol>
          <ElCol :span="6">
            <div class="stat-item">
              <div class="stat-value" :class="{ 'danger': isOverdueLimit }">
                {{ userData.overdueTimes || 0 }}
              </div>
              <div class="stat-label">逾期次数</div>
            </div>
          </ElCol>
          <ElCol :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ userData.maxOverdueTimes || 0 }}</div>
              <div class="stat-label">最大允许逾期</div>
            </div>
          </ElCol>
        </ElRow>

        <ElProgress
          :percentage="borrowPercentage"
          :status="borrowPercentage >= 100 ? 'exception' : 'success'"
          :show-text="true"
          class="borrow-progress"
        >
          <template #default="{ percentage }">
            <span>设备借用率: {{ percentage }}%</span>
          </template>
        </ElProgress>
      </ElCard>

      <ElCard class="time-info-card" shadow="never">
        <template #header>
          <div class="card-header">
            <ElIcon><Clock /></ElIcon>
            <span>时间信息</span>
          </div>
        </template>
        
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="创建时间">
            {{ formatTime(userData.createTime || '') }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="更新时间">
            {{ formatTime(userData.updateTime || '') }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="是否删除">
            <ElTag :type="userData.isDelete ? 'danger' : 'success'">
              {{ userData.isDelete ? '已删除' : '正常' }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="账号状态">
            <ElTag :type="userData.isActive ? 'success' : 'warning'">
              {{ userData.isActive ? '激活' : '未激活' }}
            </ElTag>
          </ElDescriptionsItem>
        </ElDescriptions>
      </ElCard>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="handleClose">关闭</ElButton>
        <ElButton type="primary" @click="handleEdit">编辑用户</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { User, Monitor, Clock } from '@element-plus/icons-vue'

  interface Props {
    visible: boolean
    userData: Partial<Api.SystemManage.UserListItem>
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'edit', userData: Partial<Api.SystemManage.UserListItem>): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const visible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
  })

  const title = computed(() => `用户详情 - ${props.userData.userName || '未知用户'}`)

  // 计算设备借用率
  const borrowPercentage = computed(() => {
    const current = props.userData.borrowedDeviceCount || 0
    const max = props.userData.maxBorrowedDeviceCount || 1
    return Math.round((current / max) * 100)
  })

  // 是否超过逾期限制
  const isOverdueLimit = computed(() => {
    const current = props.userData.overdueTimes || 0
    const max = props.userData.maxOverdueTimes || 0
    return current >= max && max > 0
  })

  // 角色相关
  const getRoleText = (role: number) => {
    const roleMap = {
      0: '普通用户',
      1: '管理员',
      2: '技工'
    }
    return roleMap[role as keyof typeof roleMap] || '未知'
  }

  const getRoleType = (role: number) => {
    const typeMap = {
      0: 'info' as const,
      1: 'danger' as const,
      2: 'warning' as const
    }
    return typeMap[role as keyof typeof typeMap] || 'info'
  }

  // 性别相关
  const getGenderText = (gender: number) => {
    const genderMap = {
      0: '未知',
      1: '男',
      2: '女'
    }
    return genderMap[gender as keyof typeof genderMap] || '未知'
  }

  // 状态相关
  const getStatusText = (status: number) => {
    const statusMap = {
      0: '正常',
      1: '封禁'
    }
    return statusMap[status as keyof typeof statusMap] || '未知'
  }

  const getStatusType = (status: number) => {
    const typeMap = {
      0: 'success' as const,
      1: 'danger' as const
    }
    return typeMap[status as keyof typeof typeMap] || 'info' as const
  }

  // 时间格式化
  const formatTime = (time: string) => {
    if (!time) return '未设置'
    return new Date(time).toLocaleString('zh-CN')
  }

  // 事件处理
  const handleClose = () => {
    visible.value = false
  }

  const handleEdit = () => {
    emit('edit', props.userData)
    visible.value = false
  }
</script>

<style scoped lang="scss">
.user-detail {
  .user-info-card,
  .device-info-card,
  .time-info-card {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
  }

  .avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    .user-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      margin-bottom: 12px;
    }

    .user-name {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
    }
  }

  .stat-item {
    text-align: center;
    padding: 16px;
    border: 1px solid var(--el-border-color-light);
    border-radius: 4px;

    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: var(--el-color-primary);
      margin-bottom: 4px;

      &.danger {
        color: var(--el-color-danger);
      }
    }

    .stat-label {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  .borrow-progress {
    margin-top: 16px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>