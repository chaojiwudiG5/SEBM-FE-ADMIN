<template>
  <div v-if="shouldShow" class="websocket-status-bar" :class="statusClass">
    <div class="status-content">
      <span class="status-dot"></span>
      <span class="status-text">{{ statusText }}</span>
      <span class="unread-info" v-if="isConnected && unreadCount > 0">
        未读消息: {{ unreadCount }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useWebSocketStore } from '@/store/modules/websocket'
  import { WebSocketStatus } from '@/types/websocket'

  const websocketStore = useWebSocketStore()

  // 计算属性：连接状态
  const status = computed(() => {
    const currentStatus = websocketStore.status
    console.log('📊 [StatusBar] 当前状态:', currentStatus)
    return currentStatus
  })
  const isConnected = computed(() => websocketStore.isConnected)
  const unreadCount = computed(() => websocketStore.$state.unreadTotal || 0)

  // 是否显示状态条（非连接状态时显示，连接成功后自动隐藏）
  const shouldShow = computed(() => {
    const show = status.value !== WebSocketStatus.CONNECTED
    console.log('📊 [StatusBar] 是否显示:', show, '状态:', status.value)
    return show
  })

  // 状态样式类
  const statusClass = computed(() => {
    switch (status.value) {
      case WebSocketStatus.CONNECTING:
        return 'status-connecting'
      case WebSocketStatus.CONNECTED:
        return 'status-connected'
      case WebSocketStatus.DISCONNECTED:
        return 'status-disconnected'
      case WebSocketStatus.RECONNECTING:
        return 'status-reconnecting'
      case WebSocketStatus.ERROR:
        return 'status-error'
      default:
        return ''
    }
  })

  // 状态文本
  const statusText = computed(() => {
    switch (status.value) {
      case WebSocketStatus.CONNECTING:
        return '正在连接 WebSocket...'
      case WebSocketStatus.CONNECTED:
        return 'WebSocket 已连接'
      case WebSocketStatus.DISCONNECTED:
        return 'WebSocket 未连接'
      case WebSocketStatus.RECONNECTING:
        return '正在重新连接...'
      case WebSocketStatus.ERROR:
        return 'WebSocket 连接错误'
      default:
        return ''
    }
  })
</script>

<style scoped lang="scss">
  .websocket-status-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    font-size: 13px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .status-content {
      display: flex;
      align-items: center;
      gap: 8px;

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        animation: pulse 2s infinite;
      }

      .status-text {
        font-weight: 500;
      }

      .unread-info {
        margin-left: 12px;
        padding: 2px 8px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        font-size: 12px;
      }
    }

    &.status-connecting {
      background: linear-gradient(90deg, #3b82f6, #60a5fa);
      color: white;

      .status-dot {
        background: white;
      }
    }

    &.status-connected {
      background: linear-gradient(90deg, #10b981, #34d399);
      color: white;

      .status-dot {
        background: white;
        animation: none;
      }
    }

    &.status-disconnected {
      background: linear-gradient(90deg, #6b7280, #9ca3af);
      color: white;

      .status-dot {
        background: white;
        animation: none;
      }
    }

    &.status-reconnecting {
      background: linear-gradient(90deg, #f59e0b, #fbbf24);
      color: white;

      .status-dot {
        background: white;
      }
    }

    &.status-error {
      background: linear-gradient(90deg, #ef4444, #f87171);
      color: white;

      .status-dot {
        background: white;
        animation: none;
      }
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.2);
    }
  }
</style>

