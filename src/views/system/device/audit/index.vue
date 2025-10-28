<template>
  <div class="device-audit-page art-full-height">
    <el-row :gutter="12">
      <el-col :span="16">
        <device-table :devices="devices" />
      </el-col>

      <el-col :span="8">
        <maintenance-stats />

        <borrow-request-form style="margin-top:12px" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DeviceTable from '@/components/audit/DeviceTable.vue'
import MaintenanceStats from '@/components/audit/MaintenanceStats.vue'
import BorrowRequestForm from '@/components/audit/BorrowRequestForm.vue'
import { fetchAuditDevices } from '@/services/audit'
import type { AuditDevice as Device } from '@/services/audit'

defineOptions({ name: 'DeviceAudit' })

const devices = ref<Device[]>([])

const load = async () => {
  const res = await fetchAuditDevices({ page: 1, size: 9999 })
  devices.value = res.items || []
}

onMounted(load)
</script>

<style scoped>
.device-audit-page { padding: 12px; }
</style>