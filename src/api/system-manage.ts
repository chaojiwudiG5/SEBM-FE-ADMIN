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

// 更新设备 - 管理员专有
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
export function fetchTemplateList(data: { pageNumber: number; pageSize: number; queryRole: number }) {
  console.log('🚀 调用模板列表 API，参数:', data)
  return request.post({
    url: '/template/list',
    data
  })
}
