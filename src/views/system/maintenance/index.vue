<template>
  <div class="maintenance-page art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <!-- Tabs: Pending/Completed -->
      <ElTabs v-model="activeTab" @tab-change="handleTabChange">
        <ElTabPane label="Incomplete Reports" name="pending">
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
                  Assign Maintenance Task
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

        <ElTabPane label="Completed Reports" name="completed">
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

// Create pending table
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

      console.log('Pending maintenance records:', maintenanceRecords)
      
      if (Array.isArray(maintenanceRecords)) {
        return {
          data: maintenanceRecords,
          records: maintenanceRecords,
          total: maintenanceRecords.length,
          current: pageNumber,
          size: pageSize
        }
      }

      ElMessage.error('Failed to get maintenance report list')
      return {
        data: [],
        records: [],
        total: 0,
        current: pageNumber,
        size: pageSize
      }
    } catch (error) {
      console.error('Failed to get maintenance report list:', error)
      ElMessage.error('Failed to get maintenance report list')
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
        { prop: 'id', label: 'Report ID', width: 80 },
        { prop: 'deviceName', label: 'Device Name', minWidth: 120 },
        { prop: 'userId', label: 'User ID', width: 100 },
        { 
          prop: 'description', 
          label: 'Fault Description', 
          minWidth: 200,
          showOverflowTooltip: true 
        },
        {
          prop: 'image',
          label: 'Fault Image',
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
              : 'None'
          }
        },
        {
          prop: 'status',
          label: 'Status',
          width: 100,
          formatter: (row) => {
            const record = row as MaintenanceRecord
            return h('el-tag', {
              type: record.status === 0 ? 'warning' : 'success'
            }, () => record.status === 0 ? 'Processing' : 'Completed')
          }
        },
        {
          prop: 'createTime',
          label: 'Create Time',
          width: 180,
          formatter: (row) => {
            const time = (row as MaintenanceRecord).createTime
            return time ? new Date(time).toLocaleString('en-US') : '-'
          }
        },
        {
          prop: 'updateTime',
          label: 'Update Time',
          width: 180,
          formatter: (row) => {
            const time = (row as MaintenanceRecord).updateTime
            return time ? new Date(time).toLocaleString('en-US') : '-'
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

      console.log('Completed maintenance records:', maintenanceRecords)
      
      if (Array.isArray(maintenanceRecords)) {
        return {
          data: maintenanceRecords,
          records: maintenanceRecords,
          total: maintenanceRecords.length,
          current: pageNumber,
          size: pageSize
        }
      }

      ElMessage.error('Failed to get maintenance report list')
      return {
        data: [],
        records: [],
        total: 0,
        current: pageNumber,
        size: pageSize
      }
    } catch (error) {
      console.error('Failed to get maintenance report list:', error)
      ElMessage.error('Failed to get maintenance report list')
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
        { prop: 'id', label: 'Report ID', width: 80 },
        { prop: 'deviceName', label: 'Device Name', minWidth: 120 },
        { prop: 'userId', label: 'User ID', width: 100 },
        { 
          prop: 'description', 
          label: 'Fault Description', 
          minWidth: 200,
          showOverflowTooltip: true 
        },
        {
          prop: 'image',
          label: 'Fault Image',
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
              : 'None'
          }
        },
        {
          prop: 'status',
          label: 'Status',
          width: 100,
          formatter: (row) => {
            const record = row as MaintenanceRecord
            return h('el-tag', {
              type: record.status === 0 ? 'warning' : 'success'
            }, () => record.status === 0 ? 'Processing' : 'Completed')
          }
        },
        {
          prop: 'createTime',
          label: 'Create Time',
          width: 180,
          formatter: (row) => {
            const time = (row as MaintenanceRecord).createTime
            return time ? new Date(time).toLocaleString('en-US') : '-'
          }
        },
        {
          prop: 'updateTime',
          label: 'Update Time',
          width: 180,
          formatter: (row) => {
            const time = (row as MaintenanceRecord).updateTime
            return time ? new Date(time).toLocaleString('en-US') : '-'
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

// Tab change handler
const handleTabChange = (tabName: string | number) => {
  console.log('Switch to tab:', tabName)
  if (tabName === 'pending') {
    getPendingData()
  } else if (tabName === 'completed') {
    // Completed data will be automatically fetched when switching tabs
  }
}

// Table selection event
const handlePendingSelectionChange = (rows: MaintenanceRecord[]) => {
  selectedPendingRows.value = rows
}

// Show assign technician dialog
const showAssignDialog = () => {
  if (!selectedPendingRows.value.length) {
    ElMessage.warning('Please select maintenance reports to assign')
    return
  }
  dialogVisible.value = true
}

// Assign success callback
const handleAssignSuccess = () => {
  dialogVisible.value = false
  selectedPendingRows.value = []
  getPendingData()
  ElMessage.success('Assigned successfully')
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