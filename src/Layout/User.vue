<template>
  <div class="min-h-screen bg-bg-base pb-20 transition-colors duration-300">
    <!-- Banner Header -->
    <div class="relative h-48 md:h-64 w-full bg-slate-200 dark:bg-slate-800 overflow-hidden group">
      <img v-if="memberInfo.backImage" :src="memberInfo.backImage" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
      <div v-else class="w-full h-full bg-gradient-to-r from-primary-400 to-primary-600 opacity-80"></div>
      
      <!-- Edit Banner Button (Visible on Hover) -->
      <button @click="handleEditInfo" class="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
        <el-icon :size="20"><Edit /></el-icon>
      </button>
    </div>

    <!-- Profile Info Section -->
    <div class="container mx-auto px-4 max-w-6xl">
      <div class="relative -mt-16 mb-8 flex flex-col md:flex-row items-start md:items-end gap-6">
        <!-- Avatar -->
        <div class="relative z-10 group">
          <div class="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-bg-base shadow-xl overflow-hidden bg-white dark:bg-slate-800">
             <el-avatar v-if="user.avatar_url || user.avatar" :size="160" :src="user.avatar_url || user.avatar" class="w-full h-full object-cover" />
             <el-avatar v-else :size="160" :icon="UserFilled" class="w-full h-full bg-slate-200 text-slate-400" />
          </div>
          <div class="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
        </div>

        <!-- User Details -->
        <div class="flex-1 pt-2 md:pt-0 md:pb-4 w-full">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 class="text-3xl font-bold text-text-main flex items-center gap-2">
                {{ user.user_name || user.nickName || 'Cheese User' }}
                <span v-if="user.sex === 1 || user.sex === '1'" class="text-blue-500 text-lg">♂</span>
                <span v-else-if="user.sex === 0 || user.sex === '0'" class="text-pink-500 text-lg">♀</span>
              </h1>
              <div class="flex items-center gap-4 mt-2 text-sm text-text-muted">
                <span class="flex items-center gap-1">
                  <span class="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">ID: {{ user.user_id || user.userId }}</span>
                </span>
                <span class="flex items-center gap-1" v-if="memberInfo.province">
                  <el-icon><Location /></el-icon> {{ memberInfo.province }} · {{ memberInfo.city }}
                </span>
              </div>
              <p class="text-text-main mt-3 max-w-2xl text-sm leading-relaxed opacity-80">
                {{ memberInfo.description || 'This user hasn\'t written a bio yet.' }}
              </p>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 mt-4 md:mt-0">
              <el-button type="primary" class="!rounded-full !px-6 !font-bold shadow-lg shadow-primary-500/30" @click="handleEditProfile">
                Edit Profile
              </el-button>
              <el-button plain circle class="!rounded-full" @click="handleEditInfo">
                <el-icon><More /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="flex gap-8 md:gap-16 border-b border-border pb-8 mb-8">
        <div class="text-center cursor-pointer hover:opacity-80 transition-opacity">
          <div class="text-2xl font-bold text-text-main">{{ formatNumber(followNum) }}</div>
          <div class="text-xs text-text-muted font-medium uppercase tracking-wider mt-1">Following</div>
        </div>
        <div class="text-center cursor-pointer hover:opacity-80 transition-opacity">
          <div class="text-2xl font-bold text-text-main">{{ formatNumber(fansNum) }}</div>
          <div class="text-xs text-text-muted font-medium uppercase tracking-wider mt-1">Followers</div>
        </div>
        <div class="text-center cursor-pointer hover:opacity-80 transition-opacity">
          <div class="text-2xl font-bold text-text-main">{{ formatNumber(likeAllNum) }}</div>
          <div class="text-xs text-text-muted font-medium uppercase tracking-wider mt-1">Likes</div>
        </div>
      </div>

      <!-- Content Tabs -->
      <div class="min-h-[500px]">
        <el-tabs v-model="activeName" @tab-click="handleClick" class="custom-tabs">
          <el-tab-pane v-for="item in userVideoTabShow"
                       :key="item.id"
                       :lazy="true"
                       :name="item.tabUrl">
            <template #label>
              <div class="flex items-center gap-2 px-4 py-2 text-base font-medium">
                <span>{{ item.tabName }}</span>
                <el-icon v-if="item.lock"><Lock /></el-icon>
              </div>
            </template>
            <router-view v-slot="{ Component }">
               <transition name="fade" mode="out-in">
                 <component :is="Component" />
               </transition>
            </router-view>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- Dialogs (Keep existing logic but clean up styles if needed) -->
    <el-dialog v-model="editDialogVisible" width="400px" :show-close="false" class="rounded-2xl overflow-hidden">
      <template #header="{ close }">
        <div class="flex justify-between items-center p-4 border-b border-border">
          <h3 class="text-lg font-bold">Edit Profile</h3>
          <el-button circle text @click="close"><el-icon><Close /></el-icon></el-button>
        </div>
      </template>
      <div class="p-4">
         <!-- Reusing existing form logic -->
         <div class="flex flex-col items-center mb-6">
            <el-upload class="relative group cursor-pointer" :show-file-list="false" :before-upload="beforeAvatarUpload" :http-request="handleAvatarUpload">
              <el-avatar :size="80" :src="userForm.avatar || user.avatar_url" />
              <div class="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <el-icon class="text-white"><Camera /></el-icon>
              </div>
            </el-upload>
            <span class="text-xs text-text-muted mt-2">Change Photo</span>
         </div>
         
         <div class="space-y-4">
            <div>
               <label class="text-xs font-bold text-text-muted uppercase mb-1 block">Nickname</label>
               <el-input v-model="userForm.user_name" placeholder="Nickname" />
            </div>
            <div>
               <label class="text-xs font-bold text-text-muted uppercase mb-1 block">Gender</label>
               <el-radio-group v-model="userForm.sex" class="w-full">
                  <el-radio-button label="1" class="flex-1">Male</el-radio-button>
                  <el-radio-button label="0" class="flex-1">Female</el-radio-button>
                  <el-radio-button label="2" class="flex-1">Secret</el-radio-button>
               </el-radio-group>
            </div>
         </div>
         
         <div class="flex gap-3 mt-8">
            <el-button class="flex-1" @click="cancelUpdateProfile">Cancel</el-button>
            <el-button type="primary" class="flex-1" @click="confirmUpdateProfile">Save</el-button>
         </div>
      </div>
    </el-dialog>

    <!-- Edit Info Dialog -->
    <el-dialog v-model="editInfoDialogVisible" width="400px" :show-close="false" class="rounded-2xl">
      <template #header="{ close }">
        <div class="flex justify-between items-center p-4 border-b border-border">
          <h3 class="text-lg font-bold">Edit Details</h3>
          <el-button circle text @click="close"><el-icon><Close /></el-icon></el-button>
        </div>
      </template>
      <div class="p-4 space-y-4">
         <!-- Background Image Placeholder -->
         <div class="h-32 bg-slate-100 rounded-lg flex items-center justify-center text-text-muted text-sm">
            Background upload coming soon
         </div>
         
         <div>
            <label class="text-xs font-bold text-text-muted uppercase mb-1 block">Bio</label>
            <el-input v-model="memberInfoForm.description" type="textarea" :rows="3" placeholder="Write something about yourself..." />
         </div>
         
         <!-- Other fields... -->
         
         <div class="flex gap-3 mt-6">
            <el-button class="flex-1" @click="cancelUpdateInfo">Cancel</el-button>
            <el-button type="primary" class="flex-1" @click="confirmUpdateInfo">Save</el-button>
         </div>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { getInfo, updateMemberInfo, updateUserProfile, uploadAvatarDirectly } from "@/api/member.js";
import { followAndFans } from "@/api/social.js";
import { userLikeNums } from "@/api/video.js";
import { userInfoX } from "@/store/userInfoX";
import { formatNumber } from "@/utils/format"; // Import helper
import { Camera, Close, Edit, Location, Lock, More, QuestionFilled, School, Search, UserFilled } from "@element-plus/icons-vue";
import { regionData } from "element-china-area-data";

export default {
  name: 'User',
  components: {Search, School, QuestionFilled, Location, Edit, More, Lock, Camera, Close},
  computed: {
    UserFilled() { return UserFilled }
  },
  data() {
    return {
      user: {},
      memberInfo: {},
      editDialogVisible: false,
      editInfoDialogVisible: false,
      activeName: this.$route.path,
      saveLogin: true,
      userForm: {},
      memberInfoForm: {},
      followNum: 0,
      fansNum: 0,
      likeAllNum: 0,
      userVideoTabShow: [
        {id: 1, tabName: "Videos", tabUrl: "/user/videoPost", lock: false},
        {id: 2, tabName: "Liked", tabUrl: "/user/videoLike", lock: false},
        {id: 3, tabName: "Favorites", tabUrl: "/user/videoFavorite", lock: false},
        {id: 4, tabName: "History", tabUrl: "/user/videoViewHistory", lock: false}
      ],
      options: regionData,
      selectedOptions: [],
      searchKeyword: "",
      searchDefaults: "Search videos..."
    }
  },
  created() {
    this.getUserInfo()
  },
  mounted() {
    this.$nextTick(() => {
      this.activeName = this.$route.path
    })
  },
  methods: {
    formatNumber, // Expose helper to template
    getUserInfo() {
      getInfo().then(res => {
        if (res.code === 200) {
          const userData = res.data?.User || res.data?.user || res.data
          this.user = userData
          this.memberInfo = userData.memberInfo || {}
          this.userForm = {
            ...userData,
            user_name: userData.user_name || userData.userName || userData.UserName || '',
            userId: userData.userId || userData.user_id || userData.UserId,
            sex: String(userData.sex ?? userData.Sex ?? '2')
          }
          this.memberInfoForm = userData.memberInfo || {}
          
          // Handle locks
          if (this.memberInfoForm.likeShowStatus === '1') {
            this.userVideoTabShow.find(i => i.id === 2).lock = true
          }
          if (this.memberInfoForm.favoriteShowStatus === '1') {
            this.userVideoTabShow.find(i => i.id === 3).lock = true
          }
          
          userInfoX().setUserInfo(userData)
          this.getUserFollowFansLike(userData.userId || userData.user_id)
        }
      })
    },
    getUserFollowFansLike(userId) {
      followAndFans(userId).then(res => {
        if (res.code === 200 && res.data) {
          this.followNum = res.data?.follow_count || res.data?.total || res.data?.user_list?.length || 0
          this.fansNum = res.data?.follower_count || 0
        }
      })
      userLikeNums(userId).then(res => {
        if (res.code === 200) {
          this.likeAllNum = res.data?.total || res.data?.like_count || 0
        }
      })
    },
    handleClick(tab) {
      this.$router.push(tab.props.name)
    },
    handleEditProfile() {
      this.editDialogVisible = true
    },
    handleEditInfo() {
      this.editInfoDialogVisible = true
      if (this.memberInfoForm.province && this.memberInfoForm.city && this.memberInfoForm.region) {
          this.selectedOptions = [this.memberInfoForm.province, this.memberInfoForm.city, this.memberInfoForm.region]
      }
    },
    beforeAvatarUpload(file) {
      const isImage = file.type.startsWith('image/')
      const isLt5M = file.size / 1024 / 1024 < 5
      if (!isImage) {
        this.$message.error('Images only!')
        return false
      }
      if (!isLt5M) {
        this.$message.error('Max 5MB!')
        return false
      }
      return true
    },
    async handleAvatarUpload(options) {
      const { file } = options
      try {
        const formData = new FormData()
        formData.append('file', file)
        const res = await uploadAvatarDirectly(formData)
        if (res.code === 200 || res.code === 0) {
          this.userForm.avatar = URL.createObjectURL(file)
          this.$message.success('Avatar updated')
        } else {
          this.$message.error(res.message || 'Upload failed')
        }
      } catch (error) {
        this.$message.error('Upload failed')
      }
    },
    confirmUpdateProfile() {
      let sexValue = 2
      const sexStr = String(this.userForm.sex)
      if (sexStr === '1') sexValue = 1
      else if (sexStr === '0') sexValue = 0
      
      const userName = this.userForm.user_name || ''
      const userId = this.userForm.userId || this.userForm.user_id
      
      if (!userName) return this.$message.error('Nickname required')
      if (!userId) return this.$message.error('User ID missing')
      
      updateUserProfile({
        user_name: userName,
        userId: userId,
        sex: sexValue
      }).then(res => {
        if (res.code === 0 || res.code === 200) {
          this.editDialogVisible = false
          this.$message.success('Updated successfully')
          this.getUserInfo()
        } else {
          this.$message.error(res.message || 'Update failed')
        }
      })
    },
    cancelUpdateProfile() {
      this.editDialogVisible = false
    },
    addressChoose(value) {
      this.memberInfoForm.adcode = value[value.length - 1]
      this.memberInfoForm.province = value[0]
      this.memberInfoForm.city = value[1]
      this.memberInfoForm.region = value[value.length - 1]
    },
    cancelUpdateInfo() {
      this.editInfoDialogVisible = false
    },
    confirmUpdateInfo() {
      updateMemberInfo(this.memberInfoForm).then(res => {
        if (res.code === 0 || res.code === 200) {
          this.editInfoDialogVisible = false
          this.$message.success('Updated successfully')
          this.getUserInfo()
        } else {
          this.$message.error(res.message || 'Update failed')
        }
      })
    },
    searchConfirm() {
      // Search logic
    },
  }
}
</script>

<style scoped>
/* Custom Tab Styles */
:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: var(--el-border-color-light);
}
:deep(.el-tabs__item) {
  font-size: 16px;
  color: var(--text-muted);
}
:deep(.el-tabs__item.is-active) {
  color: var(--niuyin-primary-color);
  font-weight: 600;
}
:deep(.el-tabs__active-bar) {
  background-color: var(--niuyin-primary-color);
  height: 3px;
  border-radius: 3px;
}
</style>
