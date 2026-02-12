<template>
  <div class="favorite-video-container">
    <!-- 显示收藏夹标题和返回按钮 -->
    <div v-if="favoriteTitle" class="favorite-header flex-start" style="margin-bottom: 1rem; align-items: center;">
      <el-button type="text" @click="$emit('back')" style="margin-right: 0.5rem;">
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <span class="fs9 fw600">{{ favoriteTitle }}</span>
      <span class="cg fs7" style="margin-left: 0.5rem;">共 {{ favoriteVideoTotal || 0 }} 个视频</span>
    </div>
    <div class="flex-between" v-loading="loadingIcon">
      <el-skeleton class="w100" :loading="loading" animated>
        <template #template>
          <div class="loading-container" v-for="i in 1">
            <div class="loading-item" v-for="i in 5">
              <el-skeleton-item variant="image" style="width: 100%; height: 200px"/>
              <div class="p1rem">
                <el-skeleton-item variant="h1" style="width: 70%"/>
                <div>
                  <el-skeleton-item variant="text"/>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template #default>
          <VideoCard v-for="item in favoriteVideoList" :video="item" @click="handleVideoClick(item)"/>
        </template>
      </el-skeleton>
      <div class="w100">
        <el-empty v-show="favoriteVideoTotal<=0" description="暂无数据"/>
      </div>
    </div>
  </div>
  <div v-if="dataNotMore">
    <el-divider>暂无更多数据</el-divider>
  </div>
  <!--  视频播放弹窗-->
  <el-dialog v-model="dialogVisible"
             @close="dialogDestroy"
             style="height: calc(100% - 10vh);"
             width="80%"
             :show-close="false">
    <template #header="{ close, titleId, titleClass }">
      <h3 class="one-line" :id="titleId" :class="titleClass">{{ video.videoTitle }}</h3>
      <el-button circle :icon="Close" type="primary" @click="close">
      </el-button>
    </template>
    <video class="dialog-video w100"
           autoplay
           style="max-height: 100%;border-radius: 1rem"
           :src="video.videoUrl"
           controls/>
  </el-dialog>
</template>

<script>
import VideoCard from "@/components/video/VideoCard.vue";
import {videoFavoritePage} from "@/api/behave.js";
import {Close, ArrowLeft} from "@element-plus/icons-vue";
import {videoMypage} from "@/api/video.js";

export default {
  name: "UserFavoriteVideo",
  computed: {
    Close() {
      return Close
    },
    ArrowLeft() {
      return ArrowLeft
    }
  },
  components: {VideoCard, ArrowLeft},
  emits: ['back'],  // 声明自定义事件
  props: {
    favoriteId: {
      type: Number,
      default: 0
    },
    favoriteTitle: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: true,
      loadingData: true,
      loadingIcon: false,
      dataNotMore: false,
      dialogVisible: false,
      favoriteVideoList: [],
      favoriteVideoTotal: undefined,
      videoQueryParams: {
        videoTitle: "",
        favoriteId: 0,
        pageNum: 1,
        pageSize: 10
      },
      video: {},
    }
  },
  watch: {
    // 监听 favoriteId 变化，重新加载视频列表
    favoriteId: {
      handler(newVal) {
        console.log('📁 [FAVORITE] favoriteId 变化:', newVal)
        this.videoQueryParams.favoriteId = newVal
        this.videoQueryParams.pageNum = 1
        this.favoriteVideoList = []
        this.dataNotMore = false
        this.initVideoList()
      },
      immediate: false
    }
  },
  created() {
    this.videoQueryParams.favoriteId = this.favoriteId
    this.initVideoList()
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll, true);
  },
  destroyed() {
    document.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    // 收藏视频分页
    initVideoList() {
      this.loading = true
      videoFavoritePage(this.videoQueryParams).then(res => {
        console.log('📦 [FAVORITE] 收藏视频列表响应:', res)
        // Refactored-TikTok backend uses code 10000 for success
        if (res.code === 10000 || res.code === 0 || res.code === 200) {
          // 后端返回格式: { video_list: [...], total_count: number }
          const rawList = res.data?.video_list || res.data?.VideoList || res.data?.list || res.rows || []
          this.favoriteVideoList = this.formatVideoList(rawList)
          this.favoriteVideoTotal = res.data?.total_count || res.data?.TotalCount || res.total || rawList.length || 0
          console.log('✅ [FAVORITE] 转换后的收藏视频列表:', this.favoriteVideoList)
          this.loading = false
        } else {
          this.loading = false
        }
      }).catch(err => {
        console.error('❌ [FAVORITE] 获取收藏视频列表失败:', err)
        this.loading = false
      })
    },
    // 格式化视频列表
    formatVideoList(items) {
      if (!Array.isArray(items)) return []
      return items.map(item => {
        const videoId = item.video_id || item.VideoId || item.videoId
        const userId = item.user_id || item.UserId || item.userId
        
        let videoUrl = item.video_url || item.VideoUrl || item.videoUrl
        if (!videoUrl || videoUrl.includes('localhost:9002')) {
          videoUrl = `/tiktok-user-content/users/${userId}/videos/${videoId}/source/original.mp4`
        }
        
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
          userNickName: item.user_name || item.userName || item.userNickName,
          likeNum: item.like_count || item.LikeCount || item.likeNum || 0,
          commentNum: item.comment_count || item.CommentCount || item.commentNum || 0,
          createTime: item.created_at || item.CreatedAt || item.createTime,
        }
      })
    },
    // 视频点击dialog
    handleVideoClick(video) {
      // this.video = video
      // this.dialogVisible = true
    },
    dialogDestroy() {
      const videoD = document.getElementsByClassName("dialog-video")
      videoD[0].pause();
      this.dialogVisible = false
    },
    handleScroll(e) {
      if (e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight - 10) {
        if(this.dataNotMore){
          return
        }
        //加载更多
        if (this.loadingData) {
          this.loadingIcon = true
          this.loadingData = false
          this.videoQueryParams.pageNum += 1
          videoFavoritePage(this.videoQueryParams).then(res => {
            // Refactored-TikTok backend uses code 10000 for success
            if (res.code === 10000 || res.code === 0 || res.code === 200) {
              const rawList = res.data?.video_list || res.data?.VideoList || res.data?.list || res.rows || []
              if (rawList == null || rawList.length === 0) {
                this.dataNotMore = true
                this.loadingIcon = false
                this.loadingData = false
                return;
              }
              this.favoriteVideoList = this.favoriteVideoList.concat(this.formatVideoList(rawList))
              this.loadingIcon = false
            } else {
              this.loadingIcon = false
            }
          })
          setTimeout(() => {
            // 流控
            this.loadingData = true
          }, 1000);
        }
      }
    },
  },
}
</script>

<style scoped>
.loading-container {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .loading-item {
    width: 20%;
    padding: 0 0.5rem 1rem;
  }
}
</style>
