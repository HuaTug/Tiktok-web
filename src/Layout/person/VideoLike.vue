<template>
  <div class="flex-between">
    <VideoCard v-for="item in likeVideoList" :video="item" @click="handleVideoClick(item)"/>
    <!--    <VideoWaterfall :video-list="likeVideoList"></VideoWaterfall>-->
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
      <el-empty v-show="likeVideoTotal<=0" description="暂无数据"/>
    </div>
  </div>
</template>

<script>
import { personVideoLikePage } from "@/api/behave.js";
import VideoCard from "@/components/video/VideoCard.vue";
import VideoWaterfall from "@/components/video/VideoWaterfall.vue";
import { decodeData } from "@/utils/roydon.js";
import { Close } from "@element-plus/icons-vue";

export default {
  name: "VideoLike",
  components: {VideoWaterfall, VideoCard},
  computed: {
    Close() {
      return Close
    }
  },
  data() {
    return {
      dialogVisible: false,
      likeVideoList: [],
      likeVideoTotal: 0,
      videoQueryParams: {
        userId: decodeData(this.$route.params.userId),
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
  methods: {
    // 格式化视频列表，将后端数据格式转换为前端组件需要的格式
    formatVideoList(items) {
      if (!Array.isArray(items)) return []
      return items.map(item => {
        const videoId = item.video_id || item.VideoId || item.videoId
        
        // 转换视频URL - 直接使用 MinIO 地址
        let videoUrl = item.video_url || item.VideoUrl || item.videoUrl
        if (videoUrl && (videoUrl.includes('localhost:9002') || videoUrl.includes('tiktok-user-content'))) {
          videoUrl = `/tiktok-user-content/users/${item.user_id || item.UserId || item.userId}/videos/${videoId}/source/original.mp4`
        }
        
        // 转换封面URL - 使用缩略图地址
        // 后端缩略图格式为: /tiktok-user-content/users/{userId}/videos/{videoId}/thumbnails/thumb_medium.jpg
        const userId = item.user_id || item.UserId || item.userId
        let coverImage = item.cover_url || item.CoverUrl || item.coverUrl || item.coverImage
        if (!coverImage || coverImage.includes('localhost:9002')) {
          coverImage = `/tiktok-user-content/users/${userId}/videos/${videoId}/thumbnails/thumb_medium.jpg`
        } else if (coverImage.includes('tiktok-user-content') && !coverImage.includes('thumbnails')) {
          coverImage = `/tiktok-user-content/users/${userId}/videos/${videoId}/thumbnails/thumb_medium.jpg`
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
      // console.log(this.videoQueryParams)
      personVideoLikePage(this.videoQueryParams).then(res => {
        // console.log(res)
        if (res.code === 200 || res.code === 10000) {
          const items = res.data?.Items || res.data?.items || res.rows || []
          this.likeVideoList = this.formatVideoList(items)
          this.likeVideoTotal = items.length || res.total || 0
        }
      })
    },
    handleVideoClick(video) {
      this.video = video
      this.dialogVisible = true
    },
    dialogDestroy() {
      const videoD = document.getElementsByClassName("dialog-video")
      videoD[0].pause();
      this.dialogVisible = false
    }
  }
}

</script>

<style scoped>

</style>
