<template>
  <div class="websocket-notifications">
    <!-- 通知按钮 -->
    <ElPopover
      v-model:visible="showNotifications"
      placement="bottom-end"
      :width="320"
      trigger="click"
      popper-class="websocket-notifications-popover"
    >
      <template #reference>
        <div class="notification-trigger" :class="{ 'has-unread': totalUnreadCount > 0 }">
          <ElIcon :size="18">
            <Bell />
          </ElIcon>
          <div v-if="totalUnreadCount > 0" class="unread-badge">
            {{ totalUnreadCount > 99 ? '99+' : totalUnreadCount }}
          </div>
        </div>
      </template>

      <!-- 通知内容 -->
      <div class="notifications-content">
        <div class="notifications-header">
          <h4>消息通知</h4>
          <div class="header-actions">
            <!-- 测试按钮 -->
            <ElDropdown @command="handleTestCommand" trigger="click">
              <ElButton type="primary" size="small" plain>
                测试 <ElIcon class="el-icon--right"><ArrowDown /></ElIcon>
              </ElButton>
              <template #dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem command="normal">
                    <ElIcon><Bell /></ElIcon>
                    普通通知
                  </ElDropdownItem>
                  <ElDropdownItem command="high">
                    <ElIcon color="#E6A23C"><Warning /></ElIcon>
                    高优先级
                  </ElDropdownItem>
                  <ElDropdownItem command="urgent">
                    <ElIcon color="#F56C6C"><CircleClose /></ElIcon>
                    紧急消息
                  </ElDropdownItem>
                  <ElDropdownItem command="device">
                    <ElIcon><Monitor /></ElIcon>
                    设备更新
                  </ElDropdownItem>
                  <ElDropdownItem command="maintenance">
                    <ElIcon><Tools /></ElIcon>
                    维修通知
                  </ElDropdownItem>
                  <ElDropdownItem command="system">
                    <ElIcon><Setting /></ElIcon>
                    系统消息
                  </ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>

            <ElButton v-if="totalUnreadCount > 0" type="text" size="small" @click="markAllAsRead">
              全部已读
            </ElButton>
            <ElButton type="text" size="small" @click="clearAll"> 清空 </ElButton>
          </div>
        </div>

        <div class="notifications-list">
          <div v-if="notifications.length === 0" class="empty-state">
            <ElIcon :size="48" color="var(--el-color-info)">
              <Bell />
            </ElIcon>
            <p>暂无消息</p>
          </div>

          <div
            v-for="notification in displayNotifications"
            :key="notification.id"
            class="notification-item"
            :class="{ unread: !notification.read }"
            @click="handleNotificationClick(notification)"
          >
            <div class="notification-content">
              <div class="notification-title">{{ notification.title || '系统通知' }}</div>
              <div class="notification-message">{{ notification.content }}</div>
              <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
            </div>
            <div v-if="!notification.read" class="unread-indicator"></div>
          </div>
        </div>

        <div v-if="notifications.length > maxDisplayCount" class="load-more">
          <ElButton type="text" size="small" @click="loadMore">
            查看更多 ({{ notifications.length - maxDisplayCount }})
          </ElButton>
        </div>
      </div>
    </ElPopover>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import {
    ElIcon,
    ElPopover,
    ElButton,
    ElDropdown,
    ElDropdownMenu,
    ElDropdownItem,
    ElMessage
  } from 'element-plus'
  import {
    Bell,
    ArrowDown,
    Warning,
    CircleClose,
    Monitor,
    Tools,
    Setting
  } from '@element-plus/icons-vue'
  import { useWebSocketStore } from '@/store/modules/websocket'
  import type { WebSocketMessage } from '@/types/websocket'
  import { NotificationType, NotificationPriority } from '@/types/websocket'

  const websocketStore = useWebSocketStore()

  // 响应式数据
  const showNotifications = ref(false)
  const maxDisplayCount = ref(10)

  // 计算属性
  const notifications = computed(() => websocketStore.notifications)
  const totalUnreadCount = computed(() => websocketStore.totalUnreadCount)

  const displayNotifications = computed(() => {
    return notifications.value.slice(0, maxDisplayCount.value)
  })

  // 方法
  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp

    if (diff < 60000) {
      // 1分钟内
      return '刚刚'
    } else if (diff < 3600000) {
      // 1小时内
      return `${Math.floor(diff / 60000)}分钟前`
    } else if (diff < 86400000) {
      // 1天内
      return `${Math.floor(diff / 3600000)}小时前`
    } else {
      return new Date(timestamp).toLocaleDateString()
    }
  }

  const handleNotificationClick = (notification: any) => {
    // 标记为已读
    if (!notification.read) {
      websocketStore.markNotificationAsRead(notification.id)
    }

    // 处理通知点击事件
    if (notification.action) {
      // 可以在这里处理具体的跳转或操作
      console.log('处理通知操作:', notification.action)
    }
  }

  const markAllAsRead = () => {
    websocketStore.markAllNotificationsAsRead()
  }

  const clearAll = () => {
    websocketStore.clearNotifications()
  }

  const loadMore = () => {
    maxDisplayCount.value += 10
  }

  // 测试功能：模拟后端发送WebSocket消息
  const handleTestCommand = (command: string) => {
    let testMessage: WebSocketMessage
    const timestamp = Date.now()
    const messageId = `test_${timestamp}`

    switch (command) {
      case 'normal':
        testMessage = {
          id: messageId,
          type: NotificationType.NOTIFICATION,
          title: '普通通知测试',
          content: `这是一条普通优先级的测试通知，发送时间：${new Date().toLocaleString()}`,
          timestamp,
          priority: NotificationPriority.NORMAL,
          read: false,
          data: { source: 'test', messageType: 'normal' }
        }
        break

      case 'high':
        testMessage = {
          id: messageId,
          type: NotificationType.NOTIFICATION,
          title: '⚠️ 高优先级通知',
          content: `这是一条高优先级的测试通知，需要您注意！发送时间：${new Date().toLocaleString()}`,
          timestamp,
          priority: NotificationPriority.HIGH,
          read: false,
          data: { source: 'test', messageType: 'high' }
        }
        break

      case 'urgent':
        testMessage = {
          id: messageId,
          type: NotificationType.SECURITY_ALERT,
          title: '🚨 紧急消息',
          content: `这是一条紧急消息，请立即处理！发送时间：${new Date().toLocaleString()}`,
          timestamp,
          priority: NotificationPriority.URGENT,
          read: false,
          data: { source: 'test', messageType: 'urgent' }
        }
        break

      case 'device':
        testMessage = {
          id: messageId,
          type: NotificationType.DEVICE_UPDATE,
          title: '设备状态更新',
          content: `设备 "测试设备001" 状态已更新为"在线"，发送时间：${new Date().toLocaleString()}`,
          timestamp,
          priority: NotificationPriority.NORMAL,
          read: false,
          data: {
            source: 'test',
            messageType: 'device',
            deviceId: '001',
            deviceName: '测试设备001',
            status: '在线'
          }
        }
        break

      case 'maintenance':
        testMessage = {
          id: messageId,
          type: NotificationType.MAINTENANCE_UPDATE,
          title: '维修任务通知',
          content: `设备 "测试设备002" 的维修任务已完成，请验收。发送时间：${new Date().toLocaleString()}`,
          timestamp,
          priority: NotificationPriority.HIGH,
          read: false,
          data: {
            source: 'test',
            messageType: 'maintenance',
            deviceId: '002',
            deviceName: '测试设备002',
            taskStatus: '已完成'
          }
        }
        break

      case 'system':
        testMessage = {
          id: messageId,
          type: NotificationType.SYSTEM,
          title: '系统通知',
          content: `系统将于今晚22:00-23:00进行维护，请提前保存工作。发送时间：${new Date().toLocaleString()}`,
          timestamp,
          priority: NotificationPriority.NORMAL,
          read: false,
          data: {
            source: 'test',
            messageType: 'system',
            maintenanceTime: '22:00-23:00'
          }
        }
        break

      default:
        return
    }

    // 模拟WebSocket接收到消息
    console.log('🧪 [测试] 模拟接收WebSocket消息:', testMessage)

    // 添加到store（这会触发通知显示）
    websocketStore.addMessage(testMessage)
    websocketStore.addNotification(testMessage)

    // 显示成功提示
    ElMessage({
      type: 'success',
      message: `✅ 测试消息已发送！请查看右上角通知`,
      duration: 2000
    })
  }
