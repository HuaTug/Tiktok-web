import request from '@/utils/request'

// 分页查询通知
export function noticePage(data) {
    // 通知功能后端暂未实现，返回空数据
    return Promise.resolve({
        code: 200,
        message: 'success',
        data: {
            list: [],
            total: 0
        }
    })
}

// 删除通知 (标记已读)
export function delNotice(noticeId) {
    // 通知功能后端暂未实现，返回成功
    return Promise.resolve({
        code: 200,
        message: 'success',
        data: null
    })
}

// 未读通知数量
export function noticeCount(data) {
    // 通知功能后端暂未实现，返回0
    return Promise.resolve({
        code: 200,
        message: 'success',
        data: 0
    })
}
