<template>
  <div class="websocket-demo">
    <ArtPageHeader title="WebSocket 连接管理" />
    
    <div class="demo-content">
      <!-- 连接状态卡片 -->
      <ArtCard title="连接状态" class="status-card">
        <div class="status-info">
          <div class="status-item">
            <span class="label">连接状态:</span>
            <ElTag :type="statusTagType">{{ statusText }}</ElTag>
          </div>
          <div class="status-item">
            <span class="label">连接时间:</span>
            <span>{{ connectionTime || '未连接' }}</span>
          </div>
          <div class="status-item">
            <span class="label">消息总数:</span>
            <span>{{ totalMessages }}</span>
          </div>
          <div class="status-item">
            <span class="label">未读通知:</span>
            <ElBadge :value="unreadNotifications" type="danger">
              <span>{{ unreadNotifications }}</span>
            </ElBadge>
          </div>
        </div>
        
        <div class="status-actions">
          <ElButton 
            v-if="!isConnected" 
            type="primary" 
            @click="connect"
            :loading="isConnecting"
          >
            连接
          </ElButton>
          <ElButton 
            v-if="isConnected" 
            type="danger" 
            @click="disconnect"
          >
            断开
          </ElButton>
          <ElButton 
            v-if="hasError" 
            type="warning" 
            @click="reconnect"
          >
            重连
          </ElButton>
        </div>
      </ArtCard>

      <!-- 消息发送卡片 -->
      <ArtCard title="发送消息" class="send-card">
        <div class="send-form">
          <ElForm :model="sendForm" label-width="80px">
            <ElFormItem label="消息类型">
              <ElSelect v-model="sendForm.type" placeholder="选择消息类型">
                <ElOption label="通知" value="notification" />
                <ElOption label="聊天" value="chat" />
                <ElOption label="系统" value="system" />
                <ElOption label="测试" value="test" />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="消息内容">
              <ElInput
                v-model="sendForm.content"
                type="textarea"
                :rows="3"
                placeholder="输入消息内容"
              />
            </ElFormItem>
            <ElFormItem>
              <ElButton 
                type="primary" 
                @click="sendMessage"
                :disabled="!isConnected || !sendForm.content"
              >
                发送消息
              </ElButton>
              <ElButton @click="clearForm">清空</ElButton>
            </ElFormItem>
          </ElForm>
        </div>
      </ArtCard>

      <!-- 消息历史卡片 -->
      <ArtCard title="消息历史" class="messages-card">
        <div class="messages-header">
          <ElButton size="small" @click="clearMessages">清空历史</ElButton>
          <ElButton size="small" @click="refreshMessages">刷新</ElButton>
        </div>
        
        <div class="messages-list">
          <div v-if="messages.length === 0" class="empty-state">
            <ElIcon :size="48" color="var(--el-color-info)">
              <ChatDotRound />
            </ElIcon>
            <p>暂无消息</p>
          </div>
          
          <div
            v-for="message in messages"
            :key="message.id"
            class="message-item"
            :class="message.type"
          >
            <div class="message-header">
              <ElTag :type="getMessageTagType(message.type)" size="small">
                {{ message.type }}
              </ElTag>
              <span class="message-time">{{ formatTime(message.timestamp) }}</span>
            </div>
            <div class="message-content">
              {{ message.data?.content || JSON.stringify(message.data) }}
            </div>
          </div>
        </div>
      </ArtCard>

      <!-- 通知管理卡片 -->
      <ArtCard title="通知管理" class="notifications-card">
        <div class="notifications-header">
          <ElButton size="small" @click="markAllNotificationsAsRead">全部已读</ElButton>
          <ElButton size="small" @click="clearNotifications">清空通知</ElButton>
        </div>
        
        <div class="notifications-list">
          <div v-if="notifications.length === 0" class="empty-state">
            <ElIcon :size="48" color="var(--el-color-info)">
              <Bell />
            </ElIcon>
            <p>暂无通知</p>
          </div>
          
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification-item"
            :class="{ 'unread': !notification.read }"
            @click="markNotificationAsRead(notification.id)"
          >
            <div class="notification-content">
              <div class="notification-title">{{ notification.title || '系统通知' }}</div>
              <div class="notification-message">{{ notification.message || notification.content }}</div>
              <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
            </div>
            <div v-if="!notification.read" class="unread-indicator"></div>
          </div>
        </div>
      </ArtCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElTag, ElBadge, ElButton, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElIcon } from 'element-plus'
import { ChatDotRound, Bell } from '@element-plus/icons-vue'
import { useWebSocketStore } from '@/store/modules/websocket'
import { WebSocketStatus } from '@/utils/websocket'
import { websocketManager } from '@/utils/websocket'

const websocketStore = useWebSocketStore()

// 响应式数据
const connectionTime = ref<string>('')
const sendForm = ref({
  type: 'test',
  content: ''
})

// 计算属性
const statusText = computed(() => {
  switch (websocketStore.status) {
    case WebSocketStatus.CONNECTING:
      return '连接中'
    case WebSocketStatus.CONNECTED:
      return '已连接'
    case WebSocketStatus.DISCONNECTED:
      return '未连接'
    case WebSocketStatus.ERROR:
      return '连接错误'
    default:
      return '未知状态'
  }
})

