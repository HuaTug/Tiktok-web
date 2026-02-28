<template>
  <div class="notification-center">
    <!-- 通知图标按钮 -->
    <el-popover
      :visible="showPopover"
      placement="bottom-end"
      :width="420"
      trigger="click"
      @update:visible="handlePopoverVisibleChange"
    >
      <template #reference>
        <div class="notification-trigger" @click="showPopover = !showPopover">
          <el-badge :value="unreadCount" :hidden="unreadCount === 0" :max="99">
            <el-icon :size="22"><Bell /></el-icon>
          </el-badge>
        </div>
      </template>

      <div class="notification-panel">
        <!-- 头部 -->
        <div class="panel-header">
          <span class="title">互动消息</span>
          <el-button 
            v-if="unreadCount > 0" 
            type="primary" 
            link 
            size="small"
            @click="handleMarkAllRead"
          >
            全部已读
          </el-button>
        </div>

        <!-- 标签切换 -->
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <el-tab-pane label="全部消息" name="all" />
          <el-tab-pane label="点赞" name="like" />
          <el-tab-pane label="评论" name="comment" />
          <el-tab-pane label="关注" name="follow" />
        </el-tabs>

        <!-- 通知列表 -->
        <div class="notification-list" v-loading="loading">
          <template v-if="notifications.length > 0">
            <div 
              v-for="item in notifications" 
              :key="item.id"
              class="notification-item"
              :class="{ 'is-unread': !item.is_read }"
              @click="handleNotificationClick(item)"
            >
              <!-- 用户头像 -->
              <div class="item-avatar">
                <el-avatar 
                  v-if="getAvatarUrl(item)" 
                  :src="getAvatarUrl(item)" 
                  :size="40"
                />
                <div v-else class="default-avatar">
                  <el-icon v-if="isLikeType(item.type)" :size="18" color="#FE2C55">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </el-icon>
                  <el-icon v-else-if="isCommentType(item.type)" :size="18" color="#1890ff"><ChatDotRound /></el-icon>
                  <el-icon v-else-if="item.type === 'follow'" :size="18" color="#52c41a"><UserFilled /></el-icon>
                  <el-icon v-else :size="18" color="#faad14"><Bell /></el-icon>
                </div>
              </div>
              <!-- 通知内容 -->
              <div class="item-content">
                <p class="item-title">
                  <span class="item-username" v-if="getFromUserName(item)">{{ getFromUserName(item) }}</span>
                  {{ item.content }}
                </p>
                <p class="item-time">{{ formatTime(item.created_at) }}</p>
              </div>
              <!-- 视频封面缩略图 -->
              <div class="item-cover" v-if="getVideoCover(item)">
                <img :src="getVideoCover(item)" alt="视频封面" />
              </div>
              <div v-if="!item.is_read" class="unread-dot"></div>
            </div>
          </template>
          <el-empty v-else description="暂无互动消息" :image-size="80" />
        </div>

        <!-- 查看更多 -->
        <div v-if="hasMore" class="panel-footer">
          <el-button type="primary" link @click="loadMore">查看更多</el-button>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Bell, ChatDotRound, UserFilled } from '@element-plus/icons-vue'
import { getNotificationList, markNotificationRead, getUnreadNotificationCount } from '@/api/notification'
import { ElMessage } from 'element-plus'

const showPopover = ref(false)
const loading = ref(false)
const activeTab = ref('all')
const notifications = ref([])
const unreadCount = ref(0)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

// 前端 tab name -> 后端实际 type 映射
const typeMapping = {
  'all': 'all',
  'like': 'video_like',      // 后端存储的是 video_like
  'comment': 'comment',
  'follow': 'follow'
}

// 判断是否是点赞类型
const isLikeType = (type_) => ['video_like', 'comment_like', 'video_like_aggregated', 'comment_like_aggregated'].includes(type_)
const isCommentType = (type_) => ['comment', 'comment_reply', 'mention'].includes(type_)

// 从通知中提取头像 URL
const getAvatarUrl = (item) => {
  if (item.extra?.avatar_url) return item.extra.avatar_url
  return ''
}

// 从通知中提取发送者用户名
const getFromUserName = (item) => {
  if (item.extra?.from_user_name) return item.extra.from_user_name
  if (item.from_user) return item.from_user
  return ''
}

