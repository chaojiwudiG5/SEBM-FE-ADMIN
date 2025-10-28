<template>
  <div class="audit-personnel-page art-full-height">
    <el-card v-loading="loading">
      <template #header>
        <h3 style="margin:0">Personnel Audit</h3>
      </template>

      <el-row style="margin-top:12px">
        <el-col :span="24">
          <div v-if="!loading && personnel.length === 0" style="text-align:center; padding:40px; color:var(--el-text-color-secondary)">
            No Personnel Data
          </div>
          <personnel-table v-else :personnel="personnel" />
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PersonnelTable from '@/components/audit/PersonnelTable.vue'
import { fetchAuditDevices } from '@/services/audit'

// derive personnel summary from devices mock
const personnel = ref([])
const loading = ref(false)

onMounted(async () => {
  try {
    loading.value = true
    const res = await fetchAuditDevices({ page: 1, size: 9999 })
    console.log('📊 [人员审计] 获取到的数据:', res)
    const devices = res.items || []
    const map = new Map()
    devices.forEach((d: any) => {
      const key = d.user || 'Unknown'
      const prev = map.get(key) || { user: key, department: d.department || '-', borrowCount: 0, overdueCount: 0, lastBorrow: d.borrowTime }
      prev.borrowCount += 1
      if (!d.returnTime) prev.overdueCount += 1
      if (new Date(d.borrowTime) > new Date(prev.lastBorrow)) prev.lastBorrow = d.borrowTime
      map.set(key, prev)
    })
    personnel.value = Array.from(map.values())
  } catch (error) {
    console.error('❌ [人员审计] 数据加载失败:', error)
    personnel.value = []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.audit-personnel-page { padding: 12px }
</style>
