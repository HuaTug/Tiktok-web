# 🐛 调试指南

## 调试日志说明

现在前端已经添加了详细的调试日志，打开浏览器控制台（F12）可以看到完整的流程。

### 日志标识符说明

| 图标 | 含义 | 示例 |
|------|------|------|
| 🔐 | 登录流程 | `🔐 [LOGIN] 开始登录流程...` |
| 🌐 | HTTP请求 | `🌐 [REQUEST] 发起请求: /v1/user/login` |
| 📥 | HTTP响应 | `📥 [RESPONSE] 收到响应` |
| 🔑 | Token相关 | `🔑 [REQUEST] 从Cookies读取token` |
| 💾 | 数据保存 | `💾 [TOKEN] 保存到 Cookies...` |
| 👤 | 用户信息 | `👤 [USER] 保存用户信息` |
| 📹 | 视频相关 | `📹 [VIDEO] 开始获取视频feed...` |
| ✅ | 成功 | `✅ [LOGIN] 登录成功` |
| ❌ | 错误 | `❌ [LOGIN] 登录失败` |
| ⚠️ | 警告 | `⚠️ [REQUEST] 未找到token` |
| 🔍 | 验证 | `🔍 [VERIFY] 验证保存结果` |
| 📍 | 路由跳转 | `📍 [ROUTER] 跳转到首页...` |
| 🔄 | 数据转换 | `🔄 [RESPONSE] 将code从 10000 转换为 200` |

## 完整的登录流程日志

### 正常流程（成功）

```
🔐 [LOGIN] 开始登录流程...
🔐 [LOGIN] 用户名: testuser

🌐 [REQUEST] 发起请求: /v1/user/login
🔑 [REQUEST] 从Cookies读取token: ❌ 无token
⚠️ [REQUEST] 未找到token，将发送无认证请求

📥 [RESPONSE] 收到响应: /v1/user/login
📥 [RESPONSE] 原始code: 10000
✅ [RESPONSE] 请求成功! code: 10000
🔄 [RESPONSE] 将code从 10000 转换为 200

🔐 [LOGIN] 收到登录响应:
  - res.code: 200
  - res.data: {base: {…}, token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", user: {…}}
  - res.data.token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  - res.data.base: {code: 200, msg: "Login Success"}

✅ [LOGIN] 登录成功，开始保存token...

💾 [TOKEN] 保存到 Cookies...
💾 [TOKEN] Cookies中的token: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

💾 [TOKEN] 保存到 tokenX store...
💾 [TOKEN] tokenX store中的token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

👤 [USER] 保存用户信息: {user_id: 2, user_name: "testuser", email: "test@example.com", ...}
👤 [USER] userInfoX store中的用户: {user_id: 2, user_name: "testuser", ...}

🎉 [LOGIN] Token和用户信息保存完成！

🔍 [VERIFY] 验证保存结果:
  - Cookie token: ✅ 存在
  - tokenX.token: ✅ 存在
  - userInfoX.userInfo: ✅ 存在

📍 [ROUTER] 跳转到首页...

👤 [HEADER] 检查用户信息...
👤 [HEADER] 当前 this.user: {user_id: 2, user_name: "testuser", ...}
👤 [HEADER] 当前 token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✅ [HEADER] Token存在，检查用户信息是否需要获取
✅ [HEADER] 用户信息已存在，无需重新获取

📹 [VIDEO] 开始获取视频feed...
📹 [VIDEO] publishTime: null

🌐 [REQUEST] 发起请求: /v2/video/feed
🔑 [REQUEST] 从Cookies读取token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✅ [REQUEST] 已添加 Access-Token header

📥 [RESPONSE] 收到响应: /v2/video/feed
📥 [RESPONSE] 原始code: 10000
✅ [RESPONSE] 请求成功! code: 10000
🔄 [RESPONSE] 将code从 10000 转换为 200

📥 [VIDEO] 收到视频feed响应: {code: 200, data: {…}}
📹 [VIDEO] 原始视频数据: 2 个视频
📹 [VIDEO] 转换后的视频数据: 2 个视频
📹 [VIDEO] 当前总视频数: 2
✅ [VIDEO] 视频feed加载成功
```

