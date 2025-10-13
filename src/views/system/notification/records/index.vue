<template>
  <div class="notification-records-page art-full-height">
    <ElCard shadow="never" class="records-card">
      <template #header>
        <div class="header">
          <span class="title">记录查询</span>
        </div>
      </template>

      <ElForm :inline="true" :model="search" class="records-search">
        <ElFormItem label="用户ID">
          <ElInput v-model="search.userId" placeholder="可选：输入用户ID" clearable />
        </ElFormItem>
        
        <ElFormItem label="时间范围">
          <ElDatePicker
            v-model="search.timeRange"
            type="datetimerange"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" @click="fetchData" v-ripple>搜索</ElButton>
          <ElButton @click="reset">重置</ElButton>
        </ElFormItem>
      </ElForm>

      <div class="records-table">
        <ElTable :data="list" v-loading="loading" border>
          <ElTableColumn prop="userId" label="用户ID" width="140" />
          <ElTableColumn prop="content" label="内容" min-width="200" show-overflow-tooltip />
          <ElTableColumn prop="event" label="事件" width="140" />
          <ElTableColumn prop="method" label="方式" width="120" />
          <ElTableColumn prop="sendTime" label="发送时间" width="180" />
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
  defineOptions({ name: 'NotificationRecords' })

  interface RecordItem {
    userId?: string | number
    content: string
    event: string
    method: string
    sendTime: string
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
      const params: Api.SystemManage.NotificationRecordSearchParams = {
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize
      }
      if (String(search.userId).trim()) {
        params.userId = String(search.userId).trim()
      }
      
      if (search.timeRange && search.timeRange.length === 2) {
        // 转换为秒级时间戳
        params.startTime = Math.floor(new Date(search.timeRange[0].replace(' ', 'T')).getTime() / 1000)
        params.endTime = Math.floor(new Date(search.timeRange[1].replace(' ', 'T')).getTime() / 1000)
      }
      // 默认管理员查询角色
      params.queryRole = 0

      // 调用后端接口（后端默认按发送时间倒序返回；若无该逻辑，请在接口中实现）
      console.log('[通知记录] 请求参数:', params)
      const res = await (await import('@/api/system-manage')).fetchGetNotificationRecordList(params)

      // 兼容通用分页结构
      const resp: any = res
      const records = resp?.records ?? resp?.list ?? resp?.rows ?? resp?.data ?? []
      const total = resp?.total ?? resp?.totalCount ?? resp?.count ?? 0
      list.value = records
      pagination.total = total
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


