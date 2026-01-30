<template>
  <div class="nav-center">
    <div class="nav-center-search"
         ref="NavSearch"
         style="border: 1px solid #666 !important; background-color: #2a2a2a !important;">
      <!-- 输入框 -->
      <el-popover popper-class="search-popover"
                  :width="480"
                  trigger="hover"
                  :offset="10"
                  :show-arrow="false"
                  popper-style="padding: 20px;"
                  @show="searchPopoverShow">
        <template #reference>
          <div class="flex-center wh100">
            <el-input
                class="search-input"
                v-model="searchData"
                :placeholder="searchDefaults"
                @keyup.enter.native="searchConfirm"
                clearable>
            </el-input>
            <el-button class="search-btn fw600 tcm flex-center" type="info" plain @click="searchConfirm">
              <!--               黑色主题-->
              <svg class="icon flex-center" aria-hidden="true">
                <use :xlink:href="[theme ? '#icon-search-dark' : '#icon-search']"></use>
              </svg>
              <!--              <span class="ml-5r dn-phone">搜索</span>-->
            </el-button>
          </div>
        </template>
        <template #default>
          <div class="search-pop">
            <!--            顶部搜索历史-->
            <div class="pop-top">
              <div v-if="searchHistory">
                <h5 class="mb5">搜索历史</h5>
                <el-tag class="cp tcm m5px text-hv-gold"
                        v-for="item in searchHistory"
                        :key="item.id"
                        type="info"
                        closable
                        @click="handleSearchHistorySelect(item.keyword)"
                        @close="handleSearchHistoryClose(item.id)">
                  {{ item.keyword }}
                </el-tag>
              </div>
            </div>
            <!--            中间搜索推荐-->
            <div class="pop-center">
              <div v-if="searchDiscover">
                <h5 class="mtb5">猜你想搜</h5>
                <div class="flex-between">
                  <p class="cp w49 p5px mb5px one-line search-hover-item text-hv-gold fs8"
                     v-for="item in searchDiscover"
                     @click="handleSearchDiscoverSelect(item.keyword)">
                    {{ item.keyword }}
                  </p>
                </div>
              </div>
            </div>
            <!--            底部热门搜索-->
            <div class="pop-bottom">
              <!--获取热门搜索标题的列表-->
              <div v-if="hotSearch">
                <h5 class="mtb5">芝士热搜</h5>
                <div v-for="(item,index) in hotSearch"
                     class="cp p5px one-line flex-row search-hover-item text-hv-gold fs8">
                  <div v-if="index===0" class="flex-center-nowrap">
                    <img class="mr5px" src="@/assets/images/rank/r1.png"/>
                    <span class="text-clamp" @click="handleSearchHotSelect(item)">{{ item }}</span>
                  </div>
                  <div v-else-if="index===1" class="flex-center-nowrap">
                    <img class="mr5px" src="@/assets/images/rank/r2.png"/>
                    <span class="text-clamp" @click="handleSearchHotSelect(item)">{{ item }}</span>
                  </div>
                  <div v-else-if="index===2" class="flex-center-nowrap">
                    <img class="mr5px" src="@/assets/images/rank/r3.png"/>
                    <span class="text-clamp" @click="handleSearchHotSelect(item)">{{ item }}</span>
                  </div>
                  <div v-else class="flex-center-nowrap">
                    <el-icon class="mr5px" style="width: 24px">
                      <CaretTop/>
                    </el-icon>
                    <span class="text-clamp" @click="handleSearchHotSelect(item)">{{ item }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </el-popover>
    </div>
  </div>
</template>

<script>
import { delSearchHistory, searchHistoryLoad, searchHotLoad } from "@/api/search.js";
import { themeX } from "@/store/themeX";
import { userInfoX } from "@/store/userInfoX";
import {
    ArrowRightBold, CaretTop,
    Message, QuestionFilled,
    Sunrise, SwitchButton, UserFilled,
} from '@element-plus/icons-vue';

export default {
  name: "NavCenter",
  computed: {
    UserFilled() {
      return UserFilled
    }
  },
  components: {CaretTop, Sunrise, SwitchButton, ArrowRightBold, QuestionFilled, Message},
  props: {},
  data() {
    return {
      user: userInfoX().userInfo,
      theme: themeX().dark,
      // 输入框的数据
      searchData: "",
      // 默认搜索词
      searchDefaults: "输入你感兴趣的内容",
      // 搜索历史
      searchHistory: null,
      // 猜你想搜：
      searchDiscover: [],
      // 热搜数据
      hotSearch: [],

      pageDto: {
        pageNum: 1,
        pageSize: 5
      },
    }
  },
  created() {

  },
  mounted() {
    // this.$nextTick(() => {
    //   this.getSearchHistory()
    // })
  },
  methods: {
    getSearchHistory() {
      searchHistoryLoad().then(res => {
        if (res.code === 200) {
          if (res.data.length > 0) {
            this.searchHistory = res.data
          }
        }
      })
    },
    getSearchDiscover() {
      // todo
      this.searchDiscover.push({id: 1, keyword: "你好"})
      this.searchDiscover = this.searchDiscover.slice(0, 10)
    },
    //分页获取热搜列表
    getHotSearch(pageDto) {
      searchHotLoad(pageDto).then(res => {
        pageDto = this.pageDto
        // Fix: Ensure we are getting the list, not the whole response object if it was leaking
        if (res.code === 200 && Array.isArray(res.data)) {
             this.hotSearch = res.data
        } else {
             this.hotSearch = []
        }
      })
    },
    // 判断选中了哪个搜索历史
    handleSearchHistorySelect(keyword) {
      this.searchData = keyword;
      this.routerJump();
    },
    //判断选中了那个热搜标签
    handleSearchHotSelect(keyword) {
      this.searchData = keyword;
      this.routerJump();
    },
    // 选中猜你想搜
    handleSearchDiscoverSelect(keyword) {
      this.searchData = keyword;
      this.routerJump();
    },
    // 确认搜索
    searchConfirm() {
      if (this.searchData === "") {
        this.searchData = this.searchDefaults;
      }
      this.routerJump();
      this.getSearchHistory()
    },
    // 路由跳转
    routerJump() {
      // 跳转到搜索页面
      this.$router.push(`/search/video?keyword=${this.searchData}`);
    },
    // 删除搜索历史记录
    handleSearchHistoryClose(id) {
      delSearchHistory(id).then(res => {
        if (res.code === 200) {
          this.getSearchHistory()
        }
      })
    },
    // 搜索框pop展示
    searchPopoverShow() {
      // 搜索记录
      this.getSearchHistory()
      // 猜你想搜
      this.getSearchDiscover()
      this.getHotSearch(this.pageDto)
    }
  },
}
</script>

<style scoped>
.nav-center {
  width: 100%;
  max-width: 400px;
}

.nav-center-search {
  display: flex;
  align-items: center;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  transition: all 0.2s ease;
  overflow: hidden;
}

.nav-center-search:hover,
.nav-center-search:focus-within {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.6);
}

