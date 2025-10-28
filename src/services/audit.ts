import api from '@/utils/http'

/**
 * Audit service - 调用后端真实 API
 * 对应 OpenAPI: /api/audit/**
 */

export type MaintenanceRecord = {
  id: string
  deviceId: string
  start: string
  end?: string | null
  durationMinutes?: number
  reason?: string
  technician?: string
}

export type AuditDevice = {
  id: string
  deviceId?: string
  deviceName: string
  deviceType: string
  department?: string
  user?: string
  borrowTime: string
  expectedReturn?: string | null
  returnTime?: string | null
  status: string
  isOverdue?: boolean
  overdueDays?: number
  maintenanceRecords?: MaintenanceRecord[]
}

export type PagedResult<T> = {
  total: number
  page: number
  size: number
  items: T[]
}

/** 获取设备借用/审计记录（分页） */
export function fetchAuditDevices(params?: {
  page?: number
  size?: number
  deviceType?: string
  department?: string
  user?: string
  status?: string
  start?: string
  end?: string
  overdueOnly?: boolean
  sort?: string
}) {
  return api.get<PagedResult<AuditDevice>>({ url: '/audit/devices', params })
}

/** 获取单个设备详细 */
export function fetchAuditDeviceById(id: string) {
  return api.get<AuditDevice>({ url: `/audit/devices/${id}` })
}

/** 提交借用申请 */
export function submitBorrowRequest(payload: { deviceId?: string; deviceType?: string; user: string; department?: string; expectedReturn: string; reason?: string }) {
  return api.post<{ success: boolean; requestId?: string }>({ url: '/audit/borrow-requests', data: payload })
}

/** 导出借用记录（返回二进制） */
export function exportAuditDevices(params?: { format?: 'csv' | 'xlsx' }) {
  return api.get<Blob>({ url: '/audit/devices/export', params, responseType: 'blob' as any })
}

/** 获取维护记录（分页） */
export function fetchMaintenanceRecords(params?: { page?: number; size?: number; deviceId?: string; deviceType?: string; start?: string; end?: string }) {
  return api.get<PagedResult<MaintenanceRecord>>({ url: '/audit/maintenance', params })
}

/** 获取维护统计（按设备类型） */
export function fetchMaintenanceStats(params?: { start?: string; end?: string; groupBy?: string }) {
  return api.get<Array<{ deviceType: string; avgMaintenanceMinutes: number; maintenanceCount: number }>>({ url: '/audit/maintenance/stats', params })
}

/** 借用统计（按部门/设备类型/时间） */
export function fetchBorrowStats(params?: { start?: string; end?: string; groupBy?: string; top?: number }) {
  return api.get<Array<{ department?: string; borrowCount: number; overdueCount: number; overdueRate: number }>>({ url: '/audit/borrow/stats', params })
}

/** 人员 Top N */
export function fetchPersonnelTop(params?: { start?: string; end?: string; top?: number }) {
  return api.get<Array<{ user: string; department?: string; borrowCount: number; overdueCount: number; lastBorrow?: string }>>({ url: '/audit/personnel/top', params })
}

/** 创建异步导出任务（可选） */
export function createExportJob(payload: { query?: any; format?: 'csv' | 'xlsx' }) {
  return api.post<{ jobId: string; status: string }>({ url: '/audit/export-job', data: payload })
}

/** 查询导出任务状态 */
export function getExportJobStatus(id: string) {
  return api.get<{ jobId: string; status: string; downloadUrl?: string }>({ url: `/audit/export-job/${id}/status` })
}

export default {
  fetchAuditDevices,
  fetchAuditDeviceById,
  submitBorrowRequest,
  exportAuditDevices,
  fetchMaintenanceRecords,
  fetchMaintenanceStats,
  fetchBorrowStats,
  fetchPersonnelTop,
  createExportJob,
  getExportJobStatus
}
