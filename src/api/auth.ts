import request from '@/utils/http'

/**
 * 登录
 * @param data 登录参数
 * @returns 登录响应
 */
export function fetchLogin(data: Api.Auth.LoginParams) {
  return request.post<Api.Auth.LoginResponse>({
    url: '/user/login',
    data,
    showErrorMessage: true
  })
}

/**
 * 获取用户信息
 * @returns 用户信息
 */
export function fetchGetUserInfo() {
  return request.get<Api.Auth.UserInfo>({
    url: '/user/info' // 去掉/api前缀
    // 自定义请求头
    // headers: {
    //   'X-Custom-Header': 'your-custom-value'
    // }
  })
}
