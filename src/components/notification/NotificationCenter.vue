<template>
  <div class="notification-center">
    <!-- 通知图标按钮 -->
    <el-popover
      :visible="showPopover"
      placement="bottom-end"
      :width="400"
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
          <span class="title">消息通知</span>
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
          <el-tab-pane label="全部" name="all" />
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
              <div class="item-icon">
                <el-icon v-if="item.type === 'like'" color="#ff4d4f"><Star /></el-icon>
                <el-icon v-else-if="item.type === 'comment'" color="#1890ff"><ChatDotRound /></el-icon>
                <el-icon v-else-if="item.type === 'follow'" color="#52c41a"><UserFilled /></el-icon>
                <el-icon v-else color="#faad14"><Bell /></el-icon>
              </div>
              <div class="item-content">
                <p class="item-title">{{ item.title }}</p>
                <p class="item-desc">{{ item.content }}</p>
                <p class="item-time">{{ formatTime(item.created_at) }}</p>
              </div>
              <div v-if="!item.is_read" class="unread-dot"></div>
            </div>
          </template>
          <el-empty v-else description="暂无通知" :image-size="80" />
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
import { Bell, Star, ChatDotRound, UserFilled } from '@element-plus/icons-vue'
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
      type: activeTab.value
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
  align-items: flex-start;
  padding: 12px 4px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color-light);
  transition: all var(--transition-fast);
  position: relative;
  border-radius: 8px;
  margin: 2px 0;
}

.notification-item:hover {
  background-color: var(--hover-bg);
}

.notification-item.is-unread {
  background-color: var(--active-bg);
}

.item-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--bg-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-main);
  margin-bottom: 3px;
}

.item-desc {
  font-size: 13px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-time {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 3px;
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
