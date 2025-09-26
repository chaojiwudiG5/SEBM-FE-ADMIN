<!-- 设备管理 -->
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
  import { ElMessageBox, ElMessage, ElTag, ElImage } from 'element-plus'
  import { useTable } from '@/composables/useTable'
  import { fetchGetDeviceList } from '@/api/system-manage'
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
    disabled: { type: 'info' as const, text: '停用' },
    normal: { type: 'success' as const, text: '正常' },
    maintenance: { type: 'warning' as const, text: '维修' },
    scrapped: { type: 'danger' as const, text: '报废' }
  } as const

  /**
   * 获取设备状态配置
   */
  const getDeviceStatusConfig = (status: string) => {
    return (
      DEVICE_STATUS_CONFIG[status as keyof typeof DEVICE_STATUS_CONFIG] || {
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
        current: 1,
        size: 20,
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
                src: row.image,
                previewSrcList: [row.image],
                // 图片预览是否插入至 body 元素上，用于解决表格内部图片预览样式异常
                previewTeleported: true,
                style: 'width: 40px; height: 40px; border-radius: 4px; margin-right: 10px;'
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
          width: 120,
          fixed: 'right', // 固定列
          formatter: (row) =>
            h('div', [
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => showDialog('edit', row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => deleteDevice(row)
              })
            ])
        }
      ]
    },
    // 数据处理
    transform: {
      // 数据转换器 - 替换图片
      dataTransformer: (records: any) => {
        // 类型守卫检查
        if (!Array.isArray(records)) {
          console.warn('数据转换器: 期望数组类型，实际收到:', typeof records)
          return []
        }

        // 使用本地图片替换接口返回的图片
        return records.map((item: any, index: number) => {
          return {
            ...item,
            image: DEVICE_TABLE_DATA[index % DEVICE_TABLE_DATA.length].image
          }
        })
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
      // 这里应该调用删除接口
      ElMessage.success('删除成功')
      refreshData()
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
