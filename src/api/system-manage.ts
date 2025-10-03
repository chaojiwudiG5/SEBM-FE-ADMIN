import request from '@/utils/http'
import { AppRouteRecord } from '@/types/router'
import { asyncRoutes } from '@/router/routes/asyncRoutes'
import { menuDataToRouter } from '@/router/utils/menuToRouter'

// 获取用户列表
export function fetchGetUserList(params: Api.SystemManage.UserSearchParams) {
  return request.post<Api.SystemManage.UserList>({
    url: '/user/admin/getUserList', // 使用后端实际接口
    data: params // POST请求使用data而不是params
  })
}

// 删除用户
export function fetchDeleteUser(id: number) {
  return request.post({
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

// 获取设备列表 - 分页查询
export function fetchGetDeviceList(params: Api.SystemManage.DeviceSearchParams) {
  return request.post<Api.SystemManage.DeviceList>({
    url: '/device/getDeviceList',
    data: params // 使用POST请求和data参数
  })
}

// 添加设备 - 管理员专有
export function fetchAddDevice(data: Api.SystemManage.DeviceAddParams) {
  return request.post({
    url: '/device/addDevice',
    data
  })
}

// 更新设备 - 管理员专有
export function fetchUpdateDevice(data: Api.SystemManage.DeviceUpdateParams) {
  return request.post({
    url: '/device/updateDevice',
    data
  })
}

// 删除设备 - 管理员专有
export function fetchDeleteDevice(id: number) {
  return request.post({
    url: '/device/deleteDevice',
    data: { id }
  })
}

// 更新设备状态 - 通用操作（借还设备等）
export function fetchUpdateDeviceStatus(data: { id: number; status: number }) {
  return request.post({
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
