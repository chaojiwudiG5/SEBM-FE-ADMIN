<!-- Template Search -->
<template>
  <ElCard shadow="never" class="search-card">
    <template #header>
      <div class="search-header">
        <span class="search-title">Search Criteria</span>
        <ElButton 
          size="small" 
          text 
          @click="toggleAdvancedSearch"
          class="toggle-btn"
        >
          {{ showAdvancedSearch ? 'Collapse' : 'Expand' }}
          <ElIcon>
            <ArrowDown v-if="!showAdvancedSearch" />
            <ArrowUp v-else />
          </ElIcon>
        </ElButton>
      </div>
    </template>

    <ElForm
      ref="formRef"
      :model="modelValue"
      label-width="auto"
      inline
      class="search-form"
    >
      <!-- Basic Search Criteria -->
      <ElFormItem label="Template Title" prop="templateTitle">
        <ElInput
          v-model="modelValue.templateTitle"
          placeholder="Please enter template title"
          clearable
          style="width: 200px"
          @keyup.enter="$emit('search')"
        />
      </ElFormItem>

      <ElFormItem label="Notification Node" prop="notificationNode">
        <ElSelect
          v-model="modelValue.notificationNode"
          placeholder="Please select notification node"
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

      <ElFormItem label="Notification Method" prop="notificationMethod">
        <ElSelect
          v-model="modelValue.notificationMethod"
          placeholder="Please select notification method"
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

      <ElFormItem label="Notification Event" prop="notificationEvent">
        <ElInput
          v-model="modelValue.notificationEvent"
          placeholder="Please enter notification event"
          clearable
          style="width: 160px"
          @keyup.enter="$emit('search')"
        />
      </ElFormItem>

      <ElFormItem label="Notification Type" prop="notificationType">
        <ElSelect
          v-model="modelValue.notificationType"
          placeholder="Please select notification type"
          clearable
          style="width: 160px"
        >
          <ElOption
            v-for="item in notificationTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>

      <!-- Advanced Search Criteria -->
      <template v-if="showAdvancedSearch">
        <ElFormItem label="Notification Role" prop="notificationRole">
          <ElSelect
            v-model="modelValue.notificationRole"
            placeholder="Please select notification role"
            clearable
            style="width: 160px"
          >
            <ElOption
              v-for="item in notificationRoleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="Create Time" prop="createTimeRange">
          <ElDatePicker
            v-model="modelValue.createTimeRange"
            type="datetimerange"
            range-separator="to"
            start-placeholder="Start Time"
            end-placeholder="End Time"
            style="width: 300px"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </ElFormItem>

        <ElFormItem label="Template Description" prop="templateDesc">
          <ElInput
            v-model="modelValue.templateDesc"
            placeholder="Please enter template description keywords"
            clearable
            style="width: 200px"
            @keyup.enter="$emit('search')"
          />
        </ElFormItem>

        <ElFormItem label="Time Offset" prop="relateTimeOffsetRange">
          <ElInputNumber
            v-model="modelValue.relateTimeOffsetMin"
            placeholder="Min"
            :min="0"
            :max="86400"
            style="width: 100px"
          />
          <span style="margin: 0 8px;">-</span>
          <ElInputNumber
            v-model="modelValue.relateTimeOffsetMax"
            placeholder="Max"
            :min="0"
            :max="86400"
            style="width: 100px"
          />
          <span style="margin-left: 4px; color: var(--el-text-color-secondary);">seconds</span>
        </ElFormItem>
      </template>

      <ElFormItem>
        <ElSpace>
          <ElButton type="primary" @click="$emit('search')" v-ripple>
            Search
          </ElButton>
          <ElButton @click="handleReset" v-ripple>
            Reset
          </ElButton>
        </ElSpace>
      </ElFormItem>
    </ElForm>

    <!-- Search History -->
    <div v-if="searchHistory.length > 0" class="search-history">
      <div class="history-title">Search History</div>
      <div class="history-tags">
        <ElTag
          v-for="(item, index) in searchHistory"
          :key="index"
          size="small"
          closable
          @close="removeSearchHistory(index)"
          @click="applySearchHistory(item)"
          class="history-tag"
        >
          {{ item.name }}
        </ElTag>
      </div>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import type { FormInstance } from 'element-plus'
  import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'

  interface SearchForm {
    templateTitle?: string
    notificationNode?: number
    notificationMethod?: number
    notificationEvent?: string
    notificationType?: number
    notificationRole?: number
    createTimeRange?: [string, string]
    templateDesc?: string
    relateTimeOffsetMin?: number
    relateTimeOffsetMax?: number
  }

  interface SearchHistoryItem {
    name: string
    params: SearchForm
  }

  interface Props {
    modelValue: SearchForm
  }

  interface Emits {
    (e: 'update:modelValue', value: SearchForm): void
    (e: 'search'): void
    (e: 'reset'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const showAdvancedSearch = ref(false)

  // Search history
  const searchHistory = ref<SearchHistoryItem[]>([])

  // Notification node options
  const notificationNodeOptions = [
    { label: 'Borrow Success', value: 1 },
    { label: 'Due Reminder', value: 3 },
    { label: 'Return Success', value: 4 }
  ]

  // Notification method options
  const notificationMethodOptions = [
    { label: 'Email', value: 1 },
    { label: 'SMS', value: 2 },
    { label: 'In-app', value: 3 }
  ]

  // Notification role options
  const notificationRoleOptions = [
    { label: 'Admin', value: 0 },
    { label: 'Borrower', value: 1 },
    { label: 'Technician', value: 2 }
  ]

  // Notification type options
  const notificationTypeOptions = [
    { label: 'Advance Notice', value: -1 },
    { label: 'Instant Notice', value: 0 },
    { label: 'Delayed Notice', value: 1 }
  ]

  /**
   * 切换高级搜索
   */
  const toggleAdvancedSearch = () => {
    showAdvancedSearch.value = !showAdvancedSearch.value
  }

  /**
   * 重置搜索条件
   */
  const handleReset = () => {
    formRef.value?.resetFields()
    emit('reset')
  }

  

  /**
   * 添加搜索历史
   */
  const addSearchHistory = (params: SearchForm) => {
    const searchName = generateSearchName(params)
    const historyItem: SearchHistoryItem = {
      name: searchName,
      params: { ...params }
    }
    
    // 避免重复
    const existingIndex = searchHistory.value.findIndex(item => item.name === searchName)
    if (existingIndex !== -1) {
      searchHistory.value.splice(existingIndex, 1)
    }
    
    // 添加到开头
    searchHistory.value.unshift(historyItem)
    
    // 限制历史记录数量
    if (searchHistory.value.length > 10) {
      searchHistory.value = searchHistory.value.slice(0, 10)
    }
  }

  /**
   * 生成搜索名称
   */
  const generateSearchName = (params: SearchForm): string => {
    const conditions = []
    
    if (params.templateTitle) conditions.push(`标题:${params.templateTitle}`)
    if (params.notificationNode) {
      const nodeText = notificationNodeOptions.find(item => item.value === params.notificationNode)?.label
      conditions.push(`节点:${nodeText}`)
    }
    if (params.notificationMethod) {
      const methodText = notificationMethodOptions.find(item => item.value === params.notificationMethod)?.label
      conditions.push(`方式:${methodText}`)
    }
    if (params.notificationEvent) conditions.push(`事件:${params.notificationEvent}`)
    if (params.notificationType) {
      const typeText = notificationTypeOptions.find(item => item.value === params.notificationType)?.label
      conditions.push(`类型:${typeText}`)
    }
    
    return conditions.length > 0 ? conditions.join(', ') : '全部'
  }

  /**
   * 应用搜索历史
   */
  const applySearchHistory = (item: SearchHistoryItem) => {
    emit('update:modelValue', { ...item.params })
    emit('search')
  }

  /**
   * 移除搜索历史
   */
  const removeSearchHistory = (index: number) => {
    searchHistory.value.splice(index, 1)
  }

  // 监听搜索事件，自动添加历史记录
  watch(() => props.modelValue, () => {
    const currentParams = { ...props.modelValue }
    addSearchHistory(currentParams)
  }, { deep: true })
</script>

<style lang="scss" scoped>
.search-card {
  .search-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .search-title {
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .toggle-btn {
      color: var(--el-color-primary);
    }
  }

  .search-form {
    :deep(.el-form-item) {
      margin-bottom: 16px;
    }
  }

  .search-history {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--el-border-color-light);

    .history-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
      margin-bottom: 8px;
    }

    .history-tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;

      .history-tag {
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background-color: var(--el-color-primary-light-9);
          border-color: var(--el-color-primary-light-7);
        }
      }
    }
  }
}
</style>