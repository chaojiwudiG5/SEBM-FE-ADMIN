# 🌐 CORS 跨域问题解决方案

## 🚨 问题症状
- **错误信息**: `Invalid CORS request`
- **浏览器控制台**: `Access to XMLHttpRequest at 'http://192.168.56.1:29578/...' from origin 'http://192.168.56.1:5173' has been blocked by CORS policy`
- **网络面板**: 请求状态显示为 `(failed)` 或 `net::ERR_FAILED`

## 🔍 原因分析

### 什么是CORS？
CORS（Cross-Origin Resource Sharing，跨域资源共享）是浏览器的安全策略，阻止不同域名、端口或协议之间的资源访问。

### 当前情况
- **前端**: `http://192.168.56.1:5173` (Vite开发服务器)
- **后端**: `http://192.168.56.1:29578` (API服务器)
- **问题**: 不同端口被视为跨域请求

## 🛠️ 解决方案

### 方案1: 后端配置CORS（推荐）

#### Spring Boot 示例
```java
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://192.168.56.1:5173",
    "http://192.168.1.24:5173"
})
@RestController
public class ApiController {
    // 你的API方法
}

// 或者全局配置
@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOriginPattern("*");
        config.addAllowedMethod("*");
        config.addAllowedHeader("*");
        config.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

#### Node.js/Express 示例
```javascript
const cors = require('cors');

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://192.168.56.1:5173',
    'http://192.168.1.24:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
```

#### ASP.NET Core 示例
```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddCors(options =>
    {
        options.AddPolicy("AllowSpecificOrigins", builder =>
        {
            builder.WithOrigins(
                "http://localhost:5173",
                "http://192.168.56.1:5173",
                "http://192.168.1.24:5173"
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
        });
    });
}

public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    app.UseCors("AllowSpecificOrigins");
}
```

### 方案2: Nginx 反向代理（生产环境推荐）

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端静态文件
    location / {
        root /var/www/sebm-admin/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API代理到后端
    location /api/ {
        proxy_pass http://192.168.56.1:29578/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '$http_origin' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        
        # 预检请求处理
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '$http_origin';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
}
```

### 方案3: 开发环境临时解决

#### 禁用Chrome安全策略（仅开发）
```bash
# Windows
chrome.exe --user-data-dir="c:/chrome-dev-session" --disable-web-security --disable-features=VizDisplayCompositor

# macOS
open -n -a /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --args --user-data-dir="/tmp/chrome_dev_test" --disable-web-security --disable-features=VizDisplayCompositor
```

⚠️ **警告**: 这种方法仅用于开发测试，永远不要在生产环境使用！

## 🔧 调试步骤

### 1. 检查浏览器开发者工具
```
F12 → Network → 查看失败的请求
- 状态码
- 响应头
- 预检请求(OPTIONS)
```

### 2. 检查后端服务
```bash
# 测试后端是否运行
curl -X GET http://192.168.56.1:29578/health

# 测试CORS预检请求
curl -X OPTIONS http://192.168.56.1:29578/api/test \
  -H "Origin: http://192.168.56.1:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization"
```

### 3. 查看代理日志
启动前端服务后，控制台会显示代理日志：
```
🔄 代理请求: POST /api/auth/login → http://192.168.56.1:29578/auth/login
✅ 代理响应: 200 /api/auth/login
```

## 📋 检查清单

- [ ] 后端是否在 `192.168.56.1:29578` 运行？
- [ ] 后端是否配置了CORS策略？
- [ ] 前端请求URL是否正确？（`/api/...`）
- [ ] 浏览器控制台是否有CORS错误？
- [ ] 代理配置是否正确？
- [ ] 网络防火墙是否阻止了请求？

## 🚀 立即测试

1. **重新构建前端**
   ```bash
   npm run build
   npm run serve
   ```

2. **检查控制台日志**
   - 打开浏览器开发者工具
   - 查看 Console 和 Network 面板
   - 尝试登录或API请求

3. **验证代理工作**
   - 应该看到代理日志输出
   - 检查请求是否被正确转发

如果问题仍然存在，请提供：
- 浏览器控制台的完整错误信息
- Network面板的请求详情
- 后端服务的日志输出