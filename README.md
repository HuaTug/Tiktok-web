# TikTok Web Frontend

基于 Vue 3 + TypeScript + Vite 的短视频平台前端

## 🎉 最新更新 (2026-01-21)

✅ **前后端API完全对接完成**
- 认证系统: Token三重存储,自动刷新
- 视频播放: MinIO直连,支持流畅播放
- 数据转换: snake_case ↔ camelCase 自动转换
- 错误处理: 统一错误码映射与友好提示
- 完整文档: 详见 `API_MAPPING.md` 和 `FRONTEND_API_OPTIMIZATION.md`

## 📚 快速开始

### 环境要求
- Node.js >= 16
- npm >= 8

### 安装依赖
```bash
npm install
```

### 开发运行
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 测试账号
- 用户名: `testuser`
- 密码: `test123456`

## 🛠️ 技术栈

- **框架**: Vue 3 + TypeScript + Vite
- **状态管理**: Pinia
- **路由**: Vue Router
- **UI组件**: Element Plus
- **HTTP客户端**: Axios
- **视频播放**: vue3-video-play

## 📦 主要依赖库

### 核心功能
```bash
# 视频播放器
npm i vue3-video-play --save

# 轮播组件
npm install swiper

# 图片预览
npm install v-viewer@next

# 瀑布流布局
npm install v-masonry

# 时间格式化
npm install timeago.js

# Cookie管理
npm i js-cookie

# 地图组件
npm i @vuemap/vue-amap
```

## 🔧 调试工具

项目包含以下调试工具:

1. **API测试页面** (`api-test.html`)
   - 可视化API接口测试
   - Token管理
   - 批量测试功能

2. **快速调试脚本** (`quick-debug.js`)
   - 浏览器控制台诊断
   - 一键清除缓存
   - Token状态检查

3. **Cookie测试页面** (`test-cookie.html`)
   - Cookie存储测试
   - localStorage测试

## 📖 文档

- **API映射文档**: `API_MAPPING.md` - 前后端接口对照表
- **优化报告**: `FRONTEND_API_OPTIMIZATION.md` - 详细的优化说明和完成度
- **调试指南**: `DEBUG_GUIDE.md` - 日志符号说明和问题排查

## 🎯 核心功能

### 已完成 (95%)
- ✅ 用户认证(登录/注册/Token管理)
- ✅ 视频流浏览
- ✅ 视频播放
- ✅ 视频搜索
- ✅ 评论功能
- ✅ 点赞功能
- ✅ 收藏功能
- ✅ 关注/粉丝
- ✅ 通知系统
- ✅ 热门推荐

### 待完善 (5%)
- ⚠️ 视频分类(后端待实现)
- ⚠️ 搜索历史
- ⚠️ 视频合集

## 🖼️ 运行效果

### 首页

![index.png](docs/images/niuyin-index.png)

### 推荐

![discover.png](docs/images/niuyin-discover.png)

### 热门

![hot.png](docs/images/niuyin-hot.png)

### 关注

![follow.png](docs/images/niuyin-follow.png)

### 我的

![my.png](docs/images/niuyin-user.png)

### 分类

![category.png](docs/images/niuyin-category.png)

### 搜索

![search.png](docs/images/niuyin-search.png)

### 全屏

![fullscreen.png](docs/images/niuyin-fullscreen.png)

---

## 📞 技术支持

如遇问题,请:
1. 检查后端服务是否运行 (`http://localhost:8888`)
2. 检查MinIO服务是否运行 (`http://localhost:9002`)
3. 查看浏览器控制台错误
4. 使用 `api-test.html` 测试接口
5. 参考 `FRONTEND_API_OPTIMIZATION.md` 文档

## 📄 License

MIT License
