<template>
  <!--  视频播放-->
  <VideoPlayerCarousel
      v-if="showVideoPlayer"
      :loading="loading"
      :video-list="videoList"
      @reloadVideoFeed="reloadVideoFeedEmit"/>
  <!--  <div v-loading="loading"-->
  <!--       class="wh100"-->
  <!--       :element-loading-svg="svg"-->
  <!--       element-loading-svg-view-box="-10, -10, 50, 50">-->
  <!--    <VideoPlayerSwiper v-if="showVideoPlayer"-->
  <!--                       :loading="loading"-->
  <!--                       :video-list="videoList"-->
  <!--                       @reloadVideoFeed="reloadVideoFeedEmit"/>-->
  <!--  </div>-->
</template>

<script>
import { getPersonInfo } from "@/api/member.js";
import { recommendVideoFeed } from "@/api/recommend";
import { videoFeed } from "@/api/video";
import { batchLikeStatus, batchFavoriteStatus } from "@/api/behave";
import VideoPlayerCarousel from "@/components/video/VideoPlayerCarousel.vue";
import VideoPlayerSwiper from "@/components/video/VideoPlayerSwiper.vue";

export default {
  name: 'Video',
  components: {VideoPlayerSwiper, VideoPlayerCarousel},
  data() {
    return {
      loading: true,
      autoPlay: true, // 自动播放视频
      showVideoPlayer: true,
      publishTime: null,
      videoUrl: null,
      videoList: [],
      pageNum: 1,        // 当前页码
      pageSize: 10,      // 每页条数（每次拉取10条）
      hasMore: true,     // 是否还有更多数据
      // add
      svg: `<path class="path" d=" M 30 15 L 28 17 M 25.61 25.61 A 15 15, 0, 0, 1, 15 30 A 15 15, 0, 1, 1, 27.99 7.5 L 15 15" style="stroke-width: 4px; fill: rgba(10, 10, 10, 0)"/>`,
    }
  },
  created() {
    // this.getVideoFeed()
    // this.getRecommendVideoFeed()
  },
  mounted() {
    // 优先使用 videoFeed，推荐系统暂时没有数据
    this.getVideoFeed()
  },
  methods: {
    // 将后端 snake_case 数据转换为前端需要的 camelCase 格式
    transformVideoData(video) {
      // 获取原始 URL
      let videoUrl = video.video_url || video.videoUrl
      let coverImage = video.cover_url || video.coverImage
      let videoId = video.video_id || video.videoId || video.id
      let userAvatar = video.user_avatar || video.userAvatar || video.avatar
      
      // Helper function to convert MinIO URL to relative path for vite proxy
      const convertToProxyPath = (url) => {
        if (!url) return url
        try {
          // Handle URLs like http://localhost:9002/video/xxx or http://localhost:9002/picture/xxx
          // Convert to relative path like /video/xxx or /picture/xxx for vite proxy
          const urlObj = new URL(url)
          if (urlObj.hostname === 'localhost' && (urlObj.port === '9002' || urlObj.port === '9000' || urlObj.port === '9091')) {
            // Return relative path for proxy
            console.log('🔄 [VIDEO] 转换URL为代理路径:', url, '->', urlObj.pathname)
            return urlObj.pathname
          }
        } catch (e) {
          // If URL parsing fails, try simple string replacement
          const match = url.match(/http:\/\/localhost:\d+(.+)/)
          if (match) {
            console.log('🔄 [VIDEO] 转换URL为代理路径(fallback):', url, '->', match[1])
            return match[1]
          }
        }
        return url
      }
      
      // Convert URLs to proxy paths
      videoUrl = convertToProxyPath(videoUrl)
      coverImage = convertToProxyPath(coverImage)
      userAvatar = convertToProxyPath(userAvatar)
      
      console.log('📦 [VIDEO] 转换视频数据:', {
        videoId,
        userId: video.user_id || video.userId,
        videoUrl,
        coverImage,
        title: video.title || video.videoTitle,
        userNickName: video.user_name || video.username || video.userNickName || '未知用户'
      })
      
      return {
        videoId: videoId,
        userId: video.user_id || video.userId,
        videoUrl: videoUrl,
        coverImage: coverImage,
        videoTitle: video.title || video.videoTitle,
        description: video.description,
        likeNum: video.likes_count || video.likeNum || 0,
        commentNum: video.comment_count || video.commentNum || 0,
        shareNum: video.share_count || video.shareNum || 0,
        favoritesNum: video.favorites_count || video.favoritesNum || 0,
        createTime: video.created_at || video.createTime,
        userNickName: video.user_name || video.username || video.userNickName || '未知用户',
        userAvatar: userAvatar,
        publishType: '0', // 默认为视频类型
        weatherLike: false,
        weatherFollow: false,
        weatherFavorite: false,
        tags: video.label_names ? video.label_names.split(',') : [],
        category: video.category || ''
      }
    },
    // 批量获取用户信息
    async fetchUserInfoBatch(userIds) {
      const uniqueUserIds = [...new Set(userIds)]
      const userInfoMap = {}
      
      console.log('👤 [VIDEO] 批量获取用户信息:', uniqueUserIds.length, '个用户')
      
      for (const userId of uniqueUserIds) {
        try {
          const res = await this.getUserInfoById(userId)
          console.log('📦 [VIDEO] 用户信息响应:', userId, res)
          if (res && (res.code === 200 || res.code === 0) && res.data) {
            // 后端返回格式: res.data.User (thrift生成) 或 res.data (直接返回)
            const userData = res.data.User || res.data
            userInfoMap[userId] = {
              userId: userData.user_id || userData.userId,
              userName: userData.user_name || userData.userName,
              avatarUrl: userData.avatar_url || userData.avatarUrl
            }
            console.log('✅ [VIDEO] 获取用户信息成功:', userId, userInfoMap[userId])
          }
        } catch (error) {
          console.error('❌ [VIDEO] 获取用户信息失败:', userId, error)
        }
      }
      
      return userInfoMap
    },
    // 获取单个用户信息
    getUserInfoById(userId) {
      // 如果是当前登录用户，使用 getInfo
      const loginUser = this.$store?.state?.userInfoX?.userInfo
      if (loginUser && loginUser.userId == userId) {
        return this.$store.dispatch('userInfoX/getInfo')
      }
      // 否则请求指定用户信息
      return getPersonInfo(userId)
    },
    // 将用户信息补充到视频列表
    enrichVideosWithUserInfo(videoList, userInfoMap) {
      return videoList.map(video => {
        const userInfo = userInfoMap[video.userId]
        if (userInfo) {
          return {
            ...video,
            userNickName: userInfo.userName || video.userNickName,
            userAvatar: userInfo.avatarUrl || video.userAvatar
          }
        }
        return video
      })
    },
    // 批量获取点赞状态和点赞数并更新视频列表
    async fetchLikeStatusBatch(videoList) {
      const videoIds = videoList.map(v => v.videoId).filter(id => id)
      if (videoIds.length === 0) return videoList
      
      try {
        const res = await batchLikeStatus(videoIds)
        console.log('❤️ [VIDEO] 批量获取点赞状态响应:', res)
        if (res && res.code === 200 && res.data) {
          const likeStatus = res.data.like_status || {}
          const likeCounts = res.data.like_counts || {}
          return videoList.map(video => ({
            ...video,
            weatherLike: likeStatus[video.videoId] || false,
            // 如果 Redis 有点赞数则使用，否则保持原值
            likeNum: likeCounts[video.videoId] > 0 ? likeCounts[video.videoId] : video.likeNum
          }))
        }
      } catch (error) {
        console.error('❌ [VIDEO] 获取点赞状态失败:', error)
      }
      return videoList
    },
    // 批量获取收藏状态并更新视频列表
    async fetchFavoriteStatusBatch(videoList) {
      const videoIds = videoList.map(v => v.videoId).filter(id => id)
      if (videoIds.length === 0) return videoList
      
      try {
        const res = await batchFavoriteStatus(videoIds)
        console.log('⭐ [VIDEO] 批量获取收藏状态响应:', res)
        if (res && res.code === 200 && res.data) {
          const favoriteStatus = res.data.favorite_status || {}
          return videoList.map(video => ({
            ...video,
            weatherFavorite: favoriteStatus[video.videoId] || false
          }))
        }
      } catch (error) {
        console.error('❌ [VIDEO] 获取收藏状态失败:', error)
      }
      return videoList
    },
    getVideoFeed() {
      console.log('📹 [VIDEO] 开始获取视频feed... pageNum:', this.pageNum, 'pageSize:', this.pageSize)
      if (!this.hasMore) {
        console.log('📹 [VIDEO] 没有更多数据了')
        return
      }
      this.loading = true
      videoFeed(this.publishTime, this.pageSize, this.pageNum).then(async res => {
        console.log('📥 [VIDEO] 收到视频feed响应:', res)
        // Refactored-TikTok backend uses code 200 after conversion
        if (res.code === 200 && res.data != null) {
          // 后端返回格式: data.video_list
          const rawData = res.data?.video_list || res.data?.list || (Array.isArray(res.data) ? res.data : [])
          console.log('📹 [VIDEO] 原始视频数据:', rawData.length, '个视频')
          // 转换数据格式
          let data = rawData.map(item => this.transformVideoData(item))
          console.log('📹 [VIDEO] 转换后的视频数据:', data.length, '个视频')
          
          // 收集所有用户ID
          const userIds = data.map(video => video.userId).filter(id => id)
          
          // 批量获取用户信息
          if (userIds.length > 0) {
            const userInfoMap = await this.fetchUserInfoBatch(userIds)
            data = this.enrichVideosWithUserInfo(data, userInfoMap)
            console.log('👤 [VIDEO] 补充用户信息后的视频数据:', data.length, '个视频')
          }
          
          // 批量获取点赞状态
          data = await this.fetchLikeStatusBatch(data)
          console.log('❤️ [VIDEO] 补充点赞状态后的视频数据:', data.length, '个视频')
          
          // 批量获取收藏状态
          data = await this.fetchFavoriteStatusBatch(data)
          console.log('⭐ [VIDEO] 补充收藏状态后的视频数据:', data.length, '个视频')
          
          this.videoList = this.videoList.concat(data)
          console.log('📹 [VIDEO] 当前总视频数:', this.videoList.length)
          this.loading = false
          // 如果返回的数据少于请求条数，说明没有更多了
          if (data.length < this.pageSize) {
            this.hasMore = false
            console.log('📹 [VIDEO] 已加载全部视频')
          } else {
            this.pageNum++
          }
          if (this.videoList.length > 0) {
            this.publishTime = this.videoList[this.videoList.length - 1].createTime || this.videoList[this.videoList.length - 1].create_time
          }
          this.showVideoPlayer = true
          console.log('✅ [VIDEO] 视频feed加载成功')
        } else {
          console.error('❌ [VIDEO] 视频feed响应错误')
          console.error('  - res.code:', res.code)
          console.error('  - res.data:', res.data)
          this.$message.error(res.data?.base?.msg || res.message || '获取视频失败')
        }
      }).catch(err => {
        console.error('❌ [VIDEO] 视频feed请求异常:', err)
        this.loading = false
        // 显示更友好的错误信息
        this.$message?.error?.('视频加载失败，请检查网络连接或稍后重试')
      })
    },
    getRecommendVideoFeed() {
      this.loading = true
      recommendVideoFeed(this.pageSize).then(async res => {
        // Refactored-TikTok backend uses code 200 after conversion
        if (res.code === 200 && res.data != null) {
          var that = this;
          // 后端返回格式: data.video_list
          const rawData = res.data?.video_list || res.data?.list || (Array.isArray(res.data) ? res.data : [])
          // 转换数据格式
          let data = rawData.map(item => this.transformVideoData(item))
          
          // 收集所有用户ID
          const userIds = data.map(video => video.userId).filter(id => id)
          
          // 批量获取用户信息
          if (userIds.length > 0) {
            const userInfoMap = await this.fetchUserInfoBatch(userIds)
            data = this.enrichVideosWithUserInfo(data, userInfoMap)
          }
          
          // 批量获取点赞状态
          data = await this.fetchLikeStatusBatch(data)
          
          that.videoList = that.videoList.concat(data)
          this.loading = false
          this.showVideoPlayer = true
        } else {
          this.$message.error(res.data?.base?.msg || res.message || '获取推荐视频失败')
        }
      }).catch(err => {
        console.log('Recommend video feed fetch failed:', err)
        this.loading = false
        this.$message?.error?.('推荐视频加载失败，请检查网络连接')
      })
    },
    autoPlayVideo(val) {
      this.autoPlay = val;
    },
    reloadVideoFeedEmit(val) {
      if (!this.hasMore) {
        console.log('📹 [VIDEO] 没有更多数据，跳过加载')
        return
      }
      this.loading = val
      videoFeed(this.publishTime, this.pageSize, this.pageNum).then(async res => {
        // Refactored-TikTok backend uses code 200 after conversion
        if (res.code === 200 && res.data != null) {
          // 后端返回格式: data.video_list
          const rawData = res.data?.video_list || res.data?.list || (Array.isArray(res.data) ? res.data : [])
          // 转换数据格式
          let data = rawData.map(item => this.transformVideoData(item))
          
          // 收集所有用户ID
          const userIds = data.map(video => video.userId).filter(id => id)
          
          // 批量获取用户信息
          if (userIds.length > 0) {
            const userInfoMap = await this.fetchUserInfoBatch(userIds)
            data = this.enrichVideosWithUserInfo(data, userInfoMap)
          }
          
          // 批量获取点赞状态
          data = await this.fetchLikeStatusBatch(data)
          
          // 追加到已有列表（加载更多）
          this.videoList = this.videoList.concat(data)
          this.loading = false
          // 如果返回的数据少于请求条数，说明没有更多了
          if (data.length < this.pageSize) {
            this.hasMore = false
            console.log('📹 [VIDEO] 已加载全部视频')
          } else {
            this.pageNum++
          }
          this.showVideoPlayer = true
        } else {
          this.$message.error(res.data?.base?.msg || res.message || '获取视频失败')
        }
      }).catch(err => {
        console.log('Reload video feed failed:', err)
        this.loading = false
        this.$message?.error?.('视频刷新失败，请稍后重试')
      })
      // });
    }
  }
}

</script>

<style lang='less' scoped>
.niuyin-video-player {
  margin-bottom: 1rem;
}
</style>
