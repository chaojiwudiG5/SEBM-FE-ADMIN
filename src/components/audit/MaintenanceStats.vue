<template>
  <el-card class="maintenance-chart-card" v-loading="loading">
    <div class="header">
      <h3>Maintenance Statistics</h3>
      <div class="sub">Average Maintenance Time and Count by Device Type</div>
    </div>
    <div v-if="!loading && stats.length === 0" class="empty-state">
      No Maintenance Data
    </div>
    <div v-else ref="chartRef" class="chart" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import { fetchMaintenanceStats } from '@/services/audit'

interface StatItem {
  deviceType: string
  avgMaintenanceMinutes: number
  maintenanceCount: number
}

const chartRef = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null
const stats = ref<StatItem[]>([])
const loading = ref(false)

const initChart = () => {
  if (!chartRef.value || stats.value.length === 0) return
  
  if (!chart) {
    chart = echarts.init(chartRef.value)
  }
  
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Avg Maintenance Time (min)', 'Maintenance Count'] },
    xAxis: { type: 'category', data: stats.value.map((s) => s.deviceType) },
    yAxis: [
      { type: 'value', name: 'Minutes' },
      { type: 'value', name: 'Count' }
    ],
    series: [
      { name: 'Avg Maintenance Time (min)', type: 'bar', data: stats.value.map((s) => Math.round(s.avgMaintenanceMinutes)) },
      { name: 'Maintenance Count', type: 'line', yAxisIndex: 1, data: stats.value.map((s) => s.maintenanceCount) }
    ]
  }
  chart.setOption(option)
}

const loadData = async () => {
  try {
    loading.value = true
    const res = await fetchMaintenanceStats()
    console.log('📊 [维护统计] 获取到的数据:', res)
    stats.value = Array.isArray(res) ? res : []
    
    await nextTick()
    initChart()
  } catch (error) {
    console.error('❌ [维护统计] 数据加载失败:', error)
    stats.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', () => chart?.resize())
})

onBeforeUnmount(() => {
  chart?.dispose()
  chart = null
})
</script>

<style scoped>
.maintenance-chart-card { padding: 12px }
.maintenance-chart-card .header { margin-bottom: 8px }
.maintenance-chart-card .sub { color: var(--el-text-color-secondary); font-size: 12px }
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
