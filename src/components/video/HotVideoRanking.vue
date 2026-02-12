<template>
  <div class="hot-ranking-container">
    <div class="ranking-header">
      <h2 class="ranking-title">
        <svg class="icon-fire" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 23c-4.97 0-9-3.58-9-8 0-3.08 1.64-5.48 3.76-7.21.65-.54 1.63-.23 1.84.57l.35 1.34c.14.54.65.88 1.21.75.56-.13.95-.66.89-1.23l-.34-3.08c-.07-.66.59-1.14 1.21-.88 3.16 1.32 5.54 3.94 6.53 7.18.16.53.66.87 1.22.81.55-.06.97-.53.97-1.09v-2.36c0-.66.72-1.07 1.28-.73C21.3 10.95 23 14.19 23 18c0 4.42-4.03 8-9 8z"/>
        </svg>
        热门视频榜
      </h2>
      <span class="ranking-subtitle">基于点赞数实时排行</span>
    </div>
    
    <el-skeleton :loading="loading" animated :count="5">
      <template #template>
        <div class="ranking-item-skeleton" v-for="i in 5" :key="i">
          <el-skeleton-item variant="text" style="width: 30px"/>
          <el-skeleton-item variant="image" style="width: 80px; height: 60px; margin: 0 12px;"/>
          <div style="flex: 1;">
            <el-skeleton-item variant="h3" style="width: 80%"/>
            <el-skeleton-item variant="text" style="width: 50%; margin-top: 8px;"/>
          </div>
        </div>
      </template>
      
      <template #default>
        <el-empty v-if="!videoList || videoList.length === 0" description="暂无热门视频"/>
        
        <div class="ranking-list" v-else>
          <div 
            v-for="(video, index) in videoList.slice(0, 10)" 
            :key="video.videoId || video.video_id"
            class="ranking-item"
            :class="{ 'top-three': index < 3 }"
            @click="handleVideoClick(video)"
          >
            <!-- 排名 -->
            <div class="rank-number" :class="getRankClass(index)">
              {{ index + 1 }}
            </div>
            
            <!-- 视频封面 -->
            <div class="video-cover">
              <el-image 
                :src="video.coverImage || video.cover_url"
                fit="cover"
                lazy
              >
                <template #error>
                  <div class="image-placeholder">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <!-- 播放量 -->
              <div class="play-count" v-if="video.visitCount || video.visit_count">
                <el-icon><VideoPlay /></el-icon>
                {{ formatNumber(video.visitCount || video.visit_count) }}
              </div>
            </div>
            
            <!-- 视频信息 -->
            <div class="video-info">
              <h3 class="video-title">{{ video.videoTitle || video.title }}</h3>
              <div class="video-meta">
                <span class="author" v-if="video.userNickName || video.author_name">
                  @{{ video.userNickName || video.author_name }}
                </span>
                <div class="stats">
                  <span class="like-count">
                    <el-icon><Star /></el-icon>
                    {{ formatNumber(video.likeNum || video.likes_count || 0) }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- 热度指示 -->
            <div class="heat-indicator" v-if="index < 3">
              <span class="heat-tag" :class="getHeatClass(index)">
                {{ index === 0 ? '火爆' : index === 1 ? '热门' : '上升' }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </el-skeleton>
    
    <!-- 视频播放弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :modal="true"
      class="video-dialog"
      width="80%"
      :destroy-on-close="true"
      align-center
    >
      <VideoPlayDialog v-if="currentVideo" :dialog-video="currentVideo" @dialogVisible="closeDialog"/>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { hotVideoPage } from '@/api/video.js'
import { Picture, VideoPlay, Star } from '@element-plus/icons-vue'
import VideoPlayDialog from '@/components/video/VideoPlayDialog.vue'

const loading = ref(true)
const videoList = ref([])
const dialogVisible = ref(false)
const currentVideo = ref(null)

// 获取热门视频列表
const fetchHotVideos = async () => {
  loading.value = true
  try {
    const res = await hotVideoPage({ pageNum: 1, pageSize: 10 })
    // Refactored-TikTok backend uses code 10000 for success
    // 注意：request.js 拦截器会把 res.data 展开，所以 Popular 直接在 res 上
    if (res.code === 10000 || res.code === 0 || res.code === 200) {
      console.log('📦 [HotVideoRanking] 响应数据结构:', Object.keys(res))
      console.log('📦 [HotVideoRanking] Popular 数据:', res.Popular, res.data?.Popular)
      // 优先从 res.data.Popular 获取（request.js 可能没有展开）
      const items = res.data?.Popular || res.Popular || res.data?.list || res.rows || []
      console.log('📦 [HotVideoRanking] 提取的 items:', items)
      // 格式化视频数据，过滤掉 video_id 为 0 或空的无效数据
      videoList.value = items
        .filter(item => {
          const videoId = item.video_id ?? item.VideoId ?? item.videoId
          return videoId !== undefined && videoId !== null && videoId !== 0
        })
        .map(item => {
          // 使用 ?? 代替 || 以正确处理 0 值
          const videoId = item.video_id ?? item.VideoId ?? item.videoId
          const userId = item.user_id ?? item.UserId ?? item.userId
          
          let videoUrl = item.video_url || item.VideoUrl || item.videoUrl
          if (!videoUrl || videoUrl.includes('localhost:9002')) {
            videoUrl = `/tiktok-user-content/users/${userId}/videos/${videoId}/source/original.mp4`
          }
          
          let coverImage = item.cover_url || item.CoverUrl || item.coverUrl || item.coverImage
          if (!coverImage || coverImage.includes('localhost:9002')) {
            coverImage = `/tiktok-user-content/users/${userId}/videos/${videoId}/thumbnails/thumb_medium.jpg`
          }
          
          return {
            videoId: videoId,
            videoTitle: item.video_title || item.VideoTitle || item.title || item.videoTitle || '未命名视频',
            videoUrl: videoUrl,
            coverImage: coverImage,
            userId: userId,
            userNickName: item.user_name || item.UserName || item.userName,
            likeNum: item.likes_count ?? item.like_count ?? item.LikeCount ?? item.likeCount ?? item.likeNum ?? 0,
            visitCount: item.visit_count ?? item.VisitCount ?? item.visitCount ?? 0,
            commentNum: item.comment_count ?? item.CommentCount ?? item.commentCount ?? 0,
            favoritesNum: item.favorites_count ?? item.FavoritesCount ?? item.favoritesCount ?? 0,
            publishType: item.publish_type ?? item.PublishType ?? item.publishType ?? '0', // 默认视频类型
            ...item
          }
        })
    }
  } catch (error) {
    console.error('获取热门视频失败:', error)
    videoList.value = []
  } finally {
    loading.value = false
  }
}

// 格式化数字
const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  return num.toString()
}

// 获取排名样式
const getRankClass = (index) => {
  if (index === 0) return 'rank-first'
  if (index === 1) return 'rank-second'
  if (index === 2) return 'rank-third'
  return 'rank-normal'
}

// 获取热度标签样式
const getHeatClass = (index) => {
  if (index === 0) return 'heat-hot'
  if (index === 1) return 'heat-warm'
  return 'heat-rising'
}

// 点击视频
const handleVideoClick = (video) => {
  currentVideo.value = video
  dialogVisible.value = true
}

// 关闭弹窗
const closeDialog = () => {
  dialogVisible.value = false
  currentVideo.value = null
}

onMounted(() => {
  fetchHotVideos()
})
</script>

<style scoped lang="scss">
.hot-ranking-container {
  background: var(--bg-video-card, #fff);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  max-width: 600px;
  margin: 0 auto;
}

.ranking-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  
  .ranking-title {
    display: flex;
    align-items: center;
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: var(--text-color, #333);
    
    .icon-fire {
      width: 24px;
      height: 24px;
      margin-right: 8px;
      color: #ff6b6b;
    }
  }
  
  .ranking-subtitle {
    font-size: 12px;
    color: #999;
  }
}

.ranking-item-skeleton {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.ranking-list {
  .ranking-item {
    display: flex;
    align-items: center;
    padding: 12px 8px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 4px;
    
    &:hover {
      background: rgba(0, 0, 0, 0.03);
      transform: translateX(4px);
    }
    
    &.top-three {
      background: linear-gradient(135deg, rgba(255, 107, 107, 0.05) 0%, rgba(255, 107, 107, 0) 100%);
    }
  }
}

.rank-number {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  border-radius: 8px;
  margin-right: 12px;
  flex-shrink: 0;
  
  &.rank-first {
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    color: #fff;
    box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
  }
  
  &.rank-second {
    background: linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%);
    color: #fff;
    box-shadow: 0 2px 8px rgba(192, 192, 192, 0.4);
  }
  
  &.rank-third {
    background: linear-gradient(135deg, #CD7F32 0%, #B8860B 100%);
    color: #fff;
    box-shadow: 0 2px 8px rgba(205, 127, 50, 0.4);
  }
  
  &.rank-normal {
    background: rgba(0, 0, 0, 0.04);
    color: #999;
  }
}

.video-cover {
  width: 80px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 12px;
  flex-shrink: 0;
  position: relative;
  
  :deep(.el-image) {
    width: 100%;
    height: 100%;
  }
  
  .image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    color: #ccc;
  }
  
  .play-count {
    position: absolute;
    bottom: 2px;
    right: 2px;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    font-size: 10px;
    padding: 2px 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 2px;
    
    .el-icon {
      font-size: 10px;
    }
  }
}

.video-info {
  flex: 1;
  min-width: 0;
  
  .video-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-color, #333);
    margin: 0 0 6px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.4;
  }
  
  .video-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    color: #999;
    
    .author {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100px;
    }
    
    .stats {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .like-count {
        display: flex;
        align-items: center;
        gap: 2px;
        color: #ff6b6b;
        
        .el-icon {
          font-size: 12px;
        }
      }
    }
  }
}

.heat-indicator {
  margin-left: 8px;
  flex-shrink: 0;
  
  .heat-tag {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 500;
    
    &.heat-hot {
      background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
      color: #fff;
    }
    
    &.heat-warm {
      background: linear-gradient(135deg, #ffa726 0%, #ffb74d 100%);
      color: #fff;
    }
    
    &.heat-rising {
      background: linear-gradient(135deg, #66bb6a 0%, #81c784 100%);
      color: #fff;
    }
  }
}

// 暗色主题适配
:root[data-theme="dark"] {
  .hot-ranking-container {
    background: #1a1a1a;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  }
  
  .ranking-header {
    border-bottom-color: rgba(255, 255, 255, 0.1);
    
    .ranking-title {
      color: #fff;
    }
  }
  
  .ranking-list .ranking-item {
    &:hover {
      background: rgba(255, 255, 255, 0.05);
    }
    
    &.top-three {
      background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 107, 107, 0) 100%);
    }
  }
  
  .rank-number.rank-normal {
    background: rgba(255, 255, 255, 0.1);
    color: #666;
  }
  
  .video-info .video-title {
    color: #fff;
  }
}
</style>
