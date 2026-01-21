# 🔗 前后端API接口映射文档

本文档记录了前端API调用与后端实际端点的映射关系,以及需要修复的接口问题。

---

## ✅ 已正确映射的接口

### 1. 用户模块 (member.js)
| 前端函数 | 后端端点 | 状态 | 说明 |
|---------|---------|------|------|
| `userLogin` | `POST /v1/user/login` | ✅ | 用户登录 |
| `register` | `POST /v1/user/create/` | ✅ | 用户注册 |
| `sendCode` | `POST /v1/user/sendcode` | ✅ | 发送验证码 |
| `getInfo` | `GET /v1/user/me` | ✅ | 获取当前用户信息 |
| `getPersonInfo` | `GET /v1/user/get` | ✅ | 获取其他用户信息 |
| `updateUserProfile` | `POST /v1/user/update` | ✅ | 更新用户资料 |
| `queryUser` | `POST /v1/user/query/` | ✅ | 查询用户 |
| `checkUserExists` | `POST /v1/user/check` | ✅ | 检查用户存在 |
| `deleteUser` | `DELETE /v1/user/delete` | ✅ | 删除用户 |

### 2. 视频模块 (video.js)
| 前端函数 | 后端端点 | 状态 | 说明 |
|---------|---------|------|------|
| `videoFeed` | `GET /v2/video/feed` | ✅ | 视频流 |
| `videoMypage` | `GET /v2/video/list` | ✅ | 我的视频列表 |
| `videoUserpage` | `GET /v2/video/list` | ✅ | 用户视频列表 |
| `publishVideoStart` | `POST /v2/publish/start` | ✅ | 开始上传 |
| `publishVideoUploading` | `POST /v2/publish/uploading` | ✅ | 上传分片 |
| `publishVideoComplete` | `POST /v2/publish/complete` | ✅ | 完成上传 |
| `publishVideoCancel` | `POST /v2/publish/cancel` | ✅ | 取消上传 |
| `getUploadProgress` | `GET /v2/publish/progress` | ✅ | 获取进度 |
| `resumeUpload` | `POST /v2/publish/resume` | ✅ | 断点续传 |
| `videoSearch` | `POST /v2/video/search` | ✅ | 视频搜索 |
| `videoDelete` | `DELETE /v2/video/delete` | ✅ | 删除视频 |
| `videoVisit` | `POST /v2/visit/:id` | ✅ | 访问记录 |
| `hotVideoPage` | `GET /v2/popular/` | ✅ | 热门视频 |

### 3. 互动模块 (behave.js)
| 前端函数 | 后端端点 | 状态 | 说明 |
|---------|---------|------|------|
| `videoCommentPageList` | `GET /v1/comment/list` | ✅ | 评论列表 |
| `addVideoComment` | `POST /v1/comment/publish` | ✅ | 发布评论 |
| `replayVideoComment` | `POST /v1/comment/publish` | ✅ | 回复评论 |
| `deleteVideoComment` | `DELETE /v1/comment/delete` | ✅ | 删除评论 |
| `likeVideo` | `POST /v1/action/like` | ✅ | 点赞视频 |
| `videoLikePage` | `GET /v1/action/list` | ✅ | 点赞列表 |
| `myLikeCount` | `GET /v1/action/list` | ✅ | 点赞数量 |
| `syncViewBehave` | `POST /v2/visit/:id` | ✅ | 观看行为 |

### 4. 收藏模块 (behave.js)
| 前端函数 | 后端端点 | 状态 | 说明 |
|---------|---------|------|------|
| `myFavoriteList` | `GET /v2/favorite/list` | ✅ | 收藏夹列表 |
| `createFavorite` | `POST /v2/favorite/create` | ✅ | 创建收藏夹 |
| `updateFavorite` | `POST /v2/favorite/create` | ✅ | 更新收藏夹 |
| `deleteFavorite` | `DELETE /v2/favorite/delete` | ✅ | 删除收藏夹 |
| `onlyFavoriteVideo` | `POST /v2/favorite/video/add` | ✅ | 收藏视频 |
| `userUnFavoriteVideo` | `DELETE /v2/favorite/video/delete` | ✅ | 取消收藏 |
| `favoriteVideoToCollection` | `POST /v2/favorite/video/add` | ✅ | 添加到收藏夹 |
| `videoInWhoseCollection` | `GET /v2/favorite/video` | ✅ | 查询收藏状态 |
| `collectionInfoPage` | `GET /v2/favorite/video/list` | ✅ | 收藏夹视频 |

