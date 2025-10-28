<template>
  <div class="api-test-page" style="padding: 20px">
    <el-card>
      <template #header>
        <h2>审计 API 测试工具</h2>
      </template>

      <el-space direction="vertical" style="width: 100%" :size="20">
        <!-- 测试按钮区 -->
        <el-card>
          <template #header>
            <h3>API 接口测试</h3>
          </template>
          
          <el-space wrap>
            <el-button type="primary" @click="testDevicesAPI">测试设备借用接口</el-button>
            <el-button type="primary" @click="testMaintenanceStatsAPI">测试维护统计接口</el-button>
            <el-button type="primary" @click="testBorrowStatsAPI">测试借用统计接口</el-button>
            <el-button type="primary" @click="testPersonnelTopAPI">测试人员Top接口</el-button>
            <el-button @click="clearResults">清空结果</el-button>
          </el-space>
        </el-card>

        <!-- 结果显示区 -->
        <el-card v-for="(result, index) in results" :key="index">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <h4>{{ result.title }}</h4>
              <el-tag :type="result.success ? 'success' : 'danger'">
                {{ result.success ? '成功' : '失败' }}
              </el-tag>
            </div>
          </template>

          <div>
            <p><strong>接口：</strong>{{ result.endpoint }}</p>
            <p><strong>时间：</strong>{{ result.timestamp }}</p>
            
            <el-divider />
            
            <div v-if="result.success">
              <h5>响应数据：</h5>
              <el-alert type="success" :closable="false" style="margin-bottom: 10px">
                <template v-if="result.data === null || result.data === undefined">
                  <p>⚠️ 数据为空（null/undefined）</p>
                  <p style="color: #E6A23C">这可能是因为后端返回格式不正确，或者接口未实现</p>
                </template>
                <template v-else-if="Array.isArray(result.data)">
                  <p>✅ 数据类型：<strong>数组</strong></p>
                  <p>📊 数据条数：<strong>{{ result.data.length }}</strong></p>
                  <p v-if="result.data.length > 0">🔍 第一条数据包含字段：{{ Object.keys(result.data[0]).join(', ') }}</p>
                </template>
                <template v-else-if="result.data && typeof result.data === 'object' && result.data.items">
                  <p>✅ 数据类型：<strong>分页对象</strong></p>
                  <p>📊 总记录数：<strong>{{ result.data.total }}</strong></p>
                  <p>📄 当前页码：<strong>{{ result.data.page }}</strong></p>
                  <p>📏 每页大小：<strong>{{ result.data.size }}</strong></p>
                  <p>🔢 当前页条数：<strong>{{ result.data.items?.length || 0 }}</strong></p>
                  <p v-if="result.data.items && result.data.items.length > 0">🔍 items 字段包含：{{ Object.keys(result.data.items[0]).join(', ') }}</p>
                </template>
                <template v-else-if="typeof result.data === 'object'">
                  <p>✅ 数据类型：<strong>对象</strong></p>
                  <p>🔍 包含字段：{{ Object.keys(result.data).join(', ') }}</p>
                </template>
                <template v-else>
                  <p>✅ 数据类型：<strong>{{ typeof result.data }}</strong></p>
                  <p>📝 数据值：{{ result.data }}</p>
                </template>
              </el-alert>
              
              <el-collapse>
                <el-collapse-item title="查看完整响应数据" name="1">
                  <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto; max-height: 400px">{{ JSON.stringify(result.data, null, 2) }}</pre>
                </el-collapse-item>
              </el-collapse>
            </div>
            
            <div v-else>
              <h5>错误信息：</h5>
              <el-alert type="error" :closable="false">
                <pre>{{ result.error }}</pre>
              </el-alert>
            </div>
          </div>
        </el-card>

        <!-- 使用说明 -->
        <el-card>
          <template #header>
            <h3>使用说明</h3>
          </template>
          
          <el-alert type="info" :closable="false">
            <div>
              <p><strong>1. 点击上方按钮测试各个 API 接口</strong></p>
              <p><strong>2. 查看响应数据是否正确</strong></p>
              <p><strong>3. 预期的数据格式：</strong></p>
              <ul>
                <li>设备借用接口：返回 <code>{ total, page, size, items: [...] }</code></li>
                <li>维护统计接口：返回 <code>[{ deviceType, avgMaintenanceMinutes, maintenanceCount }]</code></li>
                <li>借用统计接口：返回 <code>[{ department, borrowCount, overdueCount, overdueRate }]</code></li>
                <li>人员Top接口：返回 <code>[{ user, department, borrowCount, overdueCount, lastBorrow }]</code></li>
              </ul>
              <p><strong>4. 如果测试失败，请检查：</strong></p>
              <ul>
                <li>是否已登录</li>
                <li>Token 是否有效</li>
                <li>后端接口是否正确实现</li>
                <li>网络连接是否正常</li>
              </ul>
            </div>
          </el-alert>
        </el-card>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  fetchAuditDevices, 
  fetchMaintenanceStats,
  fetchBorrowStats,
  fetchPersonnelTop 
} from '@/services/audit'

