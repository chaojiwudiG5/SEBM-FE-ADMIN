# 语言切换指南 / Language Switch Guide

## 问题 / Issue
系统已经全部翻译为英文，但界面仍然显示中文（特别是左侧菜单栏）。

## 原因 / Cause
浏览器的 localStorage 中保存了之前的中文语言设置，即使系统默认语言已改为英文，浏览器仍会优先使用本地存储的语言偏好。

## 解决方案 / Solutions（请按顺序尝试）

### ⭐ 方案 1：一键切换到英文（最快捷）

1. 打开浏览器开发者工具
   - Windows/Linux: 按 **F12** 或 **Ctrl + Shift + I**
   - Mac: 按 **Cmd + Option + I**

2. 进入 **Console / 控制台** 标签页

3. 复制并粘贴以下代码，然后按回车：
```javascript
localStorage.setItem('language', 'en')
localStorage.setItem('art-admin-language', 'en')
location.reload()
```

4. 页面会自动刷新，所有内容应该显示为英文

---

### 方案 2：手动清除语言缓存

如果方案 1 不起作用，请尝试完全清除本地存储：

1. 按 **F12** 打开开发者工具
2. 点击 **Application** 标签页（Chrome）或 **Storage** 标签页（Firefox）
3. 在左侧菜单找到 **Local Storage**
4. 点击展开，选择你的网站地址（如 `http://localhost:5173`）
5. 在右侧面板中：
   - 找到 `language` 或 `art-admin-language` 键
   - 右键点击 → 选择 "Delete" 删除
6. 关闭开发者工具
7. 按 **Ctrl + Shift + R**（或 Mac 上的 **Cmd + Shift + R**）强制刷新页面

---

### 方案 3：使用界面切换语言（如果顶部有语言切换按钮）

1. 在顶部导航栏查找 🌐 **语言图标**（地球图标）
2. 点击图标，在下拉菜单中选择 **"English"**
3. 系统会自动切换并刷新

---

### 方案 4：完全清除浏览器缓存

如果以上方案都不起作用，请清除浏览器所有缓存：

1. 打开浏览器设置
2. 找到 "隐私和安全" 或 "Privacy"
3. 点击 "清除浏览数据" 或 "Clear browsing data"
4. 选择：
   - ✅ 缓存的图片和文件
   - ✅ Cookie 和其他网站数据
   - ✅ 本地存储
5. 时间范围选择 "全部时间" 或 "All time"
6. 点击 "清除数据"
7. 重新打开网站

## 验证 / Verification

完成上述步骤后，系统应该显示为：
- 系统标题：SEBM Rental System
- 菜单项：
  - User Management（用户管理）
  - Message Notification（消息通知）
  - Device Management（设备管理）
  - Audit（审计）
  - Template Management（模板管理）
  - Notification Records（通知记录）

## 技术说明 / Technical Notes

系统已完成的英文转换包括：
1. ✅ 默认语言设置为英文（`src/locales/index.ts`）
2. ✅ 系统名称：SEBM Rental System（`src/config/index.ts`）
3. ✅ 所有路由菜单使用 i18n 键
4. ✅ 完整的英文翻译文件（`src/locales/langs/en.json`）
5. ✅ 所有主要页面和组件的文本翻译

如果问题仍然存在，请尝试完全清除浏览器缓存或使用无痕模式访问系统。

