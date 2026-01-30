<template>
  <!--  侧边栏-->
  <el-aside class="w-[60px] md:w-64 h-full bg-bg-surface border-r border-border transition-all duration-300 flex flex-col overflow-hidden">
    <!-- logo -->
    <div class="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-border shrink-0">
      <router-link class="flex items-center gap-3 w-full justify-center md:justify-start" to="/">
        <img class="w-8 h-8 object-contain" src="@/assets/logo/logo-cheese.png" alt="Logo">
        <span class="hidden md:block font-bold text-xl text-primary tracking-tight font-sans">ZhiShi</span>
      </router-link>
    </div>
    
    <el-scrollbar class="flex-1 py-4">
      <!-- tab栏区域 -->
      <div class="px-2">
        <ul class="space-y-1">
          <li v-for="(item, i) in tabsTopList" :key="i">
            <router-link 
              class="flex items-center gap-4 px-3 py-3 rounded-xl text-text-muted hover:bg-zinc-100 dark:hover:bg-slate-800 hover:text-primary transition-all group relative"
              active-class="bg-primary-50 dark:bg-primary-900/20 text-primary font-bold shadow-sm"
              :to="item.link">
              <div class="w-6 h-6 flex items-center justify-center shrink-0">
                <svg class="w-5 h-5 fill-current transition-transform group-hover:scale-110" aria-hidden="true">
                  <use :xlink:href="item.class"></use>
                </svg>
              </div>
              <span class="hidden md:block text-sm font-medium">{{ item.name }}</span>
              
              <!-- Tooltip for mobile/collapsed -->
              <div class="md:hidden absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                {{ item.name }}
              </div>
            </router-link>
          </li>
        </ul>
      </div>
    </el-scrollbar>
  </el-aside>
</template>

<script>
import { Message } from "@element-plus/icons-vue";

export default {
  name: "Aside",
  components: {Message},
  props: {
    siteTitle: String,
  },
  data() {
    return {
      tabsTopList: [
        {id: 0, name: "Home", class: "#icon-index", link: "/"},
        {id: 1, name: "Discover", class: "#icon-discover", link: "/discover"},
        {id: 2, name: "Trending", class: "#icon-hotVideo", link: "/hotVideo"},
        {id: 3, name: "Following", class: "#icon-follow", link: "/follow"},
        {id: 5, name: "Profile", class: "#icon-erciyuan", link: "/user",},
      ],
    }
  },
  mounted() {
  },
  methods: {
    handleSelect(index) {
    },
  }
}
</script>

<style scoped>
/* Remove old styles */
</style>
