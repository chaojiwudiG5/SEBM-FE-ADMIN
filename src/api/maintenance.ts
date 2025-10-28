import request from '@/utils/http'

/**
 * 获取所有维修报单
 */
export function getAllMaintenanceRecords(params: Api.SystemManage.Maintenance.UserMaintenanceRecordSearchParams) {
  return request.post<{
    code: number
    data: {
      id: number
      deviceName: string
      userId: number
      description: string | null
      image: string | null
      status: number
      createTime: string
      updateTime: string
    }[]
    message: string
  }>({
    url: '/userMaintenanceRecord/getAllList',
    data: params,
    showErrorMessage: true
  })
}

/**
 * 获取技工列表
 */
export function getTechnicianList(params: { pageNumber: number; pageSize: number }) {
  return request.post<Api.SystemManage.UserList>({
    url: '/user/admin/getUserList',
    data: params,
    showErrorMessage: true
  })
}

/**
 * 分配维修任务给技工
 */
export function assignMaintenanceTask(params: {
    userMaintenanceRecordId: number
    mechanicId: number
}) {
  return request.post<{ code: number; data: number; message: string }>({
    url: '/mechanicanMaintenanceRecord/add?userMaintenanceRecordId=' + params.userMaintenanceRecordId + '&mechanicId=' + params.mechanicId,
    showErrorMessage: true
  })
}