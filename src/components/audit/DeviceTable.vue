<template>
  <el-card>
    <el-table :data="devices" stripe style="width: 100%">
      <el-table-column prop="deviceName" label="Device" width="220" />
      <el-table-column prop="deviceType" label="Type" width="120" />
      <el-table-column prop="department" label="Department/User" width="160">
        <template #default="{ row }">{{ row.department }} / {{ row.user }}</template>
      </el-table-column>
      <el-table-column prop="borrowTime" label="Borrow Time" width="200">
        <template #default="{ row }">{{ formatDate(row.borrowTime) }}</template>
      </el-table-column>
      <el-table-column prop="returnTime" label="Return Time" width="200">
        <template #default="{ row }">{{ row.returnTime ? formatDate(row.returnTime) : '-' }}</template>
      </el-table-column>
      <el-table-column label="Overdue" width="100">
        <template #default="{ row }">{{ isOverdue(row) ? 'Yes' : 'No' }}</template>
      </el-table-column>
      <el-table-column label="Status" width="120">
        <template #default="{ row }">{{ row.status }}</template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AuditDevice as Device } from '@/services/audit'
import dayjs from 'dayjs'

const props = defineProps<{ devices: Device[] }>()

const formatDate = (t?: string | null) => (t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-')

const isOverdue = (row: Device) => {
  if (!row.returnTime && row.borrowTime) {
    // 假设借用期限为 7 天，示例逻辑
    const due = dayjs(row.borrowTime).add(7, 'day')
    return dayjs().isAfter(due)
  }
  return false
}
</script>

<style scoped>
/* small spacing */
.el-card { padding: 8px; }
</style>
