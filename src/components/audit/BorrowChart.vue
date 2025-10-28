<template>
  <el-card class="borrow-chart-card" v-loading="loading">
    <div class="header">
      <h3>Borrowing Statistics</h3>
      <div class="sub">Borrow Count and Overdue Rate by User</div>
    </div>
    <div v-if="!loading && isEmpty" class="empty-state">
      No Borrowing Data
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
    console.log('📊 [借用统计] 获取到的数据:', res)
    const devices = res.items || []
    
    if (devices.length === 0) {
      isEmpty.value = true
      return
    }
    
    isEmpty.value = false
    
    // group by user
    const map = new Map<string, { total: number; overdue: number }>()
    devices.forEach((d: any) => {
      const userName = d.user || 'Unknown User'
      const prev = map.get(userName) || { total: 0, overdue: 0 }
      prev.total += 1
      if (!d.returnTime) prev.overdue += 1
      map.set(userName, prev)
    })

    // 按借用次数排序，取前10名
    const sortedUsers = Array.from(map.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 10)
    
    const userNames = sortedUsers.map((item) => item[0])
    const totals = sortedUsers.map((item) => item[1].total)
    const overdues = sortedUsers.map((item) => {
      const v = item[1]
      return v.total ? Math.round((v.overdue / v.total) * 100) : 0
    })

    await nextTick()
    
    if (chartRef.value) {
      if (!chart) {
        chart = echarts.init(chartRef.value)
      }
      const option = {
        tooltip: { 
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: { data: ['Borrow Count', 'Overdue Rate (%)'] },
        xAxis: { 
          type: 'category', 
          data: userNames,
          axisLabel: {
            interval: 0,
            rotate: 30
          }
        },
        yAxis: [ 
          { type: 'value', name: 'Count' }, 
          { type: 'value', name: '%', max: 100 } 
        ],
        series: [ 
          { 
            name: 'Borrow Count', 
            type: 'bar', 
            data: totals,
            itemStyle: {
              color: '#409EFF'
            }
          }, 
          { 
            name: 'Overdue Rate (%)', 
            type: 'line', 
            yAxisIndex: 1, 
            data: overdues,
            itemStyle: {
              color: '#F56C6C'
            },
            lineStyle: {
              width: 2
            }
          } 
        ]
      }
      chart.setOption(option)
    }
  } catch (error) {
    console.error('❌ [借用统计] 数据加载失败:', error)
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
.borrow-chart-card { padding: 12px }
.borrow-chart-card .sub { color: var(--el-text-color-secondary); font-size: 12px }
.chart { width: 100%; height: 220px }
.empty-state { 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  height: 220px; 
  color: var(--el-text-color-secondary); 
  font-size: 14px;
}
</style>
