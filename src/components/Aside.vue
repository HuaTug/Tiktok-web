<template>
  <!--  侧边栏-->
  <aside class="aside-container">
    <!-- logo -->
    <div class="logo-container">
      <router-link class="logo-link" to="/">
        <img class="logo-img" src="@/assets/logo/logo-cheese.png" alt="Logo">
        <span class="logo-text">ZhiShi</span>
      </router-link>
    </div>
    
    <div class="nav-scroll">
      <!-- tab栏区域 -->
      <nav class="nav-menu">
        <ul class="menu-list">
          <li v-for="(item, i) in tabsTopList" :key="i" class="menu-item">
            <router-link 
              class="menu-link"
              active-class="menu-link-active"
              :to="item.link">
              <div class="menu-icon">
                <svg class="icon-svg" aria-hidden="true">
                  <use :xlink:href="item.class"></use>
                </svg>
              </div>
              <span class="menu-text">{{ item.name }}</span>
              
              <!-- Tooltip for mobile/collapsed -->
              <div class="menu-tooltip">
                {{ item.name }}
              </div>
            </router-link>
          </li>
        </ul>
      </nav>
    </div>
  </aside>
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
        {id: 0, name: "首页", class: "#icon-index", link: "/"},
        {id: 1, name: "发现", class: "#icon-discover", link: "/discover"},
        {id: 2, name: "热门", class: "#icon-hotVideo", link: "/hotVideo"},
        {id: 3, name: "关注", class: "#icon-follow", link: "/follow"},
        {id: 5, name: "我的", class: "#icon-erciyuan", link: "/user",},
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

<style scoped lang="scss">
.aside-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #121212; /* 深灰色，比纯黑稍亮 */
}

.logo-container {
  flex-shrink: 0;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  
  @media (min-width: 769px) {
    justify-content: flex-start;
    padding: 0 24px;
  }
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  width: 100%;
  justify-content: center;
  
  @media (min-width: 769px) {
    justify-content: flex-start;
  }
}

.logo-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.logo-text {
  display: none;
  font-weight: 700;
  font-size: 20px;
  color: #FE2C55;
  letter-spacing: -0.5px;
  
  @media (min-width: 769px) {
    display: block;
  }
}

.nav-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px 0;
}

.nav-menu {
  padding: 0 8px;
}

.menu-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.menu-item {
  margin-bottom: 4px;
}

.menu-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: 12px;
  color: var(--text-muted);
  text-decoration: none;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: var(--text-main);
    
    .icon-svg {
      transform: scale(1.1);
    }
  }
}

.menu-link-active {
  color: #FE2C55 !important;
  font-weight: 700;
  background-color: rgba(254, 44, 85, 0.1);
  
  .icon-svg {
    color: #FE2C55;
  }
}

.menu-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-svg {
  width: 24px;
  height: 24px;
  fill: currentColor;
  transition: transform 0.2s ease;
}

.menu-text {
  display: none;
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
  
  @media (min-width: 769px) {
    display: block;
  }
}

.menu-tooltip {
  display: none;
  position: absolute;
  left: 100%;
  margin-left: 8px;
  padding: 6px 12px;
  background-color: #1a1a1a;
  color: #fff;
  font-size: 12px;
  border-radius: 6px;
  white-space: nowrap;
  z-index: 100;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  @media (max-width: 768px) {
    .menu-link:hover & {
      display: block;
      opacity: 1;
    }
  }
}
</style>
