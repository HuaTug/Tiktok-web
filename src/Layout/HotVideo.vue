<template>
  <div class="hot-container wh100">
    <el-scrollbar>
      <el-empty v-show="hotVideoTotal<=0" description="暂无数据"/>
      <el-skeleton class="w100" :loading="loading" animated>
        <template #template>
          <div class="loading-container" v-for="i in 2">
            <div class="loading-item" v-for="i in 5">
              <el-skeleton-item variant="image" style="width: 100%; height: 300px"/>
              <div class="p1rem">
                <el-skeleton-item variant="h1" style="width: 80%"/>
                <div>
                  <el-skeleton-item variant="text"/>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template #default>
          <div class="hotVideo-list w100" style="height: auto">
            <div class="hotVideos"
                 v-masonry
                 fit-width="true"
                 transition-duration="0.2s"
                 item-selector=".hotVideo-item">
              <!--              热门排行榜（新样式）-->
              <div style="min-height: 500px; width: 100%; max-width: 600px;" class="hotVideo-item">
                <HotVideoRanking />
              </div>
              <!--              热榜-->
              <div style="height: 600px;" class="hotVideo-item">
                <div class="hotVideo-card wh100">
                  <el-tabs v-model="activeName" @tab-click="handleHotTabClick" class="wh100">
                    <el-tab-pane v-for="item in hotTabShow"
                                 :key="item.id"
                                 :label="item.tabName"
                                 :lazy="true"
                                 :name="item.tabName">
                      <el-scrollbar>
                        <div class="hot-search-list w100" style="height: auto">
                          <div v-for="(it,index) in item.dataList" class="p5px">
                            <div class="text-hv-primary cp hot-hover-item">
                              <p class="one-line">
                                <span class="mr5px">{{ index + 1 }}、</span>
                                <span class="" @click="handleClickHotTable(it)"> {{ it }}</span>
                              </p></div>
                          </div>
                        </div>
                      </el-scrollbar>
                    </el-tab-pane>
                  </el-tabs>
                </div>
              </div>
              <!--              热搜词云面板-->
              <div style="min-height: 280px; width: 100%; max-width: 600px;" class="hotVideo-item">
                <div class="hotVideo-card" style="padding: 20px; border-radius: var(--card-radius); background: var(--bg-surface);">
                  <h3 style="margin-bottom: 16px; font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: 8px; color: var(--text-main);">
                    🔥 热搜词云
                  </h3>
                  <div class="word-cloud-container" style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">
                    <span
                      v-for="(word, index) in hotWordCloud"
                      :key="index"
                      class="word-cloud-tag cp"
                      :style="{
                        fontSize: getWordSize(index) + 'px',
                        color: getWordColor(index),
                        fontWeight: index < 3 ? '700' : index < 6 ? '600' : '400',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        background: getWordBg(index),
                        transition: 'all 0.25s ease',
                        display: 'inline-block',
                        lineHeight: '1.8',
                      }"
                      @click="handleClickHotTable(word)"
                      @mouseenter="$event.target.style.transform = 'scale(1.08)'"
                      @mouseleave="$event.target.style.transform = 'scale(1)'"
                    >
                      {{ word }}
                    </span>
                    <p v-if="hotWordCloud.length === 0" style="color: var(--text-muted); font-size: 14px;">暂无热搜数据</p>
                  </div>
                </div>
              </div>
              <!--              热门视频-->
              <div v-for='(item,index) in hotVideoList'
                   :key="item.videoId"
                   v-masonry-tile
                   class="hotVideo-item cp">
                <VideoHotCard :video="item"/>
              </div>
            </div>
            <Loading v-if="loadingIcon" :is-full-screen="false"/>
          </div>
        </template>
      </el-skeleton>
      <div v-if="dataNotMore">
        <el-divider>暂无更多数据</el-divider>
      </div>
      <!--      <el-dialog v-model="dialogVisible"-->
      <!--                 @close="dialogDestroy"-->
      <!--                 width="80%"-->
      <!--                 :show-close="false">-->
      <!--        <template #header="{ close, titleId, titleClass }">-->
      <!--          <h3 class="one-line" :id="titleId" :class="titleClass">{{ video.videoTitle }}</h3>-->
      <!--          <el-button circle :icon="Close" type="info" @click="close">-->
      <!--          </el-button>-->
      <!--        </template>-->
      <!--        <video class="dialog-video"-->
      <!--               style="width: 100%;max-height: 100vh;height: 60vh; border-radius: 1rem"-->
      <!--               autoplay-->
      <!--               :src="video.videoUrl"-->
      <!--               controls/>-->
      <!--      </el-dialog>-->
    </el-scrollbar>
    <el-backtop :right="16" :bottom="16" target=".main-container  .el-scrollbar__wrap"></el-backtop>
  </div>
  <!--  <el-dialog-->
  <!--      v-model="userVideoDialogVisible"-->
  <!--      :modal="false"-->
  <!--      custom-class="user-video-dialog"-->
  <!--      fullscreen-->
  <!--      :destroy-on-close="true"-->
  <!--      align-center>-->
  <!--    <VideoPlayDialog :dialog-video="video" @dialogVisible="dialogVisibleEmit"/>-->
  <!--  </el-dialog>-->
