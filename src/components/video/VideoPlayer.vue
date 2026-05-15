<template>
  <div class="vue3-video-play pr" :class="videoOrientationClass">
    <!-- 模糊封面背景：仅在视频还未开始播放时作为霓虹背景显示，开始播放后隐藏 -->
    <div v-show="!videoPlay" class="pa wh100 video-cover-bg">
      <img v-if="video.coverImage" class="video-cover wh100" :src="video.coverImage" alt=""/>
    </div>
    <videoPlay
        v-bind="options"
        :ref="'videoPlay'+video.videoId"
        :id="video.videoId"
        @play="onPlay"
        @pause="onPause"
        @ended="onEnded"
        @timeupdate="onTimeupdate"
        @canplay="onCanplay"/>
  </div>
</template>

<script>
// vue3视频播放器
import videoPlay from 'vue3-video-play/lib/index' // 引入组件
import {syncViewBehave} from "@/api/behave.js"
import {addWatchHistory} from "@/api/video.js"

export default {
  name: "VideoPlayer",
  components: {
    videoPlay
  },
  props: {
    video: Object,
    videoAutoPlay:{
      type: Boolean,
      default: false,
    },
    videoMuted:{
      type: Boolean,
      default: false,
    },
    videoControl:{
      type: Boolean,
      default: true,
    }
  },
  data() {
    return {
      options: {
        width: "100%", //播放器宽度
        height: "100%", //播放器高度
        color: "#0760e6", //主题色
        title: "", //视频名称
        src: this.video.videoUrl, //视频源
        poster: this.video.coverImage, // 视频封面
        muted: this.videoMuted, //静音
        speed: true, // 关闭进度条拖动
        webFullScreen: false, // 不默认开启网页全屏（按用户主动点全屏按钮才进）
        speedRate: ["0.5", "0.75", "1.0", "1.25", "1.5", "2.0"], //播放倍速
        autoPlay: this.videoAutoPlay, //自动播放
        loop: false, //循环播放
        mirror: false, //镜像画面
        ligthOff: false, //关灯模式
        volume: 0.5, //默认音量大小
        control: this.videoControl, //是否显示控制
        preload: 'auto', // 预加载策略：auto/metadata/none
        controlBtns: [
          "volume",
          "speedRate",
          "pip",
          "setting",
          "fullScreen",
        ], //控件按钮（已按使用频率排序）
      },
      videoPlay: false,
      videoDuration: "00:00",
      videoOrientation: 'vertical', // 'vertical'(9:16,默认) | 'horizontal'(16:9 等横屏) | 'square'(方屏)
      timer: null,
      videoCountdown: 60, // 秒
      watchStartTime: 0, // 观看开始时间
      currentWatchTime: 0, // 当前观看时长
      historyRecorded: false, // 是否已记录观看历史
      visitRecorded: false, // 是否已记录浏览量
    }
  },
  emits: ['videoDuration', 'videoOnPlay', 'videoOnPause'],
  computed: {
    // 根据视频实际宽高比映射到 class，CSS 据此选择 object-fit 模式
    videoOrientationClass() {
      return `is-${this.videoOrientation}`
    }
  },
  created() {
    // console.log(this.video)
  },
  mounted() {
    // 等待 vue3-video-play 的 DOM 渲染完，再注入"点击切换菜单"行为
    this.$nextTick(() => {
      this.bindClickToggleForToolItems()
    })
  },
  watch: {
    video(newVideo) {
      this.options.src = newVideo.videoUrl
      this.options.poster = newVideo.coverImage
      // 切换视频时重置状态
      this.videoPlay = false
      this.videoOrientation = 'vertical' // 默认竖屏，等 canplay 后会按真实比例修正
      this.historyRecorded = false
      this.visitRecorded = false
      this.currentWatchTime = 0
    }
  },
  methods: {
    onPlay(ev) {
      console.log('播放 play ' + this.video.videoId)
      this.videoPlay = true
      this.watchStartTime = Date.now()
      this.$emit("videoOnPlay", this.video.videoId)
      
      // 点击播放立即增加浏览量（只在首次播放时记录）
      if (!this.visitRecorded) {
        this.apiSyncViewBehave()
        this.visitRecorded = true
      }
      
      // 延迟记录观看历史（观看1/3时长后）
      this.timer = setTimeout(() => {
        this.recordWatchHistory()
      }, this.videoCountdown * 1000);
    },
    onPause(ev) {
      // console.log('暂停')
      this.videoPlay = false
      // 累计观看时长
      if (this.watchStartTime > 0) {
        this.currentWatchTime += (Date.now() - this.watchStartTime) / 1000
        this.watchStartTime = 0
      }
      this.$emit("videoOnPause", this.video.videoId)
    },
    // 播放结束
    onEnded(ev) {
      console.log('end')
      // 视频播放结束时记录观看历史
      this.recordWatchHistory()
    },
    onTimeupdate(ev) {
      this.videoDuration = ev.target.duration
      this.videoCountdown = this.videoDuration / 3 // 视频时长的1/3
      console.log(this.videoDuration + " -> " + this.videoCountdown)
      console.log()
      this.$emit("videoDuration", this.videoDuration)
      // console.log(ev.target.currentTime)
    },
    onCanplay(ev) {
      // 检测视频真实宽高比，决定使用 cover（竖屏沉浸）还是 contain（横屏完整显示）
      const videoEl = ev && ev.target
      if (videoEl && videoEl.videoWidth && videoEl.videoHeight) {
        const ratio = videoEl.videoWidth / videoEl.videoHeight
        if (ratio > 1.2) {
          this.videoOrientation = 'horizontal'  // 16:9, 4:3 等横屏
        } else if (ratio < 0.85) {
          this.videoOrientation = 'vertical'    // 9:16 等竖屏
        } else {
          this.videoOrientation = 'square'      // 接近 1:1 的方屏
        }
      }
    },
    apiSyncViewBehave() {
      syncViewBehave(this.video.videoId).then(res => {
        if (res.code === 200) {

        }
      })
    },
    // 记录观看历史
    recordWatchHistory() {
      // 避免重复记录
      if (this.historyRecorded) return
      
      // 计算观看时长
      let watchDuration = this.currentWatchTime
      if (this.watchStartTime > 0) {
        watchDuration += (Date.now() - this.watchStartTime) / 1000
      }
      
      // 计算完成率
      const completionRate = this.videoDuration > 0 
        ? Math.min(100, Math.round((watchDuration / this.videoDuration) * 100))
        : 0
      
      // 只有观看超过3秒才记录
      if (watchDuration < 3) return
      
      const videoId = this.video.videoId || this.video.video_id
      if (!videoId) return
      
      addWatchHistory({
        video_id: videoId,
        watch_duration: Math.round(watchDuration),
        completion_rate: completionRate
      }).then(res => {
        if (res.code === 0 || res.code === 200) {
          this.historyRecorded = true
          console.log('观看历史已记录')
        }
      }).catch(err => {
        console.error('记录观看历史失败:', err)
      })
    },

    // 把 vue3-video-play 默认的"hover 显示倍速/音量菜单"改为"点击切换"
    bindClickToggleForToolItems() {
      const root = this.$el
      if (!root) return
      // 重试机制：vue3-video-play 内部 DOM 可能稍后才出现
      const tryBind = (retry = 0) => {
        const toolItems = root.querySelectorAll('.d-player-control .d-tool-item')
        if (toolItems.length === 0 && retry < 10) {
          setTimeout(() => tryBind(retry + 1), 200)
          return
        }
        toolItems.forEach((item) => {
          // 仅处理含弹出子菜单的按钮（倍速/音量/设置/画质等）
          const popup = item.querySelector('.d-tool-item-main')
          if (!popup) return
          if (item.dataset.clickBound === '1') return // 防止重复绑
          item.dataset.clickBound = '1'

          // 点击按钮：toggle .menu-open
          item.addEventListener('click', (e) => {
            e.stopPropagation()
            // 关闭其它已打开的菜单
            toolItems.forEach((other) => {
              if (other !== item) other.classList.remove('menu-open')
            })
            item.classList.toggle('menu-open')
          })
        })

        // 点击播放器外部任意位置：关闭所有菜单
        if (!this._outsideClickHandler) {
          this._outsideClickHandler = (e) => {
            if (!root.contains(e.target)) {
              toolItems.forEach((it) => it.classList.remove('menu-open'))
            }
          }
          document.addEventListener('click', this._outsideClickHandler, true)
        }

        // 点击菜单内的项后也关闭菜单（点完倍速 1.5x 后）
        toolItems.forEach((item) => {
          const popup = item.querySelector('.d-tool-item-main')
          if (!popup || popup.dataset.itemClickBound === '1') return
          popup.dataset.itemClickBound = '1'
          popup.addEventListener('click', () => {
            // 用微任务延后一点，让 vue3-video-play 自己先处理 click（切换倍速）
            setTimeout(() => {
              item.classList.remove('menu-open')
            }, 0)
          })
        })
      }
      tryBind()
    }
  },
  beforeUnmount() {
    if (this._outsideClickHandler) {
      document.removeEventListener('click', this._outsideClickHandler, true)
      this._outsideClickHandler = null
    }
    clearInterval(this.timer)
    // 组件销毁前记录观看历史
    this.recordWatchHistory()
  },
}
</script>

