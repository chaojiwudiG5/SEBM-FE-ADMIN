<!-- 消息通知管理 -->
<template>
  <div class="message-page art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <!-- 标签页：已读/未读 -->
      <ElTabs v-model="activeTab" @tab-change="handleTabChange">
        <ElTabPane label="Unread Messages" name="unread">
          <template #label>
            <span>Unread Messages <ElBadge v-if="unreadCount > 0" :value="unreadCount" class="tab-badge" /></span>
          </template>
          <!-- 批量操作按钮 -->
          <div class="table-header-actions" style="margin-bottom: 16px;">
            <ElButton 
              type="primary" 
              :disabled="selectedUnreadIds.length === 0"
              @click="handleBatchMarkAsRead"
            >
              Mark as Read ({{ selectedUnreadIds.length }})
            </ElButton>
            <ElButton 
              type="success" 
              @click="handleMarkAllAsRead"
            >
              Mark All as Read
            </ElButton>
            <ElButton 
              type="danger" 
              :disabled="selectedUnreadIds.length === 0"
              @click="handleBatchDelete('unread')"
            >
              Batch Delete ({{ selectedUnreadIds.length }})
            </ElButton>
          </div>
          <ArtTable
            :loading="loading"
            :data="unreadMessages"
            :columns="unreadColumns"
            :pagination="unreadPagination"
            @pagination:size-change="handleUnreadSizeChange"
            @pagination:current-change="handleUnreadCurrentChange"
            @selection-change="handleUnreadSelectionChange"
          >
          </ArtTable>
        </ElTabPane>
        <ElTabPane label="Read Messages" name="read">
          <!-- 批量操作按钮 -->
          <div class="table-header-actions" style="margin-bottom: 16px;">
            <ElButton 
              type="danger" 
              :disabled="selectedReadIds.length === 0"
              @click="handleBatchDelete('read')"
            >
              Batch Delete ({{ selectedReadIds.length }})
            </ElButton>
          </div>
          <ArtTable
            :loading="loading"
            :data="readMessages"
            :columns="readColumns"
            :pagination="readPagination"
            @pagination:size-change="handleReadSizeChange"
            @pagination:current-change="handleReadCurrentChange"
            @selection-change="handleReadSelectionChange"
          >
          </ArtTable>
        </ElTabPane>
      </ElTabs>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted, watch } from 'vue'
  import { 
    fetchTemplateList, 
    batchMarkAsRead, 
    markAllAsRead, 
    batchDeleteMessages,
    deleteMessage 
  } from '@/api/system-manage'
  import { useUserStore } from '@/store/modules/user'

  defineOptions({ name: 'Message' })

  const userStore = useUserStore()

  type MessageListItem = {
    id: number
    userId: number
    title: string
    content: string
    status: number
    readStatus: number // 阅读状态：1=已读，0=未读
    sendTime: string
    createTime: string
  }

  // 当前激活的标签页
  const activeTab = ref<'unread' | 'read'>('unread')
  
  // 加载状态
  const loading = ref(false)
  
  // 已读和未读消息数据
  const unreadMessages = ref<MessageListItem[]>([])
  const readMessages = ref<MessageListItem[]>([])
  
  // 选中的消息ID
  const selectedUnreadIds = ref<number[]>([])
  const selectedReadIds = ref<number[]>([])
  
  // 未读消息数量（展示用）
  const unreadCount = computed(() => unreadPagination.total)
  
  // 与全局徽章同步（以服务端分页返回的 total 为准）
  import { useWebSocketStore } from '@/store/modules/websocket'
  const websocketStore = useWebSocketStore()
  
  // 分页配置 - 未读消息
  const unreadPagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })
  
  // 分页配置 - 已读消息
  const readPagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  // 未读消息表格列配置
  const unreadColumns: any = [
    {
      type: 'selection' as const,
      width: 55
    },
    {
      prop: 'title',
      label: 'Title',
      width: 150,
      showOverflowTooltip: true
    },
    {
      prop: 'content',
      label: 'Content',
      minWidth: 250,
      showOverflowTooltip: true
    },
    {
      prop: 'sendTime',
      label: 'Send Time',
      width: 180,
      formatter: (row: MessageListItem) => {
        return new Date(row.sendTime).toLocaleString('en-US')
      }
    },
    {
      prop: 'action',
      label: 'Action',
      width: 180,
      fixed: 'right',
      render: (row: MessageListItem) => {
        return h('div', { class: 'action-buttons' }, [
          h(
            resolveComponent('ElButton'),
            {
              type: 'primary',
              link: true,
              size: 'small',
              onClick: () => handleMarkSingleAsRead(row.id)
            },
            () => 'Mark as Read'
          ),
          h(
            resolveComponent('ElButton'),
            {
              type: 'danger',
              link: true,
              size: 'small',
              onClick: () => handleDeleteSingle(row.id, 'unread')
            },
            () => 'Delete'
          )
        ])
      }
    }
  ]

  // 已读消息表格列配置
  const readColumns: any = [
    {
      type: 'selection' as const,
      width: 55
    },
    {
      prop: 'title',
      label: 'Title',
      width: 150,
      showOverflowTooltip: true
    },
    {
      prop: 'content',
      label: 'Content',
      minWidth: 250,
      showOverflowTooltip: true
    },
    {
      prop: 'sendTime',
      label: 'Send Time',
      width: 180,
      formatter: (row: MessageListItem) => {
        return new Date(row.sendTime).toLocaleString('en-US')
      }
    },
    {
      prop: 'action',
      label: 'Action',
      width: 100,
      fixed: 'right',
      render: (row: MessageListItem) => {
        return h(
          resolveComponent('ElButton'),
          {
            type: 'danger',
            link: true,
            size: 'small',
            onClick: () => handleDeleteSingle(row.id, 'read')
          },
          () => 'Delete'
        )
      }
    }
  ]

  /**
   * 转换消息数据
   */
  const transformMessageData = (messageData: any): MessageListItem => {
    return {
      id: messageData.id,
      userId: messageData.userId,
      title: messageData.title,
      content: messageData.content,
      status: messageData.status,
      readStatus: messageData.readStatus || 0, // 默认为未读
      sendTime: messageData.sendTime,
      createTime: messageData.createTime
    }
  }

  /**
   * 获取未读消息列表
   */
  const fetchUnreadMessages = async () => {
    loading.value = true
    try {
      const params = {
        pageNumber: 1,
        pageSize: 999999,
        queryRole: 0,
        readStatus: 0 // 0表示未读
      }
      
      console.log('📤 未读消息请求参数:', params)
      const response = await fetchTemplateList(params)
      console.log('📊 未读消息数据:', response)
      
      let records: any[] = []
      let total = 0
      
      if (response && typeof response === 'object' && 'records' in response) {
        records = (response as any).records || []
        total = (response as any).total || records.length
      } else if (Array.isArray(response)) {
        records = response
        total = records.length
      }
      
      // 转换并排序消息
      unreadMessages.value = records
        .map(transformMessageData)
        .sort((a, b) => new Date(b.sendTime).getTime() - new Date(a.sendTime).getTime())
      
      unreadPagination.total = total
      // 同步到全局未读徽章
      websocketStore.setUnreadTotal(total)
      console.log('✅ [Message] 已同步未读总数到全局:', total)
      
      console.log('✅ 未读消息:', unreadMessages.value.length, '条，总数:', total)
    } catch (error) {
      console.error('❌ 获取未读消息失败:', error)
      ElMessage.error('Failed to fetch unread messages')
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 获取已读消息列表
   */
  const fetchReadMessages = async () => {
    loading.value = true
    try {
      const params = {
        pageNumber: 1,
        pageSize: 999999,
        queryRole: 0,
        readStatus: 1 // 1表示已读
      }
      
      console.log('📤 已读消息请求参数:', params)
      const response = await fetchTemplateList(params)
      console.log('📊 已读消息数据:', response)
      
      let records: any[] = []
      let total = 0
      
      if (response && typeof response === 'object' && 'records' in response) {
        records = (response as any).records || []
        total = (response as any).total || records.length
      } else if (Array.isArray(response)) {
        records = response
        total = records.length
      }
      
      // 转换并排序消息
      readMessages.value = records
        .map(transformMessageData)
        .sort((a, b) => new Date(b.sendTime).getTime() - new Date(a.sendTime).getTime())
      
      readPagination.total = total
      
      console.log('✅ 已读消息:', readMessages.value.length, '条，总数:', total)
    } catch (error) {
      console.error('❌ 获取已读消息失败:', error)
      ElMessage.error('Failed to fetch read messages')
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 标签页切换
   */
  const handleTabChange = (tabName: string | number) => {
    console.log('切换到标签页:', tabName)
    if (tabName === 'unread') {
      fetchUnreadMessages()
    } else if (tabName === 'read') {
      fetchReadMessages()
    }
  }
  
  /**
   * 未读消息分页 - 每页条数变化
   */
  const handleUnreadSizeChange = (size: number) => {
    unreadPagination.size = size
    unreadPagination.current = 1
    fetchUnreadMessages()
  }
  
  /**
   * 未读消息分页 - 当前页变化
   */
  const handleUnreadCurrentChange = (page: number) => {
    unreadPagination.current = page
    fetchUnreadMessages()
  }
  
  /**
   * 已读消息分页 - 每页条数变化
   */
  const handleReadSizeChange = (size: number) => {
    readPagination.size = size
    readPagination.current = 1
    fetchReadMessages()
  }
  
  /**
   * 已读消息分页 - 当前页变化
   */
  const handleReadCurrentChange = (page: number) => {
    readPagination.current = page
    fetchReadMessages()
  }

  /**
   * 未读消息选择变化
   */
  const handleUnreadSelectionChange = (selection: MessageListItem[]) => {
    selectedUnreadIds.value = selection.map(item => item.id)
    console.log('选中的未读消息ID:', selectedUnreadIds.value)
  }

  /**
   * 已读消息选择变化
   */
  const handleReadSelectionChange = (selection: MessageListItem[]) => {
    selectedReadIds.value = selection.map(item => item.id)
    console.log('选中的已读消息ID:', selectedReadIds.value)
  }

  /**
   * 标记单条消息为已读
   */
  const handleMarkSingleAsRead = async (id: number) => {
    try {
      await ElMessageBox.confirm('Are you sure to mark this message as read?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'info'
      })

      loading.value = true
      await batchMarkAsRead({ ids: [id] })
      ElMessage.success('Marked successfully')
      
      // 刷新列表
      await fetchUnreadMessages()
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error('❌ 标记已读失败:', error)
        ElMessage.error('Failed to mark as read')
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 批量标记为已读
   */
  const handleBatchMarkAsRead = async () => {
    if (selectedUnreadIds.value.length === 0) {
      ElMessage.warning('Please select messages to mark')
      return
    }

    try {
      await ElMessageBox.confirm(
        `Are you sure to mark the selected ${selectedUnreadIds.value.length} messages as read?`,
        'Confirm',
        {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          type: 'info'
        }
      )

      loading.value = true
      await batchMarkAsRead({ ids: selectedUnreadIds.value })
      ElMessage.success('Marked successfully')
      
      // 清空选择并刷新列表
      selectedUnreadIds.value = []
      await fetchUnreadMessages()
      // 由于后端已更新未读数，同步最新 total
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error('❌ 批量标记已读失败:', error)
        ElMessage.error('Failed to mark as read')
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 标记全部为已读
   */
  const handleMarkAllAsRead = async () => {
    try {
      await ElMessageBox.confirm(
        'Are you sure to mark all unread messages as read?',
        'Confirm',
        {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }
      )

      loading.value = true
      const userId = userStore.getUserInfo?.id  // 使用 id 而不是 userId
      console.log('📝 [Message] 准备标记全部已读，userId:', userId, 'userInfo:', userStore.getUserInfo)
      
      if (!userId) {
        console.error('❌ [Message] 无法获取用户ID')
        ElMessage.error('Failed to get user information')
        return
      }

      await markAllAsRead(userId)
      console.log('✅ [Message] 全部标记已读成功')
      ElMessage.success('All messages marked as read')
      
      // 清空选择并刷新列表
      selectedUnreadIds.value = []
      await fetchUnreadMessages()
      // 全部标记后未读为 0
      websocketStore.setUnreadTotal(0)
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error('❌ 标记全部已读失败:', error)
        ElMessage.error('Failed to mark as read')
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除单条消息
   */
  const handleDeleteSingle = async (id: number, type: 'unread' | 'read') => {
    try {
      await ElMessageBox.confirm('Are you sure to delete this message?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })

      loading.value = true
      await deleteMessage({ id })
      ElMessage.success('Deleted successfully')
      
      // 刷新对应列表
      if (type === 'unread') {
        await fetchUnreadMessages()
      } else {
        await fetchReadMessages()
      }
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error('❌ 删除消息失败:', error)
        ElMessage.error('Failed to delete')
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 批量删除消息
   */
  const handleBatchDelete = async (type: 'unread' | 'read') => {
    const selectedIds = type === 'unread' ? selectedUnreadIds.value : selectedReadIds.value
    
    if (selectedIds.length === 0) {
      ElMessage.warning('Please select messages to delete')
      return
    }

    try {
      await ElMessageBox.confirm(
        `Are you sure to delete the selected ${selectedIds.length} messages?`,
        'Confirm',
        {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }
      )

      loading.value = true
      await batchDeleteMessages({ ids: selectedIds })
      ElMessage.success('Deleted successfully')
      
      // 清空选择并刷新列表
      if (type === 'unread') {
        selectedUnreadIds.value = []
        await fetchUnreadMessages()
      } else {
        selectedReadIds.value = []
        await fetchReadMessages()
      }
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error('❌ 批量删除失败:', error)
        ElMessage.error('删除失败')
      }
    } finally {
      loading.value = false
    }
  }

  // 初始化获取数据 - 默认加载未读消息
  onMounted(() => {
    fetchUnreadMessages()
  })
  
  // 监听 WebSocket 消息变化，自动刷新未读列表
  watch(
    () => websocketStore.messages.length,
    (newLength, oldLength) => {
      // 仅当有新消息增加且当前在未读消息页时才刷新
      if (newLength > oldLength && activeTab.value === 'unread') {
        console.log('🔄 [MessagePage] 收到新消息，自动刷新未读列表')
        fetchUnreadMessages()
      }
    }
  )
</script>

<style scoped lang="scss">
  .message-page {
    padding: 0;
    
    :deep(.el-tabs) {
      .el-tabs__header {
        margin-bottom: 20px;
      }
      
      .tab-badge {
        margin-left: 8px;
        
        .el-badge__content {
          background-color: var(--el-color-danger);
        }
      }
    }
  }
</style>
