<template>
  <div class="follow-container">
    <div class="follow-page">
      <div class="follow-header">
        <h2 class="follow-title">我的关注（{{ followTotal || 0 }}）</h2>
      </div>
      <el-scrollbar class="follow-list-scroll" v-loading="followListLoading">
        <div class="follow-user-list">
          <div
              class="user-card"
              v-for="item in followList"
              :key="item.userId"
              @click="goToUserPage(item.userId)">
            <div class="user-avatar-wrapper">
              <el-avatar 
                  class="user-avatar"
                  :size="56"
                  v-if="item.avatar"
                  :src="item.avatar"
                  lazy/>
              <el-avatar v-else :size="56" :icon="UserFilled"/>
            </div>
            <div class="user-info-detail">
              <p class="nickname one-line">{{ item.nickName || '未知用户' }}</p>
              <p class="user-id">ID: {{ item.userId }}</p>
            </div>
            <el-button type="primary" size="small" plain @click.stop="goToUserPage(item.userId)">
              查看主页
            </el-button>
          </div>
        </div>
        <div v-if="followListDataNotMore && followList.length > 0" class="list-end">
          <el-divider>到底了</el-divider>
        </div>
        <el-empty v-if="!followListLoading && followList.length === 0" description="暂无关注用户"/>
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
import {UserFilled} from "@element-plus/icons-vue";
import {followPageList} from '@/api/social'

export default {
  name: "Follow",
  computed: {
    UserFilled() {
      return UserFilled
    }
  },
  data() {
    return {
      followQueryParams: {
        pageNum: 1,
        pageSize: 20,
      },
      followTotal: 0,
      followList: [],
      followListDataNotMore: false,
      loadingFollowListData: true,
      followListLoading: true,
    };
  },
  created() {
    this.getFollowList()
  },
  mounted() {
    window.addEventListener('scroll', this.listenFollowListScroll, true)
  },
  methods: {
    // 获取关注用户列表
    getFollowList() {
      if (this.followListDataNotMore) {
        return
      }
      this.followListLoading = true
      followPageList(this.followQueryParams).then(res => {
        console.log('📦 [FOLLOW] 关注列表响应:', res)
        if (res.code === 0 || res.code === 200) {
          const rawItems = res.data?.items || res.data?.Items || res.rows || res.data?.list || []
          const rows = rawItems.map(item => ({
            userId: item.uid || item.userId || item.user_id,
            nickName: item.user_name || item.userName || item.nickName,
            avatar: item.avatar_url || item.avatarUrl || item.avatar,
            bio: item.bio || ''
          }))
          console.log('✅ [FOLLOW] 转换后的关注列表:', rows)
          this.followList = this.followList.concat(rows)
          this.followTotal = res.data?.total || res.total || 0
          if (rawItems === null || rawItems.length == 0) {
            this.followListDataNotMore = true
          } else {
            this.followListDataNotMore = false
          }
        } else {
          if (res.code === 10001 && res.msg?.includes('Relation')) {
            this.$message.error('关注服务暂时不可用，请稍后重试')
          } else if (res.msg) {
            this.$message.error(res.msg)
          }
        }
        this.followListLoading = false
      }).catch(err => {
        console.error('❌ [FOLLOW] 获取关注列表失败:', err)
        this.$message.error('获取关注列表失败，请稍后重试')
        this.followListLoading = false
      })
    },
    // 跳转到用户主页
    goToUserPage(userId) {
      this.$router.push({ path: `/user/${userId}` })
    },
    listenFollowListScroll(e) {
      if (e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight - 10) {
        if (this.loadingFollowListData) {
          this.followQueryParams.pageNum++;
          this.getFollowList()
          this.loadingFollowListData = false
          setTimeout(() => {
            this.loadingFollowListData = true
          }, 1000);
        }
      }
    },
  },
  destroyed() {
    window.removeEventListener('scroll', this.listenFollowListScroll)
  }
};
</script>

<style scoped>
.follow-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  padding: 24px;
}

.follow-page {
  width: 100%;
  max-width: 640px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.follow-header {
  padding: 8px 16px 16px;
  border-bottom: 1px solid var(--border-color);
}

.follow-title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-main);
}

.follow-list-scroll {
  flex: 1;
}

.follow-user-list {
  display: flex;
  flex-direction: column;
}

.user-card {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  transition: background-color var(--transition-fast);
  gap: 14px;
  border-bottom: 1px solid var(--border-color-light);
  border-radius: 10px;
  margin: 2px 0;
}

.user-card:hover {
  background-color: var(--hover-bg);
}

.user-avatar-wrapper {
  flex-shrink: 0;
}

.user-avatar {
  border: 2px solid var(--border-color);
  transition: border-color var(--transition-fast);
}

.user-card:hover .user-avatar {
  border-color: var(--niuyin-primary-color);
}

.user-info-detail {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.user-info-detail .nickname {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-main);
  margin: 0 0 3px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-info-detail .user-id {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
}

.list-end {
  padding: 1rem;
}
</style>
