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
                <!-- AI 助手使用自定义 SVG 图标 -->
                <svg v-if="item.id === 4" class="icon-svg ai-icon" viewBox="0 0 1024 1024" aria-hidden="true">
                  <path d="M512 64C264.6 64 64 238.7 64 456c0 95.5 39.3 182.8 104.1 251.3L96 864l193.5-84.9C355.3 810.1 431.3 828 512 828c247.4 0 448-154.7 448-372S759.4 64 512 64z m0 680c-68.8 0-133.8-15.1-192-42.4l-13.6-6.4-141.6 62.2 55.2-118.4-10.4-11.2C152 572.2 128 516.8 128 456c0-181.1 172-308 384-308s384 126.9 384 308-172 288-384 288z" fill="currentColor"/>
                  <circle cx="320" cy="400" r="40" fill="currentColor"/>
                  <circle cx="512" cy="400" r="40" fill="currentColor"/>
                  <circle cx="704" cy="400" r="40" fill="currentColor"/>
                  <path d="M680 160l24-72 24 72 72 24-72 24-24 72-24-72-72-24z" fill="currentColor"/>
                  <path d="M820 280l16-48 16 48 48 16-48 16-16 48-16-48-48-16z" fill="currentColor"/>
                </svg>
                <svg v-else class="icon-svg" aria-hidden="true">
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
        {id: 4, name: "AI 助手", class: "#icon-ai", link: "/ai"},
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
  background-color: var(--sidebar-bg);
  transition: background-color var(--transition-normal);
}

.logo-container {
  flex-shrink: 0;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  
  @media (min-width: 769px) {
    justify-content: flex-start;
    padding: 0 20px;
  }
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  width: 100%;
  justify-content: center;
  
  @media (min-width: 769px) {
    justify-content: flex-start;
  }
}

.logo-img {
  width: 30px;
  height: 30px;
  object-fit: contain;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: rotate(-8deg) scale(1.05);
  }
}

.logo-text {
  display: none;
  font-weight: 800;
  font-size: 18px;
  background: linear-gradient(135deg, #FE2C55, #ff6b81);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.3px;
  
  @media (min-width: 769px) {
    display: block;
  }
}

.nav-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px 0;
  
  &::-webkit-scrollbar {
    width: 0;
  }
}

.nav-menu {
  padding: 0 10px;
}

.menu-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.menu-item {
  margin-bottom: 2px;
}

.menu-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  border-radius: 10px;
  color: var(--text-muted);
  text-decoration: none;
  transition: all var(--transition-fast);
  
  &:hover {
    background-color: var(--hover-bg);
    color: var(--text-main);
    
    .icon-svg {
      transform: scale(1.08);
    }
  }
}

.menu-link-active {
  color: var(--niuyin-primary-color) !important;
  font-weight: 600;
  background-color: var(--active-bg);
  
  .icon-svg {
    color: var(--niuyin-primary-color);
  }
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 20px;
    background: var(--niuyin-primary-color);
    border-radius: 0 3px 3px 0;
  }
}

.menu-icon {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-svg {
  width: 22px;
  height: 22px;
  fill: currentColor;
  transition: transform var(--transition-fast);
}

.icon-svg.ai-icon {
  color: #10a37f;
}

.menu-link-active .icon-svg.ai-icon {
  color: #10a37f;
  filter: drop-shadow(0 0 4px rgba(16, 163, 127, 0.4));
}

.menu-text {
  display: none;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  letter-spacing: 0.2px;
  
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
  background-color: var(--bg-elevated);
  color: var(--text-main);
  font-size: 12px;
  border-radius: 8px;
  white-space: nowrap;
  z-index: 100;
  pointer-events: none;
  opacity: 0;
  box-shadow: var(--shadow-md);
  transition: opacity var(--transition-fast);
  
  @media (max-width: 768px) {
    .menu-link:hover & {
      display: block;
      opacity: 1;
    }
  }
}
</style>
