import request from '@/utils/http'
import { AppRouteRecord } from '@/types/router'
import { asyncRoutes } from '@/router/routes/asyncRoutes'
import { menuDataToRouter } from '@/router/utils/menuToRouter'

// 获取用户列表 - 管理员专有，使用POST方法
export function fetchGetUserList(params: Api.SystemManage.UserSearchParams) {
  console.log('🚀 调用用户列表API，参数:', params)
  return request.post<Api.SystemManage.UserList>({
    url: '/user/admin/getUserList',
    data: params  // POST请求使用data而不是params
  })
}

// 添加用户 - 管理员专有
export function fetchAddUser(data: Api.SystemManage.UserAddParams) {
  console.log('🚀 调用添加用户API，数据:', data)
  return request.post<number>({
    url: '/user/admin/addUser',
    data
  })
}

// 更新用户 - 管理员专有
export function fetchUpdateUser(data: Api.SystemManage.UserUpdateParams) {
  console.log('🚀 调用更新用户API，数据:', data)
  return request.post<Api.SystemManage.UserListItem>({
    url: '/user/admin/updateUser',
    data
  })
}

// 删除用户 - 管理员专有，物理删除
export function fetchDeleteUser(id: number) {
  console.log('🗑️ 调用删除用户API，ID:', id)
  return request.post<boolean>({
    url: '/user/admin/deleteUser',
    data: { id }
  })
}

// 获取角色列表
export function fetchGetRoleList(params: Api.SystemManage.RoleSearchParams) {
  return request.get<Api.SystemManage.RoleList>({
    url: '/role/list',
    params
  })
}

// 获取设备列表 - 公开接口，分页查询
export function fetchGetDeviceList(params: Api.SystemManage.DeviceSearchParams) {
  console.log('🚀 调用设备列表API，参数:', params)
  return request.post<Api.SystemManage.DeviceList>({
    url: '/device/getDeviceList',
    data: params // 使用POST请求和data参数
  })
}

// 获取所有用户维修报单（管理员查看）
export function fetchGetUserMaintenanceList(params: Api.SystemManage.Maintenance.UserMaintenanceRecordSearchParams) {
  console.log('🚀 调用用户维修报单列表API，参数:', params)
  return request.post<Api.SystemManage.Maintenance.UserMaintenanceRecordList>({
    url: '/userMaintenanceRecord/getAllList',
    data: params
  })
}

// 分配维修任务给技工（管理员）
export function fetchAssignMechanicToMaintenance(data: { userMaintenanceRecordId: number; mechanicId: number }) {
  console.log('🚀 调用分配维修任务 API，参数:', data)
  // 后端要求 URL 参数形式，这里使用 POST body 兼容处理
  return request.post<number>({
    url: '/mechanicanMaintenanceRecord/add',
    data
  })
}

// 获取单个设备详情 - 公开接口
export function fetchGetDevice(id: number) {
  console.log('🚀 调用设备详情API，ID:', id)
  return request.get<Api.SystemManage.DeviceListItem>({
    url: `/device/getDevice/${id}`
  })
}

// 添加设备 - 管理员专有
export function fetchAddDevice(data: Api.SystemManage.DeviceAddParams) {
  console.log('🚀 调用添加设备API，数据:', data)
  return request.post<number>({
    url: '/device/addDevice',
    data
  })
}

// 获取模版列表
export function fetchGetTemplateList(params: Api.SystemManage.TemplateSearchParams) {
  console.log('🚀 调用模版列表API，参数:', params)
  return request.post<Api.SystemManage.TemplateList>({
    url: '/template/list',
    data: params
  })
}

// 添加模版
export function fetchAddTemplate(data: Api.SystemManage.TemplateAddParams) {
  console.log('🚀 调用添加模版API，数据:', data)
  return request.post<number>({
    url: '/template/create',
    data
  })
}

// 更新模版
export function fetchUpdateTemplate(data: Api.SystemManage.TemplateUpdateParams) {
  console.log('🚀 调用更新模版API，数据:', data)
  return request.post<Api.SystemManage.TemplateListItem>({
    url: '/template/updateTemplate',
    data
  })
}

// 禁用模版
export function fetchDisableTemplate(templateId: number) {
  console.log('🚫 调用禁用模版API，ID:', templateId)
  return request.post<boolean>({
    url: `/template/disable/${templateId}`,
    data: {}
  })
}

// 启用模版
export function fetchEnableTemplate(templateId: number) {
  console.log('✅ 调用启用模版API，ID:', templateId)
  return request.post<boolean>({
    url: `/template/enable/${templateId}`,
    data: {}
  })
}

