<template>
  <div class="flex-between videoLike" v-loading="loadingIcon">
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
import {videoLikePage} from "@/api/behave.js"
import VideoCard from "@/components/video/VideoCard.vue";
import VideoWaterfall from "@/components/video/VideoWaterfall.vue";
import {Close} from "@element-plus/icons-vue";
import {videoMypage} from "@/api/video.js";

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
      videoLikePage(this.videoQueryParams).then(res => {
        // 后端返回格式: { code: 10000, message: "Success", data: { Items: [...] } }
        if (res.code === 10000 || res.code === 200) {
          // 从 data.Items 或 data.items 获取视频列表
          const items = res.data?.Items || res.data?.items || res.rows || []
          this.likeVideoList = this.formatVideoList(items)
          this.likeVideoTotal = items.length
          this.loading = false
        } else {
          this.loading = false
        }
      }).catch(err => {
        console.error('Failed to load like videos:', err)
        this.loading = false
      })
    },
    // 格式化视频列表，将后端数据格式转换为前端组件需要的格式
    formatVideoList(items) {
      if (!Array.isArray(items)) return []
      return items.map(item => ({
        videoId: item.video_id || item.VideoId || item.videoId,
        videoTitle: item.video_title || item.VideoTitle || item.title || item.videoTitle || '未命名视频',
        videoUrl: item.video_url || item.VideoUrl || item.videoUrl,
        coverUrl: item.cover_url || item.CoverUrl || item.coverUrl,
        userId: item.user_id || item.UserId || item.userId,
        userName: item.user_name || item.UserName || item.userName,
        description: item.description || item.Description || '',
        likeCount: item.like_count || item.LikeCount || item.likeCount || 0,
        commentCount: item.comment_count || item.CommentCount || item.commentCount || 0,
        ...item
      }))
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
              this.likeVideoList = this.likeVideoList.concat(this.formatVideoList(items))
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
    width: 20%;
    padding: 0 0.5rem 1rem;
  }
}

</style>