</template>

<script>
import { batchFavoriteStatus, batchLikeStatus } from "@/api/behave.js";
import { searchHotLoad } from "@/api/search.js";
import { followAndFans } from "@/api/social.js";
import { getVideoVOById, hotVideoPage, userLikeNums } from "@/api/video";
import Loading from "@/components/Loading.vue";
import VideoDiscoverCard from "@/components/video/card/VideoDiscoverCard.vue";
import VideoHotCard from "@/components/video/card/VideoHotCard.vue";
import HotVideoRanking from "@/components/video/HotVideoRanking.vue";
import VideoPlayDialog from "@/components/video/VideoPlayDialog.vue";
import { userInfoX } from "@/store/userInfoX";
import { encodeData } from "@/utils/roydon.js";
import { Close, UserFilled } from "@element-plus/icons-vue";

export default {
  name: "HotVideo",
  components: {VideoHotCard, VideoDiscoverCard, VideoPlayDialog, Loading, HotVideoRanking},
  computed: {
    Close() {
      return Close
    },
    UserFilled() {
      return UserFilled
    }
  },
  data() {
    return {
      pageDto: {
        pageNum: 1,
        pageSize: 10
      },
      hotSearchPageDto: {
        pageNum: 1,
        pageSize: 50
      },
      userVideoLikes: "",
      followedNums: "",
      fanNums: "",
      dialogVisible: false,
      loading: true,
      loadingIcon: false,
      hotVideoList: [],
      hotVideoTotal: undefined,
      hotVideoQueryParams: {
        pageNum: 1,
        pageSize: 20
      },
      video: {},
      loadingData: true,
      dataNotMore: false,
      activeName: "热榜",//热榜区域
      hotTabShow: [
        {id: 1, tabName: "热榜", tabUrl: "/user/1", dataList: []},
        // {id: 2, tabName: "挑战榜", tabUrl: "/user/4", dataList: []},
      ],
      hotMsg: [],
      playVideoUrl: "",//hover之后播放的video
      userVideoDialogVisible: false,
      hotWordCloud: [], // Hot word cloud data
    };
  },
  created() {
    this.getHotVideoPage()
    this.loadHotWordCloud()
    // this.getHotSearchPage()
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll, true);
  },
  destroyed() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    // 格式化视频列表，将后端数据格式转换为前端组件需要的格式
    formatVideoList(items) {
      if (!Array.isArray(items)) return []
      return items
        .filter(item => {
          // 过滤掉 video_id 为 0 或空的无效数据
          const videoId = item.video_id ?? item.VideoId ?? item.videoId
          return videoId !== undefined && videoId !== null && videoId !== 0
        })
        .map(item => {
          // 使用 ?? 代替 || 以正确处理 0 值
          const videoId = item.video_id ?? item.VideoId ?? item.videoId
          const userId = item.user_id ?? item.UserId ?? item.userId
          
          console.log('📦 [formatVideoList] 处理视频数据:', { video_id: item.video_id, user_id: item.user_id, videoId, userId })
          
          // 转换视频URL
          let videoUrl = item.video_url || item.VideoUrl || item.videoUrl
          if (!videoUrl || videoUrl.includes('localhost:9002')) {
            videoUrl = `/tiktok-user-content/users/${userId}/videos/${videoId}/source/original.mp4`
          }
          
          // 转换封面URL
          let coverImage = item.cover_url || item.CoverUrl || item.coverUrl || item.coverImage
          if (!coverImage || coverImage.includes('localhost:9002')) {
            coverImage = `/tiktok-user-content/users/${userId}/videos/${videoId}/thumbnails/thumb_medium.jpg`
          }
          
          return {
            videoId: videoId,
            videoTitle: item.video_title || item.VideoTitle || item.title || item.videoTitle || '未命名视频',
            videoUrl: videoUrl,
            coverImage: coverImage,
            userId: userId,
            userNickName: item.user_name || item.UserName || item.userName,
            description: item.description || item.Description || '',
            likeNum: item.likes_count ?? item.like_count ?? item.LikeCount ?? item.likeCount ?? item.likeNum ?? 0,
            commentNum: item.comment_count ?? item.CommentCount ?? item.commentCount ?? item.commentNum ?? 0,
            visitCount: item.visit_count ?? item.VisitCount ?? item.visitCount ?? 0,
            favoritesNum: item.favorites_count ?? item.FavoritesCount ?? item.favoritesCount ?? 0,
            publishType: item.publish_type ?? item.PublishType ?? item.publishType ?? '0', // 默认视频类型
            createTime: item.created_at || item.CreatedAt || item.createTime,
            weatherLike: false, // 默认未点赞，稍后通过API获取
            weatherFavorite: false, // 默认未收藏，稍后通过API获取
            ...item
          }
        })
    },
    handleSocialBehaveNumsHover(userId, index) {
      this.$refs[`pop${index}`][0].showPopper = true
      userLikeNums(userId).then(res => {
        // Refactored-TikTok backend uses code 0 for success
        if (res.code === 0 || res.code === 200) {
          this.userVideoLikes = res.data
        }
      })
      followAndFans(userId).then(res => {
        // Refactored-TikTok backend uses code 0 for success
        if (res.code === 0 || res.code === 200) {
          this.followedNums = res.data.followedNums
          this.fanNums = res.data.fanNums
        }
      })
    },
    handleSocialBehaveNumsHoverLeave(userId, index) {
      this.$refs[`pop${index}`][0].showPopper = false
    },
    // 批量获取点赞状态
    async fetchLikeStatusBatch(videoList) {
      const videoIds = videoList.map(v => v.videoId).filter(id => id)
      if (videoIds.length === 0) return videoList
      
      try {
        const res = await batchLikeStatus(videoIds)
        console.log('❤️ [HotVideo] 批量获取点赞状态响应:', res)
        if (res && (res.code === 200 || res.code === 0 || res.code === 10000) && res.data) {
          const likeStatus = res.data.like_status || {}
          const likeCounts = res.data.like_counts || {}
          return videoList.map(video => {
            // JSON 中的 key 是 string 类型，需要转换为 string 来匹配
            const videoIdStr = String(video.videoId)
            const isLiked = likeStatus[videoIdStr] === true || likeStatus[video.videoId] === true
            const likeCount = likeCounts[videoIdStr] || likeCounts[video.videoId] || 0
            return {
              ...video,
              weatherLike: isLiked,
              // 如果 Redis 有点赞数则使用，否则保持原值
              likeNum: likeCount > 0 ? likeCount : video.likeNum
            }
          })
        }
      } catch (error) {
        console.error('❌ [HotVideo] 获取点赞状态失败:', error)
      }
      return videoList
    },
    // 批量获取收藏状态
    async fetchFavoriteStatusBatch(videoList) {
      const videoIds = videoList.map(v => v.videoId).filter(id => id)
      console.log('⭐ [HotVideo] 批量获取收藏状态, videoIds:', videoIds)
      if (videoIds.length === 0) return videoList
      
      try {
        const res = await batchFavoriteStatus(videoIds)
        console.log('⭐ [HotVideo] 批量获取收藏状态响应:', res)
        console.log('⭐ [HotVideo] 响应 code:', res?.code, 'data:', res?.data)
        if (res && (res.code === 200 || res.code === 0 || res.code === 10000) && res.data) {
          const favoriteStatus = res.data.favorite_status || {}
          console.log('⭐ [HotVideo] 收藏状态数据:', JSON.stringify(favoriteStatus))
          console.log('⭐ [HotVideo] 收藏状态 keys:', Object.keys(favoriteStatus))
          return videoList.map(video => {
            // JSON 中的 key 是 string 类型，需要转换为 string 来匹配
            const videoIdStr = String(video.videoId)
            const isFavorited = favoriteStatus[videoIdStr] === true || favoriteStatus[video.videoId] === true
            console.log(`⭐ [HotVideo] 视频 ${video.videoId} (str: "${videoIdStr}") 收藏状态:`, isFavorited, 
              'favoriteStatus[str]:', favoriteStatus[videoIdStr], 
              'favoriteStatus[num]:', favoriteStatus[video.videoId])
            return {
              ...video,
              weatherFavorite: isFavorited
            }
          })
        }
      } catch (error) {
        console.error('❌ [HotVideo] 获取收藏状态失败:', error)
      }
      return videoList
    },
    async getHotVideoPage() {
      this.loading = true
      try {
        const res = await hotVideoPage(this.hotVideoQueryParams)
        // Refactored-TikTok backend uses code 10000 for success
        if (res.code === 10000 || res.code === 0 || res.code === 200) {
          console.log('📦 [HotVideo] 响应数据结构:', Object.keys(res))
          console.log('📦 [HotVideo] Popular 数据:', res.data?.Popular, res.Popular)
          // 优先从 res.data.Popular 获取（request.js 可能没有展开）
          const items = res.data?.Popular || res.Popular || res.data?.list || res.rows || []
          console.log('📦 [HotVideo] 提取的 items:', items)
          let videoList = this.formatVideoList(items)
          
          // 批量获取点赞状态
          videoList = await this.fetchLikeStatusBatch(videoList)
          // 批量获取收藏状态
          videoList = await this.fetchFavoriteStatusBatch(videoList)
          
          this.hotVideoList = videoList
          this.hotVideoTotal = this.hotVideoList.length || res.total || res.data?.total || 0
          this.loading = false
        }
      } catch (error) {
        console.error('❌ [HotVideo] 获取热门视频失败:', error)
        this.loading = false
        
        // 显示友好的错误提示，但使用空数组继续渲染
        this.hotVideoList = []
        this.hotVideoTotal = 0
        
        // 如果后端panic，建议用户稍后重试
        if (error && error.message && error.message.includes('panic')) {
          console.warn('⚠️ [HotVideo] 后端服务异常，前端已降级处理')
        }
      }
      searchHotLoad(this.hotSearchPageDto).then(res => {
        // Refactored-TikTok backend uses code 10000 for success
        if (res.code === 10000 || res.code === 0 || res.code === 200) {
          // 优先从 res.data.Popular 获取
          const popularData = res.data?.Popular || res.Popular || res.data || []
          // 如果返回的是视频对象数组，提取标题作为热搜词
          if (Array.isArray(popularData) && popularData.length > 0) {
            if (typeof popularData[0] === 'object') {
              // 是视频对象，提取标题
              this.hotTabShow[0].dataList = popularData
                .map(item => item.title || item.video_title || item.videoTitle)
                .filter(title => title) // 过滤空值
            } else {
              // 是字符串数组，直接使用
              this.hotTabShow[0].dataList = popularData
            }
          } else {
            this.hotTabShow[0].dataList = []
          }
        }
      }).catch(error => {
        console.error('❌ [HotVideo] 获取热搜榜失败:', error)
        this.hotTabShow[0].dataList = []
      })
    },
    //获取热搜榜分页查询
    videoDialog(videoId) {
      const videoF = this.hotVideoList.filter(v => {
        return videoId === v.videoId
      })
      this.video = videoF[0]
      this.dialogVisible = true
    },
    dialogDestroy() {
      const videoD = document.getElementsByClassName("dialog-video")
      videoD[0].pause();
    },
    handleScroll(e) {
      if (e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight - 200) {
        //加载更多
        if (this.loadingData) {
          // this.loading = true
          this.loadingData = false
          this.loadingIcon = true
          this.hotVideoQueryParams.pageNum += 1
          hotVideoPage(this.hotVideoQueryParams).then(async res => {
            // Refactored-TikTok backend uses code 10000 for success
            if (res.code === 10000 || res.code === 0 || res.code === 200) {
              // 优先从 res.data.Popular 获取
              let rows = this.formatVideoList(res.data?.Popular || res.Popular || res.data?.list || res.rows || [])
              if (rows.length === 0) {
                this.dataNotMore = true
                this.loadingIcon = false
                this.loadingData = false
                return;
              }
              // 批量获取点赞状态
              rows = await this.fetchLikeStatusBatch(rows)
              // 批量获取收藏状态
              rows = await this.fetchFavoriteStatusBatch(rows)
              
              this.hotVideoList = this.hotVideoList.concat(rows)
              // this.hotVideoTotal = res.total
              this.loadingIcon = false
              // this.loading = false
              setTimeout(() => {
                // 流控
                this.loadingData = true
              }, 1000);
            } else {
              this.loadingIcon = false
            }
          }).catch(error => {
            console.error('❌ [HotVideo] 滚动加载更多失败:', error)
            this.loadingIcon = false
            this.loadingData = true // 允许下次继续尝试
            
            // 如果是后端panic错误，提示用户稍后重试
            if (error && error.message && error.message.includes('panic')) {
              console.warn('⚠️ [HotVideo] 后端服务异常，滚动加载已失败，等待用户再次尝试')
            }
          })
        }
      }
    },
    // 跳转到用户详情页面
    handlePersonInfo(userId) {
      const loginUser = userInfoX().userInfo
      if (userId === loginUser.userId) {
        this.$router.push({
          path: '/user'
        })
      } else {
        this.$router.push({
          path: '/person/' + encodeData(userId)
        })
      }
    },
    // 热榜tab点击
    handleHotTabClick(tab, event) {
      // console.log(tab.props.name);
      // const route = tab.props.name
      // console.log(this.$route.path)
      // console.log(this.$route.matched[1].path)
      // this.$router.push(route)
    },
    // 热门视频卡片hover播放视频
    handleHoverPlayVideo(videoUrl) {
      this.playVideoUrl = videoUrl
      // console.log(this.playVideoUrl)
    },
    // 热搜点击
    handleClickHotTable(it) {
      this.routerJumpVideoSearch(it)
    },
    // 视频搜索路由跳转
    routerJumpVideoSearch(keyword) {
      // 跳转到搜索页面
      this.$router.push(`/search/video?keyword=${keyword}`);
    },
    handleVideoPlayDialog(item) {
      getVideoVOById(item.videoId).then(res => {
        // Refactored-TikTok backend uses code 0 for success
        if (res.code === 0 || res.code === 200) {
          this.video = res.data
          this.userVideoDialogVisible = true
        }
      })
    },
    dialogVisibleEmit(flag) {
      this.userVideoDialogVisible = flag
    },
    // Load hot word cloud data
    loadHotWordCloud() {
      searchHotLoad({ pageNum: 1, pageSize: 20 }).then(res => {
        if (res.code === 10000 || res.code === 0 || res.code === 200) {
          const popularData = res.data?.Popular || res.Popular || res.data || []
          if (Array.isArray(popularData) && popularData.length > 0) {
            if (typeof popularData[0] === 'object') {
              this.hotWordCloud = popularData
                .map(item => item.title || item.video_title || item.videoTitle)
                .filter(title => title)
                .slice(0, 20)
            } else {
              this.hotWordCloud = popularData.slice(0, 20)
            }
          }
        }
      }).catch(() => {
        this.hotWordCloud = []
      })
    },
    // Word cloud helper: font size based on rank
    getWordSize(index) {
      if (index < 3) return 20
      if (index < 6) return 16
      if (index < 10) return 14
      return 12
    },
    // Word cloud helper: color based on rank
    getWordColor(index) {
      const colors = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6', '#1abc9c', '#e84393', '#6c5ce7', '#00b894']
      return colors[index % colors.length]
    },
    // Word cloud helper: background color
    getWordBg(index) {
      const bgs = [
        'rgba(231,76,60,0.1)', 'rgba(230,126,34,0.1)', 'rgba(241,196,15,0.1)',
        'rgba(46,204,113,0.1)', 'rgba(52,152,219,0.1)', 'rgba(155,89,182,0.1)',
        'rgba(26,188,156,0.1)', 'rgba(232,67,147,0.1)', 'rgba(108,92,231,0.1)', 'rgba(0,184,148,0.1)'
      ]
      return bgs[index % bgs.length]
    }
  }
};
</script>

<style scoped>
@import "@/assets/styles/hotVideo.scss";
</style>
