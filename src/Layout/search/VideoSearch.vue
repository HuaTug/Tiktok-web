<script setup>
import {ref, onMounted, watch} from 'vue'
import {useRoute} from 'vue-router'

const route = useRoute()

import {removeHtmlTags, smartDateFormat} from "@/utils/roydon.js";
import {searchVideo, videoSearchSuggest} from "@/api/search.js";
import {UserFilled} from "@element-plus/icons-vue";

import VideoSearchOneCard from "@/components/video/card/VideoSearchOneCard.vue";
import LoadingVideoSearch from "@/components/loading/LoadingVideoSearch.vue";

const loadingNew = ref(true)
const loadingMore = ref(false)
const videoSearchList = ref([])
const searchFrom = ref({
  keyword: null,// 搜索输入框的数据  url 上的keyword
  pageNum: 1,
  pageSize: 10,
  publishTimeLimit: 0,
})

const loadVideoSearch = async (dto) => {
  const res = await searchVideo(dto)
  // Refactored-TikTok backend uses code 10000 for success
  if ((res.code !== 10000 && res.code !== 0 && res.code !== 200) || res.data === null) {
    loadingNew.value = false
    return
  }
  // 后端返回的数据在 res.data.video_search 中
  let data = []
  if (Array.isArray(res.data)) {
    data = res.data
  } else if (res.data?.video_search) {
    data = res.data.video_search
  } else if (res.data?.list) {
    data = res.data.list
  }
  
  // 格式化视频数据，将后端字段映射到前端组件需要的字段
  const formattedData = data.map(item => {
    const videoId = item.video_id ?? item.videoId
    const userId = item.user_id ?? item.userId
    
    let videoUrl = item.video_url || item.videoUrl
    if (!videoUrl || videoUrl.includes('localhost:9002')) {
      videoUrl = `/tiktok-user-content/users/${userId}/videos/${videoId}/source/original.mp4`
    }
    
    let coverImage = item.cover_url || item.coverUrl || item.coverImage
    if (!coverImage || coverImage.includes('localhost:9002')) {
      coverImage = `/tiktok-user-content/users/${userId}/videos/${videoId}/thumbnails/thumb_medium.jpg`
    }
    
    return {
      videoId: videoId,
      userId: userId,
      videoTitle: item.title || item.video_title || item.videoTitle || '未命名视频',
      videoUrl: videoUrl,
      coverImage: coverImage,
      userAvatar: item.user_avatar || item.userAvatar || item.avatar || '',
      userNickName: item.user_name || item.userName || item.userNickName || '用户',
      publishTime: item.created_at || item.createTime || item.publishTime,
      likeNum: item.likes_count ?? item.likeNum ?? 0,
      commentNum: item.comment_count ?? item.commentNum ?? 0,
      visitCount: item.visit_count ?? item.visitCount ?? 0,
      tags: item.label_names ? item.label_names.split(',').filter(t => t) : (item.tags || []),
      publishType: item.publish_type ?? item.publishType ?? '0',
      ...item
    }
  })
  
  videoSearchList.value = [...videoSearchList.value, ...formattedData]
  loadingNew.value = false
}

const handleClickTag = (tag) => {
  const keyword = removeHtmlTags(tag)
  route.query.keyword = keyword
  // this.$router.push({ name: 'videoSearch', params: { keyword: keyword }});
  this.searchFrom.keyword = keyword
  this.loadSearchVideo();
}
// 监听路由参数的变化
// watch(() => route.params, (toParams, previousParams) => {
//   // 当路由参数发生变化时执行的回调函数
//   console.log('路由参数变化了', toParams, previousParams)
//   // 这里可以添加处理逻辑，比如重新获取数据等
// })

// 监听路由变化，更新 keyword 参数
watch(() => route.query, (newQuery) => {
  searchFrom.value.keyword = newQuery.keyword
})

onMounted(() => {
  searchFrom.value.keyword = route.query.keyword
  loadVideoSearch(searchFrom.value)
})
</script>

<template>
  <div class="hint-container" id="hint-container" ref="hintContainer">
    <LoadingVideoSearch :loading="loadingNew"/>
    <div class="" v-for="item in videoSearchList" :key="item.videoId">
      <div class="user-container">
        <el-avatar v-if="item.userAvatar" class="user-avatar" :src="item.userAvatar" :size="50" />
        <el-avatar v-else class="user-avatar" :size="50" :icon="UserFilled" />
        <span class="username" v-html="item.userNickName"></span>
        <span class="publish-time cg fs9"> · {{ smartDateFormat(item.publishTime) }}</span>
      </div>
      <p class="hint-title fw600" v-html="item.videoTitle"></p>
      <div class="mb1rem">
                <span class="hint-tags mr5px fs9 cp text-hv-gold" v-for="ite in item.tags">
                  <span>#</span><span @click="handleClickTag(ite)" v-html="ite"/>
                </span>
      </div>
      <div>
        <VideoSearchOneCard :video="item"/>
      </div>
    </div>
  </div>
</template>

<style scoped>

.user-container {
  display: flex;
  justify-content: flex-start;
  border-radius: 10px;

  .user-avatar {
    width: 50px;
    height: 50px;
    border-radius: 32px;
  }

  .username {
    line-height: 50px;
    padding: 0 10px;
  }
}

.hint-title {
  margin: 1rem 0;
}

</style>
