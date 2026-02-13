import request from '@/utils/request'

// 推荐视频流-feed
export async function recommendVideoFeed(count = 10) {
    return await request({
        url: '/v1/recommend/video',
        method: 'get',
        params: {
            count: count
        }
    })
}
