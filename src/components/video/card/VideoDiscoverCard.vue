<template>
  <div class="video-card">
    <div class="video-cover-image"
         @mouseover="handleMouseover" @mouseleave="handleMouseleave">
      <!--      <el-image class="cover-image pa eli-ofc cp wh100" :src="video.coverImage"/>-->
      <div v-if="!playVideo" class="cover-image" ref="coverImage">
        <el-image class="eli-ofc cp" :src="video.coverImage"/>
        <div v-if="Number(video.likeNum) > 0" class="video-like flex-center">
          <svg class="icon1rem" aria-hidden="true">
            <use xlink:href="#icon-like-num"></use>
          </svg>
          <span class="ml-5r">{{ video.likeNum }}</span>
        </div>
        <div v-if="formatDuration(video.videoInfo)" class="video-duration flex-center">
          <span class="fs8 cw">{{ formatDuration(video.videoInfo) }}</span>
        </div>
        <div v-if="video.publishType==='1'" class="flex-center video-type-pics">
          <svg class="icon1rem ml5" aria-hidden="true">
            <use xlink:href="#icon-pics"></use>
          </svg>
          <span class="type-desc fs7 fw500">图文</span>
        </div>
      </div>
      <div v-if="playVideo" class="background-custom">
        <!--            图文轮播-->
        <ImagePlayer v-if="video.publishType==='1'" class="imagePlayer wh100"
                     :style="{ height: imagePlayerHeight + 'px' }" :image-list="video.imageList"/>
        <!--            视频-->
        <VideoPlayer v-if="video.publishType==='0'"
                     class="videoPlayer wh100"
                     id="videoPlayer"
                     :video="video"/>
      </div>
    </div>
    <div class="video-info" @click="handleVideoPlayDialog">
      <p v-html="video.videoTitle" class="video-title two-line fs8"></p>
      <div class="video-author one-line flex-between">
        <span v-if="video.userNickName" class="fs7 cp text-hv-gold">@{{ video.userNickName }}</span>
        <span class="cg fs7">发布于 · {{ smartDateFormat(video.createTime) }}</span>
      </div>
    </div>
  </div>
  <el-dialog
      v-model="userVideoDialogVisible"
      :modal="false"
      class="user-video-dialog"
      fullscreen
      :destroy-on-close="true"
      align-center>
    <VideoPlayDialog :dialog-video="video" @dialogVisible="dialogVisibleEmit"/>
  </el-dialog>
</template>

<script>
import ImagePlayer from "@/components/video/ImagePlayer.vue";
import VideoPlayDialog from "@/components/video/VideoPlayDialog.vue";
import VideoPlayer from "@/components/video/VideoPlayer.vue";

export default {
  name: "VideoDiscoverCard",
  components: {VideoPlayDialog, ImagePlayer, VideoPlayer},
  props: {
    video: Object,
  },
  data() {
    return {
      playVideo: false,
      imagePlayerHeight: 0,
      userVideoDialogVisible: false,
    }
  },
  created() {
  },
  mounted() {
    this.$nextTick(() => {
    });
  },
  methods: {
    handleMouseover() {
      this.playVideo = true
      if (this.video.publishType === '1') {
        const coverImageHeight = this.$refs.coverImage.clientHeight;
        this.imagePlayerHeight = coverImageHeight;
      }
    },
    handleMouseleave() {
      this.playVideo = false
    },
    formatDuration(videoInfo) {
      if (videoInfo == null || videoInfo == "" || videoInfo == undefined) {
        return
      }
      const info = JSON.parse(videoInfo);
      const durationInSeconds = info.duration;
      let formattedDuration = '';

      if (durationInSeconds >= 3600 * 1000) {
        formattedDuration = new Date(durationInSeconds).toISOString().substr(11, 8);
      } else {
        formattedDuration = new Date(durationInSeconds).toISOString().substr(14, 5);
      }

      return formattedDuration;
    },
    handleVideoPlayDialog() {
      this.userVideoDialogVisible = true
    },
    dialogVisibleEmit(flag) {
      this.userVideoDialogVisible = flag
    },
  },
}
</script>

<style scoped>
.video-card {
  background-color: var(--bg-video-card);
  border-radius: var(--card-radius);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border-color-light);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
  }

  .video-cover-image {
    position: relative;
    width: 100%;
    /* 固定 4:3 宽高比 */
    aspect-ratio: 4 / 3;
    overflow: hidden;
    border-radius: var(--card-radius) var(--card-radius) 0 0;
    background-color: var(--bg-surface);

    .cover-image {
      width: 100%;
      height: 100%;
      position: relative;

      :deep(.el-image) {
        width: 100%;
        height: 100%;
      }

      :deep(.el-image img) {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .cover-image:hover {
      :deep(.el-image img) {
        transition: transform 0.4s ease;
        transform: scale(1.05);
      }
    }

    .video-like {
      position: absolute;
      bottom: 8px;
      left: 8px;
      color: white;
      font-size: 12px;
      display: flex;
      align-items: center;
      background-color: rgba(0, 0, 0, 0.55);
      border-radius: 4px;
      padding: 2px 6px;
      line-height: 1.4;
      backdrop-filter: blur(4px);
    }

    .video-duration {
      position: absolute;
      bottom: 8px;
      right: 8px;
      color: white;
      background-color: rgba(0, 0, 0, 0.55);
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 12px;
      line-height: 1.4;
      backdrop-filter: blur(4px);
    }
  }

  .video-info {
    width: 100%;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;

    .video-title {
      font-size: 14px;
      font-weight: 500;
      line-height: 1.4;
      color: var(--text-main);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 0;
    }

    .video-author {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: var(--text-muted);
    }
  }
}

.video-type-pics {
  position: absolute;
  left: 8px;
  top: 8px;
  padding: 3px 8px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(6px);
  border-radius: 4px;

  .type-desc {
    margin-left: 2px;
    color: gold;
    font-size: 11px;
  }
}

:deep(.d-player-wrap .d-player-control) {
  height: 10px !important;
}

:deep(.d-player-wrap .d-player-control .d-control-tool) {
  display: none !important;
}
</style>
