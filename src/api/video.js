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

// 视频流-feed
export async function videoFeed(createTime) {
    // 过滤掉 null/undefined 值，避免后端解析错误
    const params = {}
    if (createTime != null && createTime !== '') {
        params.create_time = createTime
    }
    return await request({
        url: '/v1/video/feed',
        method: 'get',
        params: params
    })
}

// 分页查询我的视频
export async function videoMypage(data) {
    return await request({
        url: '/v1/video/list',
        method: 'get',
        params: filterParams(data)
    })
}

// 分页查询用户视频
export async function videoUserpage(data) {
    return await request({
        url: '/v1/video/list',
        method: 'get',
        params: filterParams(data)
    })
}

// ========== V2版本分片上传API（推荐使用） ==========

// V2 发布视频 - 开始上传
export async function publishVideoStartV2(data) {
    return await request({
        url: '/v2/publish/start',
        method: 'post',
        data: data
    })
}

// V2 发布视频 - 上传分片
export async function publishVideoUploadingV2(formData, onProgress) {
    return await request({
        url: '/v2/publish/uploading',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: onProgress,
        timeout: 300000 // 5分钟超时，适合大文件分片
    })
}

// V2 发布视频 - 完成上传
export async function publishVideoCompleteV2(data) {
    return await request({
        url: '/v2/publish/complete',
        method: 'post',
        data: data
    })
}

// V2 发布视频 - 取消上传
export async function publishVideoCancelV2(data) {
    return await request({
        url: '/v2/publish/cancel',
        method: 'post',
        data: data
    })
}

// V2 获取上传进度
export async function getUploadProgressV2(uuid) {
    return await request({
        url: '/v2/publish/progress',
        method: 'get',
        params: { uuid }
    })
}

// V2 恢复上传（断点续传）
export async function resumeUploadV2(data) {
    return await request({
        url: '/v2/publish/resume',
        method: 'post',
        data: data
    })
}

// ========== V1版本API（兼容旧接口） ==========

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

// ========== 分片上传工具函数 ==========

// 默认分片大小：5MB
const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024

/**
 * 完整的分片上传流程
 * @param {Object} options 上传配置
 * @param {File} options.file 视频文件
 * @param {string} options.title 视频标题
 * @param {string} options.description 视频描述
 * @param {string} options.labName 标签（逗号分隔）
 * @param {string} options.category 分类
 * @param {number} options.open 隐私设置: 0=私有, 1=公开, 2=好友可见
 * @param {number} options.chunkSize 分片大小（字节），默认5MB
 * @param {Function} options.onProgress 进度回调 (percent, stage)
 * @param {Function} options.onChunkComplete 分片完成回调 (chunkIndex, totalChunks)
 * @returns {Promise<Object>} 上传结果
 */
export async function uploadVideoWithChunks(options) {
    const {
        file,
        title,
        description = '',
        labName = '',
        category = '',
        open = 1,
        chunkSize = DEFAULT_CHUNK_SIZE,
        onProgress = () => {},
        onChunkComplete = () => {}
    } = options

    if (!file) {
        throw new Error('请选择要上传的视频文件')
    }

    // 计算分片数量
    const totalChunks = Math.ceil(file.size / chunkSize)
    
    // Step 1: 开始上传，获取 upload_session_uuid
    onProgress(0, 'starting')
    const startRes = await publishVideoStartV2({
        title: title,
        description: description,
        lab_name: labName,
        category: category,
        open: open,
        chunk_total_number: totalChunks
    })

    if (startRes.code !== 0 && startRes.code !== 200) {
        throw new Error(startRes.message || '开始上传失败')
    }

    const uuid = startRes.data?.upload_session_uuid
    if (!uuid) {
        throw new Error('服务器返回的上传会话ID无效')
    }

    // Step 2: 分片上传
    onProgress(5, 'uploading')
    
    try {
        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            const start = chunkIndex * chunkSize
            const end = Math.min(start + chunkSize, file.size)
            const chunk = file.slice(start, end)

            const formData = new FormData()
            formData.append('uuid', uuid)
            formData.append('chunk_number', chunkIndex + 1) // 后端从1开始计数
            formData.append('filename', file.name)
            formData.append('is_m3u8', false)
            formData.append('data', chunk, file.name)

            const uploadRes = await publishVideoUploadingV2(formData, (progressEvent) => {
                if (progressEvent.lengthComputable) {
                    const chunkPercent = (progressEvent.loaded / progressEvent.total) * 100
                    const overallPercent = 5 + ((chunkIndex + chunkPercent / 100) / totalChunks) * 85
                    onProgress(Math.round(overallPercent), 'uploading')
                }
            })

            if (uploadRes.code !== 0 && uploadRes.code !== 200) {
                throw new Error(uploadRes.message || `分片 ${chunkIndex + 1} 上传失败`)
            }

            onChunkComplete(chunkIndex + 1, totalChunks)
        }

        // Step 3: 完成上传
        onProgress(90, 'completing')
        const completeRes = await publishVideoCompleteV2({
            uuid: uuid
        })

        if (completeRes.code !== 0 && completeRes.code !== 200) {
            throw new Error(completeRes.message || '完成上传失败')
        }

        onProgress(100, 'completed')
        
        return {
            success: true,
            data: completeRes.data,
            videoId: completeRes.data?.video_id,
            videoUrl: completeRes.data?.video_url,
            coverUrl: completeRes.data?.cover_url
        }

    } catch (error) {
        // 上传失败时尝试取消上传会话
        try {
            await publishVideoCancelV2({ uuid })
        } catch (cancelError) {
            console.error('取消上传会话失败:', cancelError)
        }
        throw error
    }
}

