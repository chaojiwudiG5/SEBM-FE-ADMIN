import request from '@/utils/http'

/**
 * 登录
 * @param data 登录参数
 * @returns 登录响应
 */
export function fetchLogin(data: Api.Auth.LoginParams) {
  console.log('🔐 [Login API] 发送登录请求:', {
    url: '/user/login',
    data: {
      username: data.username,
      password: '***' // 不显示真实密码
    },
    timestamp: new Date().toISOString()
  })

  return request
    .post<Api.Auth.LoginResponse>({
      url: '/user/login', // 去掉/api前缀，因为baseURL已包含
      data,
      showErrorMessage: true
    })
    .then((response) => {
      console.log('✅ [Login API] 登录请求成功:', response)
      return response
    })
    .catch((error) => {
      console.error('❌ [Login API] 登录请求失败:', {
        message: error.message,
        code: error.code,
        response: error.response,
        stack: error.stack
      })
      throw error
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
