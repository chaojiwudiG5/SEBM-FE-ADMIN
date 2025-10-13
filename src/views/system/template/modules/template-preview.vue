<template>
  <ElDialog
    v-model="visible"
    :title="title"
    width="900px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    class="template-preview-dialog"
  >
    <div class="template-preview">
      <!-- 模版基本信息 -->
      <ElCard class="preview-info-card" shadow="never">
        <template #header>
          <div class="card-header">
            <ElIcon><Document /></ElIcon>
            <span>模版信息</span>
          </div>
        </template>
        
        <ElRow :gutter="24">
          <ElCol :span="12">
            <div class="info-item">
              <label>模版标题：</label>
              <span class="info-value">{{ templateData.templateTitle }}</span>
            </div>
          </ElCol>
          <ElCol :span="12">
            <div class="info-item">
              <label>通知节点：</label>
              <ElTag :type="getNotificationNodeType(templateData.notificationNode || 0)">
                {{ getNotificationNodeText(templateData.notificationNode || 0) }}
              </ElTag>
            </div>
          </ElCol>
        </ElRow>

        <ElRow :gutter="24">
          <ElCol :span="12">
            <div class="info-item">
              <label>通知方式：</label>
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
            </div>
          </ElCol>
          <ElCol :span="12">
            <div class="info-item">
              <label>通知角色：</label>
              <ElTag :type="getNotificationRoleType(templateData.notificationRole || 0)">
                {{ getNotificationRoleText(templateData.notificationRole || 0) }}
              </ElTag>
            </div>
          </ElCol>
        </ElRow>

        <ElRow :gutter="24">
          <ElCol :span="12">
            <div class="info-item">
              <label>通知事件：</label>
              <span class="info-value">{{ templateData.notificationEvent }}</span>
            </div>
          </ElCol>
          <ElCol :span="12">
            <div class="info-item">
              <label>通知类型：</label>
              <ElTag :type="getNotificationTypeType(templateData.notificationType || 0)">
                {{ getNotificationTypeText(templateData.notificationType || 0) }}
              </ElTag>
            </div>
          </ElCol>
        </ElRow>

        <ElRow :gutter="24" v-if="templateData.relateTimeOffset">
          <ElCol :span="12">
            <div class="info-item">
              <label>时间偏移：</label>
              <span class="info-value">{{ templateData.relateTimeOffset }} 秒</span>
            </div>
          </ElCol>
        </ElRow>
      </ElCard>

      <!-- 模版内容预览 -->
      <ElCard class="preview-content-card" shadow="never">
        <template #header>
          <div class="card-header">
            <ElIcon><View /></ElIcon>
            <span>内容预览</span>
            <ElButton 
              size="small" 
              type="primary" 
              @click="handlePreviewWithVariables"
              class="preview-btn"
            >
              <template #icon>
                <ElIcon><View /></ElIcon>
              </template>
              变量预览
            </ElButton>
          </div>
        </template>
        
        <div class="template-description" v-if="templateData.templateDesc">
          <h4>模版描述：</h4>
          <p>{{ templateData.templateDesc }}</p>
        </div>
        
        <div class="template-content">
          <h4>模版内容：</h4>
          <div class="content-preview">
            <ElInput
              :model-value="previewContent"
              type="textarea"
              :rows="8"
              readonly
              placeholder="暂无内容"
              class="content-textarea"
            />
          </div>
        </div>
        
        <div class="template-tips">
          <ElText size="small" type="info">
            支持的变量占位符：{deviceName}（设备名称）、{userName}（用户名）、{time}（时间）、{message}（消息内容）
          </ElText>
        </div>
      </ElCard>

      <!-- 变量预览设置 -->
      <ElCard v-if="showVariableSettings" class="preview-variables-card" shadow="never">
        <template #header>
          <div class="card-header">
            <ElIcon><Setting /></ElIcon>
            <span>变量设置</span>
          </div>
        </template>
        
        <ElRow :gutter="24">
          <ElCol :span="12">
            <ElFormItem label="设备名称">
              <ElInput v-model="previewVariables.deviceName" placeholder="请输入设备名称" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="用户名">
              <ElInput v-model="previewVariables.userName" placeholder="请输入用户名" />
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElRow :gutter="24">
          <ElCol :span="12">
            <ElFormItem label="时间">
              <ElDatePicker
                v-model="previewVariables.time"
                type="datetime"
                placeholder="选择时间"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="消息内容">
              <ElInput v-model="previewVariables.message" placeholder="请输入消息内容" />
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElCard>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="handleClose">关闭</ElButton>
        <ElButton type="success" @click="handleCopy">复制模版</ElButton>
        <ElButton type="primary" @click="handleEdit">编辑模版</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { Document, View, Setting } from '@element-plus/icons-vue'

  interface Props {
    visible: boolean
    templateData: Partial<Api.SystemManage.TemplateListItem>
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'edit', templateData: Partial<Api.SystemManage.TemplateListItem>): void
    (e: 'copy', templateData: Partial<Api.SystemManage.TemplateListItem>): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const visible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
  })

  const title = computed(() => `模版预览 - ${props.templateData.templateTitle || '未知模版'}`)

  // 变量预览相关
  const showVariableSettings = ref(false)
  const previewVariables = ref({
    deviceName: '示例设备',
    userName: '张三',
    time: new Date(),
    message: '这是一条示例消息'
  })

  // 预览内容
  const previewContent = computed(() => {
    if (!props.templateData.content) return ''
    
    let content = props.templateData.content
    
    if (showVariableSettings.value) {
      // 替换变量
      content = content.replace(/\{deviceName\}/g, previewVariables.value.deviceName)
      content = content.replace(/\{userName\}/g, previewVariables.value.userName)
      content = content.replace(/\{time\}/g, previewVariables.value.time ? new Date(previewVariables.value.time).toLocaleString() : '')
      content = content.replace(/\{message\}/g, previewVariables.value.message)
    }
    
    return content
  })

  // 通知节点相关
  const getNotificationNodeText = (node: number) => {
    const nodeMap = {
      1: '租借审批成功',
      3: '到期提醒'
    }
    return nodeMap[node as keyof typeof nodeMap] || '未知节点'
  }

  const getNotificationNodeType = (node: number) => {
    const typeMap = {
      1: 'primary' as const,
      3: 'warning' as const
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
      0: '未知类型',
      1: '即时通知',
      2: '定时通知',
      3: '周期通知'
    }
    return typeMap[type as keyof typeof typeMap] || '未知类型'
  }

  const getNotificationTypeType = (type: number) => {
    const typeMap = {
      0: 'info' as const,
      1: 'primary' as const,
      2: 'warning' as const,
      3: 'success' as const
    }
    return typeMap[type as keyof typeof typeMap] || 'info'
  }

  // 事件处理
  const handleClose = () => {
    visible.value = false
    showVariableSettings.value = false
  }

  const handleEdit = () => {
    emit('edit', props.templateData)
    visible.value = false
  }

  const handleCopy = () => {
    emit('copy', props.templateData)
    visible.value = false
  }

  const handlePreviewWithVariables = () => {
    showVariableSettings.value = !showVariableSettings.value
  }
</script>

<style scoped lang="scss">
.template-preview-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }
}

.template-preview {
  .preview-info-card,
  .preview-content-card,
  .preview-variables-card {
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

    .preview-btn {
      margin-left: auto;
    }
  }

  .info-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    label {
      font-weight: 500;
      color: var(--el-text-color-primary);
      margin-right: 8px;
      min-width: 80px;
    }

    .info-value {
      color: var(--el-text-color-regular);
    }
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

    .content-preview {
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
  }

  .template-tips {
    margin-top: 8px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
