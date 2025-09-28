// 测试后端实际响应格式
import axios from 'axios'

const testLogin = async () => {
  console.log('🧪 测试后端登录响应格式...')

  try {
    const response = await axios.post(
      'http://localhost:29578/user/login',
      {
        username: 'ashley',
        password: 'test123'
      },
      {
        timeout: 5000,
        validateStatus: () => true, // 接受所有状态码
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    console.log('📊 完整响应分析:')
    console.log('- HTTP状态:', response.status)
    console.log('- 响应体:', JSON.stringify(response.data, null, 2))
    console.log('- 响应头:', response.headers)

    console.log('\n🔍 数据结构检查:')
    if (response.data) {
      const data = response.data
      console.log('- data.code:', data.code, '(类型:', typeof data.code, ')')
      console.log('- data.msg:', data.msg)
      console.log('- data.message:', data.message)
      console.log('- data.data:', data.data)
      console.log('- 所有字段:', Object.keys(data))

      // 检查成功状态码
      if (data.code === 200) {
        console.log('✅ 后端返回成功状态码 200')
      } else {
        console.log('❌ 后端返回错误状态码:', data.code)
        console.log('错误信息:', data.message || data.msg)
      }
    }
  } catch (error) {
    console.error('❌ 请求失败:', {
      message: error.message,
      code: error.code
    })
  }
}

testLogin()
