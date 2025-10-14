<!-- 消息通知管理 -->
<template>
  <div class="message-page art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <!-- 标签页：已读/未读 -->
      <ElTabs v-model="activeTab" @tab-change="handleTabChange">
        <ElTabPane label="未读消息" name="unread">
          <template #label>
            <span>未读消息 <ElBadge v-if="unreadCount > 0" :value="unreadCount" class="tab-badge" /></span>
          </template>
          <ArtTable
            :loading="loading"
            :data="unreadMessages"
            :columns="columns"
            :pagination="unreadPagination"
            @pagination:size-change="handleUnreadSizeChange"
            @pagination:current-change="handleUnreadCurrentChange"
          >
          </ArtTable>
        </ElTabPane>
        <ElTabPane label="已读消息" name="read">
          <ArtTable
            :loading="loading"
            :data="readMessages"
            :columns="columns"
            :pagination="readPagination"
            @pagination:size-change="handleReadSizeChange"
            @pagination:current-change="handleReadCurrentChange"
          >
          </ArtTable>
        </ElTabPane>
      </ElTabs>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { fetchTemplateList } from '@/api/system-manage'

  defineOptions({ name: 'Message' })

  type MessageListItem = {
    id: number
    userId: number
    title: string
    content: string
    status: number
    statusDesc: string
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
  
  // 未读消息数量
  const unreadCount = computed(() => unreadPagination.total)
  
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

  // 表格列配置
  const columns = [
    {
      prop: 'title',
      label: '消息标题',
      width: 150,
      showOverflowTooltip: true
    },
    {
      prop: 'content',
      label: '消息内容',
      minWidth: 250,
      showOverflowTooltip: true
    },
    {
      prop: 'sendTime',
      label: '发送时间',
      width: 180,
      formatter: (row: MessageListItem) => {
        return new Date(row.sendTime).toLocaleString('zh-CN')
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
      statusDesc: messageData.statusDesc,
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
        pageNumber: unreadPagination.current,
        pageSize: unreadPagination.size,
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
      
      console.log('✅ 未读消息:', unreadMessages.value.length, '条，总数:', total)
    } catch (error) {
      console.error('❌ 获取未读消息失败:', error)
      ElMessage.error('获取未读消息失败')
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
        pageNumber: readPagination.current,
        pageSize: readPagination.size,
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
      ElMessage.error('获取已读消息失败')
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

  // 初始化获取数据 - 默认加载未读消息
  onMounted(() => {
    fetchUnreadMessages()
  })
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
