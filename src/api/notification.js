import request from '@/utils/request'

// ========== 通知中心 API ==========

// 获取通知列表
export async function getNotificationList(params = {}) {
    return await request({
        url: '/v2/notification/list',
        method: 'get',
        params: {
            page_num: params.pageNum || 1,
            page_size: params.pageSize || 20,
            type: params.type || 'all' // all, like, comment, follow, system
        }
    })
}

// 标记通知为已读
export async function markNotificationRead(params = {}) {
    return await request({
        url: '/v2/notification/read',
        method: 'post',
        params: {
            notification_id: params.notificationId || '',
            mark_all: params.markAll || false
        }
    })
}

// 获取未读通知数量
export async function getUnreadNotificationCount() {
    return await request({
        url: '/v2/notification/unread',
        method: 'get'
    })
}

// ========== 热门排行榜 API ==========

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
