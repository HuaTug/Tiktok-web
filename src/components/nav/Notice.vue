<template>
  <div class="notice-container">
    <!-- 头部 -->
    <div class="notice-header">
      <h4 class="notice-title">互动消息</h4>
      <div class="notice-filter">
        <el-select v-model="noticeQueryParams.noticeType"
                   :teleported="false"
                   @change="handleNoticePage"
                   placeholder="全部消息"
                   size="small">
          <el-option
              v-for="item in noticeTypeOption"
              :key="item.value"
              :label="item.label"
              :value="item.value"/>
        </el-select>
      </div>
    </div>

    <!-- 通知列表 -->
    <div class="notice-list"
         v-infinite-scroll="loadMore"
         :infinite-scroll-disabled="loadingNotice"
         :infinite-scroll-distance="10">
      <div class="notice-list-inner" v-loading="loading">
        <transition-group name="notice-fade" tag="div">
          <div class="notice-card"
               v-for="item in noticeList"
               :key="item.noticeId"
               @click="handleNoticeClick(item.noticeId)">
            <!-- 通知类型图标角标 -->
            <div class="notice-avatar-wrap">
              <el-avatar v-if="item.operateAvatar"
                         :size="44"
                         :src="item.operateAvatar"
                         class="notice-avatar"/>
              <el-avatar v-else
                         :size="44"
                         :icon="UserFilled"
                         class="notice-avatar notice-avatar-default"/>
              <span class="notice-type-badge" :class="'badge-' + item.noticeType">
                <el-icon :size="10" v-if="item.noticeType === '0'"><Star/></el-icon>
                <el-icon :size="10" v-else-if="item.noticeType === '3' || item.noticeType === '4'"><ChatDotRound/></el-icon>
                <el-icon :size="10" v-else-if="item.noticeType === '1'"><Plus/></el-icon>
                <el-icon :size="10" v-else><Bell/></el-icon>
              </span>
            </div>

            <!-- 通知内容 -->
            <div class="notice-body">
              <div class="notice-body-top">
                <span class="notice-nickname">{{ item.nickName }}</span>
                <span class="notice-time">{{ smartDateFormat(item.createTime) }}</span>
              </div>
              <p class="notice-content">{{ item.content }}</p>
            </div>

            <!-- 右侧视频封面 / 回关按钮 -->
            <div class="notice-right">
              <img v-if="item.videoCoverImage"
                   class="notice-cover"
                   :src="item.videoCoverImage"
                   alt="video cover"/>
              <el-button v-else-if="item.noticeType === '1'"
                         type="primary"
                         size="small"
                         round
                         class="notice-follow-btn">
                回关
              </el-button>
              <div v-else class="notice-cover-placeholder">
                <el-icon :size="20" color="#bbb"><VideoPlay/></el-icon>
              </div>
            </div>

            <!-- 删除操作 -->
            <div class="notice-actions" @click.stop>
              <el-popconfirm
                  confirm-button-text="删除"
                  cancel-button-text="取消"
                  :icon="InfoFilled"
                  :teleported="false"
                  icon-color="#ff4757"
                  title="删除这条消息？"
                  @confirm="handleDelNoticeConfirm(item.noticeId)"
                  @cancel.stop="handleDelNoticeCancel">
                <template #reference>
                  <el-icon class="notice-more-icon"><MoreFilled/></el-icon>
                </template>
              </el-popconfirm>
            </div>
          </div>
        </transition-group>

        <!-- 空状态 -->
        <div v-if="dataNotMore && noticeList.length === 0" class="notice-empty">
          <el-icon :size="48" color="#ccc"><Bell/></el-icon>
          <p>暂无互动消息</p>
        </div>
        <div v-else-if="dataNotMore" class="notice-end">
          <span>— 没有更多了 —</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { delNotice, noticePage } from "@/api/notice.js";
import { userInfoX } from "@/store/userInfoX";
import { InfoFilled, MoreFilled, UserFilled, Star, ChatDotRound, Plus, Bell, VideoPlay } from "@element-plus/icons-vue";

let socket;
export default {
  name: "Notice",
  components: { MoreFilled, Star, ChatDotRound, Plus, Bell, VideoPlay },
  computed: {
    InfoFilled() { return InfoFilled },
    UserFilled() { return UserFilled }
  },
  data() {
    return {
      loading: false,
      loadingData: true,
      loadingIcon: true,
      dataNotMore: false,
      noticeList: [],
      noticeTotal: 0,
      noticeQueryParams: {
        noticeType: "",
        pageNum: 1,
        pageSize: 10
      },
      noticeTypeOption: [
        { id: 1, label: "全部消息", value: "" },
        { id: 2, label: "点赞", value: "0" },
        { id: 3, label: "关注", value: "1" },
        { id: 4, label: "收藏", value: "2" },
        { id: 5, label: "视频被评论", value: "3" },
        { id: 6, label: "回复评论", value: "4" },
        { id: 7, label: "赞了评论", value: "5" },
      ],
      loadingNotice: false,
      loginUser: userInfoX().userInfo,
    }
  },
  created() {
    this.getNoticeList()
    this.initWebSocket()
  },
  emits: ['noticeRefreshEmit'],
  methods: {
    initWebSocket() {
      if (!this.loginUser || !this.loginUser.userId) {
        console.log("User not logged in, skipping WebSocket connection");
        return;
      }
      console.log(this.loginUser.userId);
      let _this = this;
      if (typeof (WebSocket) == "undefined") {
        console.log("您的浏览器不支持WebSocket");
      } else {
        console.log("您的浏览器支持WebSocket");
        let socketUrl = import.meta.env.VITE_API_WS_URL + "/notice/websocket/" + this.loginUser.userId;
        if (socket != null) {
          socket.close();
          socket = null;
        }
        socket = new WebSocket(socketUrl);
        socket.onopen = function () { console.log("websocket已打开"); };
        socket.onmessage = function (msg) { console.log("收到数据====" + msg.data); };
        socket.onclose = function () { console.log("websocket已关闭"); };
        socket.onerror = function () { console.log("websocket发生了错误"); }
      }
    },
    mapNotification(item) {
      const typeMap = {
        'video_like': '0',
        'comment_like': '5',
        'follow': '1',
        'comment': '3',
        'comment_reply': '4',
        'system': '',
      }
      return {
        noticeId: item.id,
        operateAvatar: item.extra?.avatar_url || '',
        nickName: item.from_user || item.extra?.from_user_name || '用户',
        content: item.content || item.title || '',
        remark: '',
        createTime: item.created_at,
        videoCoverImage: item.extra?.video_cover || '',
        noticeType: typeMap[item.type] || '',
      }
    },
    getNoticeList() {
      this.loading = true
      this.dataNotMore = false
      noticePage(this.noticeQueryParams).then(res => {
        if (res.code === 200 || res.code === 0) {
          const list = res.data?.list || res.rows || []
          this.noticeList = list.map(item => this.mapNotification(item))
          this.noticeTotal = res.data?.total || res.total || 0
          this.loading = false
          if (this.noticeList.length === 0 || this.noticeList.length >= this.noticeTotal) {
            this.dataNotMore = true
          }
        }
      })
    },
    handleNoticePage() {
      this.loading = true
      this.dataNotMore = false
      this.noticeQueryParams.pageNum = 1
      noticePage(this.noticeQueryParams).then(res => {
        if (res.code === 200 || res.code === 0) {
          const list = res.data?.list || res.rows || []
          this.noticeList = list.map(item => this.mapNotification(item))
          this.noticeTotal = res.data?.total || res.total || 0
          this.loading = false
          this.dataNotMore = this.noticeList.length === 0 || this.noticeList.length >= this.noticeTotal
        }
      })
    },
    handleNoticeClick(noticeId) {
      this.noticeList = this.noticeList.filter(n => n.noticeId !== noticeId)
      this.noticeTotal = Math.max(0, this.noticeTotal - 1)
      if (this.noticeList.length === 0) {
        this.dataNotMore = true
      }
      delNotice(noticeId).catch(() => {})
      this.$emit('noticeRefreshEmit')
    },
    handleDelNoticeConfirm(noticeId) {
      this.noticeList = this.noticeList.filter(n => n.noticeId !== noticeId)
      this.noticeTotal = Math.max(0, this.noticeTotal - 1)
      if (this.noticeList.length === 0) {
        this.dataNotMore = true
      }
      delNotice(noticeId).catch(() => {})
      this.$emit('noticeRefreshEmit')
    },
    handleDelNoticeCancel() {},
    loadMore() {
      if (this.dataNotMore) {
        this.loading = false
        this.noticeQueryParams.pageNum = 1
        return
      }
      this.loading = true
      this.loadingNotice = true
      this.noticeQueryParams.pageNum += 1
      noticePage(this.noticeQueryParams).then(res => {
        if (res.code === 200 || res.code === 0) {
          const list = res.data?.list || res.rows || []
          if (list == null || list.length < this.noticeQueryParams.pageSize) {
            this.dataNotMore = true
            this.loading = false
            return;
          }
          this.noticeList = this.noticeList.concat(list.map(item => this.mapNotification(item)))
          this.loading = false
          this.loadingNotice = false
        }
      })
    },
    smartDateFormat(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      const now = new Date()
      const diff = Math.floor((now - date) / 1000)
      if (diff < 60) return '刚刚'
      if (diff < 3600) return Math.floor(diff / 60) + '分钟前'
      if (diff < 86400) return Math.floor(diff / 3600) + '小时前'
      if (diff < 604800) return Math.floor(diff / 86400) + '天前'
      return date.toLocaleDateString()
    }
  }
}
</script>

<style scoped>
.notice-container {
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color, #fff);
  border-radius: 16px;
  overflow: hidden;
}

/* ===== Header ===== */
.notice-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background: linear-gradient(135deg, rgba(254, 44, 85, 0.03), rgba(37, 244, 238, 0.03));
}

.notice-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--el-text-color-primary, #1a1a1a);
  letter-spacing: 0.5px;
}

.notice-filter {
  width: 120px;
}

.notice-filter :deep(.el-input__wrapper) {
  box-shadow: none !important;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 20px;
  padding: 0 12px;
}

.notice-filter :deep(.el-input.is-focus .el-input__wrapper) {
  box-shadow: none !important;
  background: rgba(0, 0, 0, 0.06);
}

.notice-filter :deep(.el-input__inner) {
  font-size: 13px;
  text-align: center;
}

/* ===== List ===== */
.notice-list {
  flex: 1;
  height: 58vh;
  overflow-y: auto;
  padding: 8px 12px 12px;
}

.notice-list::-webkit-scrollbar {
  width: 4px;
}

.notice-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.notice-list::-webkit-scrollbar-track {
  background: transparent;
}

/* ===== Card ===== */
.notice-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  margin-bottom: 6px;
  border-radius: 14px;
  background: var(--el-bg-color-page, #f8f8f8);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
}

.notice-card:hover {
  background: var(--el-fill-color-light, #f0f0f0);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.notice-card:hover .notice-actions {
  opacity: 1;
  pointer-events: auto;
}

/* ===== Avatar ===== */
.notice-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.notice-avatar {
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.notice-avatar-default {
  background: linear-gradient(135deg, #e0e0e0, #c8c8c8);
}

.notice-type-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}

.badge-0 { background: linear-gradient(135deg, #fe2c55, #ff6b81); }
.badge-1 { background: linear-gradient(135deg, #25f4ee, #00c9b7); }
.badge-3, .badge-4 { background: linear-gradient(135deg, #5b6ef5, #8b7eff); }
.badge-5 { background: linear-gradient(135deg, #ff9f43, #ffc048); }
.notice-type-badge:not(.badge-0):not(.badge-1):not(.badge-3):not(.badge-4):not(.badge-5) {
  background: linear-gradient(135deg, #a0a0a0, #bbb);
}

/* ===== Body ===== */
.notice-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notice-body-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.notice-nickname {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary, #1a1a1a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

.notice-time {
  font-size: 12px;
  color: var(--el-text-color-placeholder, #a0a0a0);
  white-space: nowrap;
  flex-shrink: 0;
}

.notice-content {
  font-size: 13px;
  color: var(--el-text-color-regular, #606060);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
}

/* ===== Right (cover / follow button) ===== */
.notice-right {
  flex-shrink: 0;
  margin-left: 4px;
}

.notice-cover {
  width: 52px;
  height: 68px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.notice-cover:hover {
  transform: scale(1.05);
}

.notice-cover-placeholder {
  width: 52px;
  height: 68px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
}

.notice-follow-btn {
  background: linear-gradient(135deg, #fe2c55, #ff6b81);
  border: none;
  color: #fff;
  font-size: 12px;
  padding: 6px 16px;
  font-weight: 600;
}

.notice-follow-btn:hover {
  background: linear-gradient(135deg, #e02549, #ff5570);
  transform: scale(1.02);
}

/* ===== Actions ===== */
.notice-actions {
  position: absolute;
  top: 8px;
  right: 10px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.notice-more-icon {
  font-size: 16px;
  color: #bbb;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.notice-more-icon:hover {
  color: #fe2c55;
  background: rgba(254, 44, 85, 0.08);
}

/* ===== Empty & End ===== */
.notice-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  gap: 12px;
}

.notice-empty p {
  font-size: 14px;
  color: var(--el-text-color-placeholder, #bbb);
  margin: 0;
}

.notice-end {
  text-align: center;
  padding: 16px 0;
}

.notice-end span {
  font-size: 12px;
  color: var(--el-text-color-placeholder, #ccc);
}

/* ===== Transition ===== */
.notice-fade-enter-active {
  transition: all 0.3s ease;
}

.notice-fade-leave-active {
  transition: all 0.2s ease;
}

.notice-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.notice-fade-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
