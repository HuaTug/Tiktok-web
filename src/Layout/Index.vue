<template>
  <!--  首页-->
  <div :class="{ 'dark': isDark }" class="min-h-screen bg-bg-base text-text-main transition-colors duration-300">
    <div class="bg-mask fixed inset-0 -z-10 bg-bg-base"></div>
    <el-container class="layout-container h-screen">
      <Aside :siteTitle="siteTitle" class="border-r border-border bg-bg-surface"></Aside>
      <el-container class="is-vertical">
        <Header @themeChangeEmit="emitThemeChange" class="border-b border-border bg-bg-surface/80 backdrop-blur-md sticky top-0 z-50"></Header>
        <el-main class="main-container p-0 overflow-x-hidden">
          <!--路由-->
          <router-view v-slot="{ Component }">
            <keep-alive :include="['Video','Discover','HotVideo','Follow','User','CategoryVideo2']">
              <component :is="Component"/>
            </keep-alive>
          </router-view>
          <el-backtop :right="16" :bottom="16" target=".main-container"></el-backtop>
        </el-main>
      </el-container>
    </el-container>
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
      isDark: false,
    }
  },
  created() {
  },
  mounted() {
    this.initTheme()
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

<style rel="stylesheet/scss" lang="scss" scoped>
.main-container {
  height: calc(100vh - 60px);
}
</style>
