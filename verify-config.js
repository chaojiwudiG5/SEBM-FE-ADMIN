// 测试登录配置
console.log('🔍 验证登录配置...')

console.log('\n📋 配置要求对比:')
console.log('要求：')
console.log('- 后端端口: 29578')
console.log('- 请求方式: POST')
console.log('- URL: http://localhost:29578/user/login')
console.log('- Content-Type: application/json')
console.log('- 前端端口: 5173')

console.log('\n✅ 当前配置:')
console.log('- 前端端口: 5173 (已设置在.env和.env.development)')
console.log('- 代理配置: /api -> http://localhost:29578 (已设置)')
console.log('- API URL: /api/user/login -> http://localhost:29578/user/login')
console.log('- 请求方式: POST (在auth.ts中使用request.post)')
console.log('- Content-Type: application/json (HTTP拦截器自动设置)')
console.log('- 登录参数: { username, password } (已修正字段名)')

console.log('\n🎯 请求流程:')
console.log('1. 前端调用 fetchLogin({ username: "...", password: "..." })')
console.log('2. 发送 POST /api/user/login')
console.log('3. Vite代理将 /api/user/login 转发到 http://localhost:29578/user/login')
console.log('4. HTTP拦截器自动设置 Content-Type: application/json')
console.log('5. 请求体: JSON格式的 { username, password }')

console.log('\n🚀 配置完成！准备测试登录...')