<style scoped>
.vue3-video-play {
  position: relative;
  z-index: 1;
  width: 100% !important;
  height: 100% !important;
  background-color: #000; /* 视频未填满时显示纯黑，避免空白闪现 */
}

/* 模糊封面背景：仅在 videoPlay=false 时通过 v-show 显示 */
.video-cover-bg {
  background-color: black;
  z-index: 0;
}

.video-cover {
  filter: blur(40px);
  opacity: 0.7;
  user-select: none;
  pointer-events: none;
  object-fit: cover;
}

.video-play {
  float: left;
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  margin: 0 auto;
  height: calc(100vh - 160px);
}

/* 播放器容器填满 */
::v-deep(.d-player-wrap) {
  width: 100% !important;
  height: 100% !important;
  background-color: transparent;
  z-index: 2;
}

::v-deep(.d-player-wrap .d-player-video) {
  width: 100% !important;
  height: 100% !important;
}

/* 确保控制栏可以交互且置顶 - z-index 要高于 video-actions(25)/video-info(20)/video-overlay(10) */
::v-deep(.d-player-wrap .d-player-control) {
  z-index: 50 !important;
  pointer-events: auto !important;
}

::v-deep(.d-player-wrap .d-player-control .d-control-tool) {
  /* 控制栏底色透明，由下方的渐变蒙层提供深色背景；这样视频画面 + 控制栏过渡更自然 */
  background-color: transparent !important;
  pointer-events: auto !important;
  z-index: 50 !important;
}

