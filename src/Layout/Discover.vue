<template>
  <div class="discover-container wh100">
    <el-scrollbar>
      <el-empty v-if="!loading && videoList.length === 0" description="暂无数据"/>
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
            <div class="hotVideos cp"
                 v-masonry
                 fit-width="true"
                 transition-duration="0.2s"
                 column-width=".discover-item"
                 item-selector=".discover-item">
              <!--              热榜-->
              <!--              <div style="height: 600px;" class="discover-item">-->
              <!--                <el-card class="discover-card wh100">-->
              <!--                  <el-tabs v-model="activeName" @tab-click="handleHotTabClick">-->
              <!--                    <el-tab-pane v-for="item in hotTabShow"-->
              <!--                                 :key="item.id"-->
              <!--                                 :label="item.tabName"-->
              <!--                                 :lazy="true"-->
              <!--                                 :name="item.tabName">-->
              <!--                      <div v-for="it in item.dataList" class="p10px">-->
              <!--                        <p>{{ it }}</p>-->
              <!--                      </div>-->
              <!--                    </el-tab-pane>-->
              <!--                  </el-tabs>-->
              <!--                </el-card>-->
              <!--              </div>-->
              <!--              热门视频-->
              <div v-for='(item,index) in videoList'
                   :key="item.videoId"
                   v-masonry-tile
                   class="discover-item">
                <VideoDiscoverCard :video="item"/>
              </div>
            </div>
            <Loading v-if="loadingIcon" :is-full-screen="false"/>
          </div>
        </template>
      </el-skeleton>
      <div v-if="dataNotMore">
        <el-divider>暂无更多数据</el-divider>
      </div>
    </el-scrollbar>
    <el-backtop :right="16" :bottom="16" target=".main-container  .el-scrollbar__wrap"></el-backtop>
  </div>
</template>

<!--
*@author roydon
*@date 2023/12/7 11:13
-->
<script>
import {pushVideo} from "@/api/video.js";
import {UserFilled} from "@element-plus/icons-vue";
import VideoShowCard from "@/components/video/VideoShowCard.vue";
import Loading from "@/components/Loading.vue";
import VideoDiscoverCard from "@/components/video/card/VideoDiscoverCard.vue";

export default {
  name: 'Discover',
  computed: {
    UserFilled() {
      return UserFilled
    }
  },
  props: {},
  components: {VideoDiscoverCard, VideoShowCard, Loading},
  data() {
    return {
      loading: true,
      loadingIcon: false,
      dataNotMore: false,
      loadingData: true,
      videoList: [],
    }
  },
  created() {
    // this.initPushVideo()
  },
  mounted() {
    this.initPushVideo()
    window.addEventListener('scroll', this.handleScroll, true);
  },
  destroyed() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    // 将后端蛇形命名字段映射为前端组件期望的驼峰命名
    normalizeVideo(v) {
      if (!v) return v
      // 如果已经有驼峰字段（说明已映射过或旧格式），直接返回
      if (v.videoId !== undefined && v.coverImage !== undefined) return v
      return {
        ...v,
        videoId: v.video_id || v.videoId,
        userId: v.user_id || v.userId,
        videoUrl: v.video_url || v.videoUrl,
        coverImage: v.cover_url || v.coverImage || '',
        videoTitle: v.title || v.videoTitle || '',
        description: v.description || '',
        likeNum: v.likes_count || v.likeNum || 0,
        commentCount: v.comment_count || v.commentCount || 0,
        visitCount: v.visit_count || v.visitCount || 0,
        shareCount: v.share_count || v.shareCount || 0,
        createTime: v.created_at || v.createTime || '',
        userNickName: v.user_nick_name || v.userNickName || '',
        publishType: v.publish_type || v.publishType || '0',
        category: v.category || '',
        duration: v.duration || 0,
      }
    },
    extractVideoList(resData) {
      // 兼容多种后端返回格式:
      // 1. resData 本身是数组
      // 2. resData.video_list (Refactored-TikTok 推荐接口)
      // 3. resData.list (旧格式)
      let list = []
      if (Array.isArray(resData)) list = resData
      else if (resData?.video_list && Array.isArray(resData.video_list)) list = resData.video_list
      else if (resData?.list && Array.isArray(resData.list)) list = resData.list
      return list.map(v => this.normalizeVideo(v))
    },
    initPushVideo() {
      this.loading = true
      pushVideo().then(res => {
        if (res.code === 0 || res.code === 200) {
          const data = this.extractVideoList(res.data)
          this.videoList = this.deduplicateVideos(data)
          this.loading = false
        }
      }).catch(err => {
        console.log('Push video fetch failed:', err)
        this.loading = false
        this.$message?.error?.('推荐视频加载失败，请检查网络连接或稍后重试')
      })
    },
    // 按 videoId 去重，合并新数据到已有列表
    deduplicateVideos(newList, existingList = []) {
      const existingIds = new Set(existingList.map(v => v.videoId))
      const unique = newList.filter(v => !existingIds.has(v.videoId))
      return existingList.concat(unique)
    },
    handleScroll(e) {
      if (e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight - 200) {
        //加载更多
        if (this.loadingData) {
          this.loadingData = false
          this.loadingIcon = true
          pushVideo().then(res => {
            if (res.code === 0 || res.code === 200) {
              const data = this.extractVideoList(res.data)
              // 去重后如果没有新视频，说明没有更多数据了
              const before = this.videoList.length
              this.videoList = this.deduplicateVideos(data, this.videoList)
              if (this.videoList.length === before) {
                this.dataNotMore = true
                this.loadingIcon = false
                this.loadingData = false
                return;
              }
              this.loadingIcon = false
              setTimeout(() => {
                this.loadingData = true
              }, 1000);
            } else {
              this.loadingIcon = false
            }
          }).catch(err => {
            console.log('Load more videos failed:', err)
            this.loadingIcon = false
            this.loadingData = true // 重置加载状态
          })
        }
      }
    },

    // 跳转到用户页面
    handlePersonInfo(userId) {

    },
  }
}
</script>

<style scoped>
@import "@/assets/styles/discover.scss";
</style>
