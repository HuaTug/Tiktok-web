<template>
  <div class="nav-center">
    <div class="nav-center-search" ref="NavSearch">
      <el-input
          class="search-input"
          v-model="searchData"
          :placeholder="searchDefaults"
          @keyup.enter.native="searchConfirm"
          clearable>
      </el-input>
      <el-button class="search-btn fw600 tcm flex-center" type="info" plain @click="searchConfirm">
        <svg class="icon flex-center" aria-hidden="true">
          <use :xlink:href="[theme ? '#icon-search-dark' : '#icon-search']"></use>
        </svg>
      </el-button>
    </div>
  </div>
</template>

<script>
import { addSearchHistory } from "@/api/search.js";
import { themeX } from "@/store/themeX";

export default {
  name: "NavCenter",
  props: {},
  data() {
    return {
      theme: themeX().dark,
      searchData: "",
      searchDefaults: "输入你感兴趣的内容",
    }
  },
  methods: {
    searchConfirm() {
      const kw = (this.searchData || '').trim()
      if (!kw) return
      this.searchData = kw
      addSearchHistory(kw).catch(() => {})
      this.$router.push({
        path: '/search/video',
        query: { keyword: kw },
      })
    },
  },
}
</script>

<style scoped>
.nav-center {
  width: 100%;
  max-width: 460px;
}

.nav-center-search {
  display: flex;
  align-items: center;
  border-radius: 22px;
  background: var(--hover-bg);
  border: 1.5px solid var(--border-color);
  transition: all var(--transition-fast);
  overflow: hidden;
}

.nav-center-search:hover,
.nav-center-search:focus-within {
  border-color: var(--niuyin-primary-color);
  background: var(--hover-bg);
  box-shadow: 0 0 0 3px rgba(254, 44, 85, 0.08);
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
  color: var(--text-main);
  font-size: 14px;
  height: 36px;
}

:deep(.search-input .el-input__inner::placeholder) {
  color: var(--text-muted);
}

.search-btn {
  flex-shrink: 0;
  height: 36px;
  width: 44px;
  border: none !important;
  background: transparent !important;
  border-radius: 0 20px 20px 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.search-btn:hover {
  background: var(--active-bg) !important;
}

.search-btn .icon {
  width: 18px;
  height: 18px;
  fill: var(--text-muted);
  transition: fill var(--transition-fast);
}

.search-btn:hover .icon {
  fill: var(--niuyin-primary-color);
}
</style>
