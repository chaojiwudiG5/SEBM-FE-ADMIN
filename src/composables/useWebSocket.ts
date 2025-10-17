/**
 * WebSocket Composable
 * 提供在组件中使用WebSocket的便捷方法
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { websocketManager, WebSocketStatus, type WebSocketMessage } from '@/utils/websocket'
import mittBus from '@/utils/sys/mittBus'

export function useWebSocket() {
  // 连接状态
  const status = ref<WebSocketStatus>(WebSocketStatus.DISCONNECTED)
  const isConnected = computed(() => status.value === WebSocketStatus.CONNECTED)
  const error = ref<string | null>(null)
  
  // 消息相关
  const messages = ref<WebSocketMessage[]>([])
  const unreadCount = ref(0)

  // 更新状态
  const updateStatus = () => {
    status.value = websocketManager.getStatus()
    error.value = websocketManager.error.value
  }

  // 发送消息
  const sendMessage = (type: string, data: any) => {
    return websocketManager.sendMessage(type, data)
  }

  // 获取最新消息
  const getLatestMessages = (count: number = 10) => {
    return websocketManager.getLatestMessages(count)
  }

  // 清空消息
  const clearMessages = () => {
    websocketManager.clearMessages()
    messages.value = []
    unreadCount.value = 0
  }

  // 重连
  const reconnect = () => {
    websocketManager.reconnect()
  }

  // 断开连接
  const disconnect = () => {
    websocketManager.disconnect()
  }

  // 监听WebSocket事件
  const setupEventListeners = () => {
    // 监听通知消息
    const handleNotification = (data: any) => {
      console.log('🔔 [useWebSocket] 收到通知:', data)
      unreadCount.value++
      
      // 可以在这里添加具体的通知处理逻辑
      // 比如显示系统通知、更新UI等
    }

    // 监听聊天消息
    const handleChatMessage = (data: any) => {
      console.log('💬 [useWebSocket] 收到聊天消息:', data)
      unreadCount.value++
    }

    // 监听系统消息
    const handleSystemMessage = (data: any) => {
      console.log('⚙️ [useWebSocket] 收到系统消息:', data)
    }

    // 注册事件监听器
    mittBus.on('websocket-notification', handleNotification)
    mittBus.on('websocket-chat-message', handleChatMessage)
    mittBus.on('websocket-system-message', handleSystemMessage)

    // 返回清理函数
    return () => {
      mittBus.off('websocket-notification', handleNotification)
      mittBus.off('websocket-chat-message', handleChatMessage)
      mittBus.off('websocket-system-message', handleSystemMessage)
    }
  }

  // 组件挂载时设置监听器
  onMounted(() => {
    updateStatus()
    const cleanup = setupEventListeners()
    
    // 组件卸载时清理监听器
    onUnmounted(cleanup)
  })

  return {
    // 状态
    status: computed(() => status.value),
    isConnected,
    error: computed(() => error.value),
    
    // 消息
    messages: computed(() => messages.value),
    unreadCount: computed(() => unreadCount.value),
    
    // 方法
    sendMessage,
    getLatestMessages,
    clearMessages,
    reconnect,
    disconnect,
    updateStatus
  }
}

/**
 * 专门用于消息通知的composable
 */
export function useWebSocketNotification() {
  const notifications = ref<any[]>([])
  const unreadCount = ref(0)

  const addNotification = (notification: any) => {
    notifications.value.unshift({
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      read: false
    })
    unreadCount.value++
  }

  const markAsRead = (id: string) => {
    const notification = notifications.value.find(n => n.id === id)
    if (notification && !notification.read) {
      notification.read = true
      unreadCount.value--
    }
  }

  const markAllAsRead = () => {
    notifications.value.forEach(n => n.read = true)
    unreadCount.value = 0
  }

  const clearNotifications = () => {
    notifications.value = []
    unreadCount.value = 0
  }

  // 监听WebSocket通知事件
  onMounted(() => {
    const handleNotification = (data: any) => {
      addNotification(data)
    }

    mittBus.on('websocket-notification', handleNotification)

    onUnmounted(() => {
      mittBus.off('websocket-notification', handleNotification)
    })
  })

  return {
    notifications: computed(() => notifications.value),
    unreadCount: computed(() => unreadCount.value),
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications
  }
}

/**
 * 专门用于聊天功能的composable
 */
export function useWebSocketChat() {
  const chatMessages = ref<any[]>([])
  const unreadCount = ref(0)

  const addMessage = (message: any) => {
    chatMessages.value.push({
      ...message,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      read: false
    })
    unreadCount.value++
  }

  const sendChatMessage = (content: string, toUserId?: string) => {
    return websocketManager.sendMessage('chat', {
      content,
      toUserId,
      timestamp: Date.now()
    })
  }

  const markAsRead = (id: string) => {
    const message = chatMessages.value.find(m => m.id === id)
    if (message && !message.read) {
      message.read = true
      unreadCount.value--
    }
  }

  const markAllAsRead = () => {
    chatMessages.value.forEach(m => m.read = true)
    unreadCount.value = 0
  }

  const clearMessages = () => {
    chatMessages.value = []
    unreadCount.value = 0
  }

  // 监听WebSocket聊天消息事件
  onMounted(() => {
    const handleChatMessage = (data: any) => {
      addMessage(data)
    }

    mittBus.on('websocket-chat-message', handleChatMessage)

    onUnmounted(() => {
      mittBus.off('websocket-chat-message', handleChatMessage)
    })
  })

  return {
    chatMessages: computed(() => chatMessages.value),
    unreadCount: computed(() => unreadCount.value),
    addMessage,
    sendChatMessage,
    markAsRead,
    markAllAsRead,
    clearMessages
  }
}
