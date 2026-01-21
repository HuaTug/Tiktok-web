import request from '@/utils/request'

// 视频流-feed
export async function videoFeed(createTime) {
    return await request({
        url: '/v1/video/feed',
        method: 'get',
        params: { create_time: createTime }
    })
}

// 分页查询我的视频
export async function videoMypage(data) {
    return await request({
        url: '/v1/video/list',
        method: 'get',
        params: data
    })
}

// 分页查询用户视频
export async function videoUserpage(data) {
    return await request({
        url: '/v1/video/list',
        method: 'get',
        params: data
    })
}

// 发布视频 - 开始上传
export async function publishVideoStart(data) {
    return await request({
        url: '/v1/publish/start',
        method: 'post',
        data: data
    })
}

// 发布视频 - 上传中
export async function publishVideoUploading(data) {
    return await request({
        url: '/v1/publish/uploading',
        method: 'post',
        data: data
    })
}

// 发布视频 - 完成上传
export async function publishVideoComplete(data) {
    return await request({
        url: '/v1/publish/complete',
        method: 'post',
        data: data
    })
}

// 发布视频 - 取消上传
export async function publishVideoCancel(data) {
    return await request({
        url: '/v1/publish/cancel',
        method: 'post',
        data: data
    })
}

// 获取上传进度
export async function getUploadProgress(data) {
    return await request({
        url: '/v1/publish/progress',
        method: 'get',
        params: data
    })
}

// 恢复上传
export async function resumeUpload(data) {
    return await request({
        url: '/v1/publish/resume',
        method: 'post',
        data: data
    })
}

// 发布视频 - 简化版本（兼容旧接口）
// 此函数封装了分块上传流程，适用于小文件
export async function publishVideo(data) {
    // 1. 开始上传
    const startRes = await publishVideoStart({
        title: data.title || data.videoTitle,
        description: data.description || data.videoDesc,
        file_name: data.fileName || 'video.mp4',
        file_size: data.fileSize || 0,
    })
    
    if (startRes.code !== 200 && startRes.code !== 0) {
        return startRes
    }
    
    const uploadId = startRes.data?.upload_id
    
    // 2. 完成上传（如果有视频URL则直接完成）
    return await publishVideoComplete({
        upload_id: uploadId,
        video_url: data.videoUrl,
        cover_url: data.coverUrl || data.videoCover,
        title: data.title || data.videoTitle,
        description: data.description || data.videoDesc,
    })
}

// 视频分类列表
export async function videoCategory(data) {
    return await request({
        url: '/v1/video/list',
        method: 'get',
        params: data
    })
}

// 视频分类分页video
export async function videoCategoryPage(data) {
    return await request({
        url: '/v1/video/list',
        method: 'get',
        params: data
    })
}

// 热门视频
export async function hotVideoPage(data) {
    return await request({
        url: '/v1/popular/',
        method: 'get',
        params: data
    })
}

// 用户视频点赞总数
export async function userLikeNums(userId) {
    return await request({
        url: '/v1/action/list',
        method: 'get',
        params: { user_id: userId }
    })
}

// 保存标签 (暂时不支持)
export async function saveVideoTag(data) {
    return await request({
        url: '/v1/video/list',
        method: 'get',
        params: data
    })
}

// 我的作品数量
export async function myVideoCount() {
    return await request({
        url: '/v1/video/list',
        method: 'get'
    })
}

// 查询用户作品
export async function memberInfoPage(data) {
    return await request({
        url: '/v1/video/list',
        method: 'get',
        params: data
    })
}

// 视频推荐
export async function pushVideo() {
    return await request({
        url: '/v1/recommend/video',
        method: 'get'
    })
}

// 分页查询我的视频合集
export async function myVideoCompilationPage(data) {
    return await request({
        url: '/v1/video/list',
        method: 'get',
        params: data
    })
}

// 根据分类推送视频
export async function pushVideoByCategory(categoryId) {
    return await request({
        url: '/v1/video/list',
        method: 'get',
        params: { category_id: categoryId }
    })
}

// 视频分类树
export async function videoCategoryTree() {
    return await request({
        url: '/v1/video/list',
        method: 'get'
    })
}

// 视频分类树
export async function videoCategoryParentList() {
    return await request({
        url: '/v1/video/list',
        method: 'get'
    })
}

// 视频父分类子分类
export async function videoCategoryChildrenList(id) {
    return await request({
        url: '/v1/video/list',
        method: 'get',
        params: { category_id: id }
    })
}

// 视频vo
export async function getVideoVOById(id) {
    return await request({
        url: '/v1/video/feed',
        method: 'get',
        params: { video_id: id }
    })
}

// 视频搜索
export async function videoSearch(data) {
    return await request({
        url: '/v1/video/search',
        method: 'post',
        data: data
    })
}

// 删除视频
export async function videoDelete(videoId) {
    return await request({
        url: '/v1/video/delete',
        method: 'delete',
        params: { video_id: videoId }
    })
}

// 视频流代理
export async function videoStreamProxy(videoId) {
    return await request({
        url: '/v1/stream/video',
        method: 'get',
        params: { video_id: videoId }
    })
}

// 视频缩略图代理
export async function videoThumbnailProxy(videoId) {
    return await request({
        url: '/v1/stream/thumbnail',
        method: 'get',
        params: { video_id: videoId }
    })
}

// 视频元数据
export async function videoMetadata(videoId) {
    return await request({
        url: '/v1/stream/metadata',
        method: 'get',
        params: { video_id: videoId }
    })
}

// 视频访问记录
export async function videoVisit(videoId) {
    return await request({
        url: '/v1/visit/' + videoId,
        method: 'post'
    })
}

// 视频转码
export async function transcodeVideo(data) {
    return await request({
        url: '/v1/video/transcode',
        method: 'post',
        data: data
    })
}

// 视频分析
export async function getVideoAnalytics(videoId) {
    return await request({
        url: '/v1/video/analytics',
        method: 'get',
        params: { video_id: videoId }
    })
}

// 批量操作视频
export async function batchOperateVideos(data) {
    return await request({
        url: '/v1/videos/batch',
        method: 'post',
        data: data
    })
}

// 视频热度管理
export async function manageVideoHeat(data) {
    return await request({
        url: '/v1/storage/heat/manage',
        method: 'post',
        data: data
    })
}

// 用户配额管理
export async function manageUserQuota(data) {
    return await request({
        url: '/v1/storage/quota/manage',
        method: 'post',
        data: data
    })
}

// 分享视频
export async function shareVideo(data) {
    return await request({
        url: '/v1/share/video',
        method: 'post',
        data: data
    })
}
