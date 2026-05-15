<template>
  <div class="main-container">
    <el-scrollbar>
      <div class="user-container">
        <div v-viewer class="avatar-area dn-phone">
          <el-avatar v-if="userAvatar" class="user-avatar" :size="80" :src="userAvatar"/>
          <el-avatar v-else class="user-avatar" :size="80" :icon="UserFilled"/>
        </div>
        <div class="user-info">
          <div class="username"><h1>{{ userName }}</h1></div>
          <div class="follow-fans-like">
            <div class="user-info-follow flex-center">
              <div class="mr-5r cg fs8">关注</div>
              <div class="follow-right fw600">{{ followNum }}</div>
            </div>
            <div class="user-info-fans flex-center">
              <div class="mr-5r cg fs8">粉丝</div>
              <div class="follow-right fw600">{{ fansNum }}</div>
            </div>
            <div class="user-info-like flex-center">
              <div class="mr-5r cg fs8">获赞</div>
              <div class="fw600">{{ likeAllNum }}</div>
            </div>
          </div>
          <div class="user-profile">
            <span class="userid">芝士ID：{{ user.user_id || user.userId || userId }}</span>
            <span v-if="user.bio" style="margin-left:12px;color:#909399;">{{ user.bio }}</span>
            <span v-if="user.location" style="margin-left:12px;">📍{{ user.location }}</span>
          </div>
        </div>
      </div>
      <!--  作品，喜欢  -->
      <div>
        <div class="user-works">
          <el-tabs v-model="activeName">
            <el-tab-pane v-for="item in userVideoTabShow"
                         :key="item.id"
                         :label="item.tabName"
                         :lazy="true"
                         :name="item.id">
            </el-tab-pane>
          </el-tabs>
          <PersonVideoPost v-if="activeName===1"/>
          <PersonVideoLike v-if="activeName===2"/>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script>
import {getPersonInfo} from "@/api/member.js";
import {Close, QuestionFilled, UserFilled} from "@element-plus/icons-vue";
import PersonVideoPost from "@/components/person/post/PersonVideoPost.vue";
import PersonVideoLike from "@/components/person/like/PersonVideoLike.vue";

export default {
  name: 'Person',
  components: {PersonVideoLike, PersonVideoPost, QuestionFilled},
  computed: {
    Close() { return Close },
    UserFilled() { return UserFilled },
    userName() {
      return this.user.user_name || this.user.userName || this.user.nickName || this.user.nick_name || '未知用户'
    },
    userAvatar() {
      return this.user.avatar_url || this.user.avatarUrl || this.user.avatar || ''
    },
  },
  data() {
    return {
      userId: this.$route.params.userId,
      user: {},
      followNum: 0,
      fansNum: 0,
      likeAllNum: 0,
      activeName: 1,
      userVideoTabShow: [
        {id: 1, tabName: "作品", tabUrl: "/person/" + this.$route.params.userId + "/videoPost"},
        {id: 2, tabName: "喜欢", tabUrl: "/person/" + this.$route.params.userId + "/videoLike"},
      ]
    }
  },
  created() {
    this.getPersonProfile()
  },
  methods: {
    getPersonProfile() {
      getPersonInfo(this.userId).then(res => {
        if (res.code === 0 || res.code === 200 || res.code === 10000) {
          const userData = res.data?.User || res.data?.user || res.data
          this.user = userData || {}
          this.likeAllNum = userData?.like_count || userData?.likeCount || 0
          this.followNum = userData?.following_count || userData?.followingCount || 0
          this.fansNum = userData?.follower_count || userData?.followerCount || 0
        }
      }).catch(err => console.error('Person info fetch failed:', err))
    },
  }
}
</script>

<style scoped>
@import "@/assets/styles/user.scss";

@media (max-width: 500px) {
  .user-container .user-info {
    margin-left: 0 !important;
  }
}
</style>
