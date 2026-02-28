import request from '@/utils/request'

// 分页查询通知
export function noticePage(data) {
    return request({
        url: '/v2/notification/list',
        method: 'get',
        params: {
            page_num: data.pageNum || 1,
            page_size: data.pageSize || 10,
            type: convertNoticeType(data.noticeType)
        }
    })
}

// 删除通知 (标记已读)
export function delNotice(noticeId) {
    return request({
        url: '/v2/notification/read',
        method: 'post',
        params: {
            notification_id: noticeId,
            mark_all: false
        }
    })
}

// 未读通知数量
export function noticeCount(data) {
    return request({
        url: '/v2/notification/unread',
        method: 'get'
    })
}

// 将前端通知类型编号转为后端 Redis key 中的类型字符串
function convertNoticeType(type_) {
    const typeMap = {
        '': 'all',            // 全部消息
        '0': 'video_like',    // 点赞视频
        '1': 'follow',        // 关注
        '2': 'video_like',    // 收藏 (暂时映射到video_like)
        '3': 'comment',       // 视频被评论
        '4': 'comment_reply', // 回复评论
        '5': 'comment_like',  // 赞了评论
    }
    return typeMap[type_] || 'all'
}
