<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="rules"
    @reset="handleReset"
    @search="handleSearch"
  >
  </ArtSearchBar>
</template>

<script setup lang="ts">
  interface Props {
    modelValue: Record<string, any>
  }
  interface Emits {
    (e: 'update:modelValue', value: Record<string, any>): void
    (e: 'search', params: Record<string, any>): void
    (e: 'reset'): void
  }
  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 表单数据双向绑定
  const searchBarRef = ref()
  const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  // 校验规则
  const rules = {
    // userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }]
  }

  // 动态 options
  const statusOptions = ref<{ label: string; value: string; disabled?: boolean }[]>([])

  // 模拟接口返回状态数据
  function fetchStatusOptions(): Promise<typeof statusOptions.value> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { label: '在线', value: '1' },
          { label: '离线', value: '2' },
          { label: '异常', value: '3' },
          { label: '注销', value: '4' }
        ])
      }, 1000)
    })
  }

  onMounted(async () => {
    statusOptions.value = await fetchStatusOptions()
  })

  // 表单配置
  const formItems = computed(() => [
    {
      label: 'Username',
      key: 'userName',
      type: 'input',
      placeholder: 'Please enter username',
      clearable: true
    },
    {
      label: 'Phone',
      key: 'userPhone',
      type: 'input',
      props: { placeholder: 'Please enter phone number', maxlength: '11' }
    },
    {
      label: 'Email',
      key: 'userEmail',
      type: 'input',
      props: { placeholder: 'Please enter email' }
    },
    {
      label: 'Role',
      key: 'userRole',
      type: 'select',
      props: {
        placeholder: 'Please select role',
        options: [
          { label: 'User', value: '0' },
          { label: 'Admin', value: '1' },
          { label: 'Technician', value: '2' }
        ]
      }
    },
    {
      label: 'Status',
      key: 'status',
      type: 'select',
      props: {
        placeholder: 'Please select status',
        options: [
          { label: 'Normal', value: '0' },
          { label: 'Banned', value: '1' }
        ]
      }
    },
    {
      label: 'Gender',
      key: 'userGender',
      type: 'radiogroup',
      props: {
        options: [
          { label: 'Male', value: '1' },
          { label: 'Female', value: '2' }
        ]
      }
    },
    {
      label: 'Age Range',
      key: 'ageRange',
      type: 'input',
      props: { placeholder: 'e.g: 18-30' }
    },
    {
      label: 'Level',
      key: 'level',
      type: 'select',
      props: {
        placeholder: 'Please select level',
        options: [
          { label: 'Level 1', value: '1' },
          { label: 'Level 2', value: '2' },
          { label: 'Level 3', value: '3' },
          { label: 'Level 4', value: '4' },
          { label: 'Level 5', value: '5' }
        ]
      }
    }
  ])

  // 事件
  function handleReset() {
    console.log('重置表单')
    emit('reset')
  }

  async function handleSearch() {
    await searchBarRef.value.validate()
    emit('search', formData.value)
    console.log('表单数据', formData.value)
  }
</script>
