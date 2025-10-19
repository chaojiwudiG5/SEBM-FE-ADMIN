/**
 * WebSocket初始化逻辑
 * 参考SEBM-FE项目实现
 */
import { watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { useWebSocketStore } from '@/store/modules/websocket'

export function useWebSocketInit() {
  const userStore = useUserStore()
  const websocketStore = useWebSocketStore()
  const route = useRoute()

  let isInitialized = false

  /**
   * 初始化WebSocket连接
   */
  async function initializeWebSocket() {
    try {
      // 确保不在登录页面
      if (route.path !== '/login' && route.path !== '/register') {
        console.log('🚀 正在初始化WebSocket连接...')
        await websocketStore.initWebSocket()
        console.log('✅ WebSocket连接初始化成功')
        isInitialized = true

        // 开发环境下添加测试通知
        if (import.meta.env.DEV) {
          setTimeout(() => {
            const testNotification = {
              title: '测试通知',
              message: '这是一条测试WebSocket通知消息',
              timestamp: Date.now()
            }
            websocketStore.addNotification(testNotification)
            console.log('📨 [WebSocket] 已添加测试通知')
          }, 3000) // 延迟3秒添加测试通知
        }
      }
    } catch (error) {
      console.error('❌ WebSocket初始化失败:', error)
      // 不显示错误提示，避免干扰用户体验
    }
  }

  /**
   * 断开WebSocket连接
   */
  function disconnectWebSocket() {
    if (isInitialized) {
      console.log('🔌 用户已登出，断开WebSocket连接...')
      websocketStore.disconnectWebSocket()
      isInitialized = false
    }
  }

  // 在组件挂载时初始化（如果用户已登录）
  if (userStore.info?.id) {
    initializeWebSocket()
  }

  // 监听用户登录状态变化
  watch(
    () => userStore.info,
    (newUserInfo, oldUserInfo) => {
      if (newUserInfo?.id && !oldUserInfo?.id) {
        // 用户刚登录，初始化WebSocket
        initializeWebSocket()
      } else if (!newUserInfo?.id && oldUserInfo?.id) {
        // 用户登出，断开WebSocket
        disconnectWebSocket()
      }
    }
  )

  // 组件卸载时清理（注意：不主动断开WebSocket）
  onUnmounted(() => {
    // WebSocket会在用户登出时自动断开
  })
}
