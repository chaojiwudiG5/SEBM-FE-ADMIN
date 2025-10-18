/**
 * WebSocket相关类型定义
 * 参考SEBM-FE项目实现
 */

// 通知类型枚举
export enum NotificationType {
  NOTIFICATION = 'notification',        // 普通通知
  SYSTEM = 'system',                   // 系统通知
  DEVICE_UPDATE = 'device_update',     // 设备更新
  MAINTENANCE_UPDATE = 'maintenance_update', // 维修更新
  BORROW_UPDATE = 'borrow_update',     // 借用更新
  USER_UPDATE = 'user_update',         // 用户更新
  SECURITY_ALERT = 'security_alert',   // 安全警报
  SYSTEM_MAINTENANCE = 'system_maintenance' // 系统维护
}

// 通知优先级枚举
export enum NotificationPriority {
  LOW = 'low',         // 低优先级
  NORMAL = 'normal',   // 普通优先级
  HIGH = 'high',       // 高优先级
  URGENT = 'urgent'    // 紧急优先级
}

// WebSocket连接状态枚举
export enum WebSocketStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

// WebSocket消息类型
export interface WebSocketMessage {
  id: string
  type: NotificationType
  title: string
  content: string
  timestamp: number
  priority: NotificationPriority
  read: boolean
  data?: any
}

// WebSocket配置
export interface WebSocketConfig {
  url: string
  protocols?: string[]
  heartbeatInterval?: number
  reconnectInterval?: number
  maxReconnectAttempts?: number
  autoConnect?: boolean
}
