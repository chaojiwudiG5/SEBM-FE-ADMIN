<template>
  <div class="maintenance-search">
    <el-form :model="formData" inline>
      <el-form-item label="状态">
        <el-select v-model="formData.status" placeholder="请选择状态" clearable>
          <el-option label="处理中" :value="0" />
          <el-option label="已处理" :value="1" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ElForm, ElFormItem, ElSelect, ElOption, ElButton } from 'element-plus'

defineOptions({ name: 'MaintenanceSearch' })

const props = defineProps<{
  modelValue: {
    status?: 0 | 1
  }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: { status?: 0 | 1 }): void
  (e: 'search', params: any): void
  (e: 'reset'): void
}>()

const formData = reactive({
  status: props.modelValue.status
})

const handleSearch = () => {
  emit('update:modelValue', { ...formData })
  emit('search', { ...formData })
}

const handleReset = () => {
  formData.status = undefined
  emit('update:modelValue', { status: undefined })
  emit('reset')
}
</script>

<style lang="scss" scoped>
.maintenance-search {
  margin-bottom: 20px;
}
</style>