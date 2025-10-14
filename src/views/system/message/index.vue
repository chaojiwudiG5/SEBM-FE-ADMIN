<!-- 消息通知管理 -->
<template>
  <div class="message-page art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data as MessageListItem[]"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { fetchTemplateList } from '@/api/system-manage'

  defineOptions({ name: 'Message' })

  type MessageListItem = {
    id: number
    userId: number
    title: string
    content: string
    status: number
    statusDesc: string
    sendTime: string
    createTime: string
  }

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
      sendTime: messageData.sendTime,
      createTime: messageData.createTime
    }
  }

  /**
   * 包装后的消息列表获取函数
   */
  const wrappedFetchTemplateList = async (params: any) => {
    console.log('📤 消息列表请求参数:', params)
    
    const transformedParams = {
      pageNumber: params.current || 1,
      pageSize: params.size || 10,
      queryRole: -1 // 默认查询所有角色
    }
    
    console.log('📤 转换后的请求参数:', transformedParams)
    
    try {
      const response = await fetchTemplateList(transformedParams)
      console.log('📊 消息列表数据:', response)
      
      if (response && typeof response === 'object' && 'records' in response) {
        // 按发送时间降序排列
        const sortedRecords = (response as any).records.sort((a: any, b: any) => {
          return new Date(b.sendTime).getTime() - new Date(a.sendTime).getTime()
        })
        
        console.log('✅ 排序后的消息列表:', sortedRecords)
        
        return {
          ...response,
          records: sortedRecords.map(transformMessageData)
        }
      }
      
      if (Array.isArray(response)) {
        // 按发送时间降序排列
        const sortedArray = (response as any[]).sort((a: any, b: any) => {
          return new Date(b.sendTime).getTime() - new Date(a.sendTime).getTime()
        })
        
        return sortedArray.map(transformMessageData)
      }
      
      return response
    } catch (error) {
      console.error('❌ 获取消息列表失败:', error)
      throw error
    }
  }

  const {
    columns,
    data,
    loading,
    pagination,
    getData,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    // 核心配置
    core: {
      apiFn: wrappedFetchTemplateList,
      apiParams: {
        current: 1,
        size: 10
      },
      paginationKey: {
        current: 'current',
        size: 'size'
      },
      columnsFactory: () => [
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
    }
  })

  // 初始化获取数据
  onMounted(() => {
    getData()
  })
</script>

<style scoped lang="scss">
  .message-page {
    padding: 0;
  }
</style>
