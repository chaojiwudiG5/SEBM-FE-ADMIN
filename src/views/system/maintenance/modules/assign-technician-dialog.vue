<template>
  <el-dialog
    v-model="visible"
    title="Assign Maintenance Task"
    width="600px"
    :close-on-click-modal="false"
    :before-close="handleClose"
  >
    <div class="dialog-content">
      <div class="selected-records">
        <h4>Selected Maintenance Reports:</h4>
        <ul>
          <li v-for="record in maintenanceRecords" :key="record.id">
            Device: {{ record.deviceName }} - Report ID: {{ record.id }}
          </li>
        </ul>
      </div>

      <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
        <el-form-item label="Select Technician" prop="mechanicId">
          <el-select
            v-model="formData.mechanicId"
            placeholder="Please select technician"
            style="width: 100%"
            :loading="loading"
          >
            <el-option
              v-for="tech in technicianList"
              :key="tech.id"
              :label="tech.username"
              :value="tech.id"
            >
              <span>{{ tech.username }}</span>
              <span class="tech-info">
                (Phone: {{ tech.phone }})
              </span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">Cancel</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">Confirm</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { getTechnicianList, assignMaintenanceTask } from '@/api/maintenance'

type MaintenanceRecord = {
  id: number
  deviceName: string
  userId: number | string
  description?: string
  image?: string
  status: 0 | 1
  createTime?: string
  updateTime?: string
}

defineOptions({ name: 'AssignTechnicianDialog' })

const props = withDefaults(defineProps<{
  modelValue: boolean
  maintenanceRecords: MaintenanceRecord[]
}>(), {
  modelValue: false,
  maintenanceRecords: () => []
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

// 表单相关
const formRef = ref<FormInstance>()
const formData = ref({
  mechanicId: undefined as number | undefined
})

const rules: FormRules = {
  mechanicId: [{ required: true, message: 'Please select technician', trigger: 'change' }]
}

// Technician list
const loading = ref(false)
const technicianList = ref<any[]>([])

// Submit status
const submitting = ref(false)

// Control dialog visibility
const visible = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    fetchTechnicianList()
  }
})

watch(() => visible.value, (val) => {
  emit('update:modelValue', val)
  if (!val) {
    formData.value.mechanicId = undefined
  }
})

// Fetch technician list
const fetchTechnicianList = async () => {
  try {
    loading.value = true
    const response = await getTechnicianList({
      pageNumber: 1,
      pageSize: 100
    })
    // Filter users with technician role
    technicianList.value = response.records.filter((user: any) => user.userRole === 2)
  } catch (error) {
    console.error('Failed to get technician list:', error)
    ElMessage.error('Failed to get technician list')
  } finally {
    loading.value = false
  }
}

// Submit assignment
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    submitting.value = true
    const mechanicId = formData.value.mechanicId
    
    // Assign tasks to selected reports
    for (const record of props.maintenanceRecords) {
      await assignMaintenanceTask({
        userMaintenanceRecordId: record.id,
        mechanicId: mechanicId!
      })
    }
    
    ElMessage.success('Assigned successfully')
    emit('success')
  } catch (error) {
    console.error('Assignment failed:', error)
    ElMessage.error('Assignment failed')
  } finally {
    submitting.value = false
  }
}

const handleClose = () => {
  visible.value = false
}
</script>

<style lang="scss" scoped>
.dialog-content {
  .selected-records {
    margin-bottom: 20px;
    padding: 10px;
    background-color: #f5f7fa;
    border-radius: 4px;

    h4 {
      margin: 0 0 10px;
      font-size: 14px;
    }

    ul {
      margin: 0;
      padding-left: 20px;
      
      li {
        line-height: 24px;
        color: #606266;
      }
    }
  }
}

.tech-info {
  color: #909399;
  margin-left: 10px;
}
</style>