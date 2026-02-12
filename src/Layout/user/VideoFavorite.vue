<template>
  <el-tabs v-model="activeName">
    <el-tab-pane v-for="(tab) in favoriteTab"
                 :label="tab.tabName"
                 :name="tab.id"
                 :lazy="true"/>
  </el-tabs>
  <UserFavoriteCollection v-if="activeName===1" @collection-click="handleCollectionClick"/>
  <UserFavoriteVideo v-if="activeName===2" :favoriteId="selectedFavoriteId" :favoriteTitle="selectedFavoriteTitle" @back="handleBackToCollection"/>
  <UserFavoriteMusic v-if="activeName===3"/>
  <div v-if="activeName===4" class="flex-between">
    <div class="w100">
      <el-empty description="暂无数据"/>
    </div>
  </div>
</template>

<script>
import VideoCard from "@/components/video/VideoCard.vue";
import {Close} from "@element-plus/icons-vue";
import {myFavoriteList, videoFavoritePage} from "@/api/behave.js";
import UserFavoriteVideo from "@/components/user/favorite/UserFavoriteVideo.vue";
import UserFavoriteCollection from "@/components/user/favorite/UserFavoriteCollection.vue";
import UserFavoriteMusic from "@/components/user/favorite/UserFavoriteMusic.vue";

export default {
  name: "VideoFavorite",
  components: {UserFavoriteMusic, UserFavoriteCollection, UserFavoriteVideo, VideoCard},
  computed: {
    Close() {
      return Close
    }
  },
  data() {
    return {
      dialogVisible: false,
      favoriteVideoList: [],
      favoriteVideoTotal: 0,
      videoQueryParams: {
        videoTitle: "",
        pageNum: 1,
        pageSize: 10
      },
      video: {},
      favoriteTab: [
        {id: 1, tabName: "收藏夹", tabUrl: "/user/videoPost"},
        {id: 2, tabName: "视频", tabUrl: "/user/videoLike"},
        // {id: 3, tabName: "音乐", tabUrl: "/user/videoFavorite"},
        // {id: 4, tabName: "合集", tabUrl: "/user/videoFavorite"},
      ],
      activeName: 1, // 默认显示收藏夹标签
      selectedFavoriteId: 0, // 当前选中的收藏夹ID，0表示全部
      selectedFavoriteTitle: '', // 当前选中的收藏夹标题
    }
  },
  created() {
  },
  methods: {
    // 处理收藏夹点击，切换到视频列表并筛选
    handleCollectionClick(collection) {
      console.log('📁 [VideoFavorite] 收藏夹被点击:', collection)
      this.selectedFavoriteId = collection.favoriteId
      this.selectedFavoriteTitle = collection.title
      this.activeName = 2 // 切换到视频标签
    },
    // 返回收藏夹列表
    handleBackToCollection() {
      this.selectedFavoriteId = 0
      this.selectedFavoriteTitle = ''
      this.activeName = 1 // 切换回收藏夹标签
    }
  }
}
</script>

<style scoped>

</style>
