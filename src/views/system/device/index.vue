<!-- 设备管理 -->
<!-- art-full-height 自动计算出页面剩余高度 -->
<!-- art-table-card 一个符合系统样式的 class，同时自动撑满剩余高度 -->
<template>
  <div class="device-page art-full-height">
    <!-- 搜索栏 -->
    <DeviceSearch
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    ></DeviceSearch>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData" layout="">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple>新增设备</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data as DeviceListItem[]"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>

      <!-- 设备弹窗 -->
      <DeviceDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :device-data="currentDeviceData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { ElMessageBox, ElMessage, ElTag, ElImage } from 'element-plus'
  import { useTable } from '@/composables/useTable'
  import { fetchGetDeviceList, fetchDeleteDevice, fetchUpdateDeviceStatus } from '@/api/system-manage'
  import DeviceSearch from './modules/device-search.vue'
  import DeviceDialog from './modules/device-dialog.vue'

  defineOptions({ name: 'Device' })

  type DeviceListItem = Api.SystemManage.DeviceListItem

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentDeviceData = ref<Partial<DeviceListItem>>({})

  // 选中行
  const selectedRows = ref<DeviceListItem[]>([])

  // 搜索表单
  const searchForm = ref({
    deviceName: undefined,
    deviceType: undefined,
    status: undefined,
    location: undefined
  })

  // 设备状态配置
  const DEVICE_STATUS_CONFIG = {
    0: { type: 'success' as const, text: '可用' },
    1: { type: 'warning' as const, text: '借出' },
    2: { type: 'danger' as const, text: '维修' },
    3: { type: 'info' as const, text: '预留' }
  } as const

  /**
   * 获取设备状态配置
   */
  const getDeviceStatusConfig = (status: Api.SystemManage.DeviceStatus) => {
    return (
      DEVICE_STATUS_CONFIG[status] || {
        type: 'info' as const,
        text: '未知'
      }
    )
  }

  /**
   * 包装后的设备列表获取函数，包含参数转换和数据处理
   */
  const wrappedFetchGetDeviceList = async (params: any) => {
    console.log('📤 设备列表原始请求参数:', params)
    
    // 转换分页参数字段名：前端使用 current/size，后端期望 pageNumber/pageSize
    const transformedParams = {
      ...params,
      pageNumber: params.current || 1,      // current -> pageNumber  
      pageSize: params.size || 999999,      // 取消条数限制，设置大数值获取所有数据
    }
    
    // 删除前端字段名，避免重复
    delete transformedParams.current
    delete transformedParams.size
    
    console.log('📤 设备列表转换后的请求参数:', transformedParams)
    
    try {
      const response = await fetchGetDeviceList(transformedParams)
      console.log('📊 设备列表原始数据:', response)
      return response
    } catch (error) {
      console.error('❌ 获取设备列表失败:', error)
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
      apiFn: wrappedFetchGetDeviceList,
      apiParams: {
        current: 1,        // 前端使用的分页参数
        size: 999999,      // 取消条数限制，获取所有数据
        ...searchForm.value
      },
      // 排除 apiParams 中的属性
      excludeParams: [],
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' }, // 序号
        {
          prop: 'deviceName',
          label: '设备信息',
          width: 280,
          formatter: (row) => {
            const deviceRow = row as DeviceListItem
            return h('div', { class: 'device', style: 'display: flex; align-items: center' }, [
              h(ElImage, {
                class: 'device-image',
                src: deviceRow.image || '/src/assets/img/common/device-placeholder.png',
                previewSrcList: deviceRow.image ? [deviceRow.image] : [],
                // 图片预览是否插入至 body 元素上，用于解决表格内部图片预览样式异常
                previewTeleported: true,
                style: 'width: 40px; height: 40px; border-radius: 4px; margin-right: 10px;',
                fit: 'cover'
              }),
              h('div', {}, [
                h(
                  'p',
                  { class: 'device-name', style: 'margin: 0; font-weight: 500;' },
                  deviceRow.deviceName
                ),
                h(
                  'p',
                  { class: 'device-type', style: 'margin: 0; color: #999; font-size: 12px;' },
                  deviceRow.deviceType
                )
              ])
            ])
          }
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row) => {
            const deviceRow = row as DeviceListItem
            const statusConfig = getDeviceStatusConfig(deviceRow.status)
            return h(ElTag, { type: statusConfig.type }, () => statusConfig.text)
          }
        },
        { 
          prop: 'location', 
          label: '设备位置',
          width: 150,
          formatter: (row) => (row as DeviceListItem).location || '-'
        },
        { 
          prop: 'description', 
          label: '描述', 
          width: 200,
          formatter: (row) => (row as DeviceListItem).description || '-'
        },
        {
          prop: 'createTime',
          label: '创建时间',
          sortable: true,
          width: 160,
          formatter: (row) => {
            const time = (row as DeviceListItem).createTime
            return time ? new Date(time).toLocaleString('zh-CN') : '-'
          }
        },
        {
          prop: 'operation',
          label: '操作',
          width: 280,
          fixed: 'right', // 固定列
          formatter: (row) => {
            const deviceRow = row as DeviceListItem
            const buttons = [
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => showDialog('edit', deviceRow)
              })
            ]
            
            // 根据设备状态显示不同的操作按钮
            if (deviceRow.status === 0) {
              // 可用状态：可以借出
              buttons.push(h('el-button', {
                type: 'primary',
                size: 'small',
                text: true,
                onClick: () => updateDeviceStatus(deviceRow, 1),
                style: { marginLeft: '8px' }
              }, { default: () => '借出' }))
            } else if (deviceRow.status === 1) {
              // 借出状态：可以归还
              buttons.push(h('el-button', {
                type: 'success',
                size: 'small',
                text: true,
                onClick: () => updateDeviceStatus(deviceRow, 0),
                style: { marginLeft: '8px' }
              }, { default: () => '归还' }))
            } else if (deviceRow.status === 2) {
              // 维护状态：可以标记为可用
              buttons.push(h('el-button', {
                type: 'warning',
                size: 'small',
                text: true,
                onClick: () => updateDeviceStatus(deviceRow, 0),
                style: { marginLeft: '8px' }
              }, { default: () => '修复完成' }))
            } else if (deviceRow.status === 3) {
              // 预约状态：可以取消预约
              buttons.push(h('el-button', {
                type: 'info',
                size: 'small',
                text: true,
                onClick: () => updateDeviceStatus(deviceRow, 0),
                style: { marginLeft: '8px' }
              }, { default: () => '取消预约' }))
            }
            
            // 所有状态都可以标记为维护
            if (deviceRow.status !== 2) {
              buttons.push(h('el-button', {
                type: 'warning',
                size: 'small',
                text: true,
                onClick: () => updateDeviceStatus(deviceRow, 2),
                style: { marginLeft: '8px' }
              }, { default: () => '标记维护' }))
            }
            
            // 管理员可以删除设备
            buttons.push(h(ArtButtonTable, {
              type: 'delete',
              onClick: () => deleteDevice(deviceRow)
            }))
            
            return h('div', { style: { display: 'flex', alignItems: 'center', gap: '4px' } }, buttons)
          }
        }
      ]
    },
    // 数据处理 - 直接使用API返回的数据
    transform: {
      // 数据转换器
      dataTransformer: (records: any) => {
        // 类型守卫检查
        if (!Array.isArray(records)) {
          console.warn('数据转换器: 期望数组类型，实际收到:', typeof records)
          return []
        }
        // 直接返回设备数据
        return records
      }
    }
  })

  /**
   * 搜索处理
   * @param params 参数
   */
  const handleSearch = (params: any) => {
    Object.assign(searchParams, params)
    getData()
  }

  /**
   * 表格多选
   * @param selection 已选择的数据
   */
  const handleSelectionChange = (selection: DeviceListItem[]) => {
    selectedRows.value = selection
  }

  /**
   * 显示弹窗
   * @param type 类型
   * @param row 行数据
   */
  const showDialog = (type: Form.DialogType, row?: DeviceListItem) => {
    dialogType.value = type
    currentDeviceData.value = row ? { ...row } : {}
    dialogVisible.value = true
  }

  /**
   * 删除设备
   */
  const deleteDevice = async (row: DeviceListItem) => {
    const confirmResult = await ElMessageBox.confirm(
      `确定要删除设备 "${row.deviceName}" 吗？`,
      '删除确认',
      {
        type: 'warning'
      }
    ).catch(() => false)

    if (confirmResult) {
      try {
        await fetchDeleteDevice(row.id)
        ElMessage.success('删除设备成功')
        refreshData()
      } catch (error) {
        console.error('删除设备失败:', error)
        ElMessage.error('删除设备失败')
      }
    }
  }

  /**
   * 更新设备状态
   */
  const updateDeviceStatus = async (row: DeviceListItem, newStatus: number) => {
    try {
      await fetchUpdateDeviceStatus({
        deviceId: row.id,    // 根据后端API规范使用deviceId
        status: newStatus
      })
      ElMessage.success('状态更新成功')
      refreshData()
    } catch (error) {
      console.error('状态更新失败:', error)
      ElMessage.error('状态更新失败')
    }
  }

  /**
   * 弹窗提交处理
   */
  const handleDialogSubmit = () => {
    refreshData()
  }
</script>

<style lang="scss" scoped>
  .device-page {
    :deep(.device) {
      .device-image {
        flex-shrink: 0;
      }

      > div {
        margin-left: 10px;

        .device-name {
          font-weight: 500;
          color: var(--art-text-gray-800);
        }

        .device-type {
          color: var(--el-text-color-secondary);
          font-size: 12px;
        }
      }
    }
  }
</style>
