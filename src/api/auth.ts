import request from '@/utils/http'

/**
 * 登录
 * @param data 登录参数
 * @returns 登录响应
 */
export function fetchLogin(data: Api.Auth.LoginParams) {
  console.log('🔐 [Login API] 发送登录请求:', {
    url: '/user/login',
    data: data,
    timestamp: new Date().toISOString()
  })
  
  return request.post<Api.Auth.LoginResponse>({
    url: '/user/login', // 移除/api前缀，因为baseURL已经包含了
    data, // 使用data字段发送POST请求体
    showErrorMessage: true // 显示错误消息
  })
}

/**
 * 获取用户信息
 * @returns 用户信息
 */
export function fetchGetUserInfo() {
  return request.get<Api.Auth.UserInfo>({
    url: '/user/info'
    // 自定义请求头
    // headers: {
    //   'X-Custom-Header': 'your-custom-value'
    // }
  })
}
