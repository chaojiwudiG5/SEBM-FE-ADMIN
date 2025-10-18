<!-- 消息弹窗 -->
<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="600px"
    :close-on-click-modal="false"
  >
    <ElForm
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <ElFormItem label="消息内容" prop="content">
        <ElInput
          v-model="formData.content"
          type="textarea"
          :rows="4"
          placeholder="请输入消息内容"
        />
      </ElFormItem>

      <ElFormItem label="角色" prop="role">
        <ElSelect
          v-model="formData.role"
          placeholder="请选择角色"
          style="width: 100%"
        >
          <ElOption label="普通用户" :value="0" />
          <ElOption label="管理员" :value="1" />
          <ElOption label="技工" :value="2" />
        </ElSelect>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElSpace>
        <ElButton @click="handleCancel">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit" :loading="submitLoading">
          确定
        </ElButton>
      </ElSpace>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'

  defineOptions({ name: 'MessageDialog' })

  interface MessageData {
    id?: number
    content?: string
    role?: number
  }

  interface Props {
    type: Form.DialogType
    messageData?: Partial<MessageData>
  }

  const props = defineProps<Props>()

  const dialogVisible = defineModel<boolean>('visible', { required: true })

  const emit = defineEmits<{
    submit: [formData: MessageData]
  }>()

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)

  const formData = ref<MessageData>({
    content: '',
    role: undefined
  })

  const dialogTitle = computed(() => {
    return props.type === 'add' ? '新增消息' : '编辑消息'
  })

  const rules: FormRules = {
    content: [
      { required: true, message: '请输入消息内容', trigger: 'blur' }
    ],
    role: [
      { required: true, message: '请选择角色', trigger: 'change' }
    ]
  }

  // 监听弹窗打开，初始化表单数据
  watch(dialogVisible, (val) => {
    if (val) {
      if (props.type === 'edit' && props.messageData) {
        formData.value = { ...props.messageData }
      } else {
        formData.value = {
          content: '',
          role: undefined
        }
      }
      nextTick(() => {
        formRef.value?.clearValidate()
      })
    }
  })

  const handleCancel = () => {
    dialogVisible.value = false
  }

  const handleSubmit = async () => {
    try {
      await formRef.value?.validate()
      submitLoading.value = true

      emit('submit', formData.value)
      
      submitLoading.value = false
    } catch (error) {
      console.error('表单验证失败:', error)
      submitLoading.value = false
    }
  }
</script>

<style scoped lang="scss">
  :deep(.el-dialog__body) {
    padding-top: 20px;
  }
</style>
