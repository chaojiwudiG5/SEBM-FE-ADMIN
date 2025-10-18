<template>
  <div class="websocket-test-page">
    <ArtPageHeader title="WebSocket连接测试" />
    
    <div class="test-content">
      <!-- 连接状态 -->
      <ArtCard title="连接状态" class="status-card">
        <div class="status-info">
          <div class="status-item">
            <span class="label">WebSocket地址:</span>
            <span class="value">{{ wsUrl }}</span>
          </div>
          <div class="status-item">
            <span class="label">连接状态:</span>
            <ElTag :type="statusTagType">{{ statusText }}</ElTag>
          </div>
          <div class="status-item">
            <span class="label">连接时间:</span>
            <span>{{ connectionTime || '未连接' }}</span>
          </div>
          <div class="status-item">
            <span class="label">接收消息数:</span>
            <span>{{ receivedMessages.length }}</span>
          </div>
        </div>
        
        <div class="status-actions">
          <ElButton 
            type="primary" 
            @click="testConnect"
            :loading="isConnecting"
            :disabled="isConnected"
          >
            测试连接
          </ElButton>
          <ElButton 
            type="danger" 
            @click="disconnect"
            :disabled="!isConnected"
          >
            断开连接
          </ElButton>
          <ElButton @click="clearLogs">清空日志</ElButton>
        </div>
      </ArtCard>

      <!-- 测试消息发送 -->
      <ArtCard title="发送测试消息" class="send-card">
        <div class="send-form">
          <ElInput
            v-model="testMessage"
            type="textarea"
            :rows="3"
            placeholder="输入测试消息内容（JSON格式）"
          />
          <ElButton 
            type="primary" 
            @click="sendTestMessage"
            :disabled="!isConnected"
            style="margin-top: 10px"
          >
            发送消息
          </ElButton>
        </div>
      </ArtCard>

      <!-- 连接日志 -->
      <ArtCard title="连接日志" class="logs-card">
        <div class="logs-list">
          <div
            v-for="(log, index) in logs"
            :key="index"
            class="log-item"
            :class="log.type"
          >
            <span class="log-time">{{ formatTime(log.timestamp) }}</span>
            <span class="log-type">{{ log.type }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
          <div v-if="logs.length === 0" class="empty-logs">
            暂无日志
          </div>
        </div>
      </ArtCard>

      <!-- 接收到的消息 -->
      <ArtCard title="接收到的消息" class="messages-card">
        <div class="messages-list">
          <div
            v-for="(msg, index) in receivedMessages"
            :key="index"
            class="message-item"
          >
            <div class="message-header">
              <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
            </div>
            <div class="message-content">
              <pre>{{ JSON.stringify(msg.data, null, 2) }}</pre>
            </div>
          </div>
          <div v-if="receivedMessages.length === 0" class="empty-messages">
            暂无消息
          </div>
        </div>
      </ArtCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElButton, ElInput, ElTag, ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

// WebSocket相关
let ws: WebSocket | null = null
const wsUrl = ref('')
const isConnecting = ref(false)
const isConnected = ref(false)
const connectionTime = ref('')
const testMessage = ref('{"type": "test", "message": "Hello WebSocket!"}')

// 日志和消息
const logs = ref<any[]>([])
const receivedMessages = ref<any[]>([])

// 计算属性
const statusText = computed(() => {
  if (isConnecting.value) return '连接中...'
  if (isConnected.value) return '已连接'
  return '未连接'
})

const statusTagType = computed(() => {
  if (isConnecting.value) return 'warning'
  if (isConnected.value) return 'success'
  return 'info'
})

// 构建WebSocket URL
const buildWebSocketUrl = () => {
  const { VITE_API_PROXY_URL } = import.meta.env
  const baseUrl = VITE_API_PROXY_URL || 'http://localhost:29578'
  
  // 将http/https转换为ws/wss
  const wsBaseUrl = baseUrl.replace(/^http/, 'ws')
  
  // 添加认证token
  const token = userStore.accessToken
  const url = new URL('/ws', wsBaseUrl)
  
  if (token) {
    url.searchParams.set('token', token)
  }
  
  return url.toString()
}

// 添加日志
const addLog = (type: string, message: string) => {
  logs.value.push({
    type,
    message,
    timestamp: Date.now()
  })
  console.log(`[WebSocket-${type}]`, message)
}

// 测试连接
const testConnect = () => {
  try {
    isConnecting.value = true
    wsUrl.value = buildWebSocketUrl()
    
    addLog('INFO', `尝试连接到: ${wsUrl.value}`)
    
    ws = new WebSocket(wsUrl.value)
    
    ws.onopen = () => {
      isConnecting.value = false
      isConnected.value = true
      connectionTime.value = new Date().toLocaleString()
      addLog('SUCCESS', 'WebSocket连接成功！')
      ElMessage.success('WebSocket连接成功！')
      
      // 发送认证消息
      const authMessage = {
        type: 'auth',
        token: userStore.accessToken,
        userId: userStore.info?.id
      }
      ws?.send(JSON.stringify(authMessage))
      addLog('INFO', '已发送认证消息')
    }
    
    ws.onmessage = (event) => {
      addLog('MESSAGE', `收到消息: ${event.data}`)
      
      try {
        const data = JSON.parse(event.data)
        receivedMessages.value.push({
          data,
          timestamp: Date.now()
        })
      } catch (e) {
        receivedMessages.value.push({
          data: event.data,
          timestamp: Date.now()
        })
      }
    }
    
    ws.onerror = (error) => {
      addLog('ERROR', `连接错误: ${error}`)
      ElMessage.error('WebSocket连接错误')
      isConnecting.value = false
    }
    
    ws.onclose = (event) => {
      addLog('INFO', `连接关闭: code=${event.code}, reason=${event.reason}`)
      isConnected.value = false
      isConnecting.value = false
      connectionTime.value = ''
    }
    
  } catch (error) {
    addLog('ERROR', `连接失败: ${error}`)
    ElMessage.error('WebSocket连接失败')
    isConnecting.value = false
  }
}

// 断开连接
const disconnect = () => {
  if (ws) {
    ws.close()
    ws = null
    addLog('INFO', '手动断开连接')
  }
}

// 发送测试消息
const sendTestMessage = () => {
  if (!ws || !isConnected.value) {
    ElMessage.warning('请先连接WebSocket')
    return
  }
  
  try {
    ws.send(testMessage.value)
    addLog('SEND', `发送消息: ${testMessage.value}`)
    ElMessage.success('消息发送成功')
  } catch (error) {
    addLog('ERROR', `发送失败: ${error}`)
    ElMessage.error('消息发送失败')
  }
}

// 清空日志
const clearLogs = () => {
  logs.value = []
  receivedMessages.value = []
  ElMessage.success('日志已清空')
}

// 格式化时间
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

// 组件卸载时断开连接
onUnmounted(() => {
  disconnect()
})
</script>

<style lang="scss" scoped>
.websocket-test-page {
  padding: 20px;

  .test-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
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
        min-width: 100px;
      }

      .value {
        color: var(--el-text-color-primary);
        word-break: break-all;
      }
    }
  }

  .status-actions {
    display: flex;
    gap: 12px;
  }

  .send-form {
    max-width: 600px;
  }

  .logs-list,
  .messages-list {
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid var(--el-border-color-light);
    border-radius: 4px;
    padding: 12px;

    .log-item {
      padding: 8px;
      border-bottom: 1px solid var(--el-border-color-lighter);
      font-family: monospace;
      font-size: 12px;
      display: flex;
      gap: 8px;

      &:last-child {
        border-bottom: none;
      }

      .log-time {
        color: var(--el-text-color-placeholder);
        min-width: 80px;
      }

      .log-type {
        font-weight: bold;
        min-width: 60px;
      }

      .log-message {
        color: var(--el-text-color-regular);
        word-break: break-all;
      }

      &.INFO .log-type {
        color: var(--el-color-info);
      }

      &.SUCCESS .log-type {
        color: var(--el-color-success);
      }

      &.ERROR .log-type {
        color: var(--el-color-danger);
      }

      &.MESSAGE .log-type {
        color: var(--el-color-primary);
      }

      &.SEND .log-type {
        color: var(--el-color-warning);
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
        margin-bottom: 8px;

        .message-time {
          font-size: 12px;
          color: var(--el-text-color-placeholder);
        }
      }

      .message-content {
        pre {
          background-color: var(--el-fill-color-light);
          padding: 8px;
          border-radius: 4px;
          font-size: 12px;
          margin: 0;
          overflow-x: auto;
        }
      }
    }

    .empty-logs,
    .empty-messages {
      text-align: center;
      padding: 40px 20px;
      color: var(--el-text-color-placeholder);
    }
  }
}
</style>
