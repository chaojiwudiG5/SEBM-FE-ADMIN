declare namespace Http {
  /** 基础响应 */
  interface BaseResponse<T = unknown> {
    // 状态码
    code: number
    // 消息（兼容 msg 和 message 字段）
    msg?: string
    message?: string
    // 数据
    data: T
  }
}
