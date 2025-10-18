<template>
  <ElDialog
    v-model="visible"
    :title="title"
    width="800px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <div class="template-detail">
      <ElCard class="template-info-card" shadow="never">
        <template #header>
          <div class="card-header">
            <ElIcon><Document /></ElIcon>
            <span>基本信息</span>
          </div>
        </template>
        
        <ElRow :gutter="24">
          <ElCol :span="24">
            <ElDescriptions :column="2" border>
              <ElDescriptionsItem label="模版ID">{{ templateData.id }}</ElDescriptionsItem>
              <ElDescriptionsItem label="模版标题">{{ templateData.templateTitle }}</ElDescriptionsItem>
              <ElDescriptionsItem label="通知节点">
              <ElTag :type="getNotificationNodeType(templateData.notificationNode || 0)">
                {{ getNotificationNodeText(templateData.notificationNode || 0) }}
                </ElTag>
              </ElDescriptionsItem>
              <ElDescriptionsItem label="通知方式">
                <div class="method-tags">
                  <ElTag 
                    v-for="method in templateData.notificationMethod" 
                    :key="method"
                    :type="getNotificationMethodType(method)"
                    size="small"
                    class="method-tag"
                  >
                    {{ getNotificationMethodText(method) }}
                  </ElTag>
                </div>
              </ElDescriptionsItem>
              <ElDescriptionsItem label="通知角色">
              <ElTag :type="getNotificationRoleType(templateData.notificationRole || 0)">
                {{ getNotificationRoleText(templateData.notificationRole || 0) }}
                </ElTag>
              </ElDescriptionsItem>
              <ElDescriptionsItem label="通知事件">{{ templateData.notificationEvent }}</ElDescriptionsItem>
              <ElDescriptionsItem label="通知类型">
                <ElTag :type="getNotificationTypeType(templateData.notificationType || 0)">
                  {{ getNotificationTypeText(templateData.notificationType || 0) }}
                </ElTag>
              </ElDescriptionsItem>
              <ElDescriptionsItem label="时间偏移(秒)">
                {{ templateData.relateTimeOffset || '无' }}
              </ElDescriptionsItem>
            </ElDescriptions>
          </ElCol>
        </ElRow>
      </ElCard>

      <ElCard class="template-content-card" shadow="never">
        <template #header>
          <div class="card-header">
            <ElIcon><EditPen /></ElIcon>
            <span>模版内容</span>
          </div>
        </template>
        
        <div class="template-description">
          <h4>模版描述：</h4>
          <p>{{ templateData.templateDesc || '暂无描述' }}</p>
        </div>
        
        <div class="template-content">
          <h4>模版内容：</h4>
          <ElInput
            :model-value="templateData.content"
            type="textarea"
            :rows="8"
            readonly
            placeholder="暂无内容"
            class="content-textarea"
          />
        </div>
        
        <div class="template-tips">
          <ElText size="small" type="info">
            支持的变量占位符：{deviceName}（设备名称）、{userName}（用户名）、{time}（时间）、{message}（消息内容）
          </ElText>
        </div>
      </ElCard>

      <ElCard class="template-time-card" shadow="never">
        <template #header>
          <div class="card-header">
            <ElIcon><Clock /></ElIcon>
            <span>时间信息</span>
          </div>
        </template>
        
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="创建时间">
            {{ formatTime(templateData.createTime || '') }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="更新时间">
            {{ formatTime(templateData.updateTime || '') }}
          </ElDescriptionsItem>
        </ElDescriptions>
      </ElCard>

      <!-- 模版统计信息 -->
      <ElCard class="template-stats-card" shadow="never">
        <template #header>
          <div class="card-header">
            <ElIcon><DataAnalysis /></ElIcon>
            <span>使用统计</span>
            <ElButton 
              size="small" 
              type="primary" 
              @click="refreshStats"
              :loading="statsLoading"
            >
              <template #icon>
                <ElIcon><Refresh /></ElIcon>
              </template>
              刷新统计
            </ElButton>
          </div>
        </template>
        
        <ElRow :gutter="24">
          <ElCol :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ templateStats.totalUsage || 0 }}</div>
              <div class="stat-label">总使用次数</div>
            </div>
          </ElCol>
          <ElCol :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ templateStats.monthUsage || 0 }}</div>
              <div class="stat-label">本月使用</div>
            </div>
          </ElCol>
          <ElCol :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ templateStats.successRate || '0%' }}</div>
              <div class="stat-label">成功率</div>
            </div>
          </ElCol>
          <ElCol :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ templateStats.lastUsed || '从未使用' }}</div>
              <div class="stat-label">最后使用</div>
            </div>
          </ElCol>
        </ElRow>
      </ElCard>

      <!-- 模版测试 -->
      <ElCard class="template-test-card" shadow="never">
        <template #header>
          <div class="card-header">
            <ElIcon><Tools /></ElIcon>
            <span>模版测试</span>
          </div>
        </template>
        
        <div class="test-section">
          <h4>测试变量设置：</h4>
          <ElRow :gutter="24">
            <ElCol :span="12">
              <ElFormItem label="设备名称">
                <ElInput v-model="testVariables.deviceName" placeholder="请输入设备名称" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="用户名">
                <ElInput v-model="testVariables.userName" placeholder="请输入用户名" />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="24">
            <ElCol :span="12">
              <ElFormItem label="时间">
                <ElDatePicker
                  v-model="testVariables.time"
                  type="datetime"
                  placeholder="选择时间"
                  style="width: 100%"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="消息内容">
                <ElInput v-model="testVariables.message" placeholder="请输入消息内容" />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <div class="test-actions">
            <ElButton type="primary" @click="testTemplate">
              <template #icon>
                <ElIcon><VideoPlay /></ElIcon>
              </template>
              测试模版
            </ElButton>
            <ElButton @click="resetTestVariables">
              <template #icon>
                <ElIcon><RefreshRight /></ElIcon>
              </template>
              重置变量
            </ElButton>
          </div>

          <div v-if="testResult" class="test-result">
            <h4>测试结果：</h4>
            <div class="result-content">
              {{ testResult }}
            </div>
          </div>
        </div>
      </ElCard>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="handleClose">关闭</ElButton>
        <ElButton type="primary" @click="handleEdit">编辑模版</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { Document, EditPen, Clock, DataAnalysis, Refresh, Tools, VideoPlay, RefreshRight } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'

  interface Props {
    visible: boolean
    templateData: Partial<Api.SystemManage.TemplateListItem>
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'edit', templateData: Partial<Api.SystemManage.TemplateListItem>): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const visible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
  })

  const title = computed(() => `模版详情 - ${props.templateData.templateTitle || '未知模版'}`)

  // 统计相关
  const statsLoading = ref(false)
  const templateStats = ref({
    totalUsage: 0,
    monthUsage: 0,
    successRate: '0%',
    lastUsed: '从未使用'
  })

  // 测试相关
  const testVariables = ref({
    deviceName: '示例设备',
    userName: '张三',
    time: new Date(),
    message: '这是一条示例消息'
  })
  const testResult = ref('')

  // 通知节点相关
  const getNotificationNodeText = (node: number) => {
    const nodeMap = {
      1: '租借成功',
      3: '到期提醒',
      4: '归还成功'
    }
    return nodeMap[node as keyof typeof nodeMap] || '未知节点'
  }

  const getNotificationNodeType = (node: number) => {
    const typeMap = {
      1: 'success' as const,
      3: 'warning' as const,
      4: 'success' as const
    }
    return typeMap[node as keyof typeof typeMap] || 'info'
  }

  // 通知方式相关
  const getNotificationMethodText = (method: number) => {
    const methodMap = {
      1: '邮件',
      2: '短信',
      3: '站内信'
    }
    return methodMap[method as keyof typeof methodMap] || '未知方式'
  }

  const getNotificationMethodType = (method: number) => {
    const typeMap = {
      1: 'primary' as const,
      2: 'success' as const,
      3: 'warning' as const
    }
    return typeMap[method as keyof typeof typeMap] || 'info'
  }

  // 通知角色相关
  const getNotificationRoleText = (role: number) => {
    const roleMap = {
      0: '管理员',
      1: '借用人',
      2: '技术人员'
    }
    return roleMap[role as keyof typeof roleMap] || '未知角色'
  }

  const getNotificationRoleType = (role: number) => {
    const typeMap = {
      0: 'primary' as const,
      1: 'success' as const,
      2: 'warning' as const
    }
    return typeMap[role as keyof typeof typeMap] || 'info'
  }

  // 通知类型相关
  const getNotificationTypeText = (type: number) => {
    const typeMap = {
      [-1]: '提前通知',
      0: '即时通知',
      1: '延迟通知'
    }
    return typeMap[type as keyof typeof typeMap] || '未知类型'
  }

  const getNotificationTypeType = (type: number) => {
    const typeMap = {
      [-1]: 'warning' as const,
      0: 'primary' as const,
      1: 'success' as const
    }
    return typeMap[type as keyof typeof typeMap] || 'info'
  }

  // 时间格式化
  const formatTime = (time: string) => {
    if (!time) return '未设置'
    return new Date(time).toLocaleString('zh-CN')
  }

  // 刷新统计
  const refreshStats = async () => {
    statsLoading.value = true
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟统计数据
      templateStats.value = {
        totalUsage: Math.floor(Math.random() * 1000),
        monthUsage: Math.floor(Math.random() * 100),
        successRate: `${Math.floor(Math.random() * 20 + 80)}%`,
        lastUsed: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
      }
      
      ElMessage.success('统计数据已刷新')
    } catch (error) {
      ElMessage.error('刷新统计数据失败')
    } finally {
      statsLoading.value = false
    }
  }

  // 测试模版
  const testTemplate = () => {
    if (!props.templateData.content) {
      ElMessage.warning('模版内容为空，无法测试')
      return
    }

    let content = props.templateData.content
    
    // 替换变量
    content = content.replace(/\{deviceName\}/g, testVariables.value.deviceName)
    content = content.replace(/\{userName\}/g, testVariables.value.userName)
    content = content.replace(/\{time\}/g, testVariables.value.time ? new Date(testVariables.value.time).toLocaleString() : '')
    content = content.replace(/\{message\}/g, testVariables.value.message)
    
    testResult.value = content
    ElMessage.success('模版测试完成')
  }

  // 重置测试变量
  const resetTestVariables = () => {
    testVariables.value = {
      deviceName: '示例设备',
      userName: '张三',
      time: new Date(),
      message: '这是一条示例消息'
    }
    testResult.value = ''
    ElMessage.info('测试变量已重置')
  }

  // 事件处理
  const handleClose = () => {
    visible.value = false
  }

  const handleEdit = () => {
    emit('edit', props.templateData)
    visible.value = false
  }

  // 监听弹窗显示，自动刷新统计
  watch(visible, (val) => {
    if (val) {
      refreshStats()
    }
  })
