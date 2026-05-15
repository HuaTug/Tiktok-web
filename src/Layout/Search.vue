<template>
  <div class="search-container wh100" ref="searchContainer">
    <el-scrollbar>
      <div class="grid-3-1">
        <div class="search-left">
          <!-- 当前搜索词提示 -->
          <div v-if="currentKeyword" class="search-keyword-bar">
            <span class="search-keyword-label">搜索：</span>
            <span class="search-keyword-text">"{{ currentKeyword }}"</span>
          </div>

          <div class="search-select flex-between">
            <div class="search-select-left">
              <el-tabs v-model="activeName" @tab-click="handleClick">
                <el-tab-pane v-for="item in videoSearchTabShow"
                             :key="item.id"
                             :label="item.tabName"
                             :lazy="true"
                             :name="item.id">
                </el-tab-pane>
              </el-tabs>
            </div>
            <div class="search-select-right">
              <el-popover class="user-popover"
                          :width="320"
                          trigger="click"
                          popper-style="padding: 20px;border-radius: 8px">
                <template #reference>
                  <div class="cp flex-center text-hv-primary">
                    <span class="mr5px">筛选</span>
                    <el-tag v-if="filterSort !== 0 || filterTime !== 0"
                            size="small"
                            type="danger"
                            effect="dark"
                            round
                            class="filter-badge">
                      {{ filterActiveCount }}
                    </el-tag>
                    <el-icon>
                      <Filter/>
                    </el-icon>
                  </div>
                </template>
                <template #default>
                  <div class="mb5">
                    <h4 class="mb5">排序依据</h4>
                    <div class="flex-between">
                      <div class="w33 cp tac text-hv-primary" v-for="item in FilterOptionSort" :key="'sort-'+item.id" style="padding: 5px"
                           @click="handleSearchSortFilter(item)">
                        <div v-if="item.id===filterSort" class="bgc-primary-4 b-radius1 tac" style="padding: 4px 2px">
                          {{ item.title }}
                        </div>
                        <div v-else class=" b-radius1 tac" style="padding: 4px 2px"> {{ item.title }}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 class="mb5">发布时间</h4>
                    <div class="flex-between ">
                      <div class="w25 cp text-hv-primary" v-for="item in FilterOptionPublishTime" :key="'time-'+item.id" style="padding: 5px"
                           @click="handleSearchTimeFilter(item)">
                        <div v-if="item.id===filterTime" class="bgc-primary-4 b-radius1 tac" style="padding: 4px 2px">
                          {{ item.title }}
                        </div>
                        <div v-else class=" b-radius1 tac" style="padding: 4px 2px"> {{ item.title }}</div>
                      </div>
                    </div>
                  </div>
                  <div v-if="filterSort !== 0 || filterTime !== 0" class="filter-reset-bar mt1rem tac">
                    <el-button size="small" @click="resetFilters">重置筛选</el-button>
                  </div>
                </template>
              </el-popover>
            </div>
          </div>
          <!--  视频/用户搜索结果由子路由渲染 -->
          <router-view :key="$route.fullPath"/>
        </div>
        <div class="search-right">
          <div class="flex-between mb1rem">
            <h4>{{ rightTitle }}</h4>
            <span v-if="!suggestLoading && videoSearchSuggestList.length"
                  class="cp fs9 cg refresh-link"
                  @click="loadSuggest">换一批</span>
          </div>
          <el-skeleton :loading="suggestLoading" animated :rows="5">
            <template #default>
              <div v-if="videoSearchSuggestList.length === 0" class="suggest-empty cg fs9 tac">
                暂无相关搜索
              </div>
              <div v-else>
                <div v-for="(item,index) in videoSearchSuggestList" :key="'sug-'+index" class="p5px">
                  <p class="text-hv-primary cp one-line search-suggest-hover-item" @click="handleClickSuggest(item)">
                    <span class="mr5px"><el-icon><Search/></el-icon></span>
                    <span class="fs9 one-line" style="line-height: 1.3">{{ item }}</span>
                  </p>
                </div>
              </div>
            </template>
          </el-skeleton>
        </div>
      </div>
    </el-scrollbar>
  </div>
  <el-backtop :right="16" :bottom="16" target=".search-container .el-scrollbar__wrap" :visibility-height="10"/>
</template>

<script>
import { videoSearchSuggest, getSearchSuggestions } from "@/api/search.js";
import VideoSearchOneCard from "@/components/video/card/VideoSearchOneCard.vue";
import { removeHtmlTags } from "@/utils/roydon.js";
import { Filter, Search } from "@element-plus/icons-vue";

export default {
  name: "VideoSearch",
  components: {VideoSearchOneCard, Filter, Search},
  props: {},
  data() {
    return {
      loading: false,
      suggestLoading: false,
      videoSearchTabShow: [
        {id: 0, tabName: "视频", tabUrl: "/search/video"},
        {id: 1, tabName: "用户", tabUrl: "/search/user"}
      ],
      activeName: 0,
      FilterOptionSort: [
        {id: 0, title: "综合排序"},
        {id: 1, title: "最新发布"},
        {id: 2, title: "最多点赞"},
      ],
      FilterOptionPublishTime: [
        {id: 0, title: "不限"},
        {id: 1, title: "一天内"},
        {id: 2, title: "一周内"},
        {id: 3, title: "一月内"},
      ],
      filterSort: 0,
      filterTime: 0,
      videoSearchSuggestList: [],
    }
  },
  computed: {
    currentKeyword() {
      return this.$route.query.keyword || ''
    },
    filterActiveCount() {
      let n = 0
      if (this.filterSort !== 0) n++
      if (this.filterTime !== 0) n++
      return n
    },
    rightTitle() {
      return this.currentKeyword ? '相关搜索' : '猜你想搜'
    },
  },
  watch: {
    // keyword 改变时重拉相关搜索；同时同步路由 query 到筛选状态
    '$route.query': {
      handler(q) {
        this.syncFiltersFromQuery(q)
        this.syncTabFromPath(this.$route.path)
        this.loadSuggest()
        // 任何一次搜索条件变化（关键词/筛选）都把滚动容器置顶，
        // 避免上一次的长列表把 scrollbar 卡在底部
        this.$nextTick(this.resetScrollTop)
      },
      immediate: false,
    },
    '$route.path': {
      handler(p) {
        this.syncTabFromPath(p)
        this.$nextTick(this.resetScrollTop)
      },
      immediate: false,
    },
  },
  mounted() {
    this.syncFiltersFromQuery(this.$route.query)
    this.syncTabFromPath(this.$route.path)
    this.loadSuggest()
    this.$nextTick(this.resetScrollTop)
  },
  methods: {
    resetScrollTop() {
      const el = this.$el && this.$el.querySelector
        ? this.$el.querySelector('.el-scrollbar__wrap')
        : document.querySelector('.search-container .el-scrollbar__wrap')
      if (el) el.scrollTop = 0
    },
    syncFiltersFromQuery(q) {
      this.filterSort = Number(q?.sort || 0)
      this.filterTime = Number(q?.time || 0)
    },
    syncTabFromPath(path) {
      const idx = this.videoSearchTabShow.findIndex(t => path.startsWith(t.tabUrl))
      this.activeName = idx >= 0 ? this.videoSearchTabShow[idx].id : 0
    },
    // 加载右侧"相关搜索/猜你想搜"
    loadSuggest() {
      this.suggestLoading = true
      const keyword = this.currentKeyword
      const handle = (raw) => {
        let arr = []
        if (Array.isArray(raw)) arr = raw
        else if (Array.isArray(raw?.suggestions)) arr = raw.suggestions
        else if (Array.isArray(raw?.video_search)) arr = raw.video_search.map(it => it.title || it.video_title || it.videoTitle).filter(Boolean)
        const list = arr.map(it => typeof it === 'object' ? (it.title || it.video_title || it.keyword || '') : it)
            .filter(it => typeof it === 'string' && it.trim())
        // 去重 + 过滤掉与当前 keyword 完全相同的项
        const seen = new Set()
        const unique = []
        for (const it of list) {
          const k = removeHtmlTags(it).trim()
          if (!k || k === keyword) continue
          if (seen.has(k)) continue
          seen.add(k)
          unique.push(it)
        }
        this.videoSearchSuggestList = unique.slice(0, 10)
      }

      const finalize = () => { this.suggestLoading = false }

      if (keyword) {
        // 已搜：取相关推荐（基于 keyword）
        videoSearchSuggest({ keyword }).then(res => {
          if (res.code === 10000 || res.code === 0 || res.code === 200) handle(res.data)
          else this.videoSearchSuggestList = []
        }).catch(() => { this.videoSearchSuggestList = [] }).finally(finalize)
      } else {
        // 未搜：调用 /v1/search/suggestions（猜你想搜，含热门关键词）
        getSearchSuggestions().then(res => {
          if (res.code === 10000 || res.code === 0 || res.code === 200) handle(res.data)
          else this.videoSearchSuggestList = []
        }).catch(() => { this.videoSearchSuggestList = [] }).finally(finalize)
      }
    },
    // 切换 tab
    handleClick(tab) {
      const target = this.videoSearchTabShow.find(t => t.id === tab.props.name)
      if (!target) return
      this.$router.push({
        path: target.tabUrl,
        query: { ...this.$route.query },
      })
    },
    handleSearchSortFilter(item) {
      this.filterSort = item.id
      this.$router.replace({
        path: this.$route.path,
        query: { ...this.$route.query, sort: item.id || undefined },
      })
    },
    handleSearchTimeFilter(item) {
      this.filterTime = item.id
      this.$router.replace({
        path: this.$route.path,
        query: { ...this.$route.query, time: item.id || undefined },
      })
    },
    resetFilters() {
      this.filterSort = 0
      this.filterTime = 0
      const q = { ...this.$route.query }
      delete q.sort
      delete q.time
      this.$router.replace({ path: this.$route.path, query: q })
    },
    // 点击相关搜索：用 router.push 触发新一轮搜索
    handleClickSuggest(item) {
      const keyword = removeHtmlTags(item).trim()
      if (!keyword) return
      this.$router.push({
        path: this.$route.path,
        query: { ...this.$route.query, keyword },
      })
    },
  }
}
</script>
<style scoped>
.search-container {
  border-radius: var(--card-radius);
  margin: 0 auto;
  background: var(--bg-base);

  .search-left {
    z-index: 9999;

    .search-keyword-bar {
      padding: 8px 4px 4px;
      font-size: 14px;
      color: var(--text-secondary);
      .search-keyword-text {
        color: var(--niuyin-primary-color);
        font-weight: 600;
      }
    }

    .search-select {
      position: sticky;
      top: 0;
      z-index: 10;
      background: var(--bg-base);
      padding: 4px 0;
    }
  }

  .search-right {
    height: max-content;
    position: sticky;
    top: 0;
    z-index: 10;
    padding: 16px;
    background: var(--bg-elevated);
    border-radius: var(--card-radius);
    border: 1px solid var(--border-color-light);

    h4 {
      color: var(--text-main);
    }

    .refresh-link {
      transition: color var(--transition-fast);
      &:hover {
        color: var(--niuyin-primary-color);
      }
    }

    .suggest-empty {
      padding: 20px 0;
    }
  }
}

.filter-badge {
  margin-right: 6px;
  height: 18px;
  padding: 0 6px;
  line-height: 18px;
  font-size: 11px;
}

.filter-reset-bar {
  border-top: 1px dashed var(--border-color-light);
  padding-top: 12px;
}

.search-suggest-hover-item {
  line-height: 1;
  border-radius: 8px;
  padding: 10px 8px;
  display: flex;
  color: var(--text-secondary);
  transition: all var(--transition-fast);

  &:hover {
    background-color: var(--hover-bg);
    color: var(--niuyin-primary-color);
  }
}

::v-deep(.el-tabs__item) {
  font-size: 1rem;
  color: var(--text-secondary);
}

::v-deep(.el-tabs__item.is-active) {
  color: var(--niuyin-primary-color);
  font-weight: 600;
}

::v-deep(.bg-mask) {
  background: none !important;
}
</style>
