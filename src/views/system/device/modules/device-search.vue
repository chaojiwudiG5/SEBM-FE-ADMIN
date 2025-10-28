<template>
  <div class="device-search">
    <ElCard shadow="never">
      <ElForm ref="formRef" :model="formData" inline>
        <ElFormItem label="Device Name">
          <ElInput
            v-model="formData.deviceName"
            placeholder="Please enter device name"
            clearable
            style="width: 200px"
          />
        </ElFormItem>

        <ElFormItem label="Device Type">
          <ElInput
            v-model="formData.deviceType"
            placeholder="Please enter device type"
            clearable
            style="width: 150px"
          />
        </ElFormItem>

        <ElFormItem label="Device Status">
          <ElSelect
            v-model="formData.status"
            placeholder="Please select status"
            clearable
            style="width: 120px"
          >
            <ElOption label="Available" :value="0" />
            <ElOption label="Borrowed" :value="1" />
            <ElOption label="Maintenance" :value="2" />
            <ElOption label="Reserved" :value="3" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="Device Location">
          <ElInput
            v-model="formData.location"
            placeholder="Please enter location"
            clearable
            style="width: 200px"
          />
        </ElFormItem>

        <ElFormItem>
          <ElButton type="primary" @click="handleSearch" v-ripple>
            <ElIcon><Search /></ElIcon>
            Search
          </ElButton>
          <ElButton @click="handleReset" v-ripple>
            <ElIcon><Refresh /></ElIcon>
            Reset
          </ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { Search, Refresh } from '@element-plus/icons-vue'
  
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
    status: undefined as Api.SystemManage.DeviceStatus | undefined,
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
      const value = searchParams[key as keyof typeof searchParams]
      if (value === '' || value === null || value === undefined) {
        delete (searchParams as any)[key]
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
