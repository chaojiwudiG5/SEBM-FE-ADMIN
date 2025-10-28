<template>
  <div class="maintenance-page art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <!-- 标签页：未完成/已完成 -->
      <ElTabs v-model="activeTab" @tab-change="handleTabChange">
        <ElTabPane label="未完成报单" name="pending">
          <!-- 表格头部 -->
          <ArtTableHeader 
            v-model:columns="pendingColumnChecks" 
            :loading="loading" 
            @refresh="refreshPendingData"
          >
            <template #left>
              <ElSpace wrap>
                <ElButton 
                  type="primary" 
                  :disabled="!selectedPendingRows.length"
                  @click="showAssignDialog"
                >
                  分配维修任务
                </ElButton>
              </ElSpace>
            </template>
          </ArtTableHeader>

          <!-- 表格 -->
          <ArtTable
            :loading="loading"
            :data="pendingData as MaintenanceRecord[]"
            :columns="pendingColumns"
            :pagination="pendingPagination"
            @selection-change="handlePendingSelectionChange"
            @pagination:size-change="handlePendingSizeChange"
            @pagination:current-change="handlePendingCurrentChange"
          >
          </ArtTable>
        </ElTabPane>

        <ElTabPane label="已完成报单" name="completed">
          <!-- 表格头部 -->
          <ArtTableHeader 
            v-model:columns="completedColumnChecks" 
            :loading="loading" 
            @refresh="refreshCompletedData"
          >
          </ArtTableHeader>

          <!-- 表格 -->
          <ArtTable
            :loading="loading"
            :data="completedData as MaintenanceRecord[]"
            :columns="completedColumns"
            :pagination="completedPagination"
            @pagination:size-change="handleCompletedSizeChange"
            @pagination:current-change="handleCompletedCurrentChange"
          >
          </ArtTable>
        </ElTabPane>
      </ElTabs>
    </ElCard>

    <!-- 分配技工弹窗 -->
    <AssignTechnicianDialog
      v-model:modelValue="dialogVisible"
      :maintenance-records="selectedPendingRows"
      @success="handleAssignSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import { ElMessage, ElCard, ElSpace, ElButton, ElTag, ElTabs, ElTabPane } from 'element-plus'
import AssignTechnicianDialog from './modules/assign-technician-dialog.vue'
import { getAllMaintenanceRecords } from '@/api/maintenance'
import ArtTable from '@/components/core/tables/art-table/index.vue'
import ArtTableHeader from '@/components/core/tables/art-table-header/index.vue'
import { useTable } from '@/composables/useTable'

type MaintenanceRecord = {
  id: number
  deviceName: string
  userId: number | string
  description?: string
  image?: string
  status: 0 | 1
  createTime?: string
  updateTime?: string
}

defineOptions({ name: 'Maintenance' })

// 当前激活的标签页
const activeTab = ref<'pending' | 'completed'>('pending')

// 分配技工弹窗
const dialogVisible = ref(false)
const selectedPendingRows = ref<MaintenanceRecord[]>([])

// 创建未完成报单的 useTable
const createPendingTable = () => {
  const wrappedFetchPendingRecords = async (params: any) => {
    try {
      const { current, size, ...rest } = params
      const pageNumber = current || 1
      const pageSize = size || 10
      
      const transformedParams = {
        pageNumber,
        pageSize,
        status: 0,
        ...rest
      }
      
      const maintenanceRecords = await getAllMaintenanceRecords(transformedParams)

      console.log('未完成维修报单数据:', maintenanceRecords)
      
      if (Array.isArray(maintenanceRecords)) {
        return {
          data: maintenanceRecords,
          records: maintenanceRecords,
          total: maintenanceRecords.length,
          current: pageNumber,
          size: pageSize
        }
      }

      ElMessage.error('获取维修报单列表失败')
      return {
        data: [],
        records: [],
        total: 0,
        current: pageNumber,
        size: pageSize
      }
    } catch (error) {
      console.error('获取维修报单列表失败:', error)
      ElMessage.error('获取维修报单列表失败')
      return {
        data: [],
        records: [],
        total: 0,
        current: params.current || 1,
        size: params.size || 10
      }
    }
  }

  return useTable({
    core: {
      apiFn: wrappedFetchPendingRecords,
      apiParams: {
        current: 1,
        size: 10,
        status: 0
      },
      paginationKey: {
        current: 'current',
        size: 'size'
      },
      columnsFactory: () => [
        { type: 'selection', width: 55 },
        { prop: 'id', label: '报单ID', width: 80 },
        { prop: 'deviceName', label: '设备名称', minWidth: 120 },
        { prop: 'userId', label: '报修用户ID', width: 100 },
        { 
          prop: 'description', 
          label: '故障描述', 
          minWidth: 200,
          showOverflowTooltip: true 
        },
        {
          prop: 'image',
          label: '故障图片',
          width: 100,
          formatter: (row) => {
            const record = row as MaintenanceRecord
            return record.image
              ? h('el-image', {
                  style: { width: '50px', height: '50px' },
                  src: record.image,
                  previewSrcList: [record.image],
                  fit: 'cover'
                })
              : '无'
          }
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row) => {
            const record = row as MaintenanceRecord
            return h('el-tag', {
              type: record.status === 0 ? 'warning' : 'success'
            }, () => record.status === 0 ? '处理中' : '已处理')
          }
        },
        {
          prop: 'createTime',
          label: '创建时间',
          width: 180,
          formatter: (row) => {
            const time = (row as MaintenanceRecord).createTime
            return time ? new Date(time).toLocaleString('zh-CN') : '-'
          }
        },
        {
          prop: 'updateTime',
          label: '更新时间',
          width: 180,
          formatter: (row) => {
            const time = (row as MaintenanceRecord).updateTime
            return time ? new Date(time).toLocaleString('zh-CN') : '-'
          }
        }
      ]
    }
  })
}