interface TestResult {
  title: string
  endpoint: string
  timestamp: string
  success: boolean
  data?: any
  error?: string
}

const results = ref<TestResult[]>([])

const addResult = (result: TestResult) => {
  results.value.unshift(result)
}

const clearResults = () => {
  results.value = []
}

const testDevicesAPI = async () => {
  console.log('🧪 [API测试] 开始测试设备借用接口...')
  try {
    const data = await fetchAuditDevices({ page: 1, size: 10 })
    console.log('✅ [API测试] 设备借用接口响应:', data)
    addResult({
      title: '设备借用接口测试',
      endpoint: 'GET /api/audit/devices',
      timestamp: new Date().toLocaleString(),
      success: true,
      data
    })
  } catch (error: any) {
    console.error('❌ [API测试] 设备借用接口失败:', error)
    addResult({
      title: '设备借用接口测试',
      endpoint: 'GET /api/audit/devices',
      timestamp: new Date().toLocaleString(),
      success: false,
      error: error.message || String(error)
    })
  }
}

const testMaintenanceStatsAPI = async () => {
  console.log('🧪 [API测试] 开始测试维护统计接口...')
  try {
    const data = await fetchMaintenanceStats()
    console.log('✅ [API测试] 维护统计接口响应:', data)
    addResult({
      title: '维护统计接口测试',
      endpoint: 'GET /api/audit/maintenance/stats',
      timestamp: new Date().toLocaleString(),
      success: true,
      data
    })
  } catch (error: any) {
    console.error('❌ [API测试] 维护统计接口失败:', error)
    addResult({
      title: '维护统计接口测试',
      endpoint: 'GET /api/audit/maintenance/stats',
      timestamp: new Date().toLocaleString(),
      success: false,
      error: error.message || String(error)
    })
  }
}

const testBorrowStatsAPI = async () => {
  console.log('🧪 [API测试] 开始测试借用统计接口...')
  try {
    const data = await fetchBorrowStats()
    console.log('✅ [API测试] 借用统计接口响应:', data)
    addResult({
      title: '借用统计接口测试',
      endpoint: 'GET /api/audit/borrow/stats',
      timestamp: new Date().toLocaleString(),
      success: true,
      data
    })
  } catch (error: any) {
    console.error('❌ [API测试] 借用统计接口失败:', error)
    addResult({
      title: '借用统计接口测试',
      endpoint: 'GET /api/audit/borrow/stats',
      timestamp: new Date().toLocaleString(),
      success: false,
      error: error.message || String(error)
    })
  }
}

const testPersonnelTopAPI = async () => {
  console.log('🧪 [API测试] 开始测试人员Top接口...')
  try {
    const data = await fetchPersonnelTop()
    console.log('✅ [API测试] 人员Top接口响应:', data)
    addResult({
      title: '人员Top接口测试',
      endpoint: 'GET /api/audit/personnel/top',
      timestamp: new Date().toLocaleString(),
      success: true,
      data
    })
  } catch (error: any) {
    console.error('❌ [API测试] 人员Top接口失败:', error)
    addResult({
      title: '人员Top接口测试',
      endpoint: 'GET /api/audit/personnel/top',
      timestamp: new Date().toLocaleString(),
      success: false,
      error: error.message || String(error)
    })
  }
}
</script>

<style scoped>
.api-test-page {
  background: var(--el-bg-color-page);
  min-height: 100vh;
}

pre {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
}

code {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

ul {
  margin: 10px 0;
  padding-left: 20px;
}

li {
  margin: 5px 0;
}
</style>

