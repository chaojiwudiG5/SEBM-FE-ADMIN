<!-- 消息搜索 -->
<template>
  <ElCard shadow="never">
    <ElForm :model="formData" inline>
      <ElFormItem label="消息内容">
        <ElInput
          v-model="formData.content"
          placeholder="请输入消息内容"
          clearable
          style="width: 200px"
        />
      </ElFormItem>

      <ElFormItem label="角色">
        <ElSelect
          v-model="formData.role"
          placeholder="请选择角色"
          clearable
          style="width: 150px"
        >
          <ElOption label="普通用户" :value="0" />
          <ElOption label="管理员" :value="1" />
          <ElOption label="技工" :value="2" />
        </ElSelect>
      </ElFormItem>

      <ElFormItem>
        <ElSpace>
          <ElButton type="primary" @click="handleSearch" v-ripple>查询</ElButton>
          <ElButton @click="handleReset" v-ripple>重置</ElButton>
        </ElSpace>
      </ElFormItem>
    </ElForm>
  </ElCard>
</template>

<script setup lang="ts">
  defineOptions({ name: 'MessageSearch' })

  interface SearchForm {
    content?: string
    role?: number
  }

  const formData = defineModel<SearchForm>({ required: true })

  const emit = defineEmits<{
    search: []
    reset: []
  }>()

  const handleSearch = () => {
    emit('search')
  }

  const handleReset = () => {
    emit('reset')
  }
</script>

<style scoped lang="scss">
  :deep(.el-form) {
    .el-form-item {
      margin-bottom: 0;
    }
  }
</style>
