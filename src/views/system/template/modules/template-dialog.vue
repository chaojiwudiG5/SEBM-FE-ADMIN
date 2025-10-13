<!-- 模版弹窗 -->
<template>
  <ElDialog
    :model-value="visible"
    @update:model-value="handleClose"
    :title="dialogTitle"
    :width="800"
    :before-close="() => handleClose()"
    destroy-on-close
  >
    <ElForm
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      class="template-form"
    >
      <ElRow :gutter="24">
        <ElCol :span="12">
          <ElFormItem label="模版标题" prop="templateTitle">
            <ElInput
              v-model="formData.templateTitle"
              placeholder="请输入模版标题"
              :disabled="type === 'view'"
              maxlength="100"
              show-word-limit
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="通知节点" prop="notificationNode">
            <ElSelect
              v-model="formData.notificationNode"
              placeholder="请选择通知节点"
              :disabled="type === 'view'"
              style="width: 100%"
            >
              <ElOption
                v-for="item in notificationNodeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="24">
        <ElCol :span="12">
          <ElFormItem label="通知方式" prop="notificationMethod">
            <ElSelect
              v-model="formData.notificationMethod"
              placeholder="请选择通知方式"
              :disabled="type === 'view'"
              style="width: 100%"
              multiple
            >
              <ElOption
                v-for="item in notificationMethodOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="通知角色" prop="notificationRole">
            <ElSelect
              v-model="formData.notificationRole"
              placeholder="请选择通知角色"
              :disabled="type === 'view'"
              style="width: 100%"
            >
              <ElOption
                v-for="item in notificationRoleOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="24">
        <ElCol :span="12">
          <ElFormItem label="通知事件" prop="notificationEvent">
            <ElInput
              v-model="formData.notificationEvent"
              placeholder="请输入通知事件"
              :disabled="type === 'view'"
              maxlength="100"
              show-word-limit
            />
          </ElFormItem>
        </ElCol>
        <ElCol v-if="showTimeOffset" :span="12">
          <ElFormItem label="时间偏移(秒)" prop="relateTimeOffset">
            <ElInputNumber
              v-model="formData.relateTimeOffset"
              placeholder="请输入时间偏移"
              :disabled="type === 'view'"
              style="width: 100%"
              :min="0"
              :max="86400"
              controls-position="right"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="24">
        <ElCol :span="12">
          <ElFormItem label="通知类型" prop="notificationType">
            <ElSelect
              v-model="formData.notificationType"
              placeholder="请选择通知类型"
              :disabled="type === 'view'"
              style="width: 100%"
            >
              <ElOption
                v-for="item in notificationTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElFormItem label="模版描述" prop="templateDesc">
        <ElInput
          v-model="formData.templateDesc"
          type="textarea"
          placeholder="请输入模版描述"
          :disabled="type === 'view'"
          :rows="3"
          maxlength="500"
          show-word-limit
        />
      </ElFormItem>

      <ElFormItem label="模版内容" prop="content">
        <div class="content-editor">
          <div class="editor-toolbar">
            <ElSpace>
              <ElButton 
                size="small" 
                @click="insertVariable('deviceName')"
                :disabled="type === 'view'"
              >
                插入设备名称
              </ElButton>
              <ElButton 
                size="small" 
                @click="insertVariable('userName')"
                :disabled="type === 'view'"
              >
                插入用户名
              </ElButton>
              <ElButton 
                size="small" 
                @click="insertVariable('time')"
                :disabled="type === 'view'"
              >
                插入时间
              </ElButton>
              <ElButton 
                size="small" 
                @click="insertVariable('message')"
                :disabled="type === 'view'"
              >
                插入消息
              </ElButton>
              <ElButton 
                size="small" 
                type="primary" 
                @click="togglePreview"
              >
                {{ showPreview ? '隐藏预览' : '显示预览' }}
              </ElButton>
            </ElSpace>
          </div>
          
          <ElInput
            ref="contentInputRef"
            v-model="formData.content"
            type="textarea"
            placeholder="请输入模版内容，支持变量占位符如：{deviceName}、{userName}等"
            :disabled="type === 'view'"
            :rows="8"
            maxlength="2000"
            show-word-limit
            class="content-textarea"
          />
          
          <!-- 内容预览 -->
          <div v-if="showPreview" class="content-preview">
            <h4>预览效果：</h4>
            <div class="preview-content">
              {{ previewContent }}
            </div>
          </div>
        </div>
        
        <div class="content-tips">
          <ElText size="small" type="info">
            支持的变量占位符：{deviceName}（设备名称）、{userName}（用户名）、{time}（时间）、{message}（消息内容）
          </ElText>
        </div>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElSpace>
        <ElButton @click="() => handleClose()">取消</ElButton>
        <ElButton v-if="type !== 'view'" type="primary" @click="handleSubmit" :loading="loading">
          {{ type === 'add' ? '创建' : '更新' }}
        </ElButton>
      </ElSpace>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import { nextTick } from 'vue'
  import { fetchAddTemplate, fetchUpdateTemplate } from '@/api/system-manage'

  interface TemplateFormData {
    id?: number
    templateTitle: string
    notificationNode: number
    notificationMethod: number[]
    notificationRole: number
    notificationEvent: string
    notificationType: number
    relateTimeOffset?: number | null
    templateDesc?: string
    content: string
  }

  interface Props {
    visible: boolean
    type: Form.DialogType
    templateData?: Partial<TemplateFormData>
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    templateData: () => ({})
  })

  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const contentInputRef = ref()
  const loading = ref(false)
  const showPreview = ref(false)

  // 预览变量
  const previewVariables = ref({
    deviceName: '示例设备',
    userName: '张三',
    time: new Date().toLocaleString(),
    message: '这是一条示例消息'
  })

  // 弹窗标题
  const dialogTitle = computed(() => {
    const titleMap = {
      add: '新增模版',
      edit: '编辑模版',
      view: '查看模版'
    }
    return titleMap[props.type] || '模版'
  })

  // 是否显示时间偏移输入栏（只有非即时通知才显示）
  const showTimeOffset = computed(() => {
    return formData.value.notificationType !== 1
  })

  // 预览内容
  const previewContent = computed(() => {
    if (!formData.value.content) return ''
    
    let content = formData.value.content
    
    // 替换变量
    content = content.replace(/\{deviceName\}/g, previewVariables.value.deviceName)
    content = content.replace(/\{userName\}/g, previewVariables.value.userName)
    content = content.replace(/\{time\}/g, previewVariables.value.time)
    content = content.replace(/\{message\}/g, previewVariables.value.message)
    
    return content
  })

  // 表单数据
  const formData = ref<TemplateFormData>({
    templateTitle: '',
    notificationNode: 1,
    notificationMethod: [],
    notificationRole: 0,
    notificationEvent: '',
    notificationType: 1,
    relateTimeOffset: null,
    templateDesc: '',
    content: ''
  })


  // 通知节点选项
  const notificationNodeOptions = [
    { label: '租借审批成功', value: 1 },
    { label: '到期提醒', value: 3 }
  ]

  // 通知方式选项
  const notificationMethodOptions = [
    { label: '邮件', value: 1 },
    { label: '短信', value: 2 },
    { label: '站内信', value: 3 }
  ]

  // 通知角色选项
  const notificationRoleOptions = [
    { label: '管理员', value: 0 },
    { label: '借用人', value: 1 },
    { label: '技术人员', value: 2 }
  ]


  // 通知类型选项
  const notificationTypeOptions = [
    { label: '即时通知', value: 1 },
    { label: '定时通知', value: 2 },
    { label: '周期通知', value: 3 }
  ]

  // 表单验证规则
  const rules: FormRules<TemplateFormData> = {
    templateTitle: [
      { required: true, message: '请输入模版标题', trigger: 'blur' },
      { min: 2, max: 100, message: '模版标题长度在 2 到 100 个字符', trigger: 'blur' }
    ],
    notificationNode: [
      { required: true, message: '请选择通知节点', trigger: 'change' }
    ],
    notificationRole: [
      { required: true, message: '请选择通知角色', trigger: 'change' }
    ],
    notificationEvent: [
      { required: true, message: '请输入通知事件', trigger: 'blur' },
      { min: 2, max: 100, message: '通知事件长度在 2 到 100 个字符', trigger: 'blur' }
    ],
    notificationMethod: [
      { required: true, message: '请选择通知方式', trigger: 'change' },
      { type: 'array', min: 1, message: '至少选择一种通知方式', trigger: 'change' }
    ],
    notificationType: [
      { required: true, message: '请选择通知类型', trigger: 'change' }
    ],
    content: [
      { required: true, message: '请输入模版内容', trigger: 'blur' },
      { min: 10, max: 2000, message: '模版内容长度在 10 到 2000 个字符', trigger: 'blur' }
    ]
  }

  /**
   * 监听弹窗显示状态
   */
  watch(
    () => props.visible,
    (val) => {
      if (val) {
        initFormData()
      } else {
        resetForm()
      }
    }
  )

  /**
   * 初始化表单数据
   */
  const initFormData = () => {
    if (props.type === 'add') {
      formData.value = {
        templateTitle: '',
        notificationNode: 1,
        notificationMethod: [],
        notificationRole: 0,
        notificationEvent: '',
        notificationType: 1,
        relateTimeOffset: null,
        templateDesc: '',
        content: ''
      }
    } else {
      formData.value = {
        ...formData.value,
        ...props.templateData
      }
    }
  }

  /**
   * 重置表单
   */
  const resetForm = () => {
    formRef.value?.resetFields()
  }

  /**
   * 处理关闭
   */
  const handleClose = (value?: boolean) => {
    emit('update:visible', false)
  }

  /**
   * 插入变量
   */
  const insertVariable = (variableName: string) => {
    const variable = `{${variableName}}`
    const textarea = contentInputRef.value?.textarea
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = formData.value.content
      
      formData.value.content = text.substring(0, start) + variable + text.substring(end)
      
      // 设置光标位置
      nextTick(() => {
        textarea.focus()
        textarea.setSelectionRange(start + variable.length, start + variable.length)
      })
    }
  }

  /**
   * 切换预览
   */
  const togglePreview = () => {
    showPreview.value = !showPreview.value
  }

  /**
   * 处理提交
   */
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      loading.value = true

      if (props.type === 'add') {
        const templateData = { ...formData.value }
        // 确保null值转换为undefined
        if (templateData.relateTimeOffset === null) {
          templateData.relateTimeOffset = undefined
        }
        await fetchAddTemplate(templateData as any)
        ElMessage.success('创建模版成功')
      } else {
        const templateData = { ...formData.value } as Api.SystemManage.TemplateUpdateParams
        // 确保null值转换为undefined
        if (templateData.relateTimeOffset === null) {
          templateData.relateTimeOffset = undefined
        }
        await fetchUpdateTemplate(templateData)
        ElMessage.success('更新模版成功')
      }

      emit('submit')
    } catch (error) {
      console.error('表单验证失败:', error)
    } finally {
      loading.value = false
    }
  }
</script>

<style lang="scss" scoped>
  .template-form {
    .content-editor {
      .editor-toolbar {
        margin-bottom: 8px;
        padding: 8px;
        background-color: var(--el-fill-color-lighter);
        border-radius: 4px;
        border: 1px solid var(--el-border-color-light);
      }

      .content-textarea {
        margin-bottom: 8px;
      }

      .content-preview {
        margin-top: 12px;
        padding: 12px;
        background-color: var(--el-fill-color-lighter);
        border-radius: 4px;
        border: 1px solid var(--el-border-color-light);

        h4 {
          margin: 0 0 8px 0;
          color: var(--el-text-color-primary);
          font-size: 14px;
        }

        .preview-content {
          color: var(--el-text-color-regular);
          line-height: 1.6;
          white-space: pre-wrap;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 13px;
        }
      }
    }

    .content-tips {
      margin-top: 8px;
    }
  }
</style>
