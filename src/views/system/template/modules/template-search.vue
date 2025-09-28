<!-- 模版搜索 -->
<template>
  <ElCard shadow="never">
    <ElForm
      ref="formRef"
      :model="modelValue"
      label-width="auto"
      inline
      class="search-form"
    >
      <ElFormItem label="模版标题" prop="templateTitle">
        <ElInput
          v-model="modelValue.templateTitle"
          placeholder="请输入模版标题"
          clearable
          style="width: 200px"
          @keyup.enter="$emit('search')"
        />
      </ElFormItem>

      <ElFormItem label="模版类型" prop="templateType">
        <ElSelect
          v-model="modelValue.templateType"
          placeholder="请选择模版类型"
          clearable
          style="width: 160px"
        >
          <ElOption
            v-for="item in templateTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="通知节点" prop="notificationNode">
        <ElSelect
          v-model="modelValue.notificationNode"
          placeholder="请选择通知节点"
          clearable
          style="width: 160px"
        >
          <ElOption
            v-for="item in notificationNodeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="通知方式" prop="notificationMethod">
        <ElSelect
          v-model="modelValue.notificationMethod"
          placeholder="请选择通知方式"
          clearable
          style="width: 160px"
        >
          <ElOption
            v-for="item in notificationMethodOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem>
        <ElSpace>
          <ElButton type="primary" @click="$emit('search')" v-ripple>
            <template #icon>
              <i class="iconfont-sys">&#xe65c;</i>
            </template>
            搜索
          </ElButton>
          <ElButton @click="handleReset" v-ripple>
            <template #icon>
              <i class="iconfont-sys">&#xe6aa;</i>
            </template>
            重置
          </ElButton>
        </ElSpace>
      </ElFormItem>
    </ElForm>
  </ElCard>
</template>

<script setup lang="ts">
  import type { FormInstance } from 'element-plus'

  interface SearchForm {
    templateTitle?: string
    templateType?: string
    notificationNode?: number
    notificationMethod?: number
  }

  interface Props {
    modelValue: SearchForm
  }

  interface Emits {
    (e: 'update:modelValue', value: SearchForm): void
    (e: 'search'): void
    (e: 'reset'): void
  }

  defineProps<Props>()
  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()

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

  /**
   * 重置搜索条件
   */
  const handleReset = () => {
    formRef.value?.resetFields()
    emit('reset')
  }
</script>

<style lang="scss" scoped>
  .search-form {
    :deep(.el-form-item) {
      margin-bottom: 16px;
    }
  }
</style>
