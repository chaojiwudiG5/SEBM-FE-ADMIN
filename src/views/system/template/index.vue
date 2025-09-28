<!-- 模版管理 -->
<template>
  <div class="template-page art-full-height">
    <!-- 搜索栏 -->
    <TemplateSearch
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    ></TemplateSearch>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple>新增模版</ElButton>
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

      <!-- 模版弹窗 -->
      <TemplateDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :template-data="currentTemplateData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElMessageBox, ElMessage, ElTag, ElButton } from 'element-plus'
  import { useTable } from '@/composables/useTable'
  import { fetchGetTemplateList, fetchDeleteTemplate } from '@/api/system-manage'
  import TemplateSearch from './modules/template-search.vue'
  import TemplateDialog from './modules/template-dialog.vue'

  defineOptions({ name: 'Template' })

  type TemplateListItem = Api.SystemManage.TemplateListItem

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentTemplateData = ref<Partial<TemplateListItem>>({})

  // 选中行
  const selectedRows = ref<TemplateListItem[]>([])

  // 搜索表单
  const searchForm = ref({
    templateTitle: undefined,
    templateType: undefined,
    notificationNode: undefined,
    notificationMethod: undefined
  })

  // 模版类型配置
  const TEMPLATE_TYPE_CONFIG = {
    email: { type: 'primary' as const, text: '邮件模版' },
    sms: { type: 'success' as const, text: '短信模版' },
    push: { type: 'warning' as const, text: '推送模版' },
    wechat: { type: 'info' as const, text: '微信模版' }
  } as const

  // 通知节点配置
  const NOTIFICATION_NODE_CONFIG = {
    1: { type: 'primary' as const, text: '设备故障' },
    2: { type: 'warning' as const, text: '维护提醒' },
    3: { type: 'success' as const, text: '状态更新' },
    4: { type: 'info' as const, text: '系统通知' }
  } as const

  // 通知方式配置
  const NOTIFICATION_METHOD_CONFIG = {
    1: { type: 'primary' as const, text: '邮件' },
    2: { type: 'success' as const, text: '短信' },
    3: { type: 'warning' as const, text: '推送' },
    4: { type: 'info' as const, text: '微信' }
  } as const

  // 通知角色配置
  const NOTIFICATION_ROLE_CONFIG = {
    1: { type: 'primary' as const, text: '管理员' },
    2: { type: 'success' as const, text: '技术员' },
    3: { type: 'warning' as const, text: '普通用户' },
    4: { type: 'info' as const, text: '所有用户' }
  } as const

  /**
   * 获取模版类型配置
   */
  const getTemplateTypeConfig = (type: string) => {
    return (
      TEMPLATE_TYPE_CONFIG[type as keyof typeof TEMPLATE_TYPE_CONFIG] || {
        type: 'info' as const,
        text: '未知'
      }
    )
  }

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
        current: 1,
        size: 10,
        ...searchForm.value
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
        prop: 'templateType',
        label: '模版类型',
        width: 120,
        search: true,
        render: (data: TemplateListItem) => {
          const config = getTemplateTypeConfig(data.templateType)
          return h(ElTag, { type: config.type }, () => config.text)
        }
      },
      {
        prop: 'notificationNode',
        label: '通知节点',
        width: 120,
        search: true,
        render: (data: TemplateListItem) => {
          const config = getNotificationNodeConfig(data.notificationNode)
          return h(ElTag, { type: config.type }, () => config.text)
        }
      },
      {
        prop: 'notificationMethod',
        label: '通知方式',
        width: 120,
        search: true,
        render: (data: TemplateListItem) => {
          const config = getNotificationMethodConfig(data.notificationMethod)
          return h(ElTag, { type: config.type }, () => config.text)
        }
      },
      {
        prop: 'notificationRole',
        label: '通知角色',
        width: 120,
        render: (data: TemplateListItem) => {
          if (!data.notificationRole) return '-'
          const config = getNotificationRoleConfig(data.notificationRole)
          return h(ElTag, { type: config.type }, () => config.text)
        }
      },
      {
        prop: 'relateTimeOffset',
        label: '时间偏移(秒)',
        width: 120,
        render: (data: TemplateListItem) => {
          return data.relateTimeOffset || '-'
        }
      },
      {
        prop: 'templateDesc',
        label: '模版描述',
        minWidth: 200,
        showOverflowTooltip: true,
        render: (data: TemplateListItem) => {
          return data.templateDesc || '-'
        }
      },
      {
        prop: 'createTime',
        label: '创建时间',
        width: 180,
        render: (data: TemplateListItem) => {
          return data.createTime ? new Date(data.createTime).toLocaleString() : '-'
        }
      },
      {
        prop: 'action',
        label: '操作',
        fixed: 'right',
        width: 180,
        render: (data: TemplateListItem) => {
          return h('div', { class: 'table-action' }, [
            h(
              ElButton,
              {
                type: 'primary',
                size: 'small',
                link: true,
                onClick: () => showDialog('edit', data)
              },
              () => '编辑'
            ),
            h(
              ElButton,
              {
                type: 'primary',
                size: 'small',
                link: true,
                onClick: () => handleView(data)
              },
              () => '查看'
            ),
            h(
              ElButton,
              {
                type: 'danger',
                size: 'small',
                link: true,
                onClick: () => handleDelete([data])
              },
              () => '删除'
            )
          ])
        }
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
   * 处理查看
   */
  const handleView = (templateData: TemplateListItem) => {
    showDialog('view', templateData)
  }

  /**
   * 处理删除
   */
  const handleDelete = async (templateList: TemplateListItem[]) => {
    const templateTitles = templateList.map((item) => item.templateTitle).join('、')

    try {
      await ElMessageBox.confirm(`确认删除模版：${templateTitles}？`, '提示', {
        type: 'warning'
      })

      const ids = templateList.map((item) => item.id)
      await fetchDeleteTemplate(ids)

      ElMessage.success('删除成功')
      refreshData()
    } catch (error) {
      // 用户取消删除
    }
  }

  /**
   * 处理搜索
   */
  const handleSearch = () => {
    getData()
  }

  /**
   * 处理选择变化
   */
  const handleSelectionChange = (selection: TemplateListItem[]) => {
    selectedRows.value = selection
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
