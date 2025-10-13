<!-- 用户管理 -->
<!-- art-full-height 自动计算出页面剩余高度 -->
<!-- art-table-card 一个符合系统样式的 class，同时自动撑满剩余高度 -->
<!-- 更多 useTable 使用示例请移步至 功能示例 下面的 高级表格示例 -->
<template>
  <div class="user-page art-full-height">
    <!-- 搜索栏 -->
    <UserSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams"></UserSearch>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple>新增用户</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data as UserListItem[]"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>

      <!-- 用户弹窗 -->
      <UserDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :user-data="currentUserData"
        @submit="handleDialogSubmit"
      />

      <!-- 用户详情弹窗 -->
      <UserDetail
        v-model:visible="detailVisible"
        :user-data="currentUserData"
        @edit="handleDetailEdit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { ElMessageBox, ElMessage, ElTag, ElImage } from 'element-plus'
  import { useTable } from '@/composables/useTable'
  import { fetchGetUserList, fetchDeleteUser, fetchAddUser, fetchUpdateUser } from '@/api/system-manage'
  import UserSearch from './modules/user-search.vue'
  import UserDialog from './modules/user-dialog.vue'
  import UserDetail from './modules/user-detail.vue'

  defineOptions({ name: 'User' })

  type UserListItem = Api.SystemManage.UserListItem

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const detailVisible = ref(false)
  const currentUserData = ref<Partial<UserListItem>>({})

  // 选中行
  const selectedRows = ref<UserListItem[]>([])

  // 搜索表单
  const searchForm = ref({
    userName: undefined,
    userGender: undefined,
    userPhone: undefined,
    userEmail: undefined,
    status: '1'
  })

  // 用户状态配置
  const USER_STATUS_CONFIG = {
    '0': { type: 'success' as const, text: '正常' },
    '1': { type: 'danger' as const, text: '封禁' }
  } as const

  /**
   * 获取用户状态配置
   */
  const getUserStatusConfig = (status: string) => {
    return (
      USER_STATUS_CONFIG[status as keyof typeof USER_STATUS_CONFIG] || {
        type: 'info' as const,
        text: '未知'
      }
    )
  }

  /**
   * 将后端用户数据转换为前端显示格式
   */
  const transformUserData = (userData: any): UserListItem => {
    // 角色映射
    const roleMap = {
      0: '普通用户',
      1: '管理员', 
      2: '技工'
    }

    // 性别映射
    const genderMap = {
      0: '未知',
      1: '男',
      2: '女'
    }

    // 状态映射
    const statusMap = {
      0: '正常',
      1: '封禁'
    }

    return {
      // 保留所有后端原始字段
      ...userData,
      
      // 前端显示字段映射
      userName: userData.username || '',
      userEmail: userData.email || '',
      userPhone: userData.phone || '',
      userGender: genderMap[userData.gender as keyof typeof genderMap] || '未知',
      avatar: userData.avatarUrl || '/src/assets/img/avatar/default.png',
      status: userData.userStatus?.toString() || '0', // 保持字符串格式给状态配置使用
      role: roleMap[userData.userRole as keyof typeof roleMap] || '普通用户',
      statusText: statusMap[userData.userStatus as keyof typeof statusMap] || '正常',
      userRoles: [roleMap[userData.userRole as keyof typeof roleMap] || '普通用户'],
      nickName: userData.username || '',
      createBy: 'System',
      updateBy: 'System'
    }
  }

  /**
   * 包装后的用户列表获取函数，包含数据转换
   */
  const wrappedFetchGetUserList = async (params: any) => {
    console.log('📤 原始请求参数:', params)
    
    // 转换分页参数字段名：前端使用 current/size，后端期望 pageNumber/pageSize
    const transformedParams = {
      ...params,
      pageNumber: params.current || 1,      // current -> pageNumber
      pageSize: params.size || 999999,      // 取消条数限制，设置大数值获取所有数据
    }
    
    // 删除前端字段名，避免重复
    delete transformedParams.current
    delete transformedParams.size
    
    console.log('📤 转换后的请求参数:', transformedParams)
    
    try {
      const response = await fetchGetUserList(transformedParams)
      console.log('📊 原始用户列表数据:', response)
      
      // 如果后端返回的是分页数据结构
      if (response && typeof response === 'object' && 'records' in response) {
        return {
          ...response,
          records: (response as any).records.map(transformUserData)
        }
      }
      
      // 如果后端直接返回数组
      if (Array.isArray(response)) {
        return (response as any[]).map(transformUserData)
      }
      
      // 如果是其他结构，尝试处理
      return response
    } catch (error) {
      console.error('❌ 获取用户列表失败:', error)
      throw error
    }
  }

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    searchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    // 核心配置
    core: {
      apiFn: wrappedFetchGetUserList,
      apiParams: {
        current: 1,
        size: 999999,  // 取消条数限制
        ...searchForm.value
      },
      // 排除 apiParams 中的属性
      excludeParams: [],
      // 分页字段映射：告诉useTable前端使用的字段名
      paginationKey: {
        current: 'current',
        size: 'size'
      },
      columnsFactory: () => [
        { type: 'selection' }, // 勾选列
        { type: 'index', width: 60, label: '序号' }, // 序号
        {
          prop: 'username',
          label: '用户名',
          width: 120,
          formatter: (row) => (row as UserListItem).username || '-'
        },
        {
          prop: 'email',
          label: '邮箱',
          width: 180,
          formatter: (row) => (row as UserListItem).email || '-'
        },
        {
          prop: 'phone',
          label: '手机号',
          width: 130,
          formatter: (row) => (row as UserListItem).phone || '-'
        },
        { 
          prop: 'gender', 
          label: '性别', 
          width: 80,
          formatter: (row) => {
            const userRow = row as UserListItem
            const genderMap = { 0: '未知', 1: '男', 2: '女' }
            return genderMap[userRow.gender as keyof typeof genderMap] || '未知'
          }
        },
        { 
          prop: 'userRole', 
          label: '角色',
          width: 100,
          formatter: (row) => {
            const userRow = row as UserListItem
            const roleMap = { 0: '普通用户', 1: '管理员', 2: '技工' }
            return roleMap[userRow.userRole as keyof typeof roleMap] || '普通用户'
          }
        },
        {
          prop: 'userStatus',
          label: '状态',
          width: 80,
          formatter: (row) => {
            const userRow = row as UserListItem
            const statusConfig = getUserStatusConfig(userRow.userStatus?.toString() || '0')
            return h(ElTag, { type: statusConfig.type }, () => statusConfig.text)
          }
        },
        { 
          prop: 'age', 
          label: '年龄',
          width: 80,
          formatter: (row) => (row as UserListItem).age || '-'
        },
        { 
          prop: 'level', 
          label: '等级',
          width: 80,
          formatter: (row) => (row as UserListItem).level || '-'
        },
        { 
          prop: 'overdueTimes', 
          label: '逾期次数',
          width: 100,
          formatter: (row) => {
            const userRow = row as UserListItem
            const current = userRow.overdueTimes || 0
            const isOverLimit = current > 0
            return h('span', 
              { style: isOverLimit ? 'color: #f56c6c; font-weight: bold;' : '' }, 
              current.toString()
            )
          }
        },
        { 
          prop: 'borrowedDeviceCount', 
          label: '已借设备',
          width: 100,
          formatter: (row) => (row as UserListItem).borrowedDeviceCount || 0
        },
        { 
          prop: 'maxBorrowedDeviceCount', 
          label: '最大可借',
          width: 100,
          formatter: (row) => (row as UserListItem).maxBorrowedDeviceCount || 0
        },
        { 
          prop: 'maxOverdueTimes', 
          label: '最大逾期',
          width: 100,
          formatter: (row) => (row as UserListItem).maxOverdueTimes || 0
        },
        {
          prop: 'createTime',
          label: '创建时间',
          width: 160,
          sortable: true,
          formatter: (row) => {
            const time = (row as UserListItem).createTime
            return time ? new Date(time).toLocaleString('zh-CN') : '-'
          }
        },
        {
          prop: 'updateTime',
          label: '更新时间',
          width: 160,
          sortable: true,
          formatter: (row) => {
            const time = (row as UserListItem).updateTime
            return time ? new Date(time).toLocaleString('zh-CN') : '-'
          }
        },
        {
          prop: 'operation',
          label: '操作',
          width: 180,
          fixed: 'right',
          formatter: (row) => {
            const userRow = row as UserListItem
            return h('div', { style: 'display: flex; gap: 8px;' }, [
              h(ArtButtonTable, {
                type: 'view',
                onClick: () => showDetail(userRow)
              }),
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => showDialog('edit', userRow)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => deleteUser(userRow)
              })
            ])
          }
        }
      ]
    },
    // 数据处理
    transform: {
      // 数据转换器 - 替换头像
      dataTransformer: (records: any) => {
        // 类型守卫检查
        if (!Array.isArray(records)) {
          console.warn('数据转换器: 期望数组类型，实际收到:', typeof records)
          return []
        }

        // 直接返回接口数据，不再使用mock头像
        return records
      }
    }
  })

  /**
   * 搜索处理
   * @param params 参数
   */
  const handleSearch = (params: Record<string, any>) => {
    // 搜索参数赋值
    Object.assign(searchParams, params)
    getData()
  }

  /**
   * 显示用户弹窗
   */
  const showDialog = (type: Form.DialogType, row?: UserListItem): void => {
    console.log('打开弹窗:', { type, row })
    dialogType.value = type
    currentUserData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  /**
   * 显示用户详情
   */
  const showDetail = (row: UserListItem): void => {
    console.log('显示用户详情:', row)
    currentUserData.value = { ...row }
    detailVisible.value = true
  }

  /**
   * 详情弹窗编辑按钮
   */
  const handleDetailEdit = (userData: Partial<UserListItem>): void => {
    console.log('详情编辑用户:', userData)
    currentUserData.value = { ...userData }
    dialogType.value = 'edit'
    dialogVisible.value = true
  }

  /**
   * 删除用户
   */
  const deleteUser = (row: UserListItem): void => {
    console.log('删除用户:', row)
    ElMessageBox.confirm(`确定要删除用户「${row.username || row.userName}」吗？`, '删除用户', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    })
      .then(async () => {
        try {
          await fetchDeleteUser(row.id)
          ElMessage.success('删除成功')
          // 重新获取数据
          getData()
        } catch (error) {
          console.error('删除失败:', error)
          ElMessage.error('删除失败')
        }
      })
      .catch(() => {
        ElMessage.info('已取消删除')
      })
  }

  /**
   * 处理弹窗提交事件
   */
  const handleDialogSubmit = async () => {
    try {
      dialogVisible.value = false
      currentUserData.value = {}
      // 重新获取数据
      getData()
    } catch (error) {
      console.error('提交失败:', error)
    }
  }

  /**
   * 处理表格行选择变化
   */
  const handleSelectionChange = (selection: UserListItem[]): void => {
    selectedRows.value = selection
    console.log('选中行数据:', selectedRows.value)
  }
</script>

<style lang="scss" scoped>
  .user-page {
    :deep(.user) {
      .avatar {
        width: 40px;
        height: 40px;
        margin-left: 0;
        border-radius: 6px;
      }

      > div {
        margin-left: 10px;

        .user-name {
          font-weight: 500;
          color: var(--art-text-gray-800);
        }
      }
    }
  }
</style>