// 获取通知记录列表（旧接口）
export function fetchGetNotificationRecordList(params: Api.SystemManage.NotificationRecordSearchParams) {
  // 设置默认管理员角色
  const requestData = {
    ...params,
    queryRole: params.queryRole ?? 0  // 默认为 0（管理员）
  }
  console.log('🚀 调用通知记录列表API，参数:', requestData)
  return request.post<Api.SystemManage.NotificationRecordList>({
    url: '/notification/record/list',
    data: requestData
  })
}

// 查询所有已发送通知记录 - 管理员接口
export function queryAllSentNotifications(data: {
  pageNumber: number
  pageSize: number
  userId?: number | string       // 用户ID（可选）
  titleKeyword?: string          // 标题关键词（可选）
  readStatus?: number            // 已读状态：0=未读，1=已读（可选）
  isDelete?: number              // 删除状态：0=未删除，1=已删除（可选）
  notificationRole?: number      // 通知角色：0=管理员，1=用户，2=技工（可选）
  startTime?: number             // 开始时间，秒级时间戳（可选）
  endTime?: number               // 结束时间，秒级时间戳（可选）
}) {
  console.log('🚀 调用查询所有已发送通知记录API，参数:', data)
  return request.post({
    url: '/notification/record/admin/listAll',
    data
  })
}

// 更新设备
export function fetchUpdateDevice(data: Api.SystemManage.DeviceUpdateParams) {
  console.log('🚀 调用更新设备API，数据:', data)
  return request.post<Api.SystemManage.DeviceListItem>({
    url: '/device/updateDevice',
    data
  })
}

// 删除设备 - 管理员专有
export function fetchDeleteDevice(id: number) {
  console.log('🗑️ 调用删除设备API，ID:', id)
  return request.post<boolean>({
    url: '/device/deleteDevice',
    data: { id }
  })
}

// 更新设备状态 - 公开接口（借还设备等）
export function fetchUpdateDeviceStatus(data: { deviceId: number; status: number }) {
  console.log('🚀 调用更新设备状态API，数据:', data)
  return request.post<boolean>({
    url: '/device/updateDeviceStatus',
    data
  })
}

interface MenuResponse {
  menuList: AppRouteRecord[]
}

// 获取菜单数据（模拟）
// 当前使用本地模拟路由数据，实际项目中请求接口返回 asyncRoutes.ts 文件的数据
export async function fetchGetMenuList(delay = 300): Promise<MenuResponse> {
  try {
    // 模拟接口返回的菜单数据
    const menuData = asyncRoutes
    // 处理菜单数据
    const menuList = menuData.map((route) => menuDataToRouter(route))
    // 模拟接口延迟
    await new Promise((resolve) => setTimeout(resolve, delay))

    return { menuList }
  } catch (error) {
    throw error instanceof Error ? error : new Error('获取菜单失败')
  }
}

// 获取消息/模板列表
export function fetchTemplateList(data: { 
  pageNumber: number
  pageSize: number
  queryRole?: number // 默认为管理员角色（0-管理员，1-用户）
  readStatus?: number // 0=未读，1=已读
}) {
  // 设置默认管理员角色
  const requestData = {
    ...data,
    queryRole: data.queryRole ?? 0  // 默认为 0（管理员）
  }
  console.log('🚀 调用模板列表 API，参数:', requestData)
  return request.post({
    url: '/notification/record/list',
    data: requestData
  })
}

// 批量标记消息为已读
export function batchMarkAsRead(data: { ids: number[] }) {
  console.log('🚀 批量标记为已读 API，参数:', data)
  return request.post({
    url: '/notification/record/batchMarkAsRead',
    data
  })
}

// 标记全部未读消息为已读
export function markAllAsRead(userId: number, userRole: number = 1) {
  console.log('🚀 标记全部为已读 API，userId:', userId, 'userRole:', userRole)
  return request.post({
    url: `/notification/record/markAllAsRead?userId=${userId}&userRole=${userRole}`,  // 添加 userRole 参数，默认为 1（特殊处理）
    data: {}
  })
}

// 批量删除消息
export function batchDeleteMessages(data: { ids: number[] }) {
  console.log('🚀 批量删除消息 API，参数:', data)
  return request.post({
    url: '/notification/record/batchDelete',
    data
  })
}

// 删除单条消息
export function deleteMessage(data: { id: number }) {
  console.log('🚀 删除单条消息 API，参数:', data)
  return request.post({
    url: '/notification/record/delete',
    data
  })
}
