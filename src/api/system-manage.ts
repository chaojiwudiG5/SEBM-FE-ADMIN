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

// 获取设备列表
export function fetchGetDeviceList(params: Api.SystemManage.DeviceSearchParams) {
  return request.get<Api.SystemManage.DeviceList>({
    url: '/device/list',
    params
  })
}

// 添加设备
export function fetchAddDevice(data: Api.SystemManage.DeviceAddParams) {
  return request.post({
    url: '/device/add',
    data
  })
}

// 更新设备
export function fetchUpdateDevice(data: Api.SystemManage.DeviceUpdateParams) {
  return request.put({
    url: '/device/update',
    data
  })
}

// 删除设备
export function fetchDeleteDevice(id: number) {
  return request.del({
    url: `/device/${id}`
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
