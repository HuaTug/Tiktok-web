import request from '@/utils/request'

// 我的关注列表
export function followPageList(data) {
    return request({
        url: '/v1/following/list',
        method: 'get',
        params: data
    })
}

// 关注/取关用户
export function followUser(userId, actionType = 1) {
    return request({
        url: '/v1/relation/action',
        method: 'post',
        data: { to_user_id: userId, action_type: actionType }
    })
}

// 关注数、粉丝数
export function followAndFans(userId) {
    return request({
        url: '/v1/following/list',
        method: 'get',
        params: { user_id: userId }
    })
}

// 关注用户视频流
export function followVideoFeed(lastTime) {
    return request({
        url: '/v1/video/feed',
        method: 'get',
        params: { last_time: lastTime }
    })
}

// 初始化用户收件箱 (暂时不支持)
export function initUserInBox() {
    return request({
        url: '/v1/following/list',
        method: 'get'
    })
}

// 粉丝列表
export function fanPageList(data) {
    return request({
        url: '/v1/follower/list',
        method: 'get',
        params: data
    })
}

// 好友列表
export function friendList(data) {
    return request({
        url: '/v1/friend/list',
        method: 'get',
        params: data
    })
}
