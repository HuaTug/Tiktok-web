import request from '@/utils/request'

// 视频搜索
export function searchVideo(data) {
    return request({
        url: '/v1/video/search',
        method: 'post',
        data: data
    })
}

// 用户搜索
export function searchUser(data) {
    return request({
        url: '/v1/user/query/',
        method: 'post',
        data: data
    })
}

// 搜索记录 (暂时不支持，返回空)
export function searchHistoryLoad() {
    return request({
        url: '/v1/video/list',
        method: 'get',
    })
}

// 删除搜索记录 (暂时不支持)
export function delSearchHistory(id) {
    return request({
        url: '/v1/video/list',
        method: 'get',
    })
}

// 热门搜索
export async function searchHotLoad(data) {
    return await request({
        url: '/v1/popular/',
        method: 'get',
        params: data
    })
}

/**
 * 视频搜索建议
 * @param data
 * @returns {*}
 */
export async function videoSearchSuggest(data) {
    return await request({
        url: '/v1/video/search',
        method: 'post',
        data: data
    })
}