### 5. 社交模块 (social.js)
| 前端函数 | 后端端点 | 状态 | 说明 |
|---------|---------|------|------|
| `followUser` | `POST /v1/relation/action` | ✅ | 关注用户 |
| `followPageList` | `GET /v1/following/list` | ✅ | 关注列表 |
| `fanPageList` | `GET /v1/follower/list` | ✅ | 粉丝列表 |
| `friendList` | `GET /v1/friend/list` | ✅ | 好友列表 |
| `followAndFans` | `GET /v1/following/list` | ✅ | 关注粉丝数 |

### 6. 推荐模块 (recommend.js)
| 前端函数 | 后端端点 | 状态 | 说明 |
|---------|---------|------|------|
| `recommendVideoFeed` | `GET /v2/recommend/video` | ✅ | 推荐视频 |

### 7. 搜索模块 (search.js)
| 前端函数 | 后端端点 | 状态 | 说明 |
|---------|---------|------|------|
| `searchVideo` | `POST /v2/video/search` | ✅ | 视频搜索 |
| `searchUser` | `POST /v1/user/query/` | ✅ | 用户搜索 |
| `searchHotLoad` | `GET /v2/popular/` | ✅ | 热门搜索 |

---

## ⚠️ 需要修复的接口

### 1. 视频分类功能 (暂无后端支持)
以下函数目前映射到 `/v2/video/list`,需要等后端实现分类API后更新:

- `videoCategory()` - 视频分类列表
- `videoCategoryPage()` - 分类视频分页
- `videoCategoryTree()` - 分类树
- `videoCategoryParentList()` - 父分类列表
- `videoCategoryChildrenList()` - 子分类列表
- `pushVideoByCategory()` - 按分类推荐

**临时方案**: 当前使用视频列表接口,前端过滤实现

### 2. 通知功能 (notice.js)
后端已有 `/v1/notifications` API,但前端未正确连接:

```javascript
// 需要更新 notice.js
export function noticePage(data) {
    return request({
        url: '/v1/notifications',
        method: 'get',
        params: data
    })
}

export function noticeCount(data) {
    return request({
        url: '/v1/notifications',
        method: 'get',
        params: { ...data, count_only: true }
    })
}
```

### 3. 视频流代理功能
后端存在bug,但已通过MinIO公开访问绕过:

- `videoStreamProxy()` - ❌ 后端nil pointer错误
- `videoThumbnailProxy()` - ❌ 后端nil pointer错误
- `videoMetadata()` - ❌ 后端nil pointer错误

**当前方案**: 前端直接访问MinIO URL (已修复端口9000→9002)

---

## 🔧 需要后端添加的新端点

### 1. 视频标签管理
```
POST /v2/video/tags/save
GET  /v2/video/tags/list
```

### 2. 视频合集管理
```
GET  /v2/video/compilation/list
POST /v2/video/compilation/create
```

### 3. 搜索历史
```
GET    /v2/search/history
DELETE /v2/search/history/:id
```

---

## 📊 数据格式转换规则

### 前端 → 后端 (camelCase → snake_case)
```javascript
// 已在各API函数中实现转换
{
  videoId → video_id
  pageNum → page_num
  pageSize → page_size
  userId → user_id
  actionType → action_type
  commentId → comment_id
  sortType → sort_type
}
```

### 后端 → 前端 (snake_case → camelCase)
```javascript
// 在 Video.vue 的 transformVideoData() 中实现
{
  video_url → videoUrl
  cover_url → coverImage
  video_id → videoId
  user_id → userId
  created_at → createTime
}
```

---

## ✨ 最近修复
1. ✅ MinIO bucket权限配置为公开访问
2. ✅ 视频URL端口修正 (9000 → 9002)
3. ✅ Token三重存储机制 (Cookies + localStorage + tokenX store)
4. ✅ 后端错误码10000转换为前端200
5. ✅ 后端错误码10013识别为Token失效

---

## 📝 维护说明
- 本文档需随API变更及时更新
- 新增接口请先确认后端已实现
- 数据转换逻辑集中在各API文件中
- 特殊处理逻辑记录在对应的Vue组件中
