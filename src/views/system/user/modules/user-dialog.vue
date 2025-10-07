<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
    width="50%"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <ElRow :gutter="24">
        <!-- 新增用户：只显示4个必填字段 -->
        <template v-if="dialogType === 'add'">
          <ElCol :span="12">
            <ElFormItem label="用户名" prop="username">
              <ElInput v-model="formData.username" placeholder="请输入用户名（昵称）" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="手机号" prop="phone">
              <ElInput v-model="formData.phone" placeholder="请输入手机号（唯一标识）" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="密码" prop="password">
              <ElInput 
                v-model="formData.password" 
                type="password" 
                placeholder="请输入密码（最少6位）" 
                show-password
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="确认密码" prop="checkPassword">
              <ElInput 
                v-model="formData.checkPassword" 
                type="password" 
                placeholder="请再次输入密码" 
                show-password
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElAlert
              title="提示：注册成功后，其他用户信息（邮箱、性别、角色等）将使用系统默认值，可在用户列表中编辑修改。"
              type="info"
              :closable="false"
              show-icon
              style="margin-bottom: 16px;"
            />
          </ElCol>
        </template>
        
        <!-- 编辑用户：显示完整字段 -->
        <template v-else>
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
            <ElFormItem label="角色" prop="userRole">
              <ElSelect v-model="formData.userRole" placeholder="请选择角色">
                <ElOption label="普通用户" :value="0" />
                <ElOption label="管理员" :value="1" />
                <ElOption label="技工" :value="2" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="用户状态" prop="userStatus">
              <ElSelect v-model="formData.userStatus" placeholder="请选择状态">
                <ElOption label="正常" :value="0" />
                <ElOption label="封禁" :value="1" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="年龄" prop="age">
              <ElInputNumber 
                v-model="formData.age" 
                :min="0" 
                :max="120" 
                placeholder="请输入年龄"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="等级" prop="level">
              <ElInputNumber 
                v-model="formData.level" 
                :min="1" 
                :max="10" 
                placeholder="请输入等级"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="最大可借设备数" prop="maxBorrowedDeviceCount">
              <ElInputNumber 
                v-model="formData.maxBorrowedDeviceCount" 
                :min="0" 
                :max="50" 
                placeholder="请输入最大可借设备数"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="最大允许逾期次数" prop="maxOverdueTimes">
              <ElInputNumber 
                v-model="formData.maxOverdueTimes" 
                :min="0" 
                :max="20" 
                placeholder="请输入最大允许逾期次数"
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
    username: '',
    email: '',
    phone: '',
    password: '',          // 新增密码字段
    checkPassword: '',     // 新增确认密码字段
    gender: 0,
    userRole: 0,
    userStatus: 0,
    age: undefined as number | undefined,
    level: undefined as number | undefined,
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
    
    // 编辑用户：验证完整字段（不包含密码）
    return {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
      ],
      email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
      ],
      phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
      ],
      gender: [{ required: true, message: '请选择性别', trigger: 'blur' }],
      userRole: [{ required: true, message: '请选择角色', trigger: 'blur' }],
      userStatus: [{ required: true, message: '请选择用户状态', trigger: 'blur' }]
    }
  })

  // 初始化表单数据
  const initFormData = () => {
    const isEdit = props.type === 'edit' && props.userData
    const row = props.userData

    Object.assign(formData, {
      username: isEdit ? row.username || '' : '',
      email: isEdit ? row.email || '' : '',
      phone: isEdit ? row.phone || '' : '',
      password: '',          // 新增时清空密码
      checkPassword: '',     // 新增时清空确认密码
      gender: isEdit ? (row.gender ?? 0) : 0,
      userRole: isEdit ? (row.userRole ?? 0) : 0,
      userStatus: isEdit ? (row.userStatus ?? 0) : 0,
      age: isEdit ? row.age : undefined,
      level: isEdit ? row.level : undefined,
      maxBorrowedDeviceCount: isEdit ? row.maxBorrowedDeviceCount : undefined,
      maxOverdueTimes: isEdit ? row.maxOverdueTimes : undefined
    })
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
            // 更新用户（不包含密码字段）
            const updateData = {
              id: props.userData?.id,
              username: formData.username,
              email: formData.email,
              phone: formData.phone,
              gender: formData.gender,
              userRole: formData.userRole,
              userStatus: formData.userStatus,
              age: formData.age,
              level: formData.level,
              maxBorrowedDeviceCount: formData.maxBorrowedDeviceCount,
              maxOverdueTimes: formData.maxOverdueTimes
            }
            await fetchUpdateUser(updateData)
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