</script>

<style lang="scss" scoped>
  .websocket-notifications {
    .notification-trigger {
      position: relative;
      padding: 8px;
      color: var(--el-text-color-regular);
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.3s ease;

      &:hover {
        color: var(--el-color-primary);
        background-color: var(--el-color-primary-light-9);
      }

      &.has-unread {
        color: var(--el-color-primary);
      }

      .unread-badge {
        position: absolute;
        top: 2px;
        right: 2px;
        min-width: 14px;
        padding: 1px 4px;
        font-size: 10px;
        font-weight: bold;
        line-height: 1.2;
        color: white;
        text-align: center;
        background: var(--el-color-danger);
        border-radius: 8px;
      }
    }
  }

  :deep(.websocket-notifications-popover) {
    padding: 0 !important;

    .notifications-content {
      .notifications-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-bottom: 1px solid var(--el-border-color-light);

        h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }
      }

      .notifications-list {
        max-height: 400px;
        overflow-y: auto;

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          color: var(--el-text-color-placeholder);

          p {
            margin: 8px 0 0;
            font-size: 14px;
          }
        }

        .notification-item {
          position: relative;
          display: flex;
          align-items: flex-start;
          padding: 12px 16px;
          cursor: pointer;
          border-bottom: 1px solid var(--el-border-color-lighter);
          transition: background-color 0.3s ease;

          &:hover {
            background-color: var(--el-color-primary-light-9);
          }

          &.unread {
            background-color: var(--el-color-primary-light-9);
          }

          .notification-content {
            flex: 1;
            min-width: 0;

            .notification-title {
              margin-bottom: 4px;
              overflow: hidden;
              font-size: 14px;
              font-weight: 500;
              color: var(--el-text-color-primary);
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .notification-message {
              display: -webkit-box;
              margin-bottom: 4px;
              overflow: hidden;
              font-size: 12px;
              line-height: 1.4;
              color: var(--el-text-color-regular);
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            }

            .notification-time {
              font-size: 11px;
              color: var(--el-text-color-placeholder);
            }
          }

          .unread-indicator {
            flex-shrink: 0;
            width: 6px;
            height: 6px;
            margin-top: 6px;
            margin-left: 8px;
            background-color: var(--el-color-primary);
            border-radius: 50%;
          }
        }
      }

      .load-more {
        padding: 8px 16px;
        text-align: center;
        border-top: 1px solid var(--el-border-color-light);
      }
    }
  }
</style>
