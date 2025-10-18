<template>
  <template v-for="item in filteredMenuItems" :key="item.path">
    <!-- 包含子菜单且无自身 path（容器类型）则渲染为可展开的 SubMenu；
      如果项有 children 但自身具有 path，则不展开，直接渲染为可点击的 MenuItem -->
    <ElSubMenu v-if="hasChildren(item) && !item.path" :index="item.path || item.meta.title" :level="level">
      <template #title>
        <MenuItemIcon :icon="item.meta.icon" :color="theme?.iconColor" />
        <span class="menu-name">
          {{ formatMenuTitle(item.meta.title) }}
        </span>
        <div v-if="item.meta.showBadge" class="art-badge" style="right: 10px" />
      </template>

      <SidebarSubmenu
        :list="item.children"
        :is-mobile="isMobile"
        :level="level + 1"
        :theme="theme"
        @close="closeMenu"
      />
    </ElSubMenu>

    <!-- 普通菜单项（包括有 children 但自身有 path 的情况——直接跳转，取消展开） -->
    <ElMenuItem
      v-else
      :index="item.path || item.meta.title"
      :level-item="level + 1"
      @click="goPage(item)"
    >
      <MenuItemIcon :icon="item.meta.icon" :color="theme?.iconColor" />
      <!-- 常规圆点徽章（菜单收起时） -->
      <div
        v-show="item.meta.showBadge && level === 0 && !menuOpen"
        class="art-badge"
        style="right: 5px"
      />
      <!-- WebSocket未读消息徽章（菜单收起时显示红色圆点） -->
      <div
        v-show="item.path === '/message' && unreadCount > 0 && level === 0 && !menuOpen"
        class="art-badge unread-message-dot"
        style="right: 5px"
      />

      <template #title>
        <span class="menu-name">
          {{ formatMenuTitle(item.meta.title) }}
          <!-- 临时调试：显示未读数量 -->
          <span v-if="item.path === '/message'" style="color: #ff4d4f; font-size: 10px; margin-left: 5px; font-weight: bold;">
            [{{ unreadCount }}]
          </span>
        </span>
        <div v-if="item.meta.showBadge" class="art-badge" />
        <!-- WebSocket未读消息红色圆点（只在有未读消息时显示） -->
        <div 
          v-if="item.path === '/message' && unreadCount > 0" 
          class="art-badge unread-message-dot"
          :style="{ animation: 'badge-blink 1.5s ease-in-out infinite' }"
        />
        <!-- 其他文本徽章 -->
        <div 
          v-else-if="item.path !== '/message' && item.meta.showTextBadge && (level > 0 || menuOpen)" 
          class="art-text-badge"
        >
          {{ item.meta.showTextBadge }}
        </div>
      </template>
    </ElMenuItem>
  </template>
</template>

<script setup lang="ts">
  import { computed, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import type { AppRouteRecord } from '@/types/router'
  import { formatMenuTitle } from '@/router/utils/utils'
  import { handleMenuJump } from '@/utils/navigation'
  import { useSettingStore } from '@/store/modules/setting'
  import { useWebSocketStore } from '@/store/modules/websocket'

  interface MenuTheme {
    iconColor?: string
  }

  interface Props {
    /** 菜单标题 */
    title?: string
    /** 菜单列表 */
    list?: AppRouteRecord[]
    /** 主题配置 */
    theme?: MenuTheme
    /** 是否为移动端模式 */
    isMobile?: boolean
    /** 菜单层级 */
    level?: number
  }

  interface Emits {
    /** 关闭菜单事件 */
    (e: 'close'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    title: '',
    list: () => [],
    theme: () => ({}),
    isMobile: false,
    level: 0
  })

  const emit = defineEmits<Emits>()

  const settingStore = useSettingStore()
  const websocketStore = useWebSocketStore()

  const { menuOpen } = storeToRefs(settingStore)
  const { unreadTotal } = storeToRefs(websocketStore)
  
  // 获取未读数量（使用 storeToRefs 确保响应式）
  const unreadCount = computed(() => {
    return unreadTotal.value || 0
  })
  
  // 监听 unreadCount 变化（仅在开发环境输出日志）
  if (import.meta.env.DEV) {
    watch(unreadCount, (newVal, oldVal) => {
      if (newVal !== oldVal) {
        console.log('🔔 [SidebarMenu] 未读消息数变化:', { 旧: oldVal, 新: newVal })
      }
    })
  }

  /**
   * 过滤后的菜单项列表
   * 只显示未隐藏的菜单项
   */
  const filteredMenuItems = computed(() => filterRoutes(props.list))

  /**
   * 跳转到指定页面
   * @param item 菜单项数据
   */
  const goPage = (item: AppRouteRecord): void => {
    closeMenu()
    handleMenuJump(item)
  }

  /**
   * 关闭菜单
   * 触发父组件的关闭事件
   */
  const closeMenu = (): void => {
    emit('close')
  }

  /**
   * 递归过滤菜单路由，移除隐藏的菜单项
   * 如果一个父菜单的所有子菜单都被隐藏，则父菜单也会被隐藏
   * @param items 菜单项数组
   * @returns 过滤后的菜单项数组
   */
  const filterRoutes = (items: AppRouteRecord[]): AppRouteRecord[] => {
    return items
      .filter((item) => {
        // 如果当前项被隐藏，直接过滤掉
        if (item.meta.isHide) {
          return false
        }

        // 如果有子菜单，递归过滤子菜单
        if (item.children && item.children.length > 0) {
          const filteredChildren = filterRoutes(item.children)
          // 如果所有子菜单都被过滤掉了，则隐藏父菜单
          return filteredChildren.length > 0
        }

        // 叶子节点且未被隐藏，保留
        return true
      })
      .map((item) => ({
        ...item,
        children: item.children ? filterRoutes(item.children) : undefined
      }))
  }

  /**
   * 判断菜单项是否包含可见的子菜单
   * @param item 菜单项数据
   * @returns 是否包含可见的子菜单
   */
  const hasChildren = (item: AppRouteRecord): boolean => {
    if (!item.children || item.children.length === 0) {
      return false
    }
    // 递归检查是否有可见的子菜单
    const filteredChildren = filterRoutes(item.children)
    return filteredChildren.length > 0
  }
</script>

<script lang="ts">
  /**
   * 菜单图标组件
   * 用于渲染菜单项的图标
   */
  const MenuItemIcon = defineComponent({
    name: 'MenuItemIcon',
    props: {
      /** 图标内容 */
      icon: {
        type: String,
        default: ''
      },
      /** 图标颜色 */
      color: {
        type: String,
        default: ''
      }
    },
    setup(props) {
      return () =>
        h('i', {
          class: 'menu-icon iconfont-sys',
          style: props.color ? { color: props.color } : undefined,
          innerHTML: props.icon
        })
    }
  })
</script>
