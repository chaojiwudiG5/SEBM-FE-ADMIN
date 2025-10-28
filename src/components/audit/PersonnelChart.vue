<template>
  <el-card class="personnel-chart-card" v-loading="loading">
    <div class="header">
      <h3>Personnel Usage Statistics</h3>
      <div class="sub">Borrow Count by User (Top 10)</div>
    </div>
    <div v-if="!loading && isEmpty" class="empty-state">
      No Personnel Data
    </div>
    <div v-else ref="chartRef" class="chart" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import { fetchAuditDevices } from '@/services/audit'

const chartRef = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null
const loading = ref(false)
const isEmpty = ref(false)

const loadData = async () => {
  try {
    loading.value = true
    const res = await fetchAuditDevices({ page: 1, size: 9999 })
    console.log('📊 [人员统计] 获取到的数据:', res)
    const devices = res.items || []
    
    if (devices.length === 0) {
      isEmpty.value = true
      return
    }
    
    const map = new Map<string, number>()
    devices.forEach((d: any) => {
      const user = d.user || 'Unknown'
      map.set(user, (map.get(user) || 0) + 1)
    })

    const arr = Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10)
    
    if (arr.length === 0) {
      isEmpty.value = true
      return
    }
    
    isEmpty.value = false
    const users = arr.map((i) => i[0])
    const counts = arr.map((i) => i[1])

    await nextTick()
    
    if (chartRef.value) {
      if (!chart) {
        chart = echarts.init(chartRef.value)
      }
      const option = {
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'value' },
        yAxis: { type: 'category', data: users, inverse: true },
        series: [ { type: 'bar', data: counts, label: { show: true, position: 'right' } } ]
      }
      chart.setOption(option)
    }
  } catch (error) {
    console.error('❌ [人员统计] 数据加载失败:', error)
    isEmpty.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', () => chart?.resize())
})

onBeforeUnmount(() => { chart?.dispose(); chart = null })
</script>

<style scoped>
.personnel-chart-card { padding: 12px }
.personnel-chart-card .sub { color: var(--el-text-color-secondary); font-size: 12px }
.chart { width: 100%; height: 260px }
.empty-state { 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  height: 260px; 
  color: var(--el-text-color-secondary); 
  font-size: 14px;
}
</style>
