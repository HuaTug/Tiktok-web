import request from '@/utils/request'

// 辅助函数：过滤掉 null/undefined/空字符串的参数
function filterParams(params) {
    if (!params) return {}
    const filtered = {}
    for (const [key, value] of Object.entries(params)) {
        if (value != null && value !== '') {
            filtered[key] = value
        }
    }
    return filtered
}

// 评论列表
export function videoCommentPageList(data) {
    // Convert camelCase to snake_case for backend API
    const params = {
        video_id: data.videoId,
        page_num: data.pageNum || 1,
        page_size: data.pageSize || 10,
        sort_type: data.sortType || 'hot'
    }
    return request({
        url: '/v1/comment/list',
        method: 'get',
        params: filterParams(params)
    })
}

// 子评论列表（根据父评论ID获取）
export function commentReplyList(data) {
    const params = {
        comment_id: data.commentId,
        page_num: data.pageNum || 1,
        page_size: data.pageSize || 20,
    }
    return request({
        url: '/v1/comment/list',
        method: 'get',
        params: filterParams(params)
    })
}

// 添加评论
export function addVideoComment(data) {
    // Convert camelCase to snake_case for backend API
    // comment_id 可能是字符串（大整数防精度丢失），需要原样发送为数字
    const commentId = data.parentId || data.commentId || '0'
    // 手动构造 JSON 字符串，避免 JS Number 精度丢失
    const jsonBody = `{"video_id":${Number(data.videoId) || 0},"content":${JSON.stringify(data.content || '')},"comment_id":${commentId},"mode":${data.originId ? 2 : 1}}`
    return request({
        url: '/v1/comment/publish',
        method: 'post',
        data: jsonBody,
        headers: { 'Content-Type': 'application/json' }
    })
}

// 视频点赞
// actionType: 1=点赞, 2=取消点赞 (前端) -> "like"/"unlike" (后端)
export function likeVideo(videoId, actionType = 1) {
    return request({
        url: '/v1/action/like',
        method: 'post',
        data: { 
            video_id: videoId, 
            action_type: actionType === 1 ? 'like' : 'unlike' 
        }
    })
}

// 批量检查视频点赞状态
export function batchLikeStatus(videoIds) {
    return request({
        url: '/v1/action/batch_status',
        method: 'post',
        data: { video_ids: videoIds }
    })
}

// 批量检查视频收藏状态
export function batchFavoriteStatus(videoIds) {
    return request({
        url: '/v1/favorite/batch_status',
        method: 'post',
        data: { video_ids: videoIds }
    })
}

// 分页查询我喜欢的视频
export function videoLikePage(data) {
    // Convert camelCase to snake_case for backend API
    const params = {
        page_num: data.pageNum || 1,
        page_size: data.pageSize || 10
    }
    return request({
        url: '/v1/action/list',
        method: 'get',
        params: params
    })
}

// 分页查询我收藏的视频
export function videoFavoritePage(data) {
    return request({
        url: '/v1/favorite/video/list',
        method: 'get',
        params: {
            favorite_id: data.favoriteId || 0,
            page_num: data.pageNum || 1,
            page_size: data.pageSize || 10
        }
    })
}

// 回复评论
export function replayVideoComment(data) {
    const commentId = data.parentId || data.commentId || '0'
    const jsonBody = `{"video_id":${Number(data.videoId) || 0},"content":${JSON.stringify(data.content || '')},"comment_id":${commentId},"mode":2}`
    return request({
        url: '/v1/comment/publish',
        method: 'post',
        data: jsonBody,
        headers: { 'Content-Type': 'application/json' }
    })
}

// 删除评论
export function deleteVideoComment(commentId) {
    return request({
        url: '/v1/comment/delete',
        method: 'delete',
        params: { comment_id: commentId }
    })
}

// 评论点赞
// actionType: 1=点赞, 2=取消点赞
export function likeComment(commentId, actionType = 1) {
    const jsonBody = `{"comment_id":${commentId},"video_id":0,"action_type":${JSON.stringify(actionType === 1 ? 'like' : 'unlike')}}`
    return request({
        url: '/v1/action/like',
        method: 'post',
        data: jsonBody,
        headers: { 'Content-Type': 'application/json' }
    })
}

// 我的喜欢数
export function myLikeCount() {
    return request({
        url: '/v1/action/list',
        method: 'get',
    })
}

// 我的收藏数
export function myFavoriteCount() {
    return request({
        url: '/v1/favorite/list',
        method: 'get',
    })
}

//查询用户收藏夹列表
export function myFavoriteList() {
    return request({
        url: '/v1/favorite/list',
        method: 'get',
    })
}

//查询用户点赞列表
export function personVideoLikePage(data) {
    return request({
        url: '/v1/action/list',
        method: 'get',
        params: data
    })
}

//创建收藏夹
export function createFavorite(data) {
    return request({
        url: '/v1/favorite/create',
        method: 'post',
        data: data
    })
}

// 用户收藏视频
export function onlyFavoriteVideo(videoId) {
    return request({
        url: '/v1/favorite/video/add',
        method: 'post',
        data: { video_id: videoId }
    })
}


// 用户取消收藏视频
export function userUnFavoriteVideo(videoId) {
    return request({
        url: '/v1/favorite/video/delete',
        method: 'delete',
        params: { video_id: videoId }
    })
}


// 收藏视频到收藏夹
export function favoriteVideoToCollection(data) {
    return request({
        url: '/v1/favorite/video/add',
        method: 'post',
        data: {
            video_id: data.videoId || data.video_id,
            favorite_id: data.favoriteId || data.favorite_id || 0
        }
    })
}

// 查询视频在用户哪些收藏夹
export function videoInWhoseCollection(videoId) {
    return request({
        url: '/v1/favorite/video',
        method: 'get',
        params: { video_id: videoId }
    })
}

// 查询收藏夹详情集合
export function collectionInfoList() {
    return request({
        url: '/v1/favorite/list',
        method: 'get',
    })
}

// 分页收藏夹详情（获取收藏夹列表）
export function collectionInfoPage(data) {
    return request({
        url: '/v1/favorite/list',
        method: 'get',
        params: {
            page_num: data.pageNum || 1,
            page_size: data.pageSize || 10
        }
    })
}

// 更新收藏夹信息
export function updateFavorite(data) {
    return request({
        url: '/v1/favorite/update',
        method: 'post',
        data: {
            favorite_id: data.favoriteId || data.favorite_id,
            title: data.title || data.name,
            name: data.title || data.name,
            description: data.description,
            cover_url: data.coverUrl || data.cover_url,
            show_status: data.showStatus || data.show_status || '1'  // 默认私密
        }
    })
}

// 删除收藏夹
export function deleteFavorite(favoriteId) {
    return request({
        url: '/v1/favorite/delete',
        method: 'delete',
        params: { favorite_id: favoriteId }
    })
}

// 同步视频观看行为埋点
export function syncViewBehave(videoId) {
    return request({
        url: '/v1/visit/' + videoId,
        method: 'post',
    })
}

// 视频笔记分页 (暂时使用评论列表代替)
export function videoNotePage(data) {
    return request({
        url: '/v1/comment/list',
        method: 'get',
        params: data
    })
}

// 视频笔记 (暂时使用评论代替)
export function addVideoNote(data) {
    return request({
        url: '/v1/comment/publish',
        method: 'post',
        data: data
    })
}

// 视频笔记 (暂时使用评论代替)
export function getVideoNote(noteId) {
    return request({
        url: '/v1/comment/list',
        method: 'get',
        params: { comment_id: noteId }
    })
}