const statusTagType = computed(() => {
  switch (websocketStore.status) {
    case WebSocketStatus.CONNECTING:
      return 'warning'
    case WebSocketStatus.CONNECTED:
      return 'success'
    case WebSocketStatus.DISCONNECTED:
      return 'info'
    case WebSocketStatus.ERROR:
      return 'danger'
    default:
      return 'info'
  }
})

const isConnected = computed(() => websocketStore.isConnected)
const isConnecting = computed(() => websocketStore.isConnecting)
const hasError = computed(() => websocketStore.hasError)
const totalMessages = computed(() => websocketStore.messages.length)
const unreadNotifications = computed(() => websocketStore.unreadNotifications)
const messages = computed(() => websocketStore.messages.slice().reverse()) // 最新消息在前
const notifications = computed(() => websocketStore.notifications)

// 方法
const connect = () => {
  websocketManager.init()
}

const disconnect = () => {
  websocketManager.disconnect()
}

const reconnect = () => {
  websocketManager.reconnect()
}

const sendMessage = () => {
  if (!sendForm.value.content.trim()) return
  
  const success = websocketManager.sendMessage(sendForm.value.type, {
    content: sendForm.value.content,
    timestamp: Date.now()
  })
  
  if (success) {
    ElMessage.success('消息发送成功')
    clearForm()
  } else {
    ElMessage.error('消息发送失败')
  }
}

const clearForm = () => {
  sendForm.value = {
    type: 'test',
    content: ''
  }
}

const clearMessages = () => {
  websocketStore.clearMessages()
  ElMessage.success('消息历史已清空')
}

const refreshMessages = () => {
  // 刷新消息列表
  ElMessage.success('消息列表已刷新')
}

const clearNotifications = () => {
  websocketStore.clearNotifications()
  ElMessage.success('通知已清空')
}

const markAllNotificationsAsRead = () => {
  websocketStore.markAllNotificationsAsRead()
  ElMessage.success('所有通知已标记为已读')
}

const markNotificationAsRead = (id: string) => {
  websocketStore.markNotificationAsRead(id)
}

const getMessageTagType = (type: string) => {
  switch (type) {
    case 'notification':
      return 'warning'
    case 'chat':
      return 'primary'
    case 'system':
      return 'info'
    case 'test':
      return 'success'
    default:
      return 'info'
  }
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString()
}

// 生命周期
onMounted(() => {
  // 初始化WebSocket store的事件监听
  websocketStore.initEventListeners()
  
  // 记录连接时间
  if (isConnected.value) {
    connectionTime.value = new Date().toLocaleString()
  }
})
</script>

<style lang="scss" scoped>
.websocket-demo {
  padding: 20px;

  .demo-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 20px;

    .status-card,
    .send-card {
      grid-column: 1 / -1;
    }

    .messages-card,
    .notifications-card {
      min-height: 400px;
    }
  }

  .status-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 20px;

    .status-item {
      display: flex;
      align-items: center;
      gap: 8px;

      .label {
        font-weight: 500;
        color: var(--el-text-color-regular);
      }
    }
  }

  .status-actions {
    display: flex;
    gap: 12px;
  }

  .send-form {
    max-width: 500px;
  }

  .messages-header,
  .notifications-header {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-bottom: 16px;
  }

  .messages-list,
  .notifications-list {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid var(--el-border-color-light);
    border-radius: 4px;
    padding: 12px;

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      color: var(--el-text-color-placeholder);

      p {
        margin: 8px 0 0 0;
        font-size: 14px;
      }
    }

    .message-item {
      padding: 12px;
      border-bottom: 1px solid var(--el-border-color-lighter);
      margin-bottom: 8px;

      &:last-child {
        border-bottom: none;
        margin-bottom: 0;
      }

      .message-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .message-content {
        font-size: 14px;
        color: var(--el-text-color-regular);
        line-height: 1.4;
      }
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      padding: 12px;
      border-bottom: 1px solid var(--el-border-color-lighter);
      cursor: pointer;
      transition: background-color 0.3s ease;
      position: relative;

      &:hover {
        background-color: var(--el-color-primary-light-9);
      }

      &.unread {
        background-color: var(--el-color-primary-light-9);
      }

      &:last-child {
        border-bottom: none;
      }

      .notification-content {
        flex: 1;
        min-width: 0;

        .notification-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--el-text-color-primary);
          margin-bottom: 4px;
        }

        .notification-message {
          font-size: 12px;
          color: var(--el-text-color-regular);
          line-height: 1.4;
          margin-bottom: 4px;
        }

        .notification-time {
          font-size: 11px;
          color: var(--el-text-color-placeholder);
        }
      }

      .unread-indicator {
        width: 6px;
        height: 6px;
        background-color: var(--el-color-primary);
        border-radius: 50%;
        margin-left: 8px;
        margin-top: 6px;
        flex-shrink: 0;
      }
    }
  }
}

@media (max-width: 768px) {
  .websocket-demo {
    .demo-content {
      grid-template-columns: 1fr;
    }

    .status-info {
      grid-template-columns: 1fr;
    }
  }
}
</style>
