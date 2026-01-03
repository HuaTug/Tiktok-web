import request from '@/utils/request'

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
        params: params
    })
}

// 添加评论
export function addVideoComment(data) {
    // Convert camelCase to snake_case for backend API
    const postData = {
        video_id: data.videoId,
        content: data.content,
        comment_id: data.parentId || data.commentId || 0,
        mode: data.originId ? 2 : 1  // mode 1 = 直接评论, mode 2 = 回复评论
    }
    return request({
        url: '/v1/comment/publish',
        method: 'post',
        data: postData
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
        url: '/v2/favorite/video/list',
        method: 'get',
        params: data
    })
}

// 回复评论
export function replayVideoComment(data) {
    // Convert camelCase to snake_case for backend API
    const postData = {
        video_id: data.videoId,
        content: data.content,
        comment_id: data.parentId || data.commentId || 0,
        mode: 2  // mode 2 = 回复评论
    }
    return request({
        url: '/v1/comment/publish',
        method: 'post',
        data: postData
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
        url: '/v2/favorite/list',
        method: 'get',
    })
}

//查询用户收藏夹列表
export function myFavoriteList() {
    return request({
        url: '/v2/favorite/list',
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
        url: '/v2/favorite/create',
        method: 'post',
        data: data
    })
}

// 用户收藏视频
export function onlyFavoriteVideo(videoId) {
    return request({
        url: '/v2/favorite/video/add',
        method: 'post',
        data: { video_id: videoId }
    })
}


// 用户取消收藏视频
export function userUnFavoriteVideo(videoId) {
    return request({
        url: '/v2/favorite/video/delete',
        method: 'delete',
        params: { video_id: videoId }
    })
}


// 收藏视频到收藏夹
export function favoriteVideoToCollection(data) {
    return request({
        url: '/v2/favorite/video/add',
        method: 'post',
        data: data
    })
}

// 查询视频在用户哪些收藏夹
export function videoInWhoseCollection(videoId) {
    return request({
        url: '/v2/favorite/video',
        method: 'get',
        params: { video_id: videoId }
    })
}

// 查询收藏夹详情集合
export function collectionInfoList() {
    return request({
        url: '/v2/favorite/list',
        method: 'get',
    })
}

// 分页收藏夹详情
export function collectionInfoPage(data) {
    return request({
        url: '/v2/favorite/video/list',
        method: 'get',
        params: data
    })
}

// 更新收藏夹信息
export function updateFavorite(data) {
    return request({
        url: '/v2/favorite/create',
        method: 'post',
        data: data
    })
}

// 删除收藏夹
export function deleteFavorite(favoriteId) {
    return request({
        url: '/v2/favorite/delete',
        method: 'delete',
        params: { favorite_id: favoriteId }
    })
}

// 同步视频观看行为埋点
export function syncViewBehave(videoId) {
    return request({
        url: '/v2/visit/' + videoId,
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