.search-input {
  flex: 1;
}

:deep(.search-input .el-input__wrapper) {
  box-shadow: none !important;
  background: transparent !important;
  padding: 0 16px;
}

:deep(.search-input .el-input__inner) {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  height: 36px;
}

:deep(.search-input .el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.6);
}

.search-btn {
  flex-shrink: 0;
  height: 36px;
  width: 44px;
  border: none !important;
  background: transparent !important;
  border-radius: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.search-btn:hover {
  background: rgba(255, 255, 255, 0.15) !important;
}

.search-btn .icon {
  width: 18px;
  height: 18px;
  fill: rgba(255, 255, 255, 0.7);
  transition: fill 0.2s ease;
}

.search-btn:hover .icon {
  fill: rgba(255, 255, 255, 1);
}

/* 亮色主题适配 */
:root:not(.dark) .nav-center-search {
  background: rgba(0, 0, 0, 0.06);
  border-color: rgba(0, 0, 0, 0.08);
}

:root:not(.dark) .nav-center-search:hover,
:root:not(.dark) .nav-center-search:focus-within {
  background: rgba(0, 0, 0, 0.1);
  border-color: rgba(0, 0, 0, 0.12);
}

:root:not(.dark) :deep(.search-input .el-input__inner) {
  color: #161823;
}

:root:not(.dark) :deep(.search-input .el-input__inner::placeholder) {
  color: rgba(22, 24, 35, 0.5);
}

:root:not(.dark) .search-btn .icon {
  fill: rgba(22, 24, 35, 0.6);
}

:root:not(.dark) .search-btn:hover .icon {
  fill: rgba(22, 24, 35, 0.9);
}
</style>