/* 在底部加一个由透明到深色的渐变蒙层，让控制栏背景平滑过渡（多段平滑，避免色带突变） */
::v-deep(.d-player-wrap)::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 150px;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.75) 25%,
    rgba(0, 0, 0, 0.5) 50%,
    rgba(0, 0, 0, 0.25) 75%,
    rgba(0, 0, 0, 0) 100%
  );
  pointer-events: none;
  z-index: 5;
}

/* 关键修复：所有 hover 弹出菜单（倍速/音量/画质/设置）必须最高优先级，
   否则会被外层 video-actions(z-25)/video-info(z-20) 等 overlay 挡住 */
::v-deep(.d-player-wrap .d-tool-item),
::v-deep(.d-player-wrap .d-tool-item-main),
::v-deep(.d-player-wrap .speed-main),
::v-deep(.d-player-wrap .volume-box),
::v-deep(.d-player-wrap .volume-main) {
  z-index: 999 !important;
  pointer-events: auto !important;
}

/* 改为"点击切换"模式：禁用默认 hover 自动弹出，只有 .menu-open 才显示 */
::v-deep(.d-player-wrap .d-tool-item:hover .d-tool-item-main) {
  display: none !important;
}
::v-deep(.d-player-wrap .d-tool-item.menu-open .d-tool-item-main) {
  display: flex !important;
}

/* 进度条样式 */
::v-deep(.d-player-wrap .d-player-control .d-control-progress) {
  pointer-events: auto !important;
  z-index: 50 !important;
  background: transparent !important;
}

::v-deep(.d-slider .d-slider__runway) {
  /* 用偏暗的半透明色，与底部渐变蒙层融合，避免出现明显色带 */
  background-color: rgba(255, 255, 255, 0.18);
  cursor: pointer !important;
  pointer-events: auto !important;
}

::v-deep(.d-slider .d-slider__bar) {
  background-color: #FE2C55;
}

::v-deep(.d-slider .d-slider__btn) {
  pointer-events: auto !important;
  cursor: pointer !important;
}

::v-deep(.d-player-wrap .d-player-control .d-control-progress .d-progress-bar) {
  transition: height 0.2s;
  pointer-events: auto !important;
  cursor: pointer !important;
}

/* 视频元素：根据视频真实比例选择填充模式
   - vertical(竖屏 9:16)：cover 沉浸式裁切填满
   - horizontal(横屏 16:9 等)：contain 完整显示，上下留黑边
   - square(方屏 1:1)：contain 完整显示，上下留黑边 */
::v-deep(.d-player-wrap .d-player-video .d-player-video-main) {
  width: 100% !important;
  height: 100% !important;
  transition: none !important;
  z-index: 2;
  background-color: #000;
}
.is-vertical ::v-deep(.d-player-wrap .d-player-video .d-player-video-main) {
  object-fit: cover !important;
}
.is-horizontal ::v-deep(.d-player-wrap .d-player-video .d-player-video-main),
.is-square ::v-deep(.d-player-wrap .d-player-video .d-player-video-main) {
  object-fit: contain !important;
}
</style>
