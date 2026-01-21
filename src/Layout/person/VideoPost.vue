<template>
  <div class="flex-between" v-loading="loadingIcon">
    <el-skeleton class="w100" :loading="loading" animated>
      <template #template>
        <div class="loading-container" v-for="i in 2">
          <div class="loading-item" v-for="i in 5">
            <el-skeleton-item variant="image" style="width: 100%; height: 200px"/>
            <div style="padding: 14px">
              <el-skeleton-item variant="h1" style="width: 80%"/>
              <div>
                <el-skeleton-item variant="text"/>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #default>
        <VideoCard
            v-for="item in postVideoList"
            :video="item"
            @click="handleVideoClick(item)"/>
      </template>
    </el-skeleton>
    <!--  视频播放弹框  -->
    <el-dialog v-model="dialogVisible"
               @close="dialogDestroy"
               style="height: calc(100% - 10vh);"
               width="80%"
               :show-close="false">
      <template #header="{ close, titleId, titleClass }">
        <h3 class="one-line" :id="titleId" :class="titleClass" style="color: black">{{ video.videoTitle }}</h3>
        <el-button circle :icon="Close" class="cb" type="info" @click="close">
        </el-button>
      </template>
      <video class="dialog-video w100"
             autoplay
             style="max-height: 100%;border-radius: 1rem"
             :src="video.videoUrl"
             controls/>
    </el-dialog>
    <div class="w100">
      <el-empty v-show="postVideoTotal<=0" description="暂无数据"/>
    </div>
  </div>
  <div v-if="dataNotMore">
    <el-divider>暂无更多数据</el-divider>
  </div>
</template>

<script>
import { videoUserpage } from "@/api/video.js";
import VideoCard from "@/components/video/VideoCard.vue";
import { decodeData } from "@/utils/roydon.js";
import { Close } from "@element-plus/icons-vue";

export default {
  name: "VideoPost",
  computed: {
    Close() {
      return Close
    }
  },
  components: {VideoCard},
  data() {
    return {
      loading: true,
      dialogVisible: false,
      postVideoList: [],
      postVideoTotal: undefined,
      videoQueryParams: {
        userId: decodeData(this.$route.params.userId),
        videoTitle: "",
        pageNum: 1,
        pageSize: 10
      },
      video: {},
      loadingData: true,
      loadingIcon: false,
      dataNotMore: false
    }
  },
  created() {
    this.initVideoList()
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
      return items.map(item => {
        const videoId = item.video_id || item.VideoId || item.videoId
        
        // 转换视频URL - 直接使用 MinIO 地址
        let videoUrl = item.video_url || item.VideoUrl || item.videoUrl
        if (videoUrl && (videoUrl.includes('localhost:9002') || videoUrl.includes('tiktok-user-content'))) {
          videoUrl = `http://localhost:9002/tiktok-user-content/videos/${item.user_id || item.UserId || item.userId}/${videoId}/source.mp4`
        }
        
        // 转换封面URL - 直接使用 MinIO 地址
        let coverImage = item.cover_url || item.CoverUrl || item.coverUrl || item.coverImage
        if (coverImage && (coverImage.includes('localhost:9002') || coverImage.includes('tiktok-user-content'))) {
          coverImage = `http://localhost:9002/tiktok-user-content/videos/${item.user_id || item.UserId || item.userId}/${videoId}/source.mp4_thumb.jpg`
        }
        
        return {
          videoId: videoId,
          videoTitle: item.video_title || item.VideoTitle || item.title || item.videoTitle || '未命名视频',
          videoUrl: videoUrl,
          coverImage: coverImage,
          userId: item.user_id || item.UserId || item.userId,
          userNickName: item.user_name || item.UserName || item.userName,
          description: item.description || item.Description || '',
          likeNum: item.like_count || item.LikeCount || item.likeCount || item.likeNum || 0,
          commentNum: item.comment_count || item.CommentCount || item.commentCount || item.commentNum || 0,
          createTime: item.created_at || item.CreatedAt || item.createTime,
          publishType: item.publish_type || item.PublishType || item.publishType || '0',
          ...item
        }
      })
    },
    initVideoList() {
      this.loading = true
      // console.log("路径参数打印")
      // console.log(this.$route.params.userId)
      videoUserpage(this.videoQueryParams).then(res => {
        if (res.code === 200 || res.code === 10000) {
          const items = res.data?.Items || res.data?.items || res.rows || []
          this.postVideoList = this.formatVideoList(items)
          this.postVideoTotal = items.length || res.total || 0
          this.loading = false
        }
      })
    },
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
        if (this.dataNotMore) {
          return
        }
        //加载更多
        if (this.loadingData) {
          this.loadingIcon = true
          this.loadingData = false
          this.videoQueryParams.pageNum += 1
          videoUserpage(this.videoQueryParams).then(res => {
            if (res.code === 200 || res.code === 10000) {
              const items = res.data?.Items || res.data?.items || res.rows || []
              if (items.length === 0) {
                this.dataNotMore = true
                this.loadingIcon = false
                this.loadingData = false
                return;
              }
              this.postVideoList = this.postVideoList.concat(this.formatVideoList(items))
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
.loading-container {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .loading-item {
    width: 19%;
  }
}
</style>
