<!-- 设备管理 -->
<template>
  <div class="dev  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { ElMessageBox, ElMessage, ElTag, ElImage } from 'element-plus'-page art-full-height">
    <!-- 搜索栏 -->
    <DeviceSearch
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    ></DeviceSearch>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple>新增设备</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
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
  import { DEVICE_TABLE_DATA } from '@/mock/temp/formData'
  import { ElMessageBox, ElMessage, ElTag, ElImage, ElButton } from 'element-plus'
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
      apiFn: fetchGetDeviceList,
      apiParams: {
        pageNumber: 1,     // 后端要求的页码参数
        pageSize: 20,      // 后端要求的每页条数参数
        ...searchForm.value
      },
      // 排除 apiParams 中的属性
      excludeParams: [],
      columnsFactory: () => [
        { type: 'selection' }, // 勾选列
        { type: 'index', width: 60, label: '序号' }, // 序号
        {
          prop: 'image',
          label: '设备名称',
          width: 280,
          formatter: (row) => {
            return h('div', { class: 'device', style: 'display: flex; align-items: center' }, [
              h(ElImage, {
                class: 'device-image',
                src: row.image || '/src/assets/img/common/device-placeholder.png',
                previewSrcList: row.image ? [row.image] : [],
                // 图片预览是否插入至 body 元素上，用于解决表格内部图片预览样式异常
                previewTeleported: true,
                style: 'width: 40px; height: 40px; border-radius: 4px; margin-right: 10px;',
                fit: 'cover'
              }),
              h('div', {}, [
                h(
                  'p',
                  { class: 'device-name', style: 'margin: 0; font-weight: 500;' },
                  row.deviceName
                ),
                h(
                  'p',
                  { class: 'device-type', style: 'margin: 0; color: #999; font-size: 12px;' },
                  row.deviceType
                )
              ])
            ])
          }
        },
        {
          prop: 'status',
          label: '状态',
          formatter: (row) => {
            const statusConfig = getDeviceStatusConfig(row.status)
            return h(ElTag, { type: statusConfig.type }, () => statusConfig.text)
          }
        },
        { prop: 'location', label: '设备位置' },
        { prop: 'description', label: '描述', width: 200 },
        {
          prop: 'createTime',
          label: '创建时间',
          sortable: true,
          width: 180
        },
        {
          prop: 'operation',
          label: '操作',
          width: 240,
          fixed: 'right', // 固定列
          formatter: (row) => {
            const buttons = [
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => showDialog('edit', row)
              })
            ]
            
            // 根据设备状态显示不同的操作按钮
            if (row.status === 0) {
              // 可用状态：可以借出
              buttons.push(h(ElButton, {
                type: 'primary',
                size: 'small',
                text: true,
                onClick: () => updateDeviceStatus(row, 1),
                style: { marginLeft: '8px' }
              }, { default: () => '借出' }))
            } else if (row.status === 1) {
              // 借出状态：可以归还
              buttons.push(h(ElButton, {
                type: 'success',
                size: 'small',
                text: true,
                onClick: () => updateDeviceStatus(row, 0),
                style: { marginLeft: '8px' }
              }, { default: () => '归还' }))
            } else if (row.status === 2) {
              // 维护状态：可以标记为可用
              buttons.push(h(ElButton, {
                type: 'warning',
                size: 'small',
                text: true,
                onClick: () => updateDeviceStatus(row, 0),
                style: { marginLeft: '8px' }
              }, { default: () => '修复完成' }))
            } else if (row.status === 3) {
              // 预约状态：可以取消预约
              buttons.push(h(ElButton, {
                type: 'info',
                size: 'small',
                text: true,
                onClick: () => updateDeviceStatus(row, 0),
                style: { marginLeft: '8px' }
              }, { default: () => '取消预约' }))
            }
            
            // 所有状态都可以标记为维护
            if (row.status !== 2) {
              buttons.push(h(ElButton, {
                type: 'warning',
                size: 'small',
                text: true,
                onClick: () => updateDeviceStatus(row, 2),
                style: { marginLeft: '8px' }
              }, { default: () => '标记维护' }))
            }
            
            // 管理员可以删除设备
            buttons.push(h(ArtButtonTable, {
              type: 'delete',
              onClick: () => deleteDevice(row)
            }))
            
            return h('div', { style: { display: 'flex', alignItems: 'center', gap: '4px' } }, buttons)
          }
        }
      ]
    },
    // 数据处理 - 直接使用API返回的数据
    transform: {}
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
        id: row.id,
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
    .device {
      .device-image {
        flex-shrink: 0;
      }
    }
  }
</style>
