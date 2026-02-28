<template>
  <div class="nav-right">
    <div class="flex-center">
      <!--通知-->
      <el-popover :width="320" ref="noticePopover" :offset="9">
        <template #reference>
          <div class="link-type cp" @mousemove="handleNoticeShow" @mouseleave="handleNoticeHide">
            <div class="link-div icon-click cg plr10px">
              <el-badge :value="noticeCount" class="item">
                <div style="height: 20px; justify-content: center; width: 20px;">
                  <svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-notice"></use>
                  </svg>
                </div>
              </el-badge>
              <p>
                <span class="cg fs7">通知</span>
              </p>
            </div>
          </div>
        </template>
        <template #default>
          <Notice v-if="showNotice" @noticeRefreshEmit="emitNoticeRefresh"/>
        </template>
      </el-popover>
      <!--消息 -->
<!--      <router-link class="link-type cp dn-phone" :to="'/message'">-->
<!--        <div class="link-div icon-click cg plr10px">-->
<!--          <div style="height: 20px;width: 20px;">-->
<!--            <svg class="icon" aria-hidden="true">-->
<!--              <use xlink:href="#icon-message"></use>-->
<!--            </svg>-->
<!--          </div>-->
<!--          <p>-->
<!--            <span class="cg fs7">消息</span>-->
<!--          </p>-->
<!--        </div>-->
<!--      </router-link>-->
      <!--发布视频 - 使用新的上传页面-->
      <router-link class="link-type cp" to="/upload">
        <div class="link-div icon-click cg plr10px">
          <div style="height: 20px;width: 20px;">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-upload"></use>
            </svg>
          </div>
          <p>
            <span class="cg fs7">上传视频</span>
          </p>
        </div>
      </router-link>
    </div>
    <el-popover class="user-popover"
                :width="400"
                :inert="60"
                :offset="10"
                @show="handlePopoverShow"
                popper-style="padding: 20px;">
      <template #reference>
        <router-link class="user-container" :to="'/user'">
          <el-avatar v-if="user.avatar_url || user.avatar" class="hv-scale" :src="user.avatar_url || user.avatar" @load="console.log('✅ [NAV-AVATAR] 导航头像加载成功:', user.avatar_url || user.avatar)" @error="console.log('❌ [NAV-AVATAR] 导航头像加载失败:', user.avatar_url || user.avatar)"/>
          <el-avatar v-else :icon="UserFilled" @click="console.log('🔍 [NAV-AVATAR] 用户信息:', user)"/>
        </router-link>
      </template>
      <template #default>
        <div class="userinfo-area">
          <div class="userinfo-header flex-between">
            <p class="one-line fw600 cp">
              <router-link class="cg flex-center" to="/user/videoPost">
                <span>{{ user.user_name || user.nickName || '用户' }}</span>
                <el-icon>
                  <ArrowRightBold/>
                </el-icon>
              </router-link>
            </p>
            <div class="trust-login flex-center">
              <div class="trust-login-title mr-5r cg fs7">保存登录信息</div>
              <div class="ml-5r">
                <el-switch v-model="saveLogin"
                           active-color="#13ce66"
                           inactive-color="#ff4949">
                </el-switch>
              </div>
            </div>
          </div>
          <div class="userinfo-center">
            <div class="flex-between">
              <!-- 我的作品 -->
              <router-link class="link-type flex-center" :to="item.url" v-for="item in userPostInfo">
                <div class="flex-center icon-click cg cp"
                     style="flex-direction: column;padding: 0 10px;">
                  <div class="tac wh32 hv-scale">
                    <svg class="icon" aria-hidden="true">
                      <use :xlink:href="item.icon"></use>
                    </svg>
                  </div>
                  <div>
                    <h4>{{ item.num }}</h4>
                  </div>
                  <p>
                    <span class="cg fs7">{{ item.title }}</span>
                  </p>
                </div>
              </router-link>
            </div>
          </div>
          <el-divider/>
          <div class="userinfo-footer flex-between">
            <div class="flex-center">
              <span>客服</span>
            </div>
            <div class="flex-center">
              <div class="link-type flex-center mr-5r cp switch-theme" @click="handleThemeSwitch">
                <el-icon>
                  <Sunrise/>
                </el-icon>
                <span class="ml-5r">换肤</span></div>
              <router-link class="link-type flex-center" @click="handleLogout" :to="'/login'">
                <el-icon>
                  <SwitchButton/>
                </el-icon>
                <span class="ml-5r">退出登录</span>
              </router-link>
            </div>
          </div>
        </div>
      </template>
    </el-popover>
  </div>
</template>

<script>
import {myVideoCount} from "@/api/video.js";
import {myLikeCount, myFavoriteCount} from "@/api/behave.js";
import {ArrowRightBold, Sunrise, SwitchButton, UserFilled} from "@element-plus/icons-vue";
import {themeX} from "@/store/themeX";
import Notice from "@/components/nav/Notice.vue";
import {noticeCount} from "@/api/notice.js";
import {tokenX} from "@/store/tokenX";
import {userInfoX} from "@/store/userInfoX";
import {getToken, hasToken, removeToken} from "@/utils/auth.js";

