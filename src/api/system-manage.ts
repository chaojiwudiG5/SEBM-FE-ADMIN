import request from '@/utils/http'
import { AppRouteRecord } from '@/types/router'
import { asyncRoutes } from '@/router/routes/asyncRoutes'
import { menuDataToRouter } from '@/router/utils/menuToRouter'

// 获取用户列表
export function fetchGetUserList(params: Api.SystemManage.UserSearchParams) {
  return request.get<Api.SystemManage.UserList>({
    url: '/api/user/list',
    params
  })
}

// 获取角色列表
export function fetchGetRoleList(params: Api.SystemManage.RoleSearchParams) {
  return request.get<Api.SystemManage.RoleList>({
    url: '/api/role/list',
    params
  })
}

// 获取设备列表
export function fetchGetDeviceList(params: Api.SystemManage.DeviceSearchParams) {
  return request.get<Api.SystemManage.DeviceList>({
    url: '/api/device/list',
    params
  })
}

// 添加设备
export function fetchAddDevice(data: Api.SystemManage.DeviceAddParams) {
  return request.post({
    url: '/api/device/add',
    data
  })
}

// 获取模版列表
export function fetchGetTemplateList(params: Api.SystemManage.TemplateSearchParams) {
  return request.get<Api.SystemManage.TemplateList>({
    url: '/api/template/list',
    params
  })
}

// 添加模版
export function fetchAddTemplate(data: Api.SystemManage.TemplateAddParams) {
  return request.post({
    url: '/api/template/add',
    data
  })
}

// 更新模版
export function fetchUpdateTemplate(data: Api.SystemManage.TemplateUpdateParams) {
  return request.put({
    url: '/api/template/update',
    data
  })
}

// 删除模版
export function fetchDeleteTemplate(ids: number[]) {
  return request.del({
    url: '/api/template/delete',
    data: { ids }
  })
}

// 更新设备
export function fetchUpdateDevice(data: Api.SystemManage.DeviceUpdateParams) {
  return request.put({
    url: '/api/device/update',
    data
  })
}

// 删除设备
export function fetchDeleteDevice(id: number) {
  return request.del({
    url: `/api/device/${id}`
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
