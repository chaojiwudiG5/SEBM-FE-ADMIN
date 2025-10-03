<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '添加设备' : '编辑设备'"
    width="40%"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="设备名称" prop="deviceName">
            <ElInput v-model="formData.deviceName" placeholder="请输入设备名称" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="设备类型" prop="deviceType">
            <ElInput v-model="formData.deviceType" placeholder="请输入设备类型" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="设备状态" prop="status">
            <ElSelect v-model="formData.status" placeholder="请选择状态" style="width: 100%">
              <ElOption label="可用" :value="0" />
              <ElOption label="借出" :value="1" />
              <ElOption label="维修" :value="2" />
              <ElOption label="预留" :value="3" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="设备位置" prop="location">
            <ElInput v-model="formData.location" placeholder="请输入设备位置" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElFormItem label="设备图片" prop="image">
        <div class="image-upload">
          <ElUpload
            class="avatar-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleImageChange"
          >
            <img v-if="formData.image" :src="formData.image" class="avatar" />
            <Icon v-else name="plus" class="avatar-uploader-icon" />
          </ElUpload>
          <div class="upload-tips">
            <p>点击上传设备图片</p>
            <p>支持 jpg、png 格式，大小不超过 2MB</p>
          </div>
        </div>
      </ElFormItem>

      <ElFormItem label="设备描述" prop="description">
        <ElInput
          v-model="formData.description"
          type="textarea"
          :rows="4"
          placeholder="请输入设备描述信息"
        />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">提交</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules, UploadFile } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import { fetchAddDevice, fetchUpdateDevice } from '@/api/system-manage'

  interface Props {
    visible: boolean
    type: string
    deviceData?: any
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 对话框显示控制
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)

  // 表单实例
  const formRef = ref<FormInstance>()

  // 表单数据
  const formData = reactive({
    deviceName: '',
    deviceType: '',
    status: 0 as Api.SystemManage.DeviceStatus,
    location: '',
    description: '',
    image: ''
  })

  // 表单验证规则
  const rules: FormRules = {
    deviceName: [
      { required: true, message: '请输入设备名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    deviceType: [{ required: true, message: '请选择设备类型', trigger: 'blur' }],
    status: [{ required: true, message: '请选择设备状态', trigger: 'blur' }],
    location: [
      { required: true, message: '请输入设备位置', trigger: 'blur' },
      { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
    ],
    description: [{ max: 500, message: '描述不能超过 500 个字符', trigger: 'blur' }]
  }

  // 初始化表单数据
  const initFormData = () => {
    const isEdit = props.type === 'edit' && props.deviceData
    const row = props.deviceData

    Object.assign(formData, {
      deviceName: isEdit ? row.deviceName || '' : '',
      deviceType: isEdit ? row.deviceType || '' : '',
      status: isEdit ? (row.status ?? 0) : 0,
      location: isEdit ? row.location || '' : '',
      description: isEdit ? row.description || '' : '',
      image: isEdit ? row.image || '' : ''
    })
  }

  // 图片上传处理
  const handleImageChange = (file: UploadFile) => {
    const isJPG = file.raw?.type === 'image/jpeg' || file.raw?.type === 'image/png'
    const isLt2M = (file.raw?.size || 0) / 1024 / 1024 < 2

    if (!isJPG) {
      ElMessage.error('上传图片只能是 JPG/PNG 格式!')
      return false
    }
    if (!isLt2M) {
      ElMessage.error('上传图片大小不能超过 2MB!')
      return false
    }

    // 这里应该上传到服务器，现在先用本地预览
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.image = e.target?.result as string
    }
    reader.readAsDataURL(file.raw!)
  }

  // 统一监听对话框状态变化
  watch(
    () => [props.visible, props.type, props.deviceData],
    ([visible]) => {
      if (visible) {
        initFormData()
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    },
    { immediate: true }
  )

  // 提交表单
  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          const submitData = { ...formData }
          
          if (dialogType.value === 'add') {
            // 添加设备
            await fetchAddDevice(submitData)
            ElMessage.success('添加设备成功')
          } else {
            // 更新设备
            const updateData = {
              id: props.deviceData?.id,
              ...submitData
            }
            await fetchUpdateDevice(updateData)
            ElMessage.success('更新设备成功')
          }
          
          dialogVisible.value = false
          emit('submit')
        } catch (error) {
          console.error('设备操作失败:', error)
          ElMessage.error(dialogType.value === 'add' ? '添加设备失败' : '更新设备失败')
        }
      }
    })
  }
</script>

<style lang="scss" scoped>
  .image-upload {
    display: flex;
    gap: 20px;
    align-items: flex-start;

    .avatar-uploader {
      :deep(.el-upload) {
        position: relative;
        overflow: hidden;
        cursor: pointer;
        border: 1px dashed var(--el-border-color);
        border-radius: 6px;
        transition: var(--el-transition-duration-fast);

        &:hover {
          border-color: var(--el-color-primary);
        }
      }

      .avatar-uploader-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 120px;
        height: 120px;
        font-size: 28px;
        color: #8c939d;
      }

      .avatar {
        display: block;
        width: 120px;
        height: 120px;
        object-fit: cover;
      }
    }

    .upload-tips {
      p {
        margin: 0;
        font-size: 12px;
        line-height: 1.8;
        color: var(--el-text-color-secondary);
      }
    }
  }
</style>
