<template>
  <ElConfigProvider size="default" :locale="locales[language]" :z-index="3000">
    <RouterView></RouterView>
  </ElConfigProvider>
</template>

<script setup lang="ts">
  import { useUserStore } from './store/modules/user'
  import { useWebSocketStore } from './store/modules/websocket'
  import { useRoute } from 'vue-router'
  import zh from 'element-plus/es/locale/lang/zh-cn'
  import en from 'element-plus/es/locale/lang/en'
  import { systemUpgrade } from './utils/sys'
  import { fetchTemplateList } from './api/system-manage'

  import { setThemeTransitionClass } from './utils/theme/animation'
  import { checkStorageCompatibility } from './utils/storage'

  const userStore = useUserStore()
  const websocketStore = useWebSocketStore()
  const route = useRoute()
  const { language } = storeToRefs(userStore)

  const locales = {
    zh: zh,
    en: en
  }

  onBeforeMount(() => {
    setThemeTransitionClass(true)
  })

  onMounted(async () => {
    console.log('🟢 [App] onMounted 开始执行')
    // 检查存储兼容性
    checkStorageCompatibility()
    // 提升暗黑主题下页面刷新视觉体验
    setThemeTransitionClass(false)
    // 系统升级
    systemUpgrade()
    
    // 等待 nextTick 确保 Pinia 持久化已恢复
    await nextTick()
    
    // 直接从 localStorage 检查
    const localUser = localStorage.getItem('user')
    console.log('🟢 [App] localStorage user 原始数据:', localUser)
    
    // 解析并检查用户信息
    let hasUserInfo = false
    try {
      const userData = JSON.parse(localUser || '{}')
      // 支持两种结构：{info: {...}} 或 {userInfo: {...}}
      hasUserInfo = (userData.info && Object.keys(userData.info).length > 0) ||
                    (userData.userInfo && Object.keys(userData.userInfo).length > 0)
      console.log('🟢 [App] 解析后的用户数据:', userData)
      console.log('🟢 [App] userStore.info:', userStore.info)
    } catch (e) {
      console.error('❌ [App] 解析用户数据失败:', e)
    }
    
    console.log('🟢 [App] 用户信息:', hasUserInfo ? '已登录' : '未登录')
    console.log('🟢 [App] 当前路径:', route.path)
    
    if (hasUserInfo) {
      // 先加载未读数量（即使 WebSocket 初始化失败也要执行）
      console.log('🟢 [App] 开始加载未读数量...')
      await loadUnreadCount()
      // 然后初始化 WebSocket
      console.log('🟢 [App] 开始初始化 WebSocket...')
      await initializeWebSocket()
    } else {
      console.warn('⚠️ [App] 用户未登录，跳过 WebSocket 初始化')
    }
  })

  // 监听用户登录状态变化 - 监听 localStorage 的 'user' key
  watch(() => localStorage.getItem('user'), async (newValue, oldValue) => {
    try {
      const newData = newValue ? JSON.parse(newValue) : {}
      const oldData = oldValue ? JSON.parse(oldValue) : {}
      
      const hasNew = (newData.info && Object.keys(newData.info).length > 0) ||
                     (newData.userInfo && Object.keys(newData.userInfo).length > 0)
      const hasOld = (oldData.info && Object.keys(oldData.info).length > 0) ||
                     (oldData.userInfo && Object.keys(oldData.userInfo).length > 0)
      
      if (hasNew && !hasOld) {
        // 用户刚登录，加载未读数量并初始化WebSocket
        console.log('👤 [App] 检测到用户登录')
        await loadUnreadCount()
        await initializeWebSocket()
      } else if (!hasNew && hasOld) {
        // 用户登出，断开WebSocket并清空未读数量
        console.log('👤 [App] 检测到用户登出')
        websocketStore.disconnectWebSocket()
        websocketStore.setUnreadTotal(0)
      }
    } catch (e) {
      console.error('❌ [App] 监听用户状态变化时出错:', e)
    }
  })

  // 初始化WebSocket连接
  async function initializeWebSocket() {
    try {
      // 确保不在登录页面
      if (route.path !== '/login' && route.path !== '/register') {
        await websocketStore.initWebSocket()
      }
    } catch (error) {
      console.error('WebSocket初始化失败:', error)
    }
  }

  // 加载未读消息数量
  async function loadUnreadCount() {
    try {
      const response = await fetchTemplateList({
        pageNumber: 1,
        pageSize: 1,
        queryRole: 0,
        readStatus: 0
      })
      
      let total = 0
      if (response && typeof response === 'object' && 'total' in response) {
        total = (response as any).total || 0
      }
      
      websocketStore.setUnreadTotal(total)
    } catch (error) {
      console.error('加载未读消息数量失败:', error)
    }
  }

  // 组件卸载时清理
  onUnmounted(() => {
    // 注意：这里不主动断开WebSocket，因为可能是页面切换
    // WebSocket会在用户登出时自动断开
  })

  // 开发环境：暴露测试方法和调试工具到全局（方便在控制台调用）
  if (import.meta.env.DEV) {
    // 发送测试消息
    window.__sendTestWebSocketMessage = (type = 'notification', priority = 'normal') => {
      websocketStore.sendTestMessage(type, priority)
    }
    
    // 调试工具
    window.__debugWebSocket = () => {
      console.log('=== WebSocket 状态诊断 ===')
      console.log('Store 状态:', {
        unreadTotal: websocketStore.unreadTotal,
        messages: websocketStore.messages.length,
        notifications: websocketStore.notifications.length,
        status: websocketStore.status,
        isConnected: websocketStore.isConnected
      })
      console.log('未读消息:', websocketStore.messages.filter(m => !m.read))
      console.log('最新5条消息:', websocketStore.messages.slice(0, 5))
      return websocketStore
    }
    
    // 直接设置未读数量（用于测试徽章显示）
    window.__setUnreadCount = (count) => {
      websocketStore.setUnreadTotal(count)
      console.log(`✅ 已设置未读数量为: ${count}`)
    }
    
    console.log(`
📨 测试工具已加载:
  - __sendTestWebSocketMessage(type, priority) - 发送测试消息
  - __debugWebSocket() - 查看状态
  - __setUnreadCount(count) - 直接设置未读数量
    `)
  }
</script>
