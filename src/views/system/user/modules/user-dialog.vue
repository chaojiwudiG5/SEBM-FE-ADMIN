<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? 'Add User' : 'Edit User'"
    width="50%"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <ElRow :gutter="24">
        <!-- 新增用户：只显示4个必填字段 -->
        <template v-if="dialogType === 'add'">
          <ElCol :span="12">
            <ElFormItem label="Username" prop="username">
              <ElInput v-model="formData.username" placeholder="Please enter username (nickname)" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="Phone" prop="phone">
              <ElInput v-model="formData.phone" placeholder="Please enter phone number (unique)" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="Password" prop="password">
              <ElInput 
                v-model="formData.password" 
                type="password" 
                placeholder="Please enter password (at least 6 characters)" 
                show-password
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="Confirm Password" prop="checkPassword">
              <ElInput 
                v-model="formData.checkPassword" 
                type="password" 
                placeholder="Please enter password again" 
                show-password
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElAlert
              title="Tip: After successful registration, other user information (email, gender, role, etc.) will use system defaults and can be edited in the user list."
              type="info"
              :closable="false"
              show-icon
              style="margin-bottom: 16px;"
            />
          </ElCol>
        </template>
        
        <!-- 编辑用户：显示完整字段 -->
        <template v-else>
          <!-- 基本信息 -->
          <ElCol :span="12">
            <ElFormItem label="用户名" prop="username">
              <ElInput v-model="formData.username" placeholder="请输入用户名" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="邮箱" prop="email">
              <ElInput v-model="formData.email" placeholder="请输入邮箱" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="手机号" prop="phone">
              <ElInput v-model="formData.phone" placeholder="请输入手机号" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="性别" prop="gender">
              <ElSelect v-model="formData.gender" placeholder="请选择性别">
                <ElOption label="未知" :value="0" />
                <ElOption label="男" :value="1" />
                <ElOption label="女" :value="2" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="年龄" prop="age">
              <ElInputNumber 
                v-model="formData.age" 
                :min="0" 
                :max="120" 
                :controls="false"
                placeholder="请输入年龄"
                style="width: 100%;"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="头像URL" prop="avatarUrl">
              <ElInput v-model="formData.avatarUrl" placeholder="请输入头像URL" />
            </ElFormItem>
          </ElCol>
          
          <!-- 权限与状态管理 -->
          <ElCol :span="24">
            <ElDivider content-position="left">权限与状态管理</ElDivider>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="角色" prop="userRole">
              <ElSelect v-model="formData.userRole" placeholder="请选择角色">
              <ElOption label="User" :value="0" />
              <ElOption label="Admin" :value="1" />
              <ElOption label="Technician" :value="2" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="用户状态" prop="userStatus">
              <ElSelect v-model="formData.userStatus" placeholder="请选择状态">
                <ElOption label="Normal" :value="0" />
                <ElOption label="Banned" :value="1" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="激活状态" prop="isActive">
              <ElSwitch 
                v-model="formData.isActive" 
                active-text="Activated" 
                inactive-text="Inactive"
              />
            </ElFormItem>
          </ElCol>
          
          <!-- 业务管理字段 -->
          <ElCol :span="24">
            <ElDivider content-position="left">设备借用业务管理</ElDivider>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="用户等级" prop="level">
              <ElInputNumber 
                v-model="formData.level" 
                :min="1" 
                :max="10" 
                :controls="false"
                placeholder="请输入等级"
                style="width: 100%;"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="逾期次数" prop="overdueTimes">
              <ElInputNumber 
                v-model="formData.overdueTimes" 
                :min="0" 
                :controls="false"
                placeholder="当前逾期次数"
                style="width: 100%;"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="已借设备数" prop="borrowedDeviceCount">
              <ElInputNumber 
                v-model="formData.borrowedDeviceCount" 
                :min="0" 
                :controls="false"
                placeholder="当前已借设备数量"
                style="width: 100%;"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="最大可借设备数" prop="maxBorrowedDeviceCount">
              <ElInputNumber 
                v-model="formData.maxBorrowedDeviceCount" 
                :min="0" 
                :max="50" 
                :controls="false"
                placeholder="请输入最大可借设备数"
                style="width: 100%;"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="最大允许逾期次数" prop="maxOverdueTimes">
              <ElInputNumber 
                v-model="formData.maxOverdueTimes" 
                :min="0" 
                :max="20" 
                :controls="false"
                placeholder="请输入最大允许逾期次数"
                style="width: 100%;"
              />
            </ElFormItem>
          </ElCol>
        </template>
      </ElRow>
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
  import { fetchUpdateUser } from '@/api/system-manage'
  import { fetchRegister } from '@/api/auth'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'

  interface Props {
    visible: boolean
    type: string
    userData?: any
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 角色列表数据 - 应该从API获取
  const roleList = ref([
    { id: 1, roleName: '管理员', value: 'ADMIN' },
    { id: 2, roleName: '普通用户', value: 'USER' }
  ])

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
    // 新增用户字段
    username: '',
    phone: '',
    password: '',
    checkPassword: '',
    // 编辑用户字段
    email: '',
    gender: 0,
    avatarUrl: '',
    age: undefined as number | undefined,
    // 权限与状态管理
    userRole: 0,
    userStatus: 0,
    isActive: true,
    // 业务管理字段
    level: undefined as number | undefined,
    overdueTimes: undefined as number | undefined,
    borrowedDeviceCount: undefined as number | undefined,
    maxBorrowedDeviceCount: undefined as number | undefined,
    maxOverdueTimes: undefined as number | undefined
  })

  // 表单验证规则
  const rules = computed<FormRules>(() => {
    // 新增用户：只验证4个必填字段
    if (dialogType.value === 'add') {
      return {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
        ],
        checkPassword: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { 
            validator: (rule: any, value: any, callback: any) => {
              if (value !== formData.password) {
                callback(new Error('两次输入的密码不一致'))
              } else {
                callback()
              }
            }, 
            trigger: 'blur' 
          }
        ]
      }
    }
    
    // 编辑用户：取消必填限制，只保留格式验证
    return {
      username: [
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
      ],
      email: [
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
      ],
      phone: [
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
      ]
    }
  })

  // 初始化表单数据
  const initFormData = () => {
    const isEdit = props.type === 'edit' && props.userData
    const row = props.userData

    if (isEdit) {
      // 编辑模式：加载所有字段
      Object.assign(formData, {
        username: row.username || '',
        email: row.email || '',
        phone: row.phone || '',
        gender: row.gender ?? 0,
        avatarUrl: row.avatarUrl || '',
        age: row.age,
        userRole: row.userRole ?? 0,
        userStatus: row.userStatus ?? 0,
        isActive: row.isActive ?? true,
        level: row.level,
        overdueTimes: row.overdueTimes,
        borrowedDeviceCount: row.borrowedDeviceCount,
        maxBorrowedDeviceCount: row.maxBorrowedDeviceCount,
        maxOverdueTimes: row.maxOverdueTimes,
        password: '',
        checkPassword: ''
      })
    } else {
      // 新增模式：清空所有字段
      Object.assign(formData, {
        username: '',
        phone: '',
        password: '',
        checkPassword: '',
        email: '',
        gender: 0,
        avatarUrl: '',
        age: undefined,
        userRole: 0,
        userStatus: 0,
        isActive: true,
        level: undefined,
        overdueTimes: undefined,
        borrowedDeviceCount: undefined,
        maxBorrowedDeviceCount: undefined,
        maxOverdueTimes: undefined
      })
    }
  }

  // 统一监听对话框状态变化
  watch(
    () => [props.visible, props.type, props.userData],
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
          if (dialogType.value === 'add') {
            // 使用注册接口添加用户（注册接口只需要 username, password, checkPassword, phone）
            const registerData: Api.Auth.RegisterParams = {
              username: formData.username,
              password: formData.password,
              checkPassword: formData.checkPassword,
              phone: formData.phone
            }
            
            console.log('📝 准备调用注册接口，数据:', { ...registerData, password: '***', checkPassword: '***' })
            
            const newUserId = await fetchRegister(registerData)
            console.log('✅ 注册成功，新用户ID:', newUserId)
            
            ElMessage.success('添加用户成功')
          } else {
            // 更新用户（包含所有可修改字段，不包含password和isDelete）
            const updateData: Api.SystemManage.UserUpdateParams = {
              id: props.userData?.id,
              username: formData.username,
              email: formData.email,
              phone: formData.phone,
              gender: formData.gender,
              avatarUrl: formData.avatarUrl || undefined,
              age: formData.age,
              userRole: formData.userRole,
              userStatus: formData.userStatus,
              isActive: formData.isActive,
              level: formData.level,
              overdueTimes: formData.overdueTimes,
              borrowedDeviceCount: formData.borrowedDeviceCount,
              maxBorrowedDeviceCount: formData.maxBorrowedDeviceCount,
              maxOverdueTimes: formData.maxOverdueTimes
            }
            
            console.log('📝 准备更新用户，数据:', updateData)
            await fetchUpdateUser(updateData)
            console.log('✅ 更新用户成功')
            ElMessage.success('更新用户成功')
          }
          
          dialogVisible.value = false
          emit('submit')
        } catch (error) {
          console.error('用户操作失败:', error)
          ElMessage.error(dialogType.value === 'add' ? '添加用户失败' : '更新用户失败')
        }
      }
    })
  }
</script>
