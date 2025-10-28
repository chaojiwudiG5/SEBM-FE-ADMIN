<template>
  <div class="audit-borrow-page art-full-height">
    <el-card v-loading="loading">
      <template #header>
        <h3 style="margin:0">Borrowing Audit</h3>
      </template>

      <el-row style="margin-top:12px">
        <el-col :span="24">
          <div v-if="!loading && devices.length === 0" style="text-align:center; padding:40px; color:var(--el-text-color-secondary)">
            No Borrowing Records
          </div>
          <device-table v-else :devices="devices" />
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DeviceTable from '@/components/audit/DeviceTable.vue'
import { fetchAuditDevices } from '@/services/audit'

const devices = ref([])
const loading = ref(false)

onMounted(async () => {
  try {
    loading.value = true
    const res = await fetchAuditDevices({ page: 1, size: 9999 })
    console.log('📊 [借用审计] 获取到的数据:', res)
    devices.value = res.items || []
  } catch (error) {
    console.error('❌ [借用审计] 数据加载失败:', error)
    devices.value = []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.audit-borrow-page { padding: 12px }
</style>
