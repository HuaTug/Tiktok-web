
// 分页查询通知 (暂时不支持，返回空数据)
export function noticePage(data) {
    // Backend notification API not implemented yet
    // Return mock empty data for now
    return Promise.resolve({
        code: 0,
        message: 'success',
        data: {
            list: [],
            total: 0
        }
    })
}

// 删除通知 (暂时不支持)
export function delNotice(noticeId) {
    // Backend notification API not implemented yet
    return Promise.resolve({
        code: 0,
        message: 'success',
        data: null
    })
}

// 未读通知数量 (暂时不支持，返回0)
export function noticeCount(data) {
    // Backend notification API not implemented yet
    return Promise.resolve({
        code: 0,
        message: 'success',
        data: 0
    })
}
