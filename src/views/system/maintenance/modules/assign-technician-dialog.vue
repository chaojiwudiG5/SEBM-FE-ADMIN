<template>
  <el-dialog
    v-model="visible"
    title="分配维修任务"
    width="600px"
    :close-on-click-modal="false"
    :before-close="handleClose"
  >
    <div class="dialog-content">
      <div class="selected-records">
        <h4>已选择的维修报单：</h4>
        <ul>
          <li v-for="record in maintenanceRecords" :key="record.id">
            设备：{{ record.deviceName }} - 报单ID：{{ record.id }}
          </li>
        </ul>
      </div>

      <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="选择技工" prop="mechanicId">
          <el-select
            v-model="formData.mechanicId"
            placeholder="请选择技工"
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
                (电话: {{ tech.phone }})
              </span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确 定</el-button>
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
  mechanicId: [{ required: true, message: '请选择技工', trigger: 'change' }]
}

// 技工列表
const loading = ref(false)
const technicianList = ref<any[]>([])

// 提交状态
const submitting = ref(false)

// 控制弹窗显示
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

// 获取技工列表
const fetchTechnicianList = async () => {
  try {
    loading.value = true
    const response = await getTechnicianList({
      pageNumber: 1,
      pageSize: 100
    })
    // 过滤出技工角色的用户
    technicianList.value = response.records.filter((user: any) => user.userRole === 2)
  } catch (error) {
    console.error('获取技工列表失败：', error)
    ElMessage.error('获取技工列表失败')
  } finally {
    loading.value = false
  }
}

// 提交分配
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    submitting.value = true
    const mechanicId = formData.value.mechanicId
    
    // 遍历所选报单进行分配
    for (const record of props.maintenanceRecords) {
      await assignMaintenanceTask({
        userMaintenanceRecordId: record.id,
        mechanicId: mechanicId!
      })
    }
    
    ElMessage.success('分配成功')
    emit('success')
  } catch (error) {
    console.error('分配失败：', error)
    ElMessage.error('分配失败')
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