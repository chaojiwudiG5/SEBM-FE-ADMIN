<template>
  <div class="notification-records-page art-full-height">
    <ElCard shadow="never" class="records-card">
      <template #header>
        <div class="header">
          <span class="title">Record Query</span>
        </div>
      </template>

      <ElForm :inline="true" :model="search" class="records-search">
        <ElFormItem label="User ID">
          <ElInput v-model="search.userId" placeholder="Optional: Enter User ID" clearable />
        </ElFormItem>
        
        <ElFormItem label="Time Range">
          <ElDatePicker
            v-model="search.timeRange"
            type="datetimerange"
            start-placeholder="Start Time"
            end-placeholder="End Time"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" @click="fetchData" v-ripple>Search</ElButton>
          <ElButton @click="reset">Reset</ElButton>
        </ElFormItem>
      </ElForm>

      <div class="records-table">
        <ElTable :data="list" v-loading="loading" border>
          <ElTableColumn prop="userId" label="User ID" width="140" />
          <ElTableColumn prop="content" label="Content" min-width="200" show-overflow-tooltip />
          <ElTableColumn label="Notification Method" width="120">
            <template #default="{ row }">
              <span>{{ getNotificationMethodText(row.notificationMethod) }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="sendTime" label="Send Time" width="180" />
        </ElTable>

        <div class="table-pagination">
          <ElPagination
            background
            layout="prev, pager, next, jumper, sizes, total"
            :total="pagination.total"
            :page-size="pagination.pageSize"
            :current-page="pagination.pageNumber"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  
  defineOptions({ name: 'NotificationRecords' })

  interface RecordItem {
    userId?: string | number
    content: string
    sendTime: string
    notificationMethod?: number  // 1-Email, 2-SMS, 3-In-app
  }

  const loading = ref(false)
  const list = ref<RecordItem[]>([])
  const search = reactive({
    userId: '',
    timeRange: undefined as undefined | [string, string]
  })
  const pagination = reactive({ pageNumber: 1, pageSize: 10, total: 0 })

  const fetchData = async () => {
    loading.value = true
    try {
      // 构造查询参数
      const params: any = {
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
        isDelete: 0  // 只查询未删除的记录
      }
      
      // 如果输入了用户ID，转换为数字类型
      if (String(search.userId).trim()) {
        const userIdNum = Number(String(search.userId).trim())
        if (!isNaN(userIdNum)) {
          params.userId = userIdNum
        }
      }
      
      // 如果选择了时间范围，转换为秒级时间戳
      if (search.timeRange && search.timeRange.length === 2) {
        params.startTime = Math.floor(new Date(search.timeRange[0].replace(' ', 'T')).getTime() / 1000)
        params.endTime = Math.floor(new Date(search.timeRange[1].replace(' ', 'T')).getTime() / 1000)
      }

      // 调用新接口：queryAllSentNotifications
      console.log('[通知记录] 请求参数:', params)
      const res = await (await import('@/api/system-manage')).queryAllSentNotifications(params)
      console.log('[通知记录] 响应数据:', res)

      // 兼容通用分页结构
      const resp: any = res
      const records = resp?.records ?? resp?.list ?? resp?.rows ?? resp?.data ?? []
      const total = resp?.total ?? resp?.totalCount ?? resp?.count ?? 0
      list.value = records
      pagination.total = total
      console.log('[通知记录] 解析结果:', { 记录数: records.length, 总数: total })
    } catch (error) {
      console.error('[通知记录] 查询失败:', error)
      ElMessage.error('Failed to query notification records')
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    search.userId = ''
    ;(search.timeRange as any) = undefined
    pagination.pageNumber = 1
    fetchData()
  }

  const handleSizeChange = (size: number) => {
    pagination.pageSize = size
    pagination.pageNumber = 1
    fetchData()
  }

  const handleCurrentChange = (page: number) => {
    pagination.pageNumber = page
    fetchData()
  }

  // 获取通知方式文本
  const getNotificationMethodText = (method?: number): string => {
    const methodMap: Record<number, string> = {
      1: 'Email',
      2: 'SMS',
      3: 'In-app'
    }
    return methodMap[method as number] || '-'
  }

  onMounted(fetchData)
</script>

<style lang="scss" scoped>
.notification-records-page {
  display: flex;
  flex-direction: column;

  .records-card {
    flex: 1;
    display: flex;
    flex-direction: column;

    :deep(.el-card__body) {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: auto; // 让卡片主体成为滚动容器，便于粘性底部分页可见
    }
  }

  .records-search {
    margin-bottom: 12px;
  }

  .records-table {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .table-pagination {
    display: flex;
    justify-content: flex-end;
    padding: 12px 0;
    border-top: 1px solid var(--el-border-color-light);
    position: sticky;
    bottom: 0;
    background: var(--el-bg-color);
    z-index: 1;
  }
}
</style>


