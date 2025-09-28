<!-- 模版弹窗 -->
<template>
  <ElDialog
    :model-value="visible"
    @update:model-value="handleClose"
    :title="dialogTitle"
    :width="800"
    :before-close="handleClose"
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
          <ElFormItem label="模版类型" prop="templateType">
            <ElSelect
              v-model="formData.templateType"
              placeholder="请选择模版类型"
              :disabled="type === 'view'"
              style="width: 100%"
            >
              <ElOption
                v-for="item in templateTypeOptions"
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
        <ElCol :span="12">
          <ElFormItem label="通知方式" prop="notificationMethod">
            <ElSelect
              v-model="formData.notificationMethod"
              placeholder="请选择通知方式"
              :disabled="type === 'view'"
              style="width: 100%"
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
      </ElRow>

      <ElRow :gutter="24">
        <ElCol :span="12">
          <ElFormItem label="通知角色" prop="notificationRole">
            <ElSelect
              v-model="formData.notificationRole"
              placeholder="请选择通知角色"
              :disabled="type === 'view'"
              style="width: 100%"
              clearable
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
        <ElCol :span="12">
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
        <ElInput
          v-model="formData.content"
          type="textarea"
          placeholder="请输入模版内容，支持变量占位符如：{deviceName}、{userName}等"
          :disabled="type === 'view'"
          :rows="8"
          maxlength="2000"
          show-word-limit
        />
        <div class="content-tips">
          <ElText size="small" type="info">
            支持的变量占位符：{deviceName}（设备名称）、{userName}（用户名）、{time}（时间）、{message}（消息内容）
          </ElText>
        </div>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElSpace>
        <ElButton @click="handleClose">取消</ElButton>
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
  import { fetchAddTemplate, fetchUpdateTemplate } from '@/api/system-manage'

  interface TemplateFormData {
    id?: number
    templateTitle: string
    templateType: string
    notificationNode: number
    notificationMethod: number
    notificationRole?: number | null
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
  const loading = ref(false)

  // 弹窗标题
  const dialogTitle = computed(() => {
    const titleMap = {
      add: '新增模版',
      edit: '编辑模版',
      view: '查看模版'
    }
    return titleMap[props.type] || '模版'
  })

  // 表单数据
  const formData = ref<TemplateFormData>({
    templateTitle: '',
    templateType: '',
    notificationNode: 1,
    notificationMethod: 1,
    notificationRole: null,
    relateTimeOffset: null,
    templateDesc: '',
    content: ''
  })

  // 模版类型选项
  const templateTypeOptions = [
    { label: '邮件模版', value: 'email' },
    { label: '短信模版', value: 'sms' },
    { label: '推送模版', value: 'push' },
    { label: '微信模版', value: 'wechat' }
  ]

  // 通知节点选项
  const notificationNodeOptions = [
    { label: '设备故障', value: 1 },
    { label: '维护提醒', value: 2 },
    { label: '状态更新', value: 3 },
    { label: '系统通知', value: 4 }
  ]

  // 通知方式选项
  const notificationMethodOptions = [
    { label: '邮件', value: 1 },
    { label: '短信', value: 2 },
    { label: '推送', value: 3 },
    { label: '微信', value: 4 }
  ]

  // 通知角色选项
  const notificationRoleOptions = [
    { label: '管理员', value: 1 },
    { label: '技术员', value: 2 },
    { label: '普通用户', value: 3 },
    { label: '所有用户', value: 4 }
  ]

  // 表单验证规则
  const rules: FormRules<TemplateFormData> = {
    templateTitle: [
      { required: true, message: '请输入模版标题', trigger: 'blur' },
      { min: 2, max: 100, message: '模版标题长度在 2 到 100 个字符', trigger: 'blur' }
    ],
    templateType: [
      { required: true, message: '请选择模版类型', trigger: 'change' }
    ],
    notificationNode: [
      { required: true, message: '请选择通知节点', trigger: 'change' }
    ],
    notificationMethod: [
      { required: true, message: '请选择通知方式', trigger: 'change' }
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
        templateType: '',
        notificationNode: 1,
        notificationMethod: 1,
        notificationRole: null,
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
        if (templateData.notificationRole === null) {
          templateData.notificationRole = undefined
        }
        await fetchAddTemplate(templateData)
        ElMessage.success('创建模版成功')
      } else {
        const templateData = { ...formData.value } as Api.SystemManage.TemplateUpdateParams
        // 确保null值转换为undefined
        if (templateData.relateTimeOffset === null) {
          templateData.relateTimeOffset = undefined
        }
        if (templateData.notificationRole === null) {
          templateData.notificationRole = undefined
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
    .content-tips {
      margin-top: 8px;
    }
  }
</style>
