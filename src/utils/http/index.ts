import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ElNotification } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { ApiStatus } from './status'
import { HttpError, handleError, showError, showSuccess } from './error'
import { $t } from '@/locales'

/** 请求配置常量 */
const REQUEST_TIMEOUT = 15000
const LOGOUT_DELAY = 500
const MAX_RETRIES = 0
const RETRY_DELAY = 1000
const UNAUTHORIZED_DEBOUNCE_TIME = 3000

/** 401防抖状态 */
let isUnauthorizedErrorShown = false
let unauthorizedTimer: NodeJS.Timeout | null = null

/** 扩展 AxiosRequestConfig */
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  showErrorMessage?: boolean
  showSuccessMessage?: boolean
}

const { VITE_API_URL, VITE_WITH_CREDENTIALS } = import.meta.env

/** Axios实例 */
const axiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT,
  baseURL: VITE_API_URL,
  withCredentials: VITE_WITH_CREDENTIALS === 'true',
  validateStatus: (status) => status >= 200 && status < 300,
  transformResponse: [
    (data, headers) => {
      const contentType = headers['content-type']
      if (contentType?.includes('application/json')) {
        try {
          return JSON.parse(data)
        } catch {
          return data
        }
      }
      return data
    }
  ]
})

/** 请求拦截器 */
axiosInstance.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
    const { accessToken } = useUserStore()
    console.log('🔑 请求拦截器 - Token存在:', !!accessToken)
    console.log('🔑 请求拦截器 - 请求URL:', request.url)
    
    if (accessToken) {
      // JWT token通常需要 Bearer 前缀
      request.headers.set('Authorization', `Bearer ${accessToken}`)
      console.log('🔑 设置Authorization头:', `Bearer ${accessToken.substring(0, 20)}...`)
    }

    if (request.data && !(request.data instanceof FormData) && !request.headers['Content-Type']) {
      request.headers.set('Content-Type', 'application/json')
      request.data = JSON.stringify(request.data)
    }

    return request
  },
  (error) => {
    showError(createHttpError($t('httpMsg.requestConfigError'), ApiStatus.error))
    return Promise.reject(error)
  }
)

/** 响应拦截器 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<Http.BaseResponse>) => {
    // 兼容 msg 和 message 字段
    const { code, msg, message } = response.data
    const errorMessage = msg || message

    // 后端返回 code: 0 表示成功，code: 200 也表示成功
    if (code === 0 || code === ApiStatus.success) return response
    
    // 处理401未授权错误
    if (code === ApiStatus.unauthorized) {
      console.error('❌ 401未授权错误:', errorMessage)
      console.error('❌ 请求URL:', response.config.url)
      handleUnauthorizedError(errorMessage)
    }

    // 处理403禁止访问错误
    if (code === ApiStatus.forbidden) {
      console.error('❌ 403禁止访问错误:', errorMessage)
      console.error('❌ 请求URL:', response.config.url)
      console.error('❌ 请求头:', response.config.headers)
      handleForbiddenError(errorMessage)
    }

    console.error('❌ HTTP错误:', { code, message: errorMessage, url: response.config.url })
    throw createHttpError(errorMessage || $t('httpMsg.requestFailed'), code)
  },
  (error) => {
    const status = error.response?.status
    const errorData = error.response?.data
    
    // 检测CORS错误
    if (!error.response && error.message && 
        (error.message.includes('CORS') || 
         error.message.includes('Cross-Origin') ||
         error.message.includes('Network Error') ||
         error.code === 'ERR_NETWORK')) {
      console.error('🚫 CORS错误检测到!')
      console.error('🔍 错误类型:', error.message)
      console.error('🔍 请求URL:', error.config?.url)
      console.error('🔍 请求方法:', error.config?.method?.toUpperCase())
      console.error('🔍 请求头:', error.config?.headers)
      console.error('📋 CORS问题可能原因:')
      console.error('   1. 后端服务器未配置CORS策略')
      console.error('   2. 当前域名不在后端白名单中')
      console.error('   3. 预检请求(OPTIONS)被拒绝')
      console.error('   4. 后端服务器未运行或地址错误')
      
      handleCorsError(error.config?.url || 'unknown')
    }
    
    console.error('❌ 网络错误:', {
      status,
      url: error.config?.url,
      data: errorData,
      headers: error.config?.headers
    })

    if (status === ApiStatus.unauthorized) {
      handleUnauthorizedError()
    } else if (status === ApiStatus.forbidden) {
      handleForbiddenError(errorData?.message || '禁止访问资源')
    }
    
    return Promise.reject(handleError(error))
  }
) /** 统一创建HttpError */
function createHttpError(message: string, code: number) {
  return new HttpError(message, code)
}