export default {
  name: "NavRight",
  components: {SwitchButton, Sunrise, ArrowRightBold, Notice},
  computed: {
    UserFilled() {
      return UserFilled
    }
  },
  props: {
    user: {
      type: Object,
      default: () => ({})
    },
  },
  data() {
    return {
      // 右侧导航栏
      rightNavList: [
        {id: 1, icon: "iconfont icon-notice", num: 0, title: "通知", url: "/notice"},
        {id: 2, icon: "iconfont icon-message", num: 0, title: "消息", url: "/message"},
        {id: 3, icon: "iconfont icon-upload", num: 0, title: "投稿", url: "/publish"},
      ],
      saveLogin: true, // 保存登录信息
      userPostInfo: [
        {id: 1, icon: "#icon-videoPost", num: 0, title: "我的作品", url: "/user/videoPost"},
        {id: 2, icon: "#icon-like-ed", num: 0, title: "我的喜欢", url: "/user/videoLike"},
        {id: 3, icon: "#icon-favorite-ed", num: 0, title: "我的收藏", url: "/user/videoFavorite"},
        {id: 4, icon: "#icon-history", num: 0, title: "观看历史", url: "/user/videoViewHistory"},
      ],
      showNotice: false,
      noticeCount: undefined,
      noticeCountQueryParams: {
        receiveFlag: "0"
      },
    }
  },
  created() {
    this.initTheme()
  },
  emits: ['darkChangeEmit'],
  mounted() {
    this.initNotice()
    // this.$nextTick(()=> {
    //   this.$refs.noticePopover.updatePopper()
    // })
  },
  methods: {
    initTheme() {
      const html = document.querySelector('html')
      const dark = themeX().dark
      if (dark) {
        html.classList.remove("light")
        html.classList.add("dark")
      } else {
        html.classList.remove("dark")
        html.classList.add("light")
      }
    },
    // 获取评论数量
    initNotice() {
      if (getToken() !== undefined) {
        noticeCount().then(res => {
          if (res.code === 0 || res.code === 200) {
            // 后端返回 { data: { unread_count: N } }
            const count = res.data?.unread_count ?? res.data ?? 0
            this.noticeCount = count > 0 ? count : undefined
          }
        }).catch(err => {
          console.log('Notice count fetch failed:', err)
        })
      }
    },
    // 用户popover的show时间
    handlePopoverShow() {
      // 封装用户作品量、喜欢量、收藏量
      myVideoCount().then(res => {
        // Refactored-TikTok backend uses code 200 after conversion
        if (res.code === 200) {
          // 后端返回 data.total 或 data.video_list.length
          const count = res.data?.total || res.data?.video_list?.length || 0
          this.userPostInfo.forEach((item) => {
            if (item.id === 1) item.num = count
          })
        }
      }).catch(err => console.log('Video count fetch failed'))
      myLikeCount().then(res => {
        // Refactored-TikTok backend uses code 200 after conversion
        if (res.code === 200) {
          // 后端返回 data.total 或 data.like_list.length
          const count = res.data?.total || res.data?.like_list?.length || (Array.isArray(res.data) ? res.data.length : 0)
          this.userPostInfo.forEach((item) => {
            if (item.id === 2) item.num = count
          })
        }
      }).catch(err => console.log('Like count fetch failed'))
      myFavoriteCount().then(res => {
        // Refactored-TikTok backend uses code 200 after conversion
        if (res.code === 200) {
          // 后端返回 data.total_count 或 data.favorite_list.length
          const count = res.data?.total_count || res.data?.favorite_list?.length || 0
          this.userPostInfo.forEach((item) => {
            if (item.id === 3) item.num = count
          })
        }
      }).catch(err => console.log('Favorite count fetch failed'))
    },
    // 退出登录
    handleLogout() {
      tokenX().removeToken()
      userInfoX().removeUserInfo()
      removeToken()
      this.$router.push('/login');
    },
    // 主题切换，换肤功能
    handleThemeSwitch() {
      const html = document.querySelector('html')
      const dark = themeX().dark
      if (html) {
        this.$emit("darkChangeEmit", !dark)
        if (dark) {
          themeX().setDark(false)
          html.classList.remove("dark")
          html.classList.add("light")
        } else {
          themeX().setDark(true)
          html.classList.remove("light")
          html.classList.add("dark")
        }
      }
    },
    // 显示通知
    handleNoticeShow() {
      this.showNotice = true
    },
    // 通知弹框隐藏
    handleNoticeHide() {
      this.showNotice = true
    },
    // 接收子事件
    emitNoticeRefresh() {
      this.initNotice()
    },
    openTargetLink(link) {
      window.open(link, "_blank")
    }
  }
}
</script>

<style scoped>
.nav-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.link-div {
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 10px;
  transition: all var(--transition-fast);
  color: var(--text-muted);
}

.link-div:hover {
  background-color: var(--hover-bg);
  color: var(--text-main);
}

.link-div .icon {
  fill: var(--text-muted);
  transition: fill var(--transition-fast);
}

.link-div:hover .icon {
  fill: var(--niuyin-primary-color);
}

.link-div p span {
  font-size: 11px;
  color: var(--text-muted);
  transition: color var(--transition-fast);
}

.link-div:hover p span {
  color: var(--text-main);
}

.link-type {
  text-decoration: none;
}

.user-container {
  display: flex;
  align-items: center;
  margin-left: 8px;
  text-decoration: none;
}

.user-container :deep(.el-avatar) {
  width: 32px;
  height: 32px;
  border: 2px solid var(--border-color);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.user-container:hover :deep(.el-avatar) {
  border-color: var(--niuyin-primary-color);
  transform: scale(1.05);
}

.userinfo-area .userinfo-header {
  margin-bottom: 12px;
}

.userinfo-area .userinfo-center {
  margin: 12px 0;
}

.userinfo-area .userinfo-footer {
  padding-top: 8px;
  font-size: 13px;
}

.switch-theme {
  padding: 4px 8px;
  border-radius: 6px;
  transition: background-color var(--transition-fast);
}

.switch-theme:hover {
  background-color: var(--hover-bg);
}
</style>