// 创建已完成报单的 useTable
const createCompletedTable = () => {
  const wrappedFetchCompletedRecords = async (params: any) => {
    try {
      const { current, size, ...rest } = params
      const pageNumber = current || 1
      const pageSize = size || 10
      
      const transformedParams = {
        pageNumber,
        pageSize,
        status: 1,
        ...rest
      }
      
      const maintenanceRecords = await getAllMaintenanceRecords(transformedParams)

      console.log('已完成维修报单数据:', maintenanceRecords)
      
      if (Array.isArray(maintenanceRecords)) {
        return {
          data: maintenanceRecords,
          records: maintenanceRecords,
          total: maintenanceRecords.length,
          current: pageNumber,
          size: pageSize
        }
      }

      ElMessage.error('获取维修报单列表失败')
      return {
        data: [],
        records: [],
        total: 0,
        current: pageNumber,
        size: pageSize
      }
    } catch (error) {
      console.error('获取维修报单列表失败:', error)
      ElMessage.error('获取维修报单列表失败')
      return {
        data: [],
        records: [],
        total: 0,
        current: params.current || 1,
        size: params.size || 10
      }
    }
  }

  return useTable({
    core: {
      apiFn: wrappedFetchCompletedRecords,
      apiParams: {
        current: 1,
        size: 10,
        status: 1
      },
      paginationKey: {
        current: 'current',
        size: 'size'
      },
      columnsFactory: () => [
        { type: 'selection', width: 55 },
        { prop: 'id', label: '报单ID', width: 80 },
        { prop: 'deviceName', label: '设备名称', minWidth: 120 },
        { prop: 'userId', label: '报修用户ID', width: 100 },
        { 
          prop: 'description', 
          label: '故障描述', 
          minWidth: 200,
          showOverflowTooltip: true 
        },
        {
          prop: 'image',
          label: '故障图片',
          width: 100,
          formatter: (row) => {
            const record = row as MaintenanceRecord
            return record.image
              ? h('el-image', {
                  style: { width: '50px', height: '50px' },
                  src: record.image,
                  previewSrcList: [record.image],
                  fit: 'cover'
                })
              : '无'
          }
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row) => {
            const record = row as MaintenanceRecord
            return h('el-tag', {
              type: record.status === 0 ? 'warning' : 'success'
            }, () => record.status === 0 ? '处理中' : '已处理')
          }
        },
        {
          prop: 'createTime',
          label: '创建时间',
          width: 180,
          formatter: (row) => {
            const time = (row as MaintenanceRecord).createTime
            return time ? new Date(time).toLocaleString('zh-CN') : '-'
          }
        },
        {
          prop: 'updateTime',
          label: '更新时间',
          width: 180,
          formatter: (row) => {
            const time = (row as MaintenanceRecord).updateTime
            return time ? new Date(time).toLocaleString('zh-CN') : '-'
          }
        }
      ]
    }
  })
}

// 未完成报单表格
const {
  columns: pendingColumns,
  columnChecks: pendingColumnChecks,
  data: pendingData,
  loading,
  pagination: pendingPagination,
  getData: getPendingData,
  handleSizeChange: handlePendingSizeChange,
  handleCurrentChange: handlePendingCurrentChange,
  refreshData: refreshPendingData
} = createPendingTable()

// 已完成报单表格
const {
  columns: completedColumns,
  columnChecks: completedColumnChecks,
  data: completedData,
  pagination: completedPagination,
  handleSizeChange: handleCompletedSizeChange,
  handleCurrentChange: handleCompletedCurrentChange,
  refreshData: refreshCompletedData
} = createCompletedTable()

// 标签页切换处理
const handleTabChange = (tabName: string | number) => {
  console.log('切换到标签页:', tabName)
  if (tabName === 'pending') {
    getPendingData()
  } else if (tabName === 'completed') {
    // 已完成数据会在标签页切换时自动获取
  }
}

// 表格选择事件
const handlePendingSelectionChange = (rows: MaintenanceRecord[]) => {
  selectedPendingRows.value = rows
}

// 显示分配技工弹窗
const showAssignDialog = () => {
  if (!selectedPendingRows.value.length) {
    ElMessage.warning('请选择要分配的维修报单')
    return
  }
  dialogVisible.value = true
}

// 分配成功回调
const handleAssignSuccess = () => {
  dialogVisible.value = false
  selectedPendingRows.value = []
  getPendingData()
  ElMessage.success('分配成功')
}
</script>

<style lang="scss" scoped>
.maintenance-page {
  padding: 20px;

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>