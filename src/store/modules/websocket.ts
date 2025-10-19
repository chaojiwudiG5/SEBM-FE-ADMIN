/**
 * WebSocket状态管理
 * 参考SEBM-FE项目实现
 */
import { defineStore } from 'pinia'
import { WebSocketStatus, type WebSocketMessage } from '@/types/websocket'
import { websocketManager } from '@/utils/websocket'

export interface MessageFilter {
  type?: string
  priority?: string
  read?: boolean
  dateRange?: {
    start: number
    end: number
  }
}

export const useWebSocketStore = defineStore('websocket', {
  state: (): {
    messages: WebSocketMessage[]
    notifications: WebSocketMessage[]
    status: WebSocketStatus
    isConnected: boolean
    lastMessageTime: number
    unreadTotal: number
  } => ({
    messages: [] as WebSocketMessage[],
    notifications: [] as WebSocketMessage[],
    status: WebSocketStatus.DISCONNECTED,
    isConnected: false,
    lastMessageTime: 0,
    // 后端未读总数（单一真实来源，用于全局徽章显示）
    unreadTotal: 0
  }),

  getters: {
    // 获取所有消息
    allMessages: (state): WebSocketMessage[] => state.messages,

    // 获取未读消息
    unreadMessages: (state): WebSocketMessage[] => state.messages.filter((msg) => !msg.read),

    // 获取未读消息数量
    unreadCount: (state): number => state.messages.filter((msg) => !msg.read).length,

    // 获取未读通知数量
    unreadNotifications: (state): number => state.notifications.filter((n) => !n.read).length,

    // 总未读数量
    totalUnreadCount: (state): number => state.notifications.filter((n) => !n.read).length,

    // 按类型过滤消息
    messagesByType:
      (state) =>
      (type: string): WebSocketMessage[] =>
        state.messages.filter((msg) => msg.type === type),

    // 按优先级过滤消息
    messagesByPriority:
      (state) =>
      (priority: string): WebSocketMessage[] =>
        state.messages.filter((msg) => msg.priority === priority),

    // 获取紧急消息
    urgentMessages: (state): WebSocketMessage[] =>
      state.messages.filter((msg) => msg.priority === 'urgent'),

    // 获取高优先级消息
    highPriorityMessages: (state): WebSocketMessage[] =>
      state.messages.filter((msg) => msg.priority === 'high'),

    // 按时间排序的消息
    sortedMessages: (state): WebSocketMessage[] =>
      [...state.messages].sort((a, b) => b.timestamp - a.timestamp),

    // 最近的消息
    recentMessages:
      (state) =>
      (limit: number = 10): WebSocketMessage[] =>
        [...state.messages].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit),

    // 按日期分组的消息
    messagesByDate: (state): { [key: string]: WebSocketMessage[] } => {
      const groups: { [key: string]: WebSocketMessage[] } = {}
      state.messages.forEach((msg) => {
        const date = new Date(msg.timestamp).toDateString()
        if (!groups[date]) {
          groups[date] = []
        }
        groups[date].push(msg)
      })
      return groups
    }
  },

  actions: {
    /**
     * 初始化WebSocket连接
     */
    async initWebSocket() {
      try {
        console.log('🔵 [Store] 开始初始化 WebSocket...')
        // 添加消息处理器
        websocketManager.onMessage(this.handleWebSocketMessage)
        websocketManager.onStatusChange(this.handleWebSocketStatus)

        console.log('🔵 [Store] 已添加消息和状态处理器')
        // 连接WebSocket
        console.log('🔵 [Store] 开始调用 websocketManager.connect()...')
        await websocketManager.connect()
        console.log('✅ [Store] WebSocket初始化成功')
      } catch (error) {
        console.error('❌ [Store] WebSocket初始化失败:', error)
        throw error
      }
    },

    /**
     * 断开WebSocket连接
     */
    disconnectWebSocket() {
      websocketManager.offMessage(this.handleWebSocketMessage)
      websocketManager.offStatusChange(this.handleWebSocketStatus)
      websocketManager.disconnect()
      console.log('🔌 [Store] WebSocket已断开')
    },

    /**
     * 处理WebSocket消息
     */
    handleWebSocketMessage(message: WebSocketMessage) {
      console.log('📨 [Store] handleWebSocketMessage 开始处理:', {
        messageId: message.id,
        read: message.read,
        当前unreadTotal: this.unreadTotal
      })

      // 检查是否已存在相同ID的消息
      const existingMsgIndex = this.messages.findIndex((msg) => msg.id === message.id)
      const existingNotifIndex = this.notifications.findIndex((n) => n.id === message.id)

      if (existingMsgIndex > -1) {
        // 更新现有消息
        const prev = this.messages[existingMsgIndex]
        this.messages[existingMsgIndex] = message
        if (existingNotifIndex > -1) {
          this.notifications[existingNotifIndex] = message
        }
        // 同步全局未读总数变化
        if (prev.read && !message.read) {
          this.unreadTotal++
          console.log('📨 [Store] 已读变未读，unreadTotal++:', this.unreadTotal)
        } else if (!prev.read && message.read) {
          this.unreadTotal = Math.max(0, this.unreadTotal - 1)
          console.log('📨 [Store] 未读变已读，unreadTotal--:', this.unreadTotal)
        }
      } else {
        // 添加新消息到开头
        this.messages.unshift(message)
        this.notifications.unshift(message)
        if (!message.read) {
          this.unreadTotal++
          console.log('📨 [Store] 添加新未读消息，unreadTotal++:', this.unreadTotal)
        }
      }

      // 更新最后消息时间
      this.lastMessageTime = message.timestamp

      // 限制消息数量，避免内存溢出（两个数组使用相同限制）
      const maxMessages = 1000
      if (this.messages.length > maxMessages) {
        this.messages = this.messages.slice(0, maxMessages)
      }
      if (this.notifications.length > maxMessages) {
        this.notifications = this.notifications.slice(0, maxMessages)
      }

      console.log(
        '📨 [Store] 消息处理完成，最终unreadTotal:',
        this.unreadTotal,
        '未读消息数:',
        this.messages.filter((msg) => !msg.read).length
      )
    },

    /**
     * 处理WebSocket状态变化
     */
    handleWebSocketStatus(status: WebSocketStatus) {
      this.status = status
      this.isConnected = status === WebSocketStatus.CONNECTED
      console.log('🔌 [Store] WebSocket状态:', status)
    },

    /**
     * 添加消息
     */
    addMessage(message: WebSocketMessage) {
      this.handleWebSocketMessage(message)
    },

    /**
     * 添加通知
     * 注意：通知会同时添加到messages和notifications中，确保未读数量一致
     */
    addNotification(notification: any) {
      const message: WebSocketMessage = {
        id: notification.id || `notif_${Date.now()}`,
        type: notification.type || 'notification',
        title: notification.title || '新通知',
        content: notification.message || notification.content || '',
        timestamp: notification.timestamp || Date.now(),
        priority: notification.priority || 'normal',
        read: false,
        data: notification
      }

      // 使用handleWebSocketMessage统一处理，确保同时添加到messages和notifications
      this.handleWebSocketMessage(message)

      console.log(
        '📨 [Store] 已添加通知，当前未读:',
        this.messages.filter((msg) => !msg.read).length
      )
    },

    /**
     * 标记消息为已读
     */
    markAsRead(messageId: string) {
      const message = this.messages.find((msg) => msg.id === messageId)
      if (message && !message.read) {
        message.read = true
        this.unreadTotal = Math.max(0, this.unreadTotal - 1)
      }
      const notification = this.notifications.find((n) => n.id === messageId)
      if (notification && !notification.read) {
        notification.read = true
      }
    },

    /**
     * 标记通知为已读
     */
    markNotificationAsRead(notificationId: string) {
      // 同时标记 messages 和 notifications
      this.markAsRead(notificationId)
    },

    /**
     * 标记所有消息为已读
     */
    markAllAsRead() {
      this.messages.forEach((msg) => {
        msg.read = true
      })
      this.notifications.forEach((n) => {
        n.read = true
      })
      this.unreadTotal = 0
    },

    /**
     * 标记所有通知为已读
     */
    markAllNotificationsAsRead() {
      // 使用 markAllAsRead 保持一致性
      this.markAllAsRead()
    },

    /**
     * 删除消息
     */
    removeMessage(messageId: string) {
      const msgIndex = this.messages.findIndex((msg) => msg.id === messageId)
      if (msgIndex > -1) {
        if (!this.messages[msgIndex].read) {
          this.unreadTotal = Math.max(0, this.unreadTotal - 1)
        }
        this.messages.splice(msgIndex, 1)
      }
      const notifIndex = this.notifications.findIndex((n) => n.id === messageId)
      if (notifIndex > -1) {
        this.notifications.splice(notifIndex, 1)
      }
    },

    /**
     * 清空所有消息
     */
    clearAllMessages() {
      this.messages = []
      this.notifications = []
      this.unreadTotal = 0
    },

    /**
     * 清空通知
     */
    clearNotifications() {
      // 同时清空 messages 和 notifications
      this.messages = []
      this.notifications = []
      this.unreadTotal = 0
    },

    /**
     * 清空已读消息
     */
    clearReadMessages() {
      this.messages = this.messages.filter((msg) => !msg.read)
      this.notifications = this.notifications.filter((n) => !n.read)
    },

    /**
     * 过滤消息
     */
    filterMessages(filter: MessageFilter): WebSocketMessage[] {
      return this.messages.filter((msg) => {
        if (filter.type && msg.type !== filter.type) return false
        if (filter.priority && msg.priority !== filter.priority) return false
        if (filter.read !== undefined && msg.read !== filter.read) return false
        if (filter.dateRange) {
          if (msg.timestamp < filter.dateRange.start || msg.timestamp > filter.dateRange.end) {
            return false
          }
        }
        return true
      })
    },

    /**
     * 搜索消息
     */
    searchMessages(query: string): WebSocketMessage[] {
      const lowerQuery = query.toLowerCase()
      return this.messages.filter(
        (msg) =>
          msg.title.toLowerCase().includes(lowerQuery) ||
          msg.content.toLowerCase().includes(lowerQuery)
      )
    },

    /**
     * 获取消息统计
     */
    getMessageStats() {
      const stats = {
        total: this.messages.length,
        unread: this.messages.filter((msg) => !msg.read).length,
        byType: {} as { [key: string]: number },
        byPriority: {} as { [key: string]: number }
      }

      this.messages.forEach((msg) => {
        // 按类型统计
        stats.byType[msg.type] = (stats.byType[msg.type] || 0) + 1
        // 按优先级统计
        stats.byPriority[msg.priority] = (stats.byPriority[msg.priority] || 0) + 1
      })

      return stats
    },

    /**
     * 发送测试消息（开发调试用）
     */
    sendTestMessage(type: string = 'notification', priority: string = 'normal') {
      const testMessage: WebSocketMessage = {
        id: `test_${Date.now()}`,
        type: type as any,
        title: `测试消息 - ${type}`,
        content: `这是一条${priority}优先级的测试消息，发送时间：${new Date().toLocaleString()}`,
        timestamp: Date.now(),
        priority: priority as any,
        read: false
      }

      this.handleWebSocketMessage(testMessage)
      console.log('✅ [Store] 测试消息已添加:', testMessage)
    },

    /**
     * 设置全局未读总数（以服务端为准）
     */
    setUnreadTotal(count: number) {
      this.unreadTotal = Math.max(0, Number(count) || 0)
      console.log('✅ [Store] setUnreadTotal 已更新:', this.unreadTotal)
    },

    /**
     * 初始化事件监听器（兼容旧代码）
     */
    initEventListeners() {
      // 已在 initWebSocket 中处理
      console.log('📡 [Store] 事件监听器已初始化')
    }
  },

  // 持久化配置
  persist: {
    key: 'websocket-store',
    storage: localStorage
  }
})
