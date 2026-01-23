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
import { searchHotLoad } from "@/api/search.js";
import { followAndFans } from "@/api/social.js";
import { getVideoVOById, hotVideoPage, userLikeNums } from "@/api/video";
import Loading from "@/components/Loading.vue";
import VideoPlayDialog from "@/components/video/VideoPlayDialog.vue";
import VideoDiscoverCard from "@/components/video/card/VideoDiscoverCard.vue";
import VideoHotCard from "@/components/video/card/VideoHotCard.vue";
import HotVideoRanking from "@/components/video/HotVideoRanking.vue";
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
    };
  },
  created() {
    this.getHotVideoPage()
    // this.getHotSearchPage()
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll, true);
  },
  destroyed() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
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
    getHotVideoPage() {
      this.loading = true
      hotVideoPage(this.hotVideoQueryParams).then(res => {
        // Refactored-TikTok backend uses code 0 for success
        if (res.code === 0 || res.code === 200) {
          this.hotVideoList = res.rows || res.data?.list || []
          this.hotVideoTotal = res.total || res.data?.total || 0
          this.loading = false
        }
      }).catch(error => {
        console.error('❌ [HotVideo] 获取热门视频失败:', error)
        this.loading = false
        
        // 显示友好的错误提示，但使用空数组继续渲染
        this.hotVideoList = []
        this.hotVideoTotal = 0
        
        // 如果后端panic，建议用户稍后重试
        if (error && error.message && error.message.includes('panic')) {
          console.warn('⚠️ [HotVideo] 后端服务异常，前端已降级处理')
        }
      })
      searchHotLoad(this.hotSearchPageDto).then(res => {
        // Refactored-TikTok backend uses code 0 for success
        if (res.code === 0 || res.code === 200) {
          this.hotTabShow[0].dataList = res.data || []
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
          hotVideoPage(this.hotVideoQueryParams).then(res => {
            // Refactored-TikTok backend uses code 0 for success
            if (res.code === 0 || res.code === 200) {
              const rows = res.rows || res.data?.list || []
              if (rows.length === 0) {
                this.dataNotMore = true
                this.loadingIcon = false
                this.loadingData = false
                return;
              }
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
    }
  }
};
</script>

<style scoped>
@import "@/assets/styles/hotVideo.scss";
</style>
