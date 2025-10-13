<!-- 模版管理 -->
<template>
  <div class="template-page art-full-height">
    <!-- 搜索栏 -->
    <TemplateSearch
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchForm"
      @quickSearch="handleQuickSearch"
    ></TemplateSearch>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="showDialog('add')" v-ripple>
              <template #icon>
                <i class="iconfont-sys">&#xe6a0;</i>
              </template>
              新增模版
            </ElButton>
            
            
          </ElSpace>
        </template>
        <template #right>
          <ElSpace>
            <ElText type="info" size="small">
              已选择 {{ selectedRows.length }} 项
              <span v-if="selectedRows.length === 1" style="color: var(--el-color-success);">
                （可预览）
              </span>
              <span v-else-if="selectedRows.length > 1" style="color: var(--el-color-warning);">
                （仅支持单个预览）
              </span>
            </ElText>
            <ElButton 
              size="small" 
              :disabled="selectedRows.length === 0"
              @click="clearSelection"
            >
              清空选择
            </ElButton>
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
        <template #operation="{ row }">
          <div class="table-action">
            <ArtButtonTable type="view" @click="() => showDetail(row)" />
            <ArtButtonTable type="edit" @click="() => showDialog('edit', row)" />
            <ElButton size="small" type="success" @click="() => handleCopy(row)">复制</ElButton>
            <ElButton size="small" type="info" @click="() => handlePreview(row)">预览</ElButton>
            <ElButton
              v-if="row.status === '1'"
              size="small"
              type="danger"
              @click="() => handleDisable([row])"
            >禁用</ElButton>
            <ElButton
              v-else
              size="small"
              type="success"
              @click="() => handleEnable([row])"
            >启用</ElButton>
          </div>
        </template>
      </ArtTable>

      <!-- 模版弹窗 -->
      <TemplateDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :template-data="currentTemplateData"
        @submit="handleDialogSubmit"
      />

      <!-- 模版详情弹窗 -->
      <TemplateDetail
        v-model:visible="detailVisible"
        :template-data="currentTemplateData"
        @edit="handleDetailEdit"
      />

      <!-- 模版预览弹窗 -->
      <TemplatePreview
        v-model:visible="previewVisible"
        :template-data="currentTemplateData"
        @edit="handlePreviewEdit"
        @copy="handlePreviewCopy"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { h } from 'vue'
  import { ElMessageBox, ElMessage, ElTag, ElButton } from 'element-plus'
  import { useTable } from '@/composables/useTable'
  import { fetchGetTemplateList, fetchDisableTemplate, fetchEnableTemplate, fetchAddTemplate } from '@/api/system-manage'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import TemplateSearch from './modules/template-search.vue'
  import TemplateDialog from './modules/template-dialog.vue'
  import TemplateDetail from './modules/template-detail.vue'
  import TemplatePreview from './modules/template-preview.vue'

  defineOptions({ name: 'Template' })

  type TemplateListItem = Api.SystemManage.TemplateListItem

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const detailVisible = ref(false)
  const previewVisible = ref(false)
  const currentTemplateData = ref<Partial<TemplateListItem>>({})

  // 选中行
  const selectedRows = ref<TemplateListItem[]>([])

  // 搜索表单
  const searchForm = ref({
    templateTitle: undefined,
    notificationNode: undefined,
    notificationMethod: undefined,
    notificationEvent: undefined,
    notificationType: undefined,
    notificationRole: undefined,
    createTimeRange: undefined,
    templateDesc: undefined,
    relateTimeOffsetMin: undefined,
    relateTimeOffsetMax: undefined
  })


  // 通知节点配置
  const NOTIFICATION_NODE_CONFIG = {
    0: { type: 'info' as const, text: '未知节点' },
    1: { type: 'primary' as const, text: '租借审批成功' },
    2: { type: 'info' as const, text: '未知节点' },
    3: { type: 'warning' as const, text: '到期提醒' }
  } as const

  // 通知方式配置
  const NOTIFICATION_METHOD_CONFIG = {
    0: { type: 'info' as const, text: '未知方式' },
    1: { type: 'primary' as const, text: '邮件' },
    2: { type: 'success' as const, text: '短信' },
    3: { type: 'warning' as const, text: '站内信' }
  } as const

  // 通知角色配置
  const NOTIFICATION_ROLE_CONFIG = {
    0: { type: 'primary' as const, text: '管理员' },
    1: { type: 'success' as const, text: '借用人' },
    2: { type: 'warning' as const, text: '技术人员' },
    3: { type: 'info' as const, text: '未知角色' }
  } as const

  // 通知类型配置
  const NOTIFICATION_TYPE_CONFIG = {
    [-1]: { type: 'warning' as const, text: '提前通知' },
    0: { type: 'primary' as const, text: '即时通知' },
    1: { type: 'success' as const, text: '延迟通知' }
  } as const


  /**
   * 获取通知节点配置
   */
  const getNotificationNodeConfig = (node: number) => {
    return (
      NOTIFICATION_NODE_CONFIG[node as keyof typeof NOTIFICATION_NODE_CONFIG] || {
        type: 'info' as const,
        text: '未知'
      }
    )
  }

  /**
   * 获取通知方式配置
   */
  const getNotificationMethodConfig = (method: number) => {
    return (
      NOTIFICATION_METHOD_CONFIG[method as keyof typeof NOTIFICATION_METHOD_CONFIG] || {
        type: 'info' as const,
        text: '未知'
      }
    )
  }

  /**
   * 获取通知角色配置
   */
  const getNotificationRoleConfig = (role: number) => {
    return (
      NOTIFICATION_ROLE_CONFIG[role as keyof typeof NOTIFICATION_ROLE_CONFIG] || {
        type: 'info' as const,
        text: '未知'
      }
    )
  }


  /**
   * 获取通知类型配置
   */
  const getNotificationTypeConfig = (type: number) => {
    return (
      NOTIFICATION_TYPE_CONFIG[type as keyof typeof NOTIFICATION_TYPE_CONFIG] || {
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
      // 数据获取
      apiFn: fetchGetTemplateList,
      // 初始参数
      apiParams: {
        pageNumber: 1,
        pageSize: 10,
        ...searchForm.value
      },
      // 分页字段映射：告诉useTable前端使用的字段名
      paginationKey: {
        current: 'pageNumber',
        size: 'pageSize'
      },
      // 立即加载
      immediate: true,
      // 表格列配置
      columnsFactory: () => [
      { type: 'selection', width: 60, fixed: 'left' },
      {
        prop: 'templateTitle',
        label: '模版标题',
        minWidth: 180,
        showOverflowTooltip: true,
        search: true
      },
      {
        prop: 'notificationNode',
        label: '通知节点',
        width: 120,
        search: true,
        formatter: (data: TemplateListItem) => {
          console.log('通知节点数据:', data.notificationNode)
          const config = getNotificationNodeConfig(data.notificationNode)
          console.log('通知节点配置:', config)
          // 直接返回文本进行测试
          return config.text || '未知'
        }
      },
      {
        prop: 'notificationMethod',
        label: '通知方式',
        width: 150,
        search: true,
        formatter: (data: TemplateListItem) => {
          console.log('通知方式数据:', data.notificationMethod)
          if (!data.notificationMethod || data.notificationMethod.length === 0) return '-'
          return data.notificationMethod.map(method => {
            const config = getNotificationMethodConfig(method)
            return config.text || '未知'
          }).join(', ')
        }
      },
      {
        prop: 'notificationRole',
        label: '通知角色',
        width: 120,
        formatter: (data: TemplateListItem) => {
          console.log('通知角色数据:', data.notificationRole)
          if (!data.notificationRole) return '-'
          const config = getNotificationRoleConfig(data.notificationRole)
          console.log('通知角色配置:', config)
          return config.text || '未知'
        }
      },
      {
        prop: 'notificationEvent',
        label: '通知事件',
        width: 120,
        search: true,
        showOverflowTooltip: true
      },
      {
        prop: 'notificationType',
        label: '通知类型',
        width: 120,
        search: true,
        formatter: (data: TemplateListItem) => {
          console.log('通知类型数据:', data.notificationType)
          if (!data.notificationType) return '-'
          const config = getNotificationTypeConfig(data.notificationType)
          console.log('通知类型配置:', config)
          return config.text || '未知'
        }
      },
      {
        prop: 'status',
        label: '状态',
        width: 100,
        formatter: (row: TemplateListItem) => {
          const isEnabled = row.status === '1'
          return h(ElTag, { type: isEnabled ? 'success' : 'info' }, () => (isEnabled ? '启用' : '禁用'))
        }
      },
      {
        prop: 'relateTimeOffset',
        label: '时间偏移(秒)',
        width: 120,
        formatter: (data: TemplateListItem) => {
          return data.relateTimeOffset || '-'
        }
      },
      {
        prop: 'templateDesc',
        label: '模版描述',
        minWidth: 200,
        showOverflowTooltip: true,
        formatter: (data: TemplateListItem) => {
          return data.templateDesc || '-'
        }
      },
      {
        prop: 'createTime',
        label: '创建时间',
        width: 180,
        formatter: (data: TemplateListItem) => {
          return data.createTime ? new Date(data.createTime).toLocaleString() : '-'
        }
      },
      {
        prop: 'operation',
        label: '操作',
        width: 360,
        fixed: 'right',
        useSlot: true
      }
    ]
    }
  })

  /**
   * 显示弹窗
   */
  const showDialog = (type: Form.DialogType, templateData?: TemplateListItem) => {
    dialogType.value = type
    currentTemplateData.value = templateData ? { ...templateData } : {}
    dialogVisible.value = true
  }

  /**
   * 处理弹窗提交
   */
  const handleDialogSubmit = () => {
    dialogVisible.value = false
    refreshData()
  }

  /**
   * 显示模版详情
   */
  const showDetail = (templateData: TemplateListItem) => {
    console.log('显示模版详情:', templateData)
    currentTemplateData.value = { ...templateData }
    detailVisible.value = true
  }

  /**
   * 处理详情编辑
   */
  const handleDetailEdit = (templateData: Partial<TemplateListItem>) => {
    showDialog('edit', templateData as TemplateListItem)
  }

  /**
   * 处理启用
   */
  const handleEnable = async (templateList: TemplateListItem[]) => {
    const templateTitles = templateList.map((item) => item.templateTitle).join('、')

    try {
      await ElMessageBox.confirm(`确认启用模版：${templateTitles}？`, '提示', {
        type: 'info'
      })

      // 逐个启用模板（本地即时回显）
      for (const template of templateList) {
        await fetchEnableTemplate(template.id)
        template.status = '1'
      }

      ElMessage.success('启用成功')
    } catch (error) {
      // 用户取消启用
    }
  }

  /**
   * 处理禁用
   */
  const handleDisable = async (templateList: TemplateListItem[]) => {
    const templateTitles = templateList.map((item) => item.templateTitle).join('、')

    try {
      await ElMessageBox.confirm(`确认禁用模版：${templateTitles}？`, '提示', {
        type: 'warning'
      })

      // 逐个禁用模板（本地即时回显）
      for (const template of templateList) {
        await fetchDisableTemplate(template.id)
        template.status = '2'
      }

      ElMessage.success('禁用成功')
    } catch (error) {
      // 用户取消禁用
    }
  }

  /**
   * 处理搜索
   */
  const handleSearch = () => {
    console.log('搜索参数:', searchForm.value)
    // 更新搜索参数
    Object.assign(searchParams, searchForm.value)
    console.log('更新后的searchParams:', searchParams)
    // 重置到第一页
    searchParams.pageNumber = 1
    getData()
  }

  /**
   * 处理快速搜索
   */
  const handleQuickSearch = () => {
    console.log('快速搜索')
    // 重置搜索参数
    Object.keys(searchForm.value).forEach(key => {
      (searchParams as any)[key] = undefined
    })
    // 重置到第一页
    searchParams.pageNumber = 1
    getData()
  }

  /**
   * 处理选择变化
   */
  const handleSelectionChange = (selection: TemplateListItem[]) => {
    selectedRows.value = selection
  }

  /**
   * 重置搜索参数
   */
  const resetSearchForm = () => {
    searchForm.value = {
      templateTitle: undefined,
      notificationNode: undefined,
      notificationMethod: undefined,
      notificationEvent: undefined,
      notificationType: undefined,
      notificationRole: undefined,
      createTimeRange: undefined,
      templateDesc: undefined,
      relateTimeOffsetMin: undefined,
      relateTimeOffsetMax: undefined
    }
    // 清空搜索参数
    Object.keys(searchForm.value).forEach(key => {
      (searchParams as any)[key] = undefined
    })
    // 重置到第一页
    searchParams.pageNumber = 1
    console.log('重置后的searchParams:', searchParams)
    getData()
  }

  /**
   * 复制模版
   */
  const handleCopy = (templateData: TemplateListItem) => {
    const copyData = {
      ...templateData,
      templateTitle: `${templateData.templateTitle} - 副本`,
      id: undefined
    }
    showDialog('add', copyData as any)
  }

  /**
   * 预览模版
   */
  const handlePreview = (templateData: TemplateListItem) => {
    currentTemplateData.value = { ...templateData }
    previewVisible.value = true
  }

  /**
   * 处理预览编辑
   */
  const handlePreviewEdit = (templateData: Partial<TemplateListItem>) => {
    previewVisible.value = false
    showDialog('edit', templateData as TemplateListItem)
  }

  /**
   * 处理预览复制
   */
  const handlePreviewCopy = (templateData: Partial<TemplateListItem>) => {
    previewVisible.value = false
    handleCopy(templateData as TemplateListItem)
  }

  /**
   * 批量复制
   */
  const handleBatchCopy = () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请先选择要复制的模版')
      return
    }

    ElMessageBox.confirm(
      `确认复制选中的 ${selectedRows.value.length} 个模版吗？`,
      '批量复制确认',
      {
        type: 'info',
        confirmButtonText: '确认复制',
        cancelButtonText: '取消'
      }
    ).then(async () => {
      try {
        // 这里可以实现批量复制的逻辑
        // 由于API可能不支持批量复制，我们可以逐个复制
        for (const template of selectedRows.value) {
          const copyData = {
            ...template,
            templateTitle: `${template.templateTitle} - 副本`,
            id: undefined
          }
          await fetchAddTemplate(copyData as any)
        }
        
        ElMessage.success(`成功复制 ${selectedRows.value.length} 个模版`)
        clearSelection()
        refreshData()
      } catch (error) {
        ElMessage.error('批量复制失败')
        console.error('批量复制失败:', error)
      }
    }).catch(() => {
      // 用户取消
    })
  }

  /**
   * 批量禁用
   */
  const handleBatchDisable = () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请先选择要禁用的模版')
      return
    }

    const templateTitles = selectedRows.value.map(item => item.templateTitle).join('、')
    ElMessageBox.confirm(
      `确认禁用选中的 ${selectedRows.value.length} 个模版：${templateTitles}？`,
      '批量禁用确认',
      {
        type: 'warning',
        confirmButtonText: '确认禁用',
        cancelButtonText: '取消'
      }
    ).then(async () => {
      try {
        // 逐个禁用模板
        for (const template of selectedRows.value) {
          await fetchDisableTemplate(template.id)
        }
        ElMessage.success(`成功禁用 ${selectedRows.value.length} 个模版`)
        clearSelection()
        refreshData()
      } catch (error) {
        ElMessage.error('批量禁用失败')
        console.error('批量禁用失败:', error)
      }
    }).catch(() => {
      // 用户取消
    })
  }

  /**
   * 单个模版预览
   */
  const handleSinglePreview = () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请先选择一个模版')
      return
    }

    if (selectedRows.value.length > 1) {
      ElMessage.warning('预览功能只支持单个模版，请只选择一个模版')
      return
    }

    // 显示选中的模版详情
    const template = selectedRows.value[0]
    currentTemplateData.value = { ...template }
    detailVisible.value = true
  }

  /**
   * 清空选择
   */
  const clearSelection = () => {
    selectedRows.value = []
    // 这里需要调用表格的清空选择方法
    // 由于我们使用的是 useTable，可能需要通过 ref 来访问表格实例
  }
</script>

<style lang="scss" scoped>
  .template-page {
    padding: 0;

    .art-table-card {
      margin-top: 16px;
    }
  }

  .table-action {
    display: flex;
    align-items: center;
    gap: 8px;
  }
</style>
