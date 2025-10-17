<template>
  <div class="websocket-status" :class="statusClass">
    <div class="status-indicator" :title="statusText">
      <div class="status-dot"></div>
      <span class="status-text">{{ statusText }}</span>
    </div>
    
    <!-- 未读消息提示 -->
    <div v-if="totalUnreadCount > 0" class="unread-badge">
      {{ totalUnreadCount > 99 ? '99+' : totalUnreadCount }}
    </div>
    
    <!-- 连接错误提示 -->
    <ElTooltip v-if="hasError" content="点击重连" placement="bottom">
      <div class="error-indicator" @click="handleReconnect">
        <ElIcon><Warning /></ElIcon>
      </div>
    </ElTooltip>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElIcon, ElTooltip } from 'element-plus'
import { Warning } from '@element-plus/icons-vue'
import { useWebSocketStore } from '@/store/modules/websocket'
import { WebSocketStatus } from '@/types/websocket'
import { websocketManager } from '@/utils/websocket'

const websocketStore = useWebSocketStore()

// 计算属性
const statusClass = computed(() => ({
  'status-connecting': websocketStore.status === WebSocketStatus.CONNECTING,
  'status-connected': websocketStore.isConnected,
  'status-disconnected': !websocketStore.isConnected && websocketStore.status !== WebSocketStatus.CONNECTING,
  'status-error': websocketStore.status === WebSocketStatus.ERROR
}))

const statusText = computed(() => {
  switch (websocketStore.status) {
    case WebSocketStatus.CONNECTING:
      return '连接中...'
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

const totalUnreadCount = computed(() => websocketStore.totalUnreadCount)
const hasError = computed(() => websocketStore.status === WebSocketStatus.ERROR)

// 方法
const handleReconnect = () => {
  websocketStore.initWebSocket()
}
</script>

<style lang="scss" scoped>
.websocket-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  transition: all 0.3s ease;

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 4px;

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      transition: background-color 0.3s ease;
    }

    .status-text {
      font-size: 12px;
      color: var(--el-text-color-regular);
    }
  }

  .unread-badge {
    background: var(--el-color-danger);
    color: white;
    border-radius: 10px;
    padding: 2px 6px;
    font-size: 10px;
    font-weight: bold;
    min-width: 16px;
    text-align: center;
    line-height: 1;
  }

  .error-indicator {
    color: var(--el-color-danger);
    cursor: pointer;
    padding: 2px;
    border-radius: 2px;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: var(--el-color-danger-light-9);
    }
  }

  // 状态样式
  &.status-connecting {
    .status-dot {
      background-color: var(--el-color-warning);
      animation: pulse 1.5s infinite;
    }
  }

  &.status-connected {
    .status-dot {
      background-color: var(--el-color-success);
    }
  }

  &.status-disconnected {
    .status-dot {
      background-color: var(--el-color-info);
    }
  }

  &.status-error {
    .status-dot {
      background-color: var(--el-color-danger);
    }
  }
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>
