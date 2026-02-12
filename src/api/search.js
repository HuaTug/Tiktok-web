import request from '@/utils/request'

// Video search
export function searchVideo(data) {
    return request({
        url: '/v1/video/search',
        method: 'post',
        data: data
    })
}

// User search
export function searchUser(data) {
    return request({
        url: '/v1/user/query/',
        method: 'post',
        data: data
    })
}

// ========== Search History ==========

// Get search history
export function searchHistoryLoad() {
    return request({
        url: '/v1/search/history',
        method: 'get',
    })
}

// Add search history
export function addSearchHistory(keyword) {
    return request({
        url: '/v1/search/history',
        method: 'post',
        data: { keyword }
    })
}

// Delete a specific search history item or all
export function delSearchHistory(keyword) {
    return request({
        url: '/v1/search/history',
        method: 'delete',
        params: { keyword }
    })
}

// Clear all search history
export function clearAllSearchHistory() {
    return request({
        url: '/v1/search/history',
        method: 'delete',
        params: { all: 'true' }
    })
}

// ========== Search Suggestions (猜你想搜) ==========

// Get personalized search suggestions
export function getSearchSuggestions() {
    return request({
        url: '/v1/search/suggestions',
        method: 'get',
    })
}

// ========== Hot Search ==========

// Get hot search
export async function searchHotLoad(data) {
    return await request({
        url: '/v1/popular/',
        method: 'get',
        params: data
    })
}

// ========== Video Search Suggest (Related Search) ==========

/**
 * Video search suggestions (for the right panel on search page)
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
