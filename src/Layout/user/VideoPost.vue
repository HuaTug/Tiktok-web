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
    this.initVideoCompilation()
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
        
        // 转换视频URL - 使用前端代理地址，解决跨域问题
        let videoUrl = item.video_url || item.VideoUrl || item.videoUrl
        if (!videoUrl || (videoUrl.includes('localhost:9002') || videoUrl.includes('tiktok-user-content'))) {
          videoUrl = `/tiktok-user-content/users/${userId}/videos/${videoId}/source/original.mp4`
        }
        
        // 转换封面URL - 使用前端代理地址，解决跨域问题
        // 后端缩略图格式为: /tiktok-user-content/users/{userId}/videos/{videoId}/thumbnails/thumb_medium.jpg
        let coverImage = item.cover_url || item.CoverUrl || item.coverUrl || item.coverImage
        if (!coverImage || coverImage.includes('localhost:9002')) {
          coverImage = `/tiktok-user-content/users/${userId}/videos/${videoId}/thumbnails/thumb_medium.jpg`
        } else if (coverImage.includes('tiktok-user-content') && !coverImage.includes('thumbnails')) {
          // 如果是旧格式的路径，转换为新的缩略图格式
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
          likeNum: item.likes_count || item.like_count || item.LikeCount || item.likeCount || item.likeNum || 0,
          commentNum: item.comment_count || item.CommentCount || item.commentCount || item.commentNum || 0,
          createTime: item.created_at || item.CreatedAt || item.createTime,
          publishType: item.publish_type || item.PublishType || item.publishType || '0',
          ...item
        }
      })
    },
    initVideoList() {
      this.loading = true
      // 从用户信息中获取userId
      const authorId = this.currentUser?.userId || this.currentUser?.user_id
      if (authorId) {
        this.videoQueryParams.author_id = authorId
      } else {
        // 如果没有 author_id，从参数中删除它避免发送 null
        delete this.videoQueryParams.author_id
      }
      videoMypage(this.videoQueryParams).then(res => {
        if (res.code === 200 || res.code === 10000) {
          const items = res.data?.video_list || res.data?.Items || res.data?.items || res.rows || []
          this.postVideoList = this.formatVideoList(items)
          this.postVideoTotal = items.length || res.total || 0
          this.loading = false
        }
      })
    },
    // 分页我的视频合集
    initVideoCompilation() {
      myVideoCompilationPage(this.videoCompilationDTO).then(res => {
        if (res.code === 200) {
          this.videoCompilationList = res.rows
          this.videoCompilationTotal = res.total
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
    loadMore() {
      if (this.dataNotMore) {
        return
      }
      //加载更多
      if (this.loadingData) {
        this.loadingIcon = true
        this.loadingData = false
        this.videoQueryParams.page_num += 1
        // 确保author_id存在
        if (this.currentUser) {
          this.videoQueryParams.author_id = this.videoQueryParams.author_id || (this.currentUser.userId || this.currentUser.user_id)
        }
        console.log("loadMore")
        videoMypage(this.videoQueryParams).then(res => {
          if (res.code === 200 || res.code === 10000) {
            const items = res.data?.video_list || res.data?.Items || res.data?.items || res.rows || []
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