### 异常流程（token未保存）

如果看到这样的日志：
```
✅ [LOGIN] 登录成功，开始保存token...
💾 [TOKEN] 保存到 Cookies...
💾 [TOKEN] Cookies中的token: (空字符串或没有token=)
```

说明token没有正确保存到Cookies。

### 异常流程（token未传递）

如果看到这样的日志：
```
🌐 [REQUEST] 发起请求: /v2/video/feed
🔑 [REQUEST] 从Cookies读取token: ❌ 无token
⚠️ [REQUEST] 未找到token，将发送无认证请求

📥 [RESPONSE] 收到响应: /v2/video/feed
📥 [RESPONSE] 原始code: 10013
❌ [RESPONSE] 未认证! code: 10013
```

说明token没有从Cookies中读取到。

## 调试步骤

### 1. 清除所有缓存

在浏览器控制台输入：
```javascript
localStorage.clear();
sessionStorage.clear();
document.cookie.split(";").forEach(c => document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"));
console.log('✅ 缓存已清除');
```

### 2. 刷新页面并登录

- 按 F5 刷新页面
- 打开控制台（F12）
- 使用测试账号登录：
  - 用户名: `testuser`
  - 密码: `test123456`

### 3. 观察控制台日志

按照上面的"正常流程"对比你的日志，找到哪一步出问题了。

### 4. 手动验证token

登录成功后，在控制台输入：

```javascript
// 检查Cookies
console.log('Cookies:', document.cookie);

// 检查localStorage
console.log('localStorage.token:', localStorage.getItem('token'));

// 检查tokenX store (需要在Vue环境中)
console.log('tokenX.token:', tokenX().token);

// 检查userInfoX store
console.log('userInfoX.userInfo:', userInfoX().userInfo);
```

### 5. 手动测试API

```javascript
// 测试获取视频
fetch('http://localhost:8888/v2/video/feed', {
  headers: {
    'Access-Token': document.cookie.split('token=')[1]?.split(';')[0]
  }
})
.then(res => res.json())
.then(data => console.log('API响应:', data));
```

## 常见问题排查

### 问题1: 登录成功但token为空

**日志特征**：
```
🔐 [LOGIN] 收到登录响应:
  - res.data.token: undefined 或 ""
```

**原因**：后端返回的数据结构不对，或者用户名密码错误

**解决**：检查 `res.data.base.code` 是否为 200

---

### 问题2: token保存了但读取不到

**日志特征**：
```
💾 [TOKEN] Cookies中的token: token=eyJ...
...（之后）
🔑 [REQUEST] 从Cookies读取token: ❌ 无token
```

**原因**：Cookies的domain或path设置问题

**解决**：在控制台检查：
```javascript
document.cookie.split(';').forEach(c => console.log(c));
```

---

### 问题3: 页面刷新后token丢失

**原因**：tokenX store的persist配置可能有问题

**解决**：检查localStorage：
```javascript
console.log('localStorage keys:', Object.keys(localStorage));
```

---

## 需要提供的调试信息

如果还是有问题，请提供：

1. **完整的控制台日志**（从登录开始到报错为止）
2. **Cookies内容**：`document.cookie`
3. **localStorage内容**：`Object.keys(localStorage)` 和对应的值
4. **登录响应**：完整的 `res` 对象
5. **浏览器版本**

## 快速诊断命令

在控制台粘贴这段代码，一键诊断：

```javascript
console.log('=== 🔍 系统诊断 ===');
console.log('');
console.log('📋 Cookies:');
console.log(document.cookie || '(空)');
console.log('');
console.log('📋 localStorage:');
Object.keys(localStorage).forEach(key => {
  console.log(`  ${key}:`, localStorage.getItem(key)?.substring(0, 50) + '...');
});
console.log('');
console.log('📋 sessionStorage:');
Object.keys(sessionStorage).forEach(key => {
  console.log(`  ${key}:`, sessionStorage.getItem(key)?.substring(0, 50) + '...');
});
console.log('');
console.log('✅ 诊断完成');
```
