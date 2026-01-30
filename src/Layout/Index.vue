<template>
  <!--  首页-->
  <div :class="{ 'dark': isDark }" class="app-wrapper">
    <div class="bg-mask"></div>
    <div class="layout-container">
      <Aside :siteTitle="siteTitle" class="sidebar-container"></Aside>
      <div class="main-wrapper">
        <Header @themeChangeEmit="emitThemeChange" class="header-container"></Header>
        <main class="main-container">
          <!--路由-->
          <router-view v-slot="{ Component }">
            <keep-alive :include="['Video','Discover','HotVideo','Follow','User','CategoryVideo2']">
              <component :is="Component"/>
            </keep-alive>
          </router-view>
          <el-backtop :right="16" :bottom="16" target=".main-container"></el-backtop>
        </main>
      </div>
    </div>
  </div>
</template>
<script>
import Aside from "@/components/Aside.vue";
import Header from "@/components/Header.vue";
import { themeX } from "@/store/themeX";

export default {
  name: 'Index',
  components: {Aside, Header},
  data() {
    return {
      siteTitle: "ZhiShi",
      isDark: true, // Default to dark mode for better initial impression
    }
  },
  created() {
  },
  mounted() {
    // Force dark mode initially if not set
    const dark = themeX().dark !== false; 
    this.emitThemeChange(dark);
  },
  methods: {
    initTheme() {
      const dark = themeX().dark
      this.isDark = dark
      this.applyTheme(dark)
    },
    // 换肤事件
    emitThemeChange(dark) {
      this.isDark = dark
      this.applyTheme(dark)
    },
    applyTheme(dark) {
      if (dark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.app-wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: var(--bg-base);
  color: var(--text-main);
  transition: background-color 0.3s, color 0.3s;
}

.bg-mask {
  position: fixed;
  inset: 0;
  z-index: -1;
  background-color: var(--bg-base);
}

.layout-container {
  display: flex;
  width: 100%;
  height: 100%;
}

.sidebar-container {
  flex-shrink: 0;
  width: 240px;
  height: 100%;
  background-color: #121212; /* 深灰色，比纯黑稍亮 */
  transition: width 0.3s;
  
  @media (max-width: 768px) {
    width: 60px;
  }
}

.main-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0; // 防止flex子元素溢出
  height: 100%;
  overflow: hidden;
}

.header-container {
  flex-shrink: 0;
  height: 60px;
  background-color: #121212; /* 深灰色，比纯黑稍亮 */
  z-index: 100;
}

.main-container {
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 0;
}
</style>
