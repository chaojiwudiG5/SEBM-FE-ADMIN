<template>
  <div class="device-search">
    <ElCard shadow="never">
      <ElForm ref="formRef" :model="formData" inline>
        <ElFormItem label="设备名称">
          <ElInput
            v-model="formData.deviceName"
            placeholder="请输入设备名称"
            clearable
            style="width: 200px"
          />
        </ElFormItem>

        <ElFormItem label="设备类型">
          <ElInput
            v-model="formData.deviceType"
            placeholder="请输入设备类型"
            clearable
            style="width: 150px"
          />
        </ElFormItem>

        <ElFormItem label="设备状态">
          <ElSelect
            v-model="formData.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <ElOption label="停用" value="disabled" />
            <ElOption label="正常" value="normal" />
            <ElOption label="维修" value="maintenance" />
            <ElOption label="报废" value="scrapped" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="设备位置">
          <ElInput
            v-model="formData.location"
            placeholder="请输入位置"
            clearable
            style="width: 200px"
          />
        </ElFormItem>

        <ElFormItem>
          <ElButton type="primary" @click="handleSearch" v-ripple>
            <Icon name="search" />
            查询
          </ElButton>
          <ElButton @click="handleReset" v-ripple>
            <Icon name="refresh" />
            重置
          </ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  interface Props {
    modelValue: Record<string, any>
  }

  interface Emits {
    (e: 'update:modelValue', value: Record<string, any>): void
    (e: 'search', value: Record<string, any>): void
    (e: 'reset'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 表单实例
  const formRef = ref()

  // 表单数据
  const formData = reactive({
    deviceName: '',
    deviceType: '',
    status: undefined as string | undefined,
    location: ''
  })

  // 监听外部数据变化
  watch(
    () => props.modelValue,
    (newVal) => {
      Object.assign(formData, newVal)
    },
    { immediate: true, deep: true }
  )

  // 监听内部数据变化
  watch(
    formData,
    (newVal) => {
      emit('update:modelValue', { ...newVal })
    },
    { deep: true }
  )

  /**
   * 搜索处理
   */
  const handleSearch = () => {
    const searchParams = { ...formData }
    // 过滤空值
    Object.keys(searchParams).forEach((key) => {
      if (
        searchParams[key] === '' ||
        searchParams[key] === null ||
        searchParams[key] === undefined
      ) {
        delete searchParams[key]
      }
    })
    emit('search', searchParams)
  }

  /**
   * 重置处理
   */
  const handleReset = () => {
    formRef.value?.resetFields()
    Object.assign(formData, {
      deviceName: '',
      deviceType: '',
      status: undefined,
      location: ''
    })
    emit('reset')
    handleSearch()
  }
</script>

<style lang="scss" scoped>
  .device-search {
    margin-bottom: 20px;

    :deep(.el-card__body) {
      padding: 20px;
    }
  }
</style>