/** 处理401错误（带防抖） */
function handleUnauthorizedError(message?: string): never {
  const error = createHttpError(message || $t('httpMsg.unauthorized'), ApiStatus.unauthorized)

  if (!isUnauthorizedErrorShown) {
    isUnauthorizedErrorShown = true
    logOut()

    unauthorizedTimer = setTimeout(resetUnauthorizedError, UNAUTHORIZED_DEBOUNCE_TIME)

    showError(error, true)
    throw error
  }

  throw error
}

/** 处理403错误（禁止访问） */
function handleForbiddenError(message?: string): never {
  console.error('🚫 403禁止访问 - 可能原因:')
  console.error('   1. Token过期或无效')
  console.error('   2. 权限不足')  
  console.error('   3. 后端服务配置问题')
  console.error('   4. 生产环境权限配置不同')
  
  const error = createHttpError(message || '您没有访问此资源的权限，请联系管理员', ApiStatus.forbidden)
  
  // 显示错误通知但不自动退出登录
  ElNotification({
    title: '访问被拒绝',
    message: error.message,
    type: 'error',
    duration: 5000
  })
  
  throw error
}

/** 处理CORS错误 */
function handleCorsError(url: string): never {
  console.error('🌐 CORS配置建议:')
  console.error('   后端需要添加以下CORS头:')
  console.error('   - Access-Control-Allow-Origin: http://192.168.56.1:5173')
  console.error('   - Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS')
  console.error('   - Access-Control-Allow-Headers: Content-Type, Authorization')
  console.error('   - Access-Control-Allow-Credentials: true')
  
  const error = createHttpError(
    '跨域请求被阻止，请检查后端CORS配置或网络连接', 
    0 // CORS错误通常没有HTTP状态码
  )
  
  ElNotification({
    title: 'CORS跨域错误',
    message: '无法访问后端服务，请检查后端CORS配置或联系管理员',
    type: 'error',
    duration: 8000
  })
  
  throw error
}

/** 重置401防抖状态 */
function resetUnauthorizedError() {
  isUnauthorizedErrorShown = false
  if (unauthorizedTimer) clearTimeout(unauthorizedTimer)
  unauthorizedTimer = null
}

/** 退出登录函数 */
function logOut() {
  setTimeout(() => {
    useUserStore().logOut()
  }, LOGOUT_DELAY)
}

/** 是否需要重试 */
function shouldRetry(statusCode: number) {
  return [
    ApiStatus.requestTimeout,
    ApiStatus.internalServerError,
    ApiStatus.badGateway,
    ApiStatus.serviceUnavailable,
    ApiStatus.gatewayTimeout
  ].includes(statusCode)
}

/** 请求重试逻辑 */
async function retryRequest<T>(
  config: ExtendedAxiosRequestConfig,
  retries: number = MAX_RETRIES
): Promise<T> {
  try {
    return await request<T>(config)
  } catch (error) {
    if (retries > 0 && error instanceof HttpError && shouldRetry(error.code)) {
      await delay(RETRY_DELAY)
      return retryRequest<T>(config, retries - 1)
    }
    throw error
  }
}

/** 延迟函数 */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 请求函数 */
async function request<T = any>(config: ExtendedAxiosRequestConfig): Promise<T> {
  // POST | PUT 参数自动填充
  if (
    ['POST', 'PUT'].includes(config.method?.toUpperCase() || '') &&
    config.params &&
    !config.data
  ) {
    config.data = config.params
    config.params = undefined
  }

  try {
    const res = await axiosInstance.request<Http.BaseResponse<T>>(config)

    // 显示成功消息
    if (config.showSuccessMessage && res.data.msg) {
      showSuccess(res.data.msg)
    }

    return res.data.data as T
  } catch (error) {
    if (error instanceof HttpError && error.code !== ApiStatus.unauthorized) {
      const showMsg = config.showErrorMessage !== false
      showError(error, showMsg)
    }
    return Promise.reject(error)
  }
}

/** API方法集合 */
const api = {
  get<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'GET' })
  },
  post<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'POST' })
  },
  put<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'PUT' })
  },
  del<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'DELETE' })
  },
  request<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>(config)
  }
}

export default api