// 从通知中提取视频封面
const getVideoCover = (item) => {
  if (item.extra?.video_cover) return item.extra.video_cover
  return ''
}

// 是否有更多数据
const hasMore = computed(() => notifications.value.length < total.value)

// 获取通知列表
const fetchNotifications = async (reset = false) => {
  if (reset) {
    pageNum.value = 1
    notifications.value = []
  }

  loading.value = true
  try {
    const res = await getNotificationList({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      type: typeMapping[activeTab.value] || activeTab.value
    })
    
    if (res.code === 200 || res.code === 0) {
      const data = res.data || {}
      if (reset) {
        notifications.value = data.list || []
      } else {
        notifications.value = [...notifications.value, ...(data.list || [])]
      }
      total.value = data.total || 0
      unreadCount.value = data.unread_count || 0
    }
  } catch (error) {
    console.error('获取通知列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取未读数量
const fetchUnreadCount = async () => {
  try {
    const res = await getUnreadNotificationCount()
    if (res.code === 200 || res.code === 0) {
      unreadCount.value = res.data?.unread_count || 0
    }
  } catch (error) {
    console.error('获取未读数量失败:', error)
  }
}

// 标记全部已读
const handleMarkAllRead = async () => {
  try {
    const res = await markNotificationRead({ markAll: true })
    if (res.code === 200 || res.code === 0) {
      unreadCount.value = 0
      notifications.value = notifications.value.map(item => ({
        ...item,
        is_read: true
      }))
      ElMessage.success('已全部标记为已读')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 点击通知项
const handleNotificationClick = async (item) => {
  if (!item.is_read) {
    try {
      await markNotificationRead({ notificationId: item.id })
      item.is_read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }

  // 根据通知类型跳转
  // TODO: 实现跳转逻辑
  showPopover.value = false
}

// 切换标签
const handleTabChange = () => {
  fetchNotifications(true)
}

// 加载更多
const loadMore = () => {
  pageNum.value++
  fetchNotifications()
}

// Popover 显示状态变化
const handlePopoverVisibleChange = (visible) => {
  showPopover.value = visible
  if (visible) {
    fetchNotifications(true)
  }
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  
  return date.toLocaleDateString()
}

// 定时刷新未读数量
let refreshTimer = null

onMounted(() => {
  fetchUnreadCount()
  // 每分钟刷新一次未读数量
  refreshTimer = setInterval(fetchUnreadCount, 60000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>

<style scoped>
.notification-center {
  display: inline-flex;
  align-items: center;
}

.notification-trigger {
  cursor: pointer;
  padding: 8px;
  border-radius: 10px;
  transition: background-color var(--transition-fast);
  color: var(--text-muted);
}

.notification-trigger:hover {
  background-color: var(--hover-bg);
  color: var(--niuyin-primary-color);
}

.notification-panel {
  max-height: 500px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.panel-header .title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main);
}

.notification-list {
  flex: 1;
  overflow-y: auto;
  max-height: 350px;
  min-height: 200px;
}

.notification-item {
  display: flex;
  align-items: center;
  padding: 10px 4px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color-light);
  transition: all var(--transition-fast);
  position: relative;
  border-radius: 8px;
  margin: 2px 0;
  gap: 10px;
}

.notification-item:hover {
  background-color: var(--hover-bg);
}

.notification-item.is-unread {
  background-color: var(--active-bg);
}

.item-avatar {
  flex-shrink: 0;
}

.item-avatar .el-avatar {
  border: 1px solid var(--border-color-light);
}

.default-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--bg-surface);
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 13px;
  color: var(--text-main);
  margin-bottom: 3px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-username {
  font-weight: 600;
  color: var(--text-main);
  margin-right: 4px;
}

.item-time {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

.item-cover {
  flex-shrink: 0;
  width: 44px;
  height: 56px;
  border-radius: 6px;
  overflow: hidden;
  background-color: var(--bg-surface);
}

.item-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--niuyin-primary-color);
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
}

.panel-footer {
  padding-top: 12px;
  text-align: center;
  border-top: 1px solid var(--border-color);
}

:deep(.el-tabs__header) {
  margin-bottom: 0;
}

:deep(.el-tabs__item) {
  font-size: 13px;
  padding: 0 12px;
}
</style>
