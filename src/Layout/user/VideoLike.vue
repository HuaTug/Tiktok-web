<template>
  <div class="video-like-grid" v-loading="loadingIcon">
    <el-skeleton class="w100" :loading="loading" animated>
      <template #template>
        <div class="loading-container" v-for="i in 1">
          <div class="loading-item" v-for="i in 5">
            <el-skeleton-item variant="image" style="width: 100%; height: 200px"/>
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
        <VideoCard v-for="item in likeVideoList"
                   :video="item"
                   @click="handleVideoClick(item)"/>
      </template>
    </el-skeleton>
    <div class="w100">
      <el-empty v-show="likeVideoTotal<=0" description="暂无数据"/>
    </div>
  </div>
  <div v-if="dataNotMore">
    <el-divider>暂无更多数据</el-divider>
  </div>
  <!--  视频播放弹框  -->
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
import { videoLikePage } from "@/api/behave.js";
import VideoCard from "@/components/video/VideoCard.vue";
import VideoWaterfall from "@/components/video/VideoWaterfall.vue";
import { Close } from "@element-plus/icons-vue";

export default {
  name: "VideoLike",
  computed: {
    Close() {
      return Close
    }
  },
  components: {VideoWaterfall, VideoCard},
  data() {
    return {
      loading: true,
      loadingData: true,
      loadingIcon: false,
      dataNotMore: false,
      dialogVisible: false,
      likeVideoList: [],
      likeVideoTotal: undefined,
      videoQueryParams: {
        videoTitle: "",
        pageNum: 1,
        pageSize: 10
      },
      video: {},
    }
  },
  created() {
    this.initVideoList()
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll, true);
  },
  destroyed() {
    document.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    initVideoList() {
      this.loading = true
      // 重置分页与去重状态
      this.videoQueryParams.pageNum = 1
      this.dataNotMore = false
      videoLikePage(this.videoQueryParams).then(res => {
        // 后端返回格式: { code: 10000, message: "Success", data: { Items: [...] } }
        if (res.code === 10000 || res.code === 200) {
          // 从 data.Items 或 data.items 获取视频列表
          const items = res.data?.Items || res.data?.items || res.rows || []
          this.likeVideoList = this.dedupVideoList(this.formatVideoList(items))
          this.likeVideoTotal = this.likeVideoList.length
          this.loading = false
        } else {
          this.loading = false
        }
      }).catch(err => {
        console.error('Failed to load like videos:', err)
        this.loading = false
      })
    },
    // 按 videoId 去重，避免后端分页重复返回导致界面出现重复卡片
    dedupVideoList(list) {
      const seen = new Set()
      const result = []
      for (const v of list) {
        const key = v && (v.videoId ?? v.video_id ?? v.VideoId)
        if (key === undefined || key === null || key === '') {
          result.push(v)
          continue
        }
        if (seen.has(key)) continue
        seen.add(key)
        result.push(v)
      }
      return result
    },
    // 格式化视频列表，将后端数据格式转换为前端组件需要的格式
    formatVideoList(items) {
      if (!Array.isArray(items)) return []
      return items.map(item => {
        const videoId = item.video_id || item.VideoId || item.videoId
        const userId = item.user_id || item.UserId || item.userId
        
        // 处理视频URL — 优先使用后端返回的 video_url（已包含正确的 MinIO 路径）
        let videoUrl = item.video_url || item.VideoUrl || item.videoUrl
        if (!videoUrl) {
          videoUrl = `/tiktok-user-content/users/${userId}/videos/${videoId}/source/original.mp4`
        } else if (videoUrl.includes('localhost:9002')) {
          videoUrl = videoUrl.replace(/https?:\/\/localhost:9002/, '')
        }
        
        // 处理封面URL — 优先使用后端返回的 cover_url
        let coverImage = item.cover_url || item.CoverUrl || item.coverUrl || item.coverImage
        if (!coverImage) {
          coverImage = `/tiktok-user-content/users/${userId}/videos/${videoId}/thumbnails/thumb_medium.jpg`
        } else if (coverImage.includes('localhost:9002')) {
          coverImage = coverImage.replace(/https?:\/\/localhost:9002/, '')
        }
        
        return {
          videoId: videoId,
          videoTitle: item.video_title || item.VideoTitle || item.title || item.videoTitle || '未命名视频',
          videoUrl: videoUrl,
          coverImage: coverImage,
          userId: userId,
          userNickName: item.user_name || item.UserName || item.userName,
          description: item.description || item.Description || '',
          likeNum: item.likes_count || item.like_count || item.LikeCount || item.likeCount || 0,
          commentNum: item.comment_count || item.CommentCount || item.commentCount || 0,
          createTime: item.created_at || item.CreatedAt || item.createTime,
          publishType: item.publish_type || item.PublishType || item.publishType || '0',
          ...item
        }
      })
    },
    handleVideoClick(video) {
      // 实现视频点击跳转逻辑
      if (video) {
        console.log('🔗 [VIDEO-CLICK] 点击视频:', video.videoId, video.videoTitle)
        // 跳转到视频播放页面
        this.$router.push({
          path: '/video',
          query: {
            videoId: video.videoId,
            userId: video.userId
          }
        })
      }
    },
    dialogDestroy() {
      const videoD = document.getElementsByClassName("dialog-video")
      if (videoD && videoD[0]) {
        videoD[0].pause();
      }
      this.dialogVisible = false
    },
    // scroll事件
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
          videoLikePage(this.videoQueryParams).then(res => {
            // 后端返回格式: { code: 10000, message: "Success", data: { Items: [...] } }
            if (res.code === 10000 || res.code === 200) {
              const items = res.data?.Items || res.data?.items || res.rows || []
              if (items == null || items.length === 0) {
                this.dataNotMore = true
                this.loadingIcon = false
                this.loadingData = false
                return;
              }
              this.likeVideoList = this.dedupVideoList(
                this.likeVideoList.concat(this.formatVideoList(items))
              )
              this.likeVideoTotal = this.likeVideoList.length
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
  }
}

</script>

<style scoped>
.video-like-grid {
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 16px;
  padding: 8px 0;
}

.video-like-grid :deep(.video-card) {
  width: calc(20% - 13px);
  padding: 0;
  margin: 0;
  height: 240px;
}

@media (max-width: 768px) {
  .video-like-grid :deep(.video-card) {
    width: calc(50% - 8px);
    height: 200px;
  }
}

.loading-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 16px;
  width: 100%;

  .loading-item {
    width: calc(20% - 13px);
  }
}
</style>
