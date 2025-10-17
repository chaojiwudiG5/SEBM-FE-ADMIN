/**
 * WebSocket连接管理工具
 * 参考SEBM-FE项目实现
 */
import { ElMessage, ElNotification } from 'element-plus'
import { WebSocketStatus, NotificationPriority, type WebSocketMessage } from '@/types/websocket'

class WebSocketManager {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 3000
  private heartbeatInterval: number | null = null
  private status: WebSocketStatus = WebSocketStatus.DISCONNECTED
  private messageHandlers: ((message: WebSocketMessage) => void)[] = []
  private statusHandlers: ((status: WebSocketStatus) => void)[] = []

  /**
   * 获取WebSocket URL
   */
  private getWebSocketURL(): string {
    // 从localStorage获取用户信息 - Pinia user store 持久化的 key 是 'user'
    const userStoreData = JSON.parse(localStorage.getItem('user') || '{}')
    console.log('📦 [WebSocket] localStorage 中的 user 数据:', userStoreData)
    
    // 尝试多种方式获取userId - 支持不同的数据结构
    const userId = userStoreData.userInfo?.id || 
                   userStoreData.userInfo?.userId ||
                   userStoreData.info?.userId || 
                   userStoreData.info?.id
    
    if (!userId) {
      console.error('❌ [WebSocket] 无法获取用户ID')
      console.error('❌ [WebSocket] user store 数据:', userStoreData)
      console.error('❌ [WebSocket] userInfo:', userStoreData.userInfo)
      console.error('❌ [WebSocket] info:', userStoreData.info)
      throw new Error('No user ID found')
    }

    console.log('✅ [WebSocket] 成功获取用户ID:', userId)

    // 根据环境选择WebSocket地址
    const wsUrl = import.meta.env.DEV
      ? `ws://localhost:29578/ws/notification?userId=${userId}`
      : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/notification?userId=${userId}`
    
    console.log('🌐 [WebSocket] 连接地址:', wsUrl)
    return wsUrl
  }

  /**
   * 连接WebSocket
   */
  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const url = this.getWebSocketURL()
        console.log('🔌 [WebSocket] 开始连接:', url)
        console.log('📊 [WebSocket] 当前环境:', import.meta.env.DEV ? '开发环境' : '生产环境')
        console.log('📊 [WebSocket] 浏览器支持:', 'WebSocket' in window ? '是' : '否')
        
        this.ws = new WebSocket(url)
        this.status = WebSocketStatus.CONNECTING
        this.notifyStatusHandlers()

        this.ws.onopen = () => {
          console.log('✅ [WebSocket] 连接成功')
          this.status = WebSocketStatus.CONNECTED
          this.reconnectAttempts = 0
          this.startHeartbeat()
          this.notifyStatusHandlers()
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const rawMessage = JSON.parse(event.data)
            
            // 适配后端消息格式
            const message: WebSocketMessage = this.adaptBackendMessage(rawMessage)
            this.handleMessage(message)
          } catch (error) {
            console.error('❌ [WebSocket] 解析消息失败:', error)
          }
        }

        this.ws.onclose = (event) => {
          console.log('🔌 [WebSocket] 连接关闭:', event.code, event.reason)
          this.status = WebSocketStatus.DISCONNECTED
          this.stopHeartbeat()
          this.notifyStatusHandlers()
          
          // 如果不是主动关闭，尝试重连
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect()
          }
        }

        this.ws.onerror = (error) => {
          console.error('❌ [WebSocket] 连接错误:', error)
          this.status = WebSocketStatus.ERROR
          this.notifyStatusHandlers()
          reject(error)
        }

      } catch (error) {
        console.error('❌ [WebSocket] 创建连接失败:', error)
        this.status = WebSocketStatus.ERROR
        this.notifyStatusHandlers()
        reject(error)
      }
    })
  }

  /**
   * 断开连接
   */
  public disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'User disconnected')
      this.ws = null
    }
    this.stopHeartbeat()
    this.status = WebSocketStatus.DISCONNECTED
    this.notifyStatusHandlers()
  }

  /**
   * 发送消息
   */
  public send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('⚠️ [WebSocket] 连接未打开')
    }
  }

  /**
   * 适配后端消息格式
   */
  private adaptBackendMessage(rawMessage: any): WebSocketMessage {
    // 处理pong响应（心跳）
    if (rawMessage.type === 'pong') {
      console.log('💓 [WebSocket] 收到心跳响应')
      return {
        id: `pong_${Date.now()}`,
        type: 'system' as any,
        title: '',
        content: '',
        timestamp: rawMessage.timestamp || Date.now(),
        priority: NotificationPriority.LOW,
        read: true,
        data: rawMessage
      }
    }

    // 适配后端的消息格式
    return {
      id: rawMessage.id || `msg_${Date.now()}`,
      type: this.mapBackendType(rawMessage.type, rawMessage.notificationType),
      title: rawMessage.subject || rawMessage.title || '新消息',
      content: rawMessage.content || '',
      timestamp: this.parseTimestamp(rawMessage.timestamp),
      priority: this.inferPriority(rawMessage.notificationType, rawMessage.type),
      read: false,
      data: rawMessage
    }
  }

  /**
   * 映射后端消息类型到前端类型
   */
  private mapBackendType(type: string, notificationType?: string): any {
    // 如果是notification类型，根据notificationType细分
    if (type === 'notification' && notificationType) {
      const typeMap: { [key: string]: string } = {
        'DEVICE_UPDATE': 'device_update',
        'MAINTENANCE_UPDATE': 'maintenance_update',
        'BORROW_UPDATE': 'borrow_update',
        'USER_UPDATE': 'user_update',
        'SECURITY_ALERT': 'security_alert',
        'SYSTEM_MAINTENANCE': 'system_maintenance'
      }
      return typeMap[notificationType] || 'notification'
    }
    
    // 直接类型映射
    return type === 'system' ? 'system' : 'notification'
  }

  /**
   * 解析时间戳
   */
  private parseTimestamp(timestamp: any): number {
    if (typeof timestamp === 'number') {
      return timestamp
    }
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp.replace(' ', 'T'))
      return date.getTime()
    }
    return Date.now()
  }

  /**
   * 根据通知类型推断优先级
   */
  private inferPriority(notificationType?: string, type?: string): NotificationPriority {
    if (!notificationType) {
      return type === 'system' ? NotificationPriority.NORMAL : NotificationPriority.NORMAL
    }
    
    const highPriorityTypes = ['SECURITY_ALERT', 'SYSTEM_MAINTENANCE']
    const urgentTypes = ['SECURITY_ALERT']
    
    if (urgentTypes.includes(notificationType)) {
      return NotificationPriority.URGENT
    }
    if (highPriorityTypes.includes(notificationType)) {
      return NotificationPriority.HIGH
    }
    return NotificationPriority.NORMAL
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(message: WebSocketMessage): void {
    // 忽略pong消息和空标题消息
    if (message.type === 'system' && !message.title) {
      return
    }

    console.log('📨 [WebSocket] 收到消息:', message)
    
    // 通知所有消息处理器
    this.messageHandlers.forEach(handler => {
      try {
        handler(message)
      } catch (error) {
        console.error('❌ [WebSocket] 消息处理器错误:', error)
      }
    })

    // 根据消息类型显示通知
    this.showNotification(message)
  }

  /**
   * 显示通知
   */
  private showNotification(message: WebSocketMessage): void {
    const notificationType = this.getNotificationType(message.priority)
    const duration = this.getNotificationDuration(message.priority)
    
    // 使用ElNotification显示桌面通知
    ElNotification({
      title: message.title,
      message: message.content,
      type: notificationType,
      duration: duration,
      position: 'top-right'
    })
  }

  /**
   * 获取通知类型
   */
  private getNotificationType(priority: NotificationPriority): 'success' | 'warning' | 'error' | 'info' {
    switch (priority) {
      case NotificationPriority.URGENT:
        return 'error'
      case NotificationPriority.HIGH:
        return 'warning'
      case NotificationPriority.NORMAL:
        return 'info'
      case NotificationPriority.LOW:
        return 'success'
      default:
        return 'info'
    }
  }

  /**
   * 获取通知持续时间
   */
  private getNotificationDuration(priority: NotificationPriority): number {
    switch (priority) {
      case NotificationPriority.URGENT:
        return 0 // 不自动关闭
      case NotificationPriority.HIGH:
        return 5000
      case NotificationPriority.NORMAL:
        return 3000
      case NotificationPriority.LOW:
        return 2000
      default:
        return 3000
    }
  }

  /**
   * 心跳检测
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = window.setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' })
        console.log('💓 [WebSocket] 发送心跳')
      }
    }, 30000) // 每30秒发送一次心跳
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  /**
   * 重连机制
   */
  private scheduleReconnect(): void {
    this.reconnectAttempts++
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`🔄 [WebSocket] 计划重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts}) 延迟 ${delay}ms`)
    this.status = WebSocketStatus.RECONNECTING
    this.notifyStatusHandlers()
    
    setTimeout(() => {
      if (this.status === WebSocketStatus.RECONNECTING || this.status === WebSocketStatus.DISCONNECTED) {
        console.log(`🔄 [WebSocket] 开始第 ${this.reconnectAttempts} 次重连...`)
        this.connect().catch(error => {
          console.error('❌ [WebSocket] 重连失败:', error)
        })
      }
    }, delay)
  }

  /**
   * 添加消息处理器
   */
  public onMessage(handler: (message: WebSocketMessage) => void): void {
    this.messageHandlers.push(handler)
  }

  /**
   * 移除消息处理器
   */
  public offMessage(handler: (message: WebSocketMessage) => void): void {
    const index = this.messageHandlers.indexOf(handler)
    if (index > -1) {
      this.messageHandlers.splice(index, 1)
    }
  }

  /**
   * 添加状态变化处理器
   */
  public onStatusChange(handler: (status: WebSocketStatus) => void): void {
    this.statusHandlers.push(handler)
  }

  /**
   * 移除状态变化处理器
   */
  public offStatusChange(handler: (status: WebSocketStatus) => void): void {
    const index = this.statusHandlers.indexOf(handler)
    if (index > -1) {
      this.statusHandlers.splice(index, 1)
    }
  }

  /**
   * 通知状态处理器
   */
  private notifyStatusHandlers(): void {
    this.statusHandlers.forEach(handler => {
      try {
        handler(this.status)
      } catch (error) {
        console.error('❌ [WebSocket] 状态处理器错误:', error)
      }
    })
  }

  /**
   * 获取连接状态
   */
  public getStatus(): WebSocketStatus {
    return this.status
  }

  /**
   * 检查是否已连接
   */
  public isConnected(): boolean {
    return this.status === WebSocketStatus.CONNECTED
  }
}

// 创建单例实例
export const websocketManager = new WebSocketManager()
