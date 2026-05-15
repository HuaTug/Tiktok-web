<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

import LoadingUserSearch from '@/components/loading/LoadingUserSearch.vue'
import { searchUser } from '@/api/search.js'
import { removeHtmlTags } from '@/utils/roydon.js'
import { UserFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const loadingNew = ref(true)
const loadingMore = ref(false)
const dataNotMore = ref(false)
const userSearchList = ref([])
const searchFrom = ref({
  keyword: null,
  pageNum: 1,
  pageSize: 10,
})

const formatUser = (item) => {
  return {
    userId: item.user_id || item.userId || item.id,
    username: item.username || item.user_name || item.userName || '',
    nickName: item.nick_name || item.nickName || item.nickname || item.user_name || item.username || '匿名用户',
    avatar: item.avatar || item.avatar_url || item.user_avatar || '',
    fans: item.follower_count ?? item.fansCount ?? item.fans ?? 0,
    follows: item.following_count ?? item.followCount ?? item.follows ?? 0,
    likes: item.like_count ?? item.likes_count ?? item.likes ?? 0,
    description: item.signature || item.description || item.bio || '',
    isFollow: !!(item.is_follow || item.isFollow),
    ...item,
  }
}

const loadUserSearch = async (append = false) => {
  if (!searchFrom.value.keyword) {
    loadingNew.value = false
    return
  }
  if (append) {
    if (dataNotMore.value || loadingMore.value) return
    loadingMore.value = true
  } else {
    loadingNew.value = true
    userSearchList.value = []
    dataNotMore.value = false
    searchFrom.value.pageNum = 1
  }

  try {
    const res = await searchUser(searchFrom.value)
    const ok = res.code === 10000 || res.code === 0 || res.code === 200
    if (!ok || res.data == null) {
      if (!append) userSearchList.value = []
      dataNotMore.value = true
      return
    }

    let raw = []
    if (Array.isArray(res.data)) raw = res.data
    else if (Array.isArray(res.data?.list)) raw = res.data.list
    else if (Array.isArray(res.data?.users)) raw = res.data.users
    else if (Array.isArray(res.data?.user_list)) raw = res.data.user_list

    const formatted = raw.map(formatUser)
    if (append) userSearchList.value = [...userSearchList.value, ...formatted]
    else userSearchList.value = formatted

    if (formatted.length < searchFrom.value.pageSize) dataNotMore.value = true
  } catch (err) {
    console.error('[UserSearch] failed:', err)
    if (!append) userSearchList.value = []
    dataNotMore.value = true
  } finally {
    loadingNew.value = false
    loadingMore.value = false
  }
}

const handleFollow = (userId) => {
  ElMessage.info('关注功能开发中')
}

const handleUserClick = (user) => {
  if (!user.userId) return
  // 简单跳转到个人主页
  // 当前路由系统 /user 是自己主页，他人主页可在后续接入；这里仅占位避免报错
  ElMessage.info(`查看用户：${removeHtmlTags(user.nickName)}`)
}

const handleLoadMore = () => {
  searchFrom.value.pageNum += 1
  loadUserSearch(true)
}

let scrollEl = null
const onScroll = (e) => {
  if (loadingMore.value || dataNotMore.value || loadingNew.value) return
  const el = e.target
  if (el.scrollHeight <= el.clientHeight + 1) return
  if (el.scrollTop <= 0) return
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) handleLoadMore()
}

const resetScrollTop = () => {
  const el = scrollEl || document.querySelector('.search-container .el-scrollbar__wrap')
  if (el) el.scrollTop = 0
  if (window.scrollY) window.scrollTo({ top: 0 })
}

const initFromQuery = () => {
  searchFrom.value.keyword = route.query.keyword || null
}

const isEmpty = computed(() => !loadingNew.value && userSearchList.value.length === 0)

onMounted(() => {
  initFromQuery()
  scrollEl = document.querySelector('.search-container .el-scrollbar__wrap')
  if (scrollEl) scrollEl.addEventListener('scroll', onScroll, { passive: true })
  resetScrollTop()
  loadUserSearch(false).then(() => nextTick(resetScrollTop))
})

onBeforeUnmount(() => {
  if (scrollEl) scrollEl.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div class="hint-container">
    <LoadingUserSearch :loading="loadingNew"/>

    <el-empty v-if="isEmpty"
              :description="searchFrom.keyword ? `没有找到与&quot;${searchFrom.keyword}&quot;相关的用户` : '请输入关键词开始搜索'"/>

    <div class="cp user-container oh"
         v-for="item in userSearchList"
         :key="item.userId"
         @click="handleUserClick(item)">
      <div class="user-main w100">
        <div class="user-main-left">
          <el-avatar v-if="item.avatar" class="user-avatar" :src="item.avatar" :size="50"/>
          <el-avatar v-else class="user-avatar" :size="50" :icon="UserFilled"/>
          <span class="fw600 plr10px" v-html="item.nickName"></span>
        </div>
        <div class="user-btn" @click.stop>
          <el-button v-if="!item.isFollow"
                     class="user-edit-btn"
                     type="primary"
                     @click="handleFollow(item.userId)">关注</el-button>
          <el-button v-else
                     class="user-edit-btn"
                     plain
                     @click="handleFollow(item.userId)">已关注</el-button>
        </div>
      </div>
      <div class="user-info">
        <div class="fs9">
          <span>芝士号：</span><span>{{ removeHtmlTags(item.username || '') }}</span>
          <span class="ml1r cg">|</span>
          <span class="ml1r">粉丝数：</span><span>{{ item.fans }}</span>
          <span class="ml1r cg">|</span>
          <span class="ml1r">获赞数：</span><span>{{ item.likes }}</span>
        </div>
        <p class="cg fs9 mt1rem one-line">{{ item.description || '这个人很懒，什么都没写~' }}</p>
      </div>
      <img v-if="item.avatar" class="user-cover" :src="item.avatar" alt="">
    </div>

    <div v-if="!loadingNew && userSearchList.length > 0" class="load-more-bar tac cg fs9">
      <span v-if="loadingMore">加载中...</span>
      <span v-else-if="dataNotMore">已经到底啦~</span>
      <el-button v-else size="small" text @click="handleLoadMore">加载更多</el-button>
    </div>
  </div>
</template>

<style scoped>
.user-container {
  display: flex;
  background-color: var(--bg-video-card);
  margin-bottom: 1rem;
  flex-direction: column;
  position: relative;
  align-items: flex-start;
  border-radius: 10px;
  padding: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.user-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.user-container .user-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-container .user-main-left {
  display: flex;
  align-items: center;
}

.user-container .user-main-left .user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 32px;
}

.user-container .user-btn {
  z-index: 1;
}

.user-container .user-info {
  margin-top: 1rem;
}

.user-container .user-cover {
  position: absolute;
  right: 0;
  bottom: 0;
  transform: translate(10%, 10%);
  width: 100px;
  z-index: 0;
  filter: blur(0.5rem);
  height: 100px;
  border-radius: 50%;
  pointer-events: none;
}

.load-more-bar {
  padding: 16px 0 24px;
}
</style>
