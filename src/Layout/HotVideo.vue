<template>
  <div class="hot-container wh100">
    <el-scrollbar>
      <div class="hot-page">
        <!-- 页面标题 -->
        <div class="hot-page-header">
          <h1 class="page-title">
            <svg class="icon-fire" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 23c-4.97 0-9-3.58-9-8 0-3.08 1.64-5.48 3.76-7.21.65-.54 1.63-.23 1.84.57l.35 1.34c.14.54.65.88 1.21.75.56-.13.95-.66.89-1.23l-.34-3.08c-.07-.66.59-1.14 1.21-.88 3.16 1.32 5.54 3.94 6.53 7.18.16.53.66.87 1.22.81.55-.06.97-.53.97-1.09v-2.36c0-.66.72-1.07 1.28-.73C21.3 10.95 23 14.19 23 18c0 4.42-4.03 8-9 8z"/>
            </svg>
            热门
          </h1>
        </div>

        <el-skeleton class="w100" :loading="loading" animated>
          <template #template>
            <div class="hot-content">
              <div class="hot-ranking-section">
                <div class="skeleton-item" v-for="i in 10" :key="i">
                  <el-skeleton-item variant="text" style="width: 30px; height: 24px;"/>
                  <el-skeleton-item variant="image" style="width: 80px; height: 56px; border-radius: 8px; margin: 0 12px;"/>
                  <div style="flex: 1;">
                    <el-skeleton-item variant="h3" style="width: 60%"/>
                    <el-skeleton-item variant="text" style="width: 40%; margin-top: 8px;"/>
                  </div>
                </div>
              </div>
              <div class="hot-search-section">
                <div v-for="i in 15" :key="i" style="padding: 8px 0;">
                  <el-skeleton-item variant="text" style="width: 80%;"/>
                </div>
              </div>
            </div>
          </template>

          <template #default>
            <div class="hot-content">
              <!-- 左侧：热门视频排行榜 -->
              <div class="hot-ranking-section">
                <HotVideoRanking />
              </div>

              <!-- 右侧：热搜词 -->
              <div class="hot-search-section">
                <div class="search-card">
                  <div class="search-header">
                    <h2 class="search-title">
                      <svg class="icon-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.35-4.35"/>
                      </svg>
                      热搜榜
                    </h2>
                    <span class="search-subtitle">实时热搜关键词</span>
                  </div>

                  <el-empty v-if="hotSearchList.length === 0" description="暂无热搜数据" :image-size="80"/>

                  <div class="search-list" v-else>
                    <div
                      v-for="(word, index) in hotSearchList"
                      :key="index"
                      class="search-item"
                      @click="handleClickHotSearch(word)"
                    >
                      <span class="search-rank" :class="getRankClass(index)">{{ index + 1 }}</span>
                      <span class="search-word">{{ word }}</span>
                      <span class="search-badge" v-if="index < 3">
                        {{ index === 0 ? '爆' : index === 1 ? '热' : '新' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </el-skeleton>
      </div>
    </el-scrollbar>
    <el-backtop :right="16" :bottom="16" target=".main-container .el-scrollbar__wrap"/>
  </div>
</template>

<script>
import { searchHotLoad } from "@/api/search.js";
import HotVideoRanking from "@/components/video/HotVideoRanking.vue";

export default {
  name: "HotVideo",
  components: { HotVideoRanking },
  data() {
    return {
      loading: true,
      hotSearchList: [],
    };
  },
  created() {
    this.loadHotSearch();
  },
  methods: {
    async loadHotSearch() {
      this.loading = true;
      try {
        const res = await searchHotLoad({ pageNum: 1, pageSize: 50 });
        if (res.code === 10000 || res.code === 0 || res.code === 200) {
          const popularData = res.data?.Popular || res.Popular || res.data || [];
          if (Array.isArray(popularData) && popularData.length > 0) {
            if (typeof popularData[0] === 'object') {
              this.hotSearchList = popularData
                .map(item => item.title || item.video_title || item.videoTitle)
                .filter(title => title);
            } else {
              this.hotSearchList = popularData;
            }
          }
        }
      } catch (error) {
        console.error('获取热搜数据失败:', error);
        this.hotSearchList = [];
      } finally {
        this.loading = false;
      }
    },
    getRankClass(index) {
      if (index === 0) return 'rank-first';
      if (index === 1) return 'rank-second';
      if (index === 2) return 'rank-third';
      return '';
    },
    handleClickHotSearch(word) {
      this.$router.push(`/search/video?keyword=${word}`);
    },
  },
};
</script>

<style scoped>
@import "@/assets/styles/hotVideo.scss";
</style>