// 发布视频 - 简化版本（兼容旧接口）
export async function publishVideo(data) {
    // 如果有file对象，使用V2分片上传
    if (data.file) {
        return await uploadVideoWithChunks({
            file: data.file,
            title: data.title || data.videoTitle,
            description: data.description || data.videoDesc,
            labName: data.labName || '',
            category: data.category || data.categoryId || '',
            open: data.open || 1,
            onProgress: data.onProgress,
            onChunkComplete: data.onChunkComplete
        })
    }
    
    // 兼容旧的URL方式
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
    
    return await publishVideoComplete({
        upload_id: uploadId,
        video_url: data.videoUrl,
        cover_url: data.coverUrl || data.videoCover,
        title: data.title || data.videoTitle,
        description: data.description || data.videoDesc,
    })
}

// Get video categories from backend
export async function getVideoCategories() {
    return await request({
        url: '/v1/video/categories',
        method: 'get',
    })
}

// 视频分类列表 (legacy)
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

// ========== 高级功能 API ==========

// 个性化推荐视频（基于推荐引擎）
export async function getRecommendedVideos(params = {}) {
    return await request({
        url: '/v1/recommend/video',
        method: 'get',
        params: {
            count: params.count || 10,
            categories: params.categories || '',
            algorithm_type: params.algorithmType || 'default'
        }
    })
}

// 获取热门视频排行榜
export async function getHotVideoRanking(params = {}) {
    return await request({
        url: '/v2/video/hot/ranking',
        method: 'get',
        params: {
            limit: params.limit || 20,
            time_range: params.timeRange || 'day' // day, week, month
        }
    })
}

// 视频搜索 - ES全文搜索（增强版）
export async function searchVideosV2(params) {
    return await request({
        url: '/v1/video/search',
        method: 'post',
        data: {
            keywords: params.keywords || '',
            username: params.username || '',
            page_size: params.pageSize || 20,
            page_num: params.pageNum || 1,
            from_date: params.fromDate || 0,
            to_date: params.toDate || 0
        }
    })
}

// 获取视频详情（包含实时统计数据）
export async function getVideoDetailV2(videoId) {
    return await request({
        url: '/v2/video/detail',
        method: 'get',
        params: { video_id: videoId }
    })
}

// 批量获取视频统计数据
export async function batchGetVideoStats(videoIds) {
    return await request({
        url: '/v2/video/stats/batch',
        method: 'post',
        data: { video_ids: videoIds }
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

// ========== 观看历史相关 API ==========

// 获取观看历史列表
export async function getWatchHistory(params) {
    return await request({
        url: '/v2/history/list',
        method: 'get',
        params: params
    })
}

// 添加观看历史
export async function addWatchHistory(data) {
    return await request({
        url: '/v2/history/add',
        method: 'post',
        data: data
    })
}

// 删除单条观看历史
export async function deleteWatchHistoryItem(videoId) {
    return await request({
        url: '/v2/history/delete',
        method: 'delete',
        params: { video_id: videoId }
    })
}

// 清空观看历史
export async function clearWatchHistory(dateRange) {
    return await request({
        url: '/v2/history/clear',
        method: 'delete',
        params: { date_range: dateRange || 'all' }
    })
}

// ========== 视频浏览量相关 API ==========

// 记录视频访问（V2版本）
export async function videoVisitV2(data) {
    return await request({
        url: '/v2/video/visit',
        method: 'post',
        data: data
    })
}

// 获取视频浏览量
export async function getVideoVisitCount(videoId) {
    return await request({
        url: '/v2/video/visit/count',
        method: 'get',
        params: { video_id: videoId }
    })
}
