# 🚀 生产环境部署指南

## 1. 预览环境（当前使用的方式）
```bash
# 构建项目
pnpm build

# 启动预览服务器（用于测试构建结果）
pnpm serve
# 访问: http://192.168.56.1:5173
```
**注意**: 这只是用于测试构建结果，不是真正的生产环境

## 2. 真正的生产环境部署

### 方式一：使用 Nginx 部署（推荐）
```bash
# 1. 构建项目
pnpm build

# 2. 将 dist 文件夹内容部署到 Nginx
# 配置 Nginx 反向代理到后端 API
```

### 方式二：使用 Express 服务器
```bash
# 1. 构建项目
pnpm build

# 2. 使用静态文件服务器
npx serve dist -s -l 3000
```

### 方式三：使用 PM2 管理预览服务器
```bash
# 1. 安装 PM2
npm install -g pm2

# 2. 构建项目
pnpm build

# 3. 使用 PM2 启动
pm2 serve dist 5173 --name "sebm-admin"
```

## 3. 环境配置检查清单

### 开发环境 (.env.development)
- ✅ VITE_API_PROXY_URL = http://localhost:29578
- ✅ 访问地址: http://localhost:5173

### 生产预览环境 (.env.production)  
- ✅ VITE_API_PROXY_URL = http://192.168.56.1:29578
- ✅ 访问地址: http://192.168.56.1:5173

### 后端服务器要求
- ✅ 后端服务必须在 29578 端口运行
- ✅ 后端必须支持跨域请求或配置代理
- ✅ 后端必须可以通过网络IP访问

## 4. 403 错误排查步骤

1. **检查后端服务状态**
   ```bash
   # 检查后端是否运行在指定端口
   netstat -ano | findstr :29578
   ```

2. **检查网络连接**
   ```bash
   # 测试后端API是否可访问
   curl http://192.168.56.1:29578/health
   ```

3. **检查浏览器网络面板**
   - 打开 F12 开发者工具
   - 查看 Network 选项卡
   - 检查 API 请求的实际地址和响应

4. **检查后端日志**
   - 查看后端服务器日志
   - 确认是否接收到请求
   - 检查权限验证逻辑

## 5. 推荐的生产环境架构

```
用户浏览器 → Nginx (端口80/443) → Vue.js 应用
                ↓
            反向代理到后端 API (端口29578)
```

这样可以避免CORS问题并提供更好的性能和安全性。