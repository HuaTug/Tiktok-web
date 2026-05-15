<template>
  <!--  视频合集区域-->
  <div v-show="videoCompilationTotal!==0" class="video-ca">
    <h5>视频合集<span class="fs7 cg cp ml-5r">查看更多 ></span></h5>
  </div>
  <div class="video-compilation-list">
    <div v-for="item in videoCompilationList" class="video-compilation-item">
      <div class="video-compilation flex-start cp cbx">
        <div class="wh5rem compilation-cover oh b-radius1">
          <img v-if="item.coverImage" class="wh100 b-radius1" :src="item.coverImage" :alt="item.title"/>
          <img v-else class="wh100 b-radius1" src="@/assets/logo/logo-cheese.png" :alt="item.title"/>
        </div>
        <div class="video-compilation-right" style="margin-left: 10px">
          <h5 class="title one-line">{{ item.title }}</h5>
          <div class="mtb5">
            <span class="desc fs7 cg two-line">{{ item.description }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!--  视频作品区域-->
  <div class="videoPost"
       style="overflow-y: auto"
       v-infinite-scroll="loadMore"
       :infinite-scroll-disabled="loadingVideoPost"
       :infinite-scroll-delay="500"
       :infinite-scroll-distance="10">
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
        <VideoCard
            v-for="item in postVideoList"
            :video="item"
            @click="handleVideoClick(item)"/>
        <Loading v-if="loadingIcon" :is-full-screen="false"/>
      </template>
    </el-skeleton>
    <div class="w100">
      <el-empty v-show="postVideoTotal<=0" description="暂无数据"/>
    </div>
  </div>
  <div v-if="dataNotMore">
    <el-divider>暂无更多数据</el-divider>
  </div>
  <!--  视频播放弹框  -->
  <!--  <el-dialog v-model="dialogVisible"-->
  <!--             @close="dialogDestroy"-->
  <!--             style="height: calc(100% - 10vh);"-->
  <!--             width="80%"-->
  <!--             :show-close="false">-->
  <!--    <template #header="{ close, titleId, titleClass }">-->
  <!--      <h3 class="one-line" :id="titleId" :class="titleClass">{{ video.videoTitle }}</h3>-->
  <!--      <el-button circle :icon="Close" type="primary" @click="close">-->
  <!--      </el-button>-->
  <!--    </template>-->
  <!--    <video class="dialog-video w100"-->
  <!--           autoplay-->
  <!--           style="max-height: 100%;border-radius: 1rem"-->
  <!--           :src="video.videoUrl"-->
  <!--           controls/>-->
  <!--  </el-dialog>-->
</template>

<script>
import { myVideoCompilationPage, videoMypage } from "@/api/video.js";
import Loading from "@/components/Loading.vue";
import VideoCard from "@/components/video/VideoCard.vue";
import { Close } from "@element-plus/icons-vue";
import {userInfoX} from "@/store/userInfoX";

export default {
  name: "VideoPost",
  computed: {
    Close() {
      return Close
    },
    currentUser() {
      return userInfoX().userInfo;
    }
  },
  components: {Loading, VideoCard},
  data() {
    return {
      loading: true,
      dialogVisible: false,
      postVideoList: [],
      postVideoTotal: null,
      videoQueryParams: {
        author_id: null,
        videoTitle: "",
        page_num: 1,
        page_size: 10
      },
      video: {},
      loadingData: true,
      loadingIcon: false,
      dataNotMore: false,
      videoCompilationDTO: {
        title: null,
        pageNum: 1,
        pageSize: 5,
      },
      videoCompilationList: [],
      videoCompilationTotal: 0,
      loadingVideoPost: false,

    }
  },
  created() {
    this.initVideoList()
    // 视频合集功能暂未实现独立接口，先不加载，避免与作品列表重复
    // this.initVideoCompilation()
  },
  watch: {
    // 监听用户信息变化，Pinia 持久化恢复后可能触发
    currentUser: {
      handler(newVal) {
        if (newVal && this.postVideoList.length === 0 && !this.loading) {
          console.log('👁️ [VideoPost] currentUser 变化，重新加载视频列表')
          this.videoQueryParams.page_num = 1
          this.initVideoList()
          // this.initVideoCompilation()
        }
      },
      deep: true
    }
  },
  mounted() {
    // window.addEventListener('scroll', this.handleScroll, true);
  },
  beforeDestroy() {
  },
  destroyed() {
    document.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    // 格式化视频列表，将后端数据格式转换为前端组件需要的格式
    formatVideoList(items) {
      if (!Array.isArray(items)) return []
      return items.map(item => {
        const videoId = item.video_id || item.VideoId || item.videoId
        const userId = item.user_id || item.UserId || item.userId
        
        // 处理视频URL
        // 后端返回的 video_url 已经是正确的 MinIO 相对路径（如 /tiktok-user-content/users/1/videos/82/source/original.mp4）
        // 只在完全缺失或包含绝对地址（localhost:9002）时才用 videoId 兜底生成
        let videoUrl = item.video_url || item.VideoUrl || item.videoUrl
        if (!videoUrl) {
          videoUrl = `/tiktok-user-content/users/${userId}/videos/${videoId}/source/original.mp4`
        } else if (videoUrl.includes('localhost:9002')) {
          // 把绝对地址转成前端代理的相对路径，保留原始路径中的目录编号
          videoUrl = videoUrl.replace(/https?:\/\/localhost:9002/, '')
        }
        
        // 处理封面URL — 同理，优先使用后端返回的 cover_url
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
          likeNum: item.likes_count || item.like_count || item.LikeCount || item.likeCount || item.likeNum || 0,
          commentNum: item.comment_count || item.CommentCount || item.commentCount || item.commentNum || 0,
          createTime: item.created_at || item.CreatedAt || item.createTime,
          publishType: item.publish_type || item.PublishType || item.publishType || '0',
          ...item
        }
      })
    },
    // 获取当前用户ID（兼容后端不同字段名）
    getCurrentUserId() {
      const u = this.currentUser
      if (!u) return null
      // 后端返回的是 user_id（蛇形命名），前端可能用 userId（驼峰）
      return u.user_id || u.userId || u.id || null
    },
    initVideoList() {
      this.loading = true
      this.dataNotMore = false
      const authorId = this.getCurrentUserId()
      console.log('📋 [VideoPost] initVideoList, authorId:', authorId, 'currentUser:', this.currentUser)
      if (!authorId) {
        // author_id 缺失时不请求，避免后端走 feed 流返回所有视频
        console.warn('⚠️ [VideoPost] author_id 为空，跳过请求。请检查用户是否已登录。')
        this.loading = false
        this.postVideoTotal = 0
        return
      }
      this.videoQueryParams.author_id = authorId
      this.videoQueryParams.page_num = 1
      videoMypage(this.videoQueryParams).then(res => {
        if (res.code === 200 || res.code === 10000) {
          const items = res.data?.video_list || res.data?.Items || res.data?.items || res.rows || []
          this.postVideoList = this.formatVideoList(items)
          // 优先使用后端返回的 total（真实总数），否则用当前列表长度
          this.postVideoTotal = res.data?.total || res.total || items.length || 0
          this.loading = false
          // 如果当前返回数量小于 page_size 或后端标记 has_more=false，直接标记没有更多
          const hasMore = res.data?.has_more
          if (items.length < this.videoQueryParams.page_size || hasMore === false) {
            this.dataNotMore = true
          }
          console.log('📋 [VideoPost] initVideoList 完成, 视频数:', items.length, '总数:', this.postVideoTotal, '还有更多:', !this.dataNotMore)
        }
      })
    },
    // 分页我的视频合集
    initVideoCompilation() {
      const authorId = this.getCurrentUserId()
      if (!authorId) {
        console.warn('⚠️ [VideoPost] initVideoCompilation: author_id 为空，跳过请求')
        return
      }
      const params = {
        ...this.videoCompilationDTO,
        author_id: authorId
      }
      myVideoCompilationPage(params).then(res => {
        if (res.code === 200 || res.code === 10000) {
          this.videoCompilationList = res.rows || res.data?.video_list || []
          this.videoCompilationTotal = res.total || this.videoCompilationList.length || 0
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
    handleScroll(e) {
      if (e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight - 10) {
        if (this.dataNotMore) {
          return
        }
        //加载更多
        if (this.loadingData) {
          this.loadingIcon = true
          this.loadingData = false
          this.videoQueryParams.page_num += 1
          videoMypage(this.videoQueryParams).then(res => {
            if (res.code === 200 || res.code === 10000) {
              const items = res.data?.video_list || res.data?.Items || res.data?.items || res.rows || []
              if (items.length === 0) {
                this.dataNotMore = true
                this.loadingIcon = false
                this.loadingData = false
                return;
              }
              // 去重：根据 videoId 过滤掉已存在的视频
              const existingIds = new Set(this.postVideoList.map(v => v.videoId))
              const newVideos = this.formatVideoList(items).filter(v => !existingIds.has(v.videoId))
              if (newVideos.length > 0) {
                this.postVideoList = this.postVideoList.concat(newVideos)
              }
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
    loadMore() {
      if (this.dataNotMore || this.loading) {
        return
      }
      // 如果已知总数且已加载完，直接标记结束
      if (this.postVideoTotal > 0 && this.postVideoList.length >= this.postVideoTotal) {
        this.dataNotMore = true
        return
      }
      //加载更多
      if (this.loadingData) {
        // 确保 author_id 存在，避免走 feed 流
        if (!this.videoQueryParams.author_id) {
          const authorId = this.getCurrentUserId()
          if (!authorId) {
            console.warn('⚠️ [VideoPost] loadMore: author_id 为空，跳过请求')
            return
          }
          this.videoQueryParams.author_id = authorId
        }
        this.loadingIcon = true
        this.loadingData = false
        this.videoQueryParams.page_num += 1
        console.log("loadMore, page:", this.videoQueryParams.page_num)
        videoMypage(this.videoQueryParams).then(res => {
          if (res.code === 200 || res.code === 10000) {
            const items = res.data?.video_list || res.data?.Items || res.data?.items || res.rows || []
            if (items.length === 0) {
              this.dataNotMore = true
              this.loadingIcon = false
              this.loadingData = false
              return;
            }
            // 去重：根据 videoId 过滤掉已存在的视频
            const existingIds = new Set(this.postVideoList.map(v => v.videoId))
            const newVideos = this.formatVideoList(items).filter(v => !existingIds.has(v.videoId))
            if (newVideos.length > 0) {
              this.postVideoList = this.postVideoList.concat(newVideos)
            }
            // 如果返回数量小于页大小或后端标记无更多，结束
            const hasMore = res.data?.has_more
            if (items.length < this.videoQueryParams.page_size || hasMore === false) {
              this.dataNotMore = true
            }
            this.loadingIcon = false
          } else {
            this.loadingIcon = false
            console.log('Video mypage error:', res)
          }
        }).catch(err => {
          console.log('Video mypage fetch failed:', err)
          this.loadingIcon = false
          this.loadingData = true // 重置状态以允许重试
        })
        setTimeout(() => {
          // 流控
          this.loadingData = true
        }, 1000);
      }
    }
  }
}

</script>

<style scoped>
.videoPost {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
}

.loading-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;

  .loading-item {
    width: 20%;
    padding: 0 0.5rem 1rem;
  }
}

.video-compilation-list {
  display: flex;
  justify-content: space-between;
  flex-flow: row wrap;
  align-items: center;
  overflow-x: scroll;
  margin: .5rem 0;
  /*height: calc(80px + 2rem);*/

  .video-compilation-item {
    width: 20%;
    padding: .5rem 5px;

    &:nth-child(5n+1) {
      padding-left: 0 !important;
    }

    &:nth-child(5n+5) {
      padding-right: 0 !important;
    }

    .video-compilation {
      padding: .5rem;
      width: 100%;
      background-color: var(--el-bg-color-page);
      border-radius: 1rem;

      &:hover {
        transition: all .5s ease;
        background-color: var(--niuyin-primary-color-5);
        box-shadow: 0 4px 10px 0 rgba(0, 0, 0, .12);

        .compilation-cover img {
          transition: all .5s ease;
          transform: scale(1.1);
        }

        .title {
          transition: all .3s ease;
          color: gold;
          font-weight: bold;
        }
      }
    }
  }

}

@media (max-width: 768px) {
  .video-compilation-list {
    .video-compilation-right {
      margin-left: 0 !important;
    }

    .title {
      /* 一行显示 */
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
    }

    .desc {
      /* 一行显示 */
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
    }
  }
}

</style>
