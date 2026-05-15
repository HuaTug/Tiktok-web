<script setup>
import { onMounted, onBeforeUnmount, ref, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

import { searchVideo, addSearchHistory } from '@/api/search.js'
import { removeHtmlTags, smartDateFormat } from '@/utils/roydon.js'
import { UserFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

import LoadingVideoSearch from '@/components/loading/LoadingVideoSearch.vue'
import VideoSearchOneCard from '@/components/video/card/VideoSearchOneCard.vue'

const loadingNew = ref(true)
const loadingMore = ref(false)
const dataNotMore = ref(false)
const videoSearchList = ref([])
const totalCount = ref(0)

const searchFrom = ref({
  keyword: null,
  pageNum: 1,
  pageSize: 10,
  publishTimeLimit: 0,
  sort_by: 'relevance', // relevance | latest | likes
  from_date: '',
  to_date: '',
})

const getSortBy = (sortId) => {
  const sortMap = { 0: 'relevance', 1: 'latest', 2: 'likes' }
  return sortMap[sortId] || 'relevance'
}

const getFromDate = (timeId) => {
  if (!timeId || timeId === 0) return ''
  const now = new Date()
  switch (timeId) {
    case 1:
      now.setDate(now.getDate() - 1)
      return now.toISOString().split('T')[0]
    case 2:
      now.setDate(now.getDate() - 7)
      return now.toISOString().split('T')[0]
    case 3:
      now.setMonth(now.getMonth() - 1)
      return now.toISOString().split('T')[0]
    default:
      return ''
  }
}

const formatItem = (item) => {
  const videoId = item.video_id ?? item.videoId
  const userId = item.user_id ?? item.userId

  let videoUrl = item.video_url || item.videoUrl
  if (!videoUrl || (typeof videoUrl === 'string' && videoUrl.includes('localhost:9002'))) {
    videoUrl = `/tiktok-user-content/users/${userId}/videos/${videoId}/source/original.mp4`
  } else if (typeof videoUrl === 'string' && videoUrl.startsWith('http') && videoUrl.includes('localhost:9002')) {
    videoUrl = videoUrl.replace(/https?:\/\/localhost:9002/, '')
  }

  let coverImage = item.cover_url || item.coverUrl || item.coverImage
  if (!coverImage || (typeof coverImage === 'string' && coverImage.includes('localhost:9002'))) {
    coverImage = `/tiktok-user-content/users/${userId}/videos/${videoId}/thumbnails/thumb_medium.jpg`
  } else if (typeof coverImage === 'string' && coverImage.startsWith('http') && coverImage.includes('localhost:9002')) {
    coverImage = coverImage.replace(/https?:\/\/localhost:9002/, '')
  }

  return {
    videoId,
    userId,
    videoTitle: item.title || item.video_title || item.videoTitle || '未命名视频',
    videoUrl,
    coverImage,
    userAvatar: item.user_avatar || item.userAvatar || item.avatar || '',
    userNickName: item.user_name || item.userName || item.userNickName || '用户',
    publishTime: item.created_at || item.createTime || item.publishTime,
    likeNum: item.likes_count ?? item.likeNum ?? 0,
    commentNum: item.comment_count ?? item.commentNum ?? 0,
    visitCount: item.visit_count ?? item.visitCount ?? 0,
    tags: item.label_names ? String(item.label_names).split(',').filter((t) => t) : item.tags || [],
    publishType: item.publish_type ?? item.publishType ?? '0',
    ...item,
  }
}

const loadVideoSearch = async (append = false) => {
  if (!searchFrom.value.keyword) {
    loadingNew.value = false
    return
  }
  if (append) {
    if (dataNotMore.value || loadingMore.value) return
    loadingMore.value = true
  } else {
    loadingNew.value = true
    videoSearchList.value = []
    dataNotMore.value = false
    searchFrom.value.pageNum = 1
  }

  try {
    const res = await searchVideo(searchFrom.value)
    const ok = res.code === 10000 || res.code === 0 || res.code === 200
    if (!ok || res.data == null) {
      if (!append) videoSearchList.value = []
      dataNotMore.value = true
      return
    }

    let raw = []
    if (Array.isArray(res.data)) raw = res.data
    else if (Array.isArray(res.data?.video_search)) raw = res.data.video_search
    else if (Array.isArray(res.data?.list)) raw = res.data.list
    totalCount.value = res.data?.total_count ?? res.data?.total ?? raw.length

    const formatted = raw.map(formatItem)
    if (append) {
      videoSearchList.value = [...videoSearchList.value, ...formatted]
    } else {
      videoSearchList.value = formatted
    }

    // 没有数据 或 已经拿到的总数 >= total，标记已加载完
    if (formatted.length === 0 || (totalCount.value > 0 && videoSearchList.value.length >= totalCount.value)) {
      dataNotMore.value = true
    }
  } catch (err) {
    console.error('[VideoSearch] failed:', err)
    if (!append) videoSearchList.value = []
    dataNotMore.value = true
  } finally {
    loadingNew.value = false
    loadingMore.value = false
  }
}

const handleClickTag = (tag) => {
  const keyword = removeHtmlTags(tag).trim()
  if (!keyword) return
  router.push({
    path: route.path,
    query: { ...route.query, keyword },
  })
}

const handleLoadMore = () => {
  searchFrom.value.pageNum += 1
  loadVideoSearch(true)
}

// 滚动加载更多（容器是父组件 .search-container 的 el-scrollbar）
let scrollEl = null
const onScroll = (e) => {
  if (loadingMore.value || dataNotMore.value || loadingNew.value) return
  const el = e.target
  // 必须满足：内容确实可滚动 + 用户主动滚动到底部，避免短列表/初始化时被 clamp 误触
  if (el.scrollHeight <= el.clientHeight + 1) return
  if (el.scrollTop <= 0) return
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) {
    handleLoadMore()
  }
}

// 把父滚动容器置顶
const resetScrollTop = () => {
  const el = scrollEl || document.querySelector('.search-container .el-scrollbar__wrap')
  if (el) el.scrollTop = 0
  // 同时把 window 也置顶（极端 fallback）
  if (window.scrollY) window.scrollTo({ top: 0 })
}

const initFromQuery = () => {
  const q = route.query
  searchFrom.value.keyword = q.keyword || null
  searchFrom.value.sort_by = getSortBy(Number(q.sort || 0))
  searchFrom.value.from_date = getFromDate(Number(q.time || 0))
  searchFrom.value.publishTimeLimit = Number(q.time || 0)
}

const isEmpty = computed(() => !loadingNew.value && videoSearchList.value.length === 0)

onMounted(() => {
  initFromQuery()
  if (searchFrom.value.keyword) {
    // 静默写入搜索历史，失败不影响搜索
    addSearchHistory(searchFrom.value.keyword).catch(() => {})
  }

  // 绑定父级容器滚动事件
  scrollEl = document.querySelector('.search-container .el-scrollbar__wrap')
  if (scrollEl) scrollEl.addEventListener('scroll', onScroll, { passive: true })

  // 关键修复：新一轮搜索 mount 时，父滚动容器可能因为上一轮长列表停留在底部，
  // 必须先归零，再发起请求，否则用户看到的是"刚搜索就停在底部"的诡异现象。
  resetScrollTop()

  loadVideoSearch(false).then(() => {
    // 数据加载完成后，再保险地置顶一次（图片/视频卡片渲染会造成布局抖动）
    nextTick(resetScrollTop)
  })
})

onBeforeUnmount(() => {
  if (scrollEl) scrollEl.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div class="hint-container" id="hint-container" ref="hintContainer">
    <LoadingVideoSearch :loading="loadingNew"/>

    <!-- 空状态 -->
    <el-empty v-if="isEmpty"
              :description="searchFrom.keyword ? `没有找到与&quot;${searchFrom.keyword}&quot;相关的视频` : '请输入关键词开始搜索'"/>

    <!-- 结果列表 -->
    <div v-for="item in videoSearchList" :key="item.videoId" class="search-result-item">
      <div class="user-container">
        <el-avatar v-if="item.userAvatar" class="user-avatar" :src="item.userAvatar" :size="50"/>
        <el-avatar v-else class="user-avatar" :size="50" :icon="UserFilled"/>
        <span class="username" v-html="item.userNickName"></span>
        <span class="publish-time cg fs9"> · {{ smartDateFormat(item.publishTime) }}</span>
      </div>
      <p class="hint-title fw600" v-html="item.videoTitle"></p>
      <div class="mb1rem" v-if="item.tags && item.tags.length">
        <span class="hint-tags mr5px fs9 cp text-hv-gold" v-for="ite in item.tags" :key="ite">
          <span>#</span><span @click="handleClickTag(ite)" v-html="ite"/>
        </span>
      </div>
      <div>
        <VideoSearchOneCard :video="item"/>
      </div>
    </div>

    <!-- 加载更多状态 -->
    <div v-if="!loadingNew && videoSearchList.length > 0" class="load-more-bar tac cg fs9">
      <span v-if="loadingMore">加载中...</span>
      <span v-else-if="dataNotMore">已经到底啦~</span>
      <el-button v-else size="small" text @click="handleLoadMore">加载更多</el-button>
    </div>
  </div>
</template>

<style scoped>
.user-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
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

.search-result-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color-light, rgba(0, 0, 0, 0.06));
}

.search-result-item:last-child {
  border-bottom: none;
}

.load-more-bar {
  padding: 16px 0 24px;
}
</style>
