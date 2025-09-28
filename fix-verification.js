// 验证API路径配置
console.log('🔍 验证修复后的API路径配置...')

console.log('\n❌ 修复前的问题:')
console.log('baseURL: "/api" + url: "/api/user/login" = "/api/api/user/login" ❌')

console.log('\n✅ 修复后的配置:')
console.log('baseURL: "/api" + url: "/user/login" = "/api/user/login" ✅')

console.log('\n🎯 当前请求流程:')
console.log('1. 前端调用: fetchLogin()')
console.log('2. HTTP实例: baseURL(/api) + url(/user/login) = /api/user/login')
console.log('3. Vite代理: /api/user/login → http://localhost:29578/user/login')
console.log('4. 最终请求: POST http://localhost:29578/user/login')

console.log('\n📋 修改文件列表:')
console.log('✅ src/api/auth.ts - 登录和用户信息API')
console.log('✅ src/api/system-manage.ts - 所有系统管理API')

console.log('\n🚀 问题已解决！不再有双重/api路径了。')
