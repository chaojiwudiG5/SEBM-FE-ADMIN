<template>
  <div class="audit-page art-full-height">
    <el-card v-loading="loading">
      <template #header>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <h3 style="margin:0">Audit Overview</h3>
            <div style="color:var(--el-text-color-secondary)">Device and Personnel Borrowing, Overdue and Maintenance Statistics</div>
          </div>
        </div>
      </template>

      <!-- Toolbar: date range, device type filter -->
      <div class="toolbar" style="display:flex; gap:8px; align-items:center; margin-top:12px">
        <el-date-picker v-model="range" type="daterange" range-separator="to" start-placeholder="Start Date" end-placeholder="End Date" />
        <el-select v-model="selectedType" placeholder="Device Type" clearable style="min-width:160px">
          <el-option v-for="t in deviceTypes" :key="t" :label="t" :value="t" />
        </el-select>
        <el-button type="primary" @click="applyFilters">Filter</el-button>
        <el-button @click="resetFilters">Reset</el-button>
        <div style="flex:1"></div>
        <el-button type="text" @click="reload">Refresh</el-button>
      </div>

      <!-- Charts area: two-column for main charts, full-width personnel chart below -->
      <div class="charts" style="margin-top:12px">
        <el-row :gutter="16">
          <el-col :span="12">
            <maintenance-stats />
          </el-col>
          <el-col :span="12">
            <borrow-chart />
          </el-col>
        </el-row>

        <el-row style="margin-top:12px">
          <el-col :span="24">
            <personnel-chart />
          </el-col>
        </el-row>
      </div>

      <el-divider style="margin:16px 0" />

      <!-- Device table (filtered) -->
      <div class="device-table-area">
        <div v-if="!loading && filteredDevices.length === 0" style="text-align:center; padding:40px; color:var(--el-text-color-secondary)">
          No Device Borrowing Records
        </div>
        <device-table v-else :devices="filteredDevices" />
      </div>

      <borrow-request-form style="margin-top:12px" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import DeviceTable from '@/components/audit/DeviceTable.vue'
import MaintenanceStats from '@/components/audit/MaintenanceStats.vue'
import BorrowRequestForm from '@/components/audit/BorrowRequestForm.vue'
import BorrowChart from '@/components/audit/BorrowChart.vue'
import PersonnelChart from '@/components/audit/PersonnelChart.vue'
import { fetchAuditDevices } from '@/services/audit'

const devices = ref<any[]>([])
const range = ref<any[]>([])
const selectedType = ref<string>('')
const loading = ref(false)

const load = async () => {
  try {
    loading.value = true
    const res = await fetchAuditDevices({ page: 1, size: 9999 })
    console.log('📊 [审计总览] 获取到的设备数据:', res)
    devices.value = res.items || []
  } catch (error) {
    console.error('❌ [审计总览] 数据加载失败:', error)
    devices.value = []
  } finally {
    loading.value = false
  }
}

const reload = () => load()

const deviceTypes = computed(() => {
  const s = new Set<string>()
  devices.value.forEach((d: any) => { if (d.deviceType) s.add(d.deviceType) })
  return Array.from(s)
})

const filteredDevices = computed(() => {
  return devices.value.filter((d: any) => {
    if (selectedType.value && d.deviceType !== selectedType.value) return false
    if (range.value && range.value.length === 2) {
      const start = new Date(range.value[0]).getTime()
      const end = new Date(range.value[1]).getTime()
      const bt = d.borrowTime ? new Date(d.borrowTime).getTime() : 0
      if (bt < start || bt > end) return false
    }
    return true
  })
})

const applyFilters = () => {
  // computed filteredDevices updates automatically
}

const resetFilters = () => {
  range.value = []
  selectedType.value = ''
}

onMounted(load)
</script>

<style scoped>
.audit-page { padding: 12px; }
</style>
