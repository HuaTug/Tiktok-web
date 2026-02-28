<template>
  <div class="video-view-history">
    <!-- 顶部操作栏 -->
    <div class="history-header">
      <h3>观看历史</h3>
      <el-button v-if="historyList.length > 0" type="danger" text @click="handleClearAll">
        <el-icon><Delete /></el-icon>
        清空历史
      </el-button>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>
    <div v-else-if="historyList.length > 0" class="history-list">
      <div v-for="item in historyList" :key="item.history_id" class="history-item">
        <VideoCard :video="formatVideoData(item)" />
        <div class="item-actions">
          <span class="watch-time">{{ formatWatchTime(item.watch_time) }}</span>
          <el-button type="danger" text size="small" @click="handleDeleteItem(item.video_id)">
            删除
          </el-button>
        </div>
      </div>
    </div>
    <el-empty v-else description="暂无观看历史">
      <template #description>
        <p class="cg">观看的视频将会显示在这里</p>
      </template>
    </el-empty>

    <!-- 加载更多 -->
    <div v-if="hasMore && historyList.length > 0" class="load-more">
      <el-button @click="loadMore" :loading="loadingMore">加载更多</el-button>
    </div>
  </div>
</template>
<script>
import VideoCard from "@/components/video/VideoCard.vue";
import { Delete } from '@element-plus/icons-vue';
import { getWatchHistory, deleteWatchHistoryItem, clearWatchHistory } from "@/api/video.js";
import { ElMessageBox, ElMessage } from 'element-plus';

export default {
  name: "VideoViewHistory",
  components: { VideoCard, Delete },
  data() {
    return {
      loading: false,
      loadingMore: false,
      historyList: [],
      hasMore: true,
      queryParams: {
        page_num: 1,
        page_size: 20,
        date_filter: 'all'
      }
    }
  },
  created() {
    this.getWatchHistory()
  },
  methods: {
    // 获取观看历史
    async getWatchHistory() {
      this.loading = true
      try {
        const res = await getWatchHistory(this.queryParams)
        // 兼容两种响应格式：{code, data} 或 {base: {code}, history_list}
        const code = res.code || res.base?.code
        if (code === 0 || code === 200) {
          this.historyList = res.data?.history_list || res.history_list || []
          this.hasMore = res.has_more || (this.historyList.length >= this.queryParams.page_size)
        } else {
          console.error('获取观看历史失败:', res.message || res.base?.msg)
        }
      } catch (error) {
        console.error('获取观看历史失败:', error)
      } finally {
        this.loading = false
      }
    },

    // 加载更多
    async loadMore() {
      this.loadingMore = true
      this.queryParams.page_num++
      try {
        const res = await getWatchHistory(this.queryParams)
        const code = res.code || res.base?.code
        if (code === 0 || code === 200) {
          const newList = res.data?.history_list || res.history_list || []
          this.historyList.push(...newList)
          this.hasMore = res.has_more || (newList.length >= this.queryParams.page_size)
        }
      } catch (error) {
        console.error('加载更多失败:', error)
        this.queryParams.page_num--
      } finally {
        this.loadingMore = false
      }
    },

    // 删除单条历史
    async handleDeleteItem(videoId) {
      try {
        const res = await deleteWatchHistoryItem(videoId)
        if (res.code === 0 || res.code === 200) {
          this.historyList = this.historyList.filter(item => item.video_id !== videoId)
          ElMessage.success('删除成功')
        } else {
          ElMessage.error(res.message || '删除失败')
        }
      } catch (error) {
        console.error('删除历史失败:', error)
        ElMessage.error('删除失败')
      }
    },

    // 清空所有历史
    async handleClearAll() {
      try {
        await ElMessageBox.confirm('确定要清空所有观看历史吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        const res = await clearWatchHistory('all')
        if (res.code === 0 || res.code === 200) {
          this.historyList = []
          ElMessage.success('清空成功')
        } else {
          ElMessage.error(res.message || '清空失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('清空历史失败:', error)
          ElMessage.error('清空失败')
        }
      }
    },

    // 格式化视频数据以兼容 VideoCard 组件
    formatVideoData(item) {
      const videoInfo = item.video_info || {}
      return {
        videoId: item.video_id || videoInfo.video_id,
        video_id: item.video_id || videoInfo.video_id,
        videoTitle: videoInfo.title || '',
        coverUrl: videoInfo.cover_url || videoInfo.coverUrl || '',
        cover_url: videoInfo.cover_url || videoInfo.coverUrl || '',
        coverImage: videoInfo.cover_url || videoInfo.coverUrl || '',
        playUrl: videoInfo.video_url || videoInfo.play_url || '',
        play_url: videoInfo.video_url || videoInfo.play_url || '',
        videoUrl: videoInfo.video_url || '',
        userId: item.user_id || videoInfo.user_id,
        userNickName: videoInfo.user_name || videoInfo.author?.nickname || '',
        author: videoInfo.author || {},
        likeNum: videoInfo.likes_count || videoInfo.like_count || 0,
        commentNum: videoInfo.comment_count || 0,
        visitCount: videoInfo.visit_count || 0,
        createTime: videoInfo.created_at || '',
        description: videoInfo.description || '',
        publishType: videoInfo.publish_type || '0'
      }
    },

    // 格式化观看时间
    formatWatchTime(watchTime) {
      if (!watchTime) return ''
      const date = new Date(watchTime)
      const now = new Date()
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) {
        return '今天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      } else if (diffDays === 1) {
        return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      } else if (diffDays < 7) {
        return diffDays + '天前'
      } else {
        return date.toLocaleDateString('zh-CN')
      }
    }
  }
}
</script>
<style scoped>
.video-view-history {
  padding: 20px;
  width: 100%;
}
.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.history-header h3 {
  margin: 0;
  font-size: 18px;
}
.loading-container {
  padding: 20px;
}
.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  width: 100%;
}
.history-item {
  position: relative;
  width: calc(25% - 0.75rem);
  min-width: 200px;
}
.history-item :deep(.video-card) {
  width: 100% !important;
  padding: 0 !important;
  height: 280px;
}
.history-item :deep(.video-card .video-card-card) {
  width: 100%;
  height: 100%;
}
.history-item :deep(.video-card .video-cover-image) {
  height: 200px;
}
.history-item :deep(.video-card .video-info) {
  height: auto;
  min-height: 60px;
}
.item-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding: 0 5px;
}
.watch-time {
  font-size: 12px;
  color: #999;
}
.load-more {
  text-align: center;
  margin-top: 20px;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .history-item {
    width: calc(33.33% - 0.67rem);
  }
}
@media (max-width: 900px) {
  .history-item {
    width: calc(50% - 0.5rem);
  }
}
@media (max-width: 600px) {
  .history-item {
    width: 100%;
  }
}
</style>