</script>

<style scoped lang="scss">
.template-detail {
  .template-info-card,
  .template-content-card,
  .template-time-card,
  .template-stats-card,
  .template-test-card {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
  }

  .method-tags {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;

    .method-tag {
      margin: 0;
    }
  }

  .template-description {
    margin-bottom: 16px;

    h4 {
      margin: 0 0 8px 0;
      color: var(--el-text-color-primary);
      font-size: 14px;
    }

    p {
      margin: 0;
      color: var(--el-text-color-regular);
      line-height: 1.5;
    }
  }

  .template-content {
    margin-bottom: 16px;

    h4 {
      margin: 0 0 8px 0;
      color: var(--el-text-color-primary);
      font-size: 14px;
    }

    .content-textarea {
      :deep(.el-textarea__inner) {
        background-color: var(--el-fill-color-lighter);
        border: 1px solid var(--el-border-color-light);
        color: var(--el-text-color-primary);
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 13px;
        line-height: 1.4;
      }
    }
  }

  .template-tips {
    margin-top: 8px;
  }

  // 统计卡片样式
  .template-stats-card {
    .stat-item {
      text-align: center;
      padding: 16px;
      background-color: var(--el-fill-color-lighter);
      border-radius: 8px;
      border: 1px solid var(--el-border-color-light);

      .stat-value {
        font-size: 24px;
        font-weight: 600;
        color: var(--el-color-primary);
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }

  // 测试卡片样式
  .template-test-card {
    .test-section {
      h4 {
        margin: 0 0 16px 0;
        color: var(--el-text-color-primary);
        font-size: 14px;
      }

      .test-actions {
        margin: 16px 0;
        display: flex;
        gap: 12px;
      }

      .test-result {
        margin-top: 16px;
        padding: 12px;
        background-color: var(--el-fill-color-lighter);
        border-radius: 4px;
        border: 1px solid var(--el-border-color-light);

        h4 {
          margin: 0 0 8px 0;
          color: var(--el-text-color-primary);
          font-size: 14px;
        }

        .result-content {
          color: var(--el-text-color-regular);
          line-height: 1.6;
          white-space: pre-wrap;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 13px;
        }
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

