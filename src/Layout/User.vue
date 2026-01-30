<template>
  <div class="">
    <!--    <div style="position: fixed;-->
    <!--    right: 0;-->
    <!--    top: 0;-->
    <!--    z-index: -10;"><img :src="memberInfo.backImage">-->
    <!--    </div>-->
    <el-scrollbar class="scrollbar">
      <!--      用户信息区域-->
      <div class="user-container" :style="{ backgroundImage: `url(${memberInfo.backImage})` }">
        <div v-viewer class="avatar-area">
          <!-- 调试用户头像显示 -->
          <el-avatar v-if="user.avatar_url || user.avatar" class="user-avatar pr" :src="user.avatar_url || user.avatar" @load="console.log('
✅ [AVATAR] 头像加载成功:', user.avatar_url || user.avatar)" @error="console.log('❌ [AVATAR] 头像加载失败:', user.avatar_url || user.avatar)"/>                                                                                                                                                    <el-avatar v-else class="user-avatar pr" :icon="UserFilled"/>

          <div class="image-dot dn-phone"></div>
        </div>
        <div class="user-info">
          <div class="username"><h1>{{ user.user_name || user.nickName || '用户' }}</h1></div>
          <div class="follow-fans-like">
            <div class="user-info-follow flex-center">
              <div class="mr-5r cg fs8">关注</div>
              <div class="follow-right fw600">{{ followNum }}</div>
            </div>
            <div class="=user-info-fans flex-center">
              <div class="mr-5r cg fs8">粉丝</div>
              <div class="follow-right fw600">{{ fansNum }}</div>
            </div>
            <div class="user-info-like flex-center">
              <div class="mr-5r cg fs8">获赞</div>
              <div class="fw600">{{ likeAllNum }}</div>
            </div>
          </div>
          <div class="user-profile mtb5 dn-phone">
            <span class="userid">苝士ID：{{ user.user_id || user.userId }}</span>
            <span class="gender-age">
              <svg v-if="user.sex===1 || user.sex==='1'" class="icon1rem" aria-hidden="true">
              <use xlink:href="#icon-man"></use></svg>
              <svg v-else-if="user.sex===0 || user.sex==='0'" class="icon1rem" aria-hidden="true">
              <use xlink:href="#icon-woman"></use></svg>
              <svg v-else class="icon1rem" aria-hidden="true">
              <use xlink:href="#icon-sex-primary"></use></svg>
              <span class="ml-5r">{{ '22岁' }}</span></span>
            <span class="city">{{ memberInfo.province + " · " + memberInfo.city }}</span>
            <span v-if="memberInfo.campus" class="school">
              <el-icon :size="16" class="mr-5r">
                <School/>
              </el-icon>
              {{ memberInfo.campus }}
            </span>
          </div>
          <div class="user-description ">
            <p class="one-line fs8">{{ memberInfo.description }}</p>
          </div>
        </div>
        <div class="user-op h100" style="min-height: 100px">
          <div class="trust-login-switch dn-phone">
            <div class="trust-login-tips flex-center">
              <el-tooltip content="保存登录信息，下次登陆免验证" placement="top">
                <el-icon :size="20">
                  <QuestionFilled/>
                </el-icon>
              </el-tooltip>
            </div>
            <div class="trust-login-switch-title">保存登录信息</div>
            <div class="trust-login-switch-button">
              <el-switch v-model="saveLogin"
                         active-color="#13ce66"
                         inactive-color="#ff4949">
              </el-switch>
            </div>
          </div>
          <div class="user-edit">
            <el-button class="user-edit-btn" @click="handleEditProfile" type="primary">编辑资料</el-button>
            <el-button class="user-edit-btn" @click="handleEditInfo" type="primary">详细信息</el-button>
          </div>
        </div>
      </div>
      <!--  作品，喜欢，收藏  -->
      <div>
        <div class="user-works pr">
          <!--          tab栏-->
          <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane v-for="item in userVideoTabShow"
                         :key="item.id"
                         :lazy="true"
                         :name="item.tabUrl">
              <template #label>
                <div class="flex-center">
                  <span>{{ item.tabName }}</span>
                  <svg v-if="item.lock" class="icon1rem ml-5r" aria-hidden="true">
                    <use xlink:href="#icon-lock"></use>
                  </svg>
                </div>
              </template>
              <router-view/>
            </el-tab-pane>
          </el-tabs>
          <!--          作品搜索-->
          <div v-if="activeName==='/user/videoPost'" class="pa flex-center"
               style="height: 40px;top: 0;right: 0px;z-index: 200">
            <div class="dn-phone" style="padding: 5px 0">
              <el-input
                  class="search-input fs8"
                  style="height: 30px"
                  v-model="searchKeyword"
                  :placeholder="searchDefaults"
                  @keyup.enter.native="searchConfirm"
                  clearable>
                <template #append>
                  <el-button type="primary" @click="searchConfirm">
                    <el-icon style="vertical-align: middle">
                      <Search/>
                    </el-icon>
                  </el-button>
                </template>
              </el-input>
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>
    <!--  编辑资料弹框  -->
    <el-dialog class="oh edit-info-dialog"
               v-model="editDialogVisible"
               width="400px"
               :show-close="false">
      <template #header="{ close, titleId, titleClass }">
        <h3 class="one-line" :id="titleId" :class="titleClass">编辑资料</h3>
        <el-button circle :icon="Close" class="cb" type="info" @click="close">
        </el-button>
      </template>
      <el-scrollbar>
        <div class="edit-avatar">
          <el-tooltip content="上传头像" placement="top" effect="customized">
            <el-upload class="avatar-uploader"
                       :show-file-list="false"
                       :before-upload="beforeAvatarUpload"
                       :http-request="handleAvatarUpload">
              <img v-if="user.avatar||userForm.avatar" :src="userForm.avatar" class="avatar"/>
              <i v-else class="iconfont icon-camera avatar-uploader-icon"/>
            </el-upload>
          </el-tooltip>
          <div class="I5fCASKY cg">点击修改头像</div>
        </div>
        <div class="edit-nickname">
          <div class="N3OJZMVX">昵称</div>
          <el-input v-model="userForm.nickName"
                    maxlength="20"
                    class="w-50 m-2"
                    placeholder="记得填写昵称"
                    show-word-limit
                    type="text"/>
        </div>
        <div class="edit-gender">
          <div class="N3OJZMVX">性别</div>
          <el-radio-group v-model="userForm.sex">
            <el-radio-button :label="'1'">
              <svg class="icon1rem" aria-hidden="true">
                <use xlink:href="#icon-man"></use>
              </svg>
              男
            </el-radio-button>
            <el-radio-button :label="'0'">
              <svg class="icon1rem" aria-hidden="true">
                <use xlink:href="#icon-woman"></use>
              </svg>
              女
            </el-radio-button>
            <el-radio-button :label="'2'">
              <svg class="icon1rem" aria-hidden="true">
                <use xlink:href="#icon-sex-primary"></use>
              </svg>
              保密
            </el-radio-button>
          </el-radio-group>
        </div>
        <!--  确认按钮  -->
        <div class="edit-button">
          <el-button type="info" class="cg fw600" @click="cancelUpdateProfile">取消</el-button>
          <el-button type="primary" class="fw600" @click="confirmUpdateProfile">保存</el-button>
        </div>
      </el-scrollbar>
    </el-dialog>
    <!--  编辑详细信息弹框  -->
    <el-dialog class="oh edit-info-dialog"
               v-model="editInfoDialogVisible"
               width="400px"
               :show-close="false">
      <template #header="{ close, titleId, titleClass }">
        <h3 class="one-line" :id="titleId" :class="titleClass">编辑详细信息</h3>
        <el-button circle :icon="Close" class="cb" type="info" @click="close">
        </el-button>
      </template>
      <el-scrollbar>
        <div class="edit-background w100">
          <el-tooltip content="背景图片上传功能暂未开放" placement="top" effect="customized">
            <div class="background-preview w100" style="cursor: not-allowed;">
              <img v-if="memberInfoForm.backImage" :src="memberInfoForm.backImage" class="back-image"/>
              <div v-else class="back-image-placeholder">背景图片上传暂未开放</div>
            </div>
          </el-tooltip>
        </div>
        <div class="edit-birthday">
          <div class="mtb5">出生日期</div>
          <el-date-picker
              style="width: 100% !important;"
              v-model="memberInfoForm.birthday"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              type="datetime"
              :size="'large'"
              placeholder="选择出生日期"
          />
        </div>
        <div class="edit-city">
          <div class="mtb5">选择城市</div>
          <el-cascader :options="options"
                       class="w100"
                       v-model="selectedOptions"
                       @change="addressChoose"/>
        </div>
        <div class="edit-campus">
          <div class="mtb5">学校</div>
          <el-input
              v-model="memberInfoForm.campus"
              maxlength="64"
              class="w-50 m-2"
              placeholder="输入学校"
              show-word-limit
              type="text"
          />
        </div>
        <el-row>
          <el-col :span="12">
            <div class="edit-like">
              <div class="mtb5">我的喜欢可见</div>
              <div class="tac">
                <el-switch
                    v-model="memberInfoForm.likeShowStatus"
                    class="mt-2 tac"
                    inline-prompt
                    active-value="0"
                    inactive-value="1"
                    :active-icon="Check"
                    :inactive-icon="Close"/>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="edit-favorite">
              <div class="mtb5">收藏夹可见</div>
              <div class="tac">
                <el-switch
                    v-model="memberInfoForm.favoriteShowStatus"
                    class="mt-2"
                    inline-prompt
                    active-value="0"
                    inactive-value="1"
                    :active-icon="Check"
                    :inactive-icon="Close"/>
              </div>
            </div>
          </el-col>
        </el-row>
        <div class="edit-desc">
          <div class="mtb5">输入描述信息</div>
          <el-input
              v-model="memberInfoForm.description"
              :rows="2"
              type="textarea"
              placeholder="这是一段描述"
          />
        </div>
        <!--  确认按钮  -->
        <div class="edit-button">
          <el-button type="info" class="cg fw600" @click="cancelUpdateInfo">取消</el-button>
          <el-button type="primary" class="fw600" @click="confirmUpdateInfo">保存</el-button>
        </div>
      </el-scrollbar>
    </el-dialog>
  </div>
</template>

<script>
import { getAvatarUploadUrl, getInfo, updateAvatar, updateMemberInfo, updateUserProfile, uploadAvatarToOss } from "@/api/member.js";
import { followAndFans } from "@/api/social.js";
import { userLikeNums } from "@/api/video.js";
import { userInfoX } from "@/store/userInfoX";
import { Check, Close, QuestionFilled, School, Search, UserFilled } from "@element-plus/icons-vue";
import {
  regionData,
} from "element-china-area-data";

export default {
  name: 'User',
  components: {Search, School, QuestionFilled},
  computed: {
    Search() {
      return Search
    },
    UserFilled() {
      return UserFilled
    },
    Check() {
      return Check
    },
    Close() {
      return Close
    }
  },
  data() {
    return {
      user: {},
      memberInfo: {},
      editDialogVisible: false, //编辑资料弹框
      editInfoDialogVisible: false, //编辑详细信息弹框
      activeName: this.$route.path,
      saveLogin: true,
      userForm: {},
      memberInfoForm: {},
      // backImageUploadUrl: import.meta.env.VITE_API_BASE_URL + "/member/api/v1/info/backImage/upload", // 后端暂无此接口
      followNum: 0, // 关注数
      fansNum: 0, //粉丝数
      likeAllNum: 0, //获赞数
      userVideoTabShow: [
        {id: 1, tabName: "作品", tabUrl: "/user/videoPost", lock: false},
        {id: 2, tabName: "喜欢", tabUrl: "/user/videoLike", lock: false},
        {id: 3, tabName: "收藏", tabUrl: "/user/videoFavorite", lock: false},
        {id: 4, tabName: "观看历史", tabUrl: "/user/videoViewHistory", lock: false}
      ],
      // 省市区级联
      options: regionData,
      selectedOptions: [],
      searchKeyword: "",
      searchDefaults: "请输入作品名称"
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
    getUserInfo() {
      console.log('🔍 [USER-INFO] 开始获取用户信息...')
      getInfo().then(res => {
        console.log('📥 [USER-INFO] 获取到响应:', res)
        // Refactored-TikTok backend returns code 200 after conversion
        if (res.code === 200) {
          // Refactored-TikTok 后端返回的用户信息在 data.User 中
          const userData = res.data?.User || res.data?.user || res.data
          console.log('👤 [USER-INFO] 解析后的用户数据:', userData)
          console.log('🖼️ [USER-INFO] 头像信息:', {
            avatar_url: userData?.avatar_url,
            avatar: userData?.avatar,
            avatar_url_type: typeof userData?.avatar_url,
            avatar_type: typeof userData?.avatar
          })
          this.user = userData
          this.memberInfo = userData.memberInfo || {}
          this.userForm = {...userData}
          this.memberInfoForm = userData.memberInfo || {}
          if (this.memberInfoForm.likeShowStatus === '1') {
            // 喜欢被禁用
            this.userVideoTabShow.forEach((item, index) => {
              if (item.id === 2) {
                item.lock = true
              }
            })
          }
          if (this.memberInfoForm.favoriteShowStatus === '1') {
            // 收藏被禁用
            this.userVideoTabShow.forEach((item, index) => {
              if (item.id === 3) {
                item.lock = true
              }
            })
          }
          userInfoX().setUserInfo(userData)
          this.getUserFollowFansLike(userData.userId || userData.user_id)
        }
      }).catch(err => {
        console.log('Get user info failed:', err)
      })
    },
    getUserFollowFansLike(userId) {
      // 查询关注、粉丝
      followAndFans(userId).then(res => {
        // Refactored-TikTok backend uses code 200 after conversion
        if (res.code === 200 && res.data) {
          // 后端返回: data.follow_count, data.user_list.length
          this.followNum = res.data?.follow_count || res.data?.total || res.data?.user_list?.length || 0
          this.fansNum = res.data?.follower_count || 0
        }
      }).catch(err => console.log('Follow/Fans fetch failed:', err))
      // 查询获赞
      userLikeNums(userId).then(res => {
        // Refactored-TikTok backend uses code 200 after conversion
        if (res.code === 200) {
          this.likeAllNum = res.data?.total || res.data?.like_count || 0
        }
      }).catch(err => console.log('Like nums fetch failed:', err))
    },
    handleClick(tab, event) {
      // console.log(tab.props.name);
      const route = tab.props.name
      // console.log(this.$route.path)
      // console.log(this.$route.matched[1].path)
      this.$router.push(route)
    },
    // 编辑资料
    handleEditProfile() {
      this.editDialogVisible = true

    },
    // 编辑详细信息
    handleEditInfo() {
      this.editInfoDialogVisible = true
      this.selectedOptions = [this.memberInfoForm.province, this.memberInfoForm.city, this.memberInfoForm.region]
    },
    // 头像上传前的验证
    beforeAvatarUpload(file) {
      const isImage = file.type.startsWith('image/')
      const isLt5M = file.size / 1024 / 1024 < 5

      if (!isImage) {
        this.$message.error('只能上传图片文件！')
        return false
      }
      if (!isLt5M) {
        this.$message.error('图片大小不能超过 5MB！')
        return false
      }
      return true
    },
    // 自定义头像上传逻辑
    async handleAvatarUpload(options) {
      const { file } = options
      try {
        // 1. 获取文件扩展名
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase()

        // 2. 获取预签名上传URL
        const uploadUrlRes = await getAvatarUploadUrl(fileExtension)
        if (uploadUrlRes.code !== 200 && uploadUrlRes.code !== 0) {
          this.$message.error(uploadUrlRes.message || uploadUrlRes.msg || '获取上传URL失败')
          return
        }

        const { upload_url, access_url } = uploadUrlRes.data

        // 3. 上传文件到OSS
        await uploadAvatarToOss(upload_url, file)

        // 4. 更新用户头像
        const updateRes = await updateAvatar(access_url)
        if (updateRes.code === 200 || updateRes.code === 0) {
          this.userForm.avatar = access_url
          this.$message.success('头像上传成功')
        } else {
          this.$message.error(updateRes.message || updateRes.msg || '更新头像失败')
        }
      } catch (error) {
        console.error('Avatar upload error:', error)
        this.$message.error('头像上传失败，请重试')
      }
    },
    // 确认提交
    confirmUpdateProfile() {
      updateUserProfile(this.userForm).then(res => {
        // Refactored-TikTok backend uses code 0 for success
        if (res.code === 0 || res.code === 200) {
          this.editDialogVisible = false
          this.$message.success(res.message || res.msg || '更新成功')
          this.getUserInfo()
        } else {
          this.$message.error(res.message || res.msg || '更新失败')
        }
      }).catch(err => {
        this.$message.error('更新失败，请检查网络连接')
      })
    },
    cancelUpdateProfile() {
      this.editDialogVisible = false
    },
    /**省市区三级联动 */
    addressChoose(value) {
      // console.log(this.regionData);
      // console.log("地址", value)
      // console.log("地址编码", value[value.length - 1])
      this.memberInfoForm.adcode = value[value.length - 1]
      this.memberInfoForm.province = value[0]
      this.memberInfoForm.city = value[1]
      this.memberInfoForm.region = value[value.length - 1]
    },
    //取消
    cancelUpdateInfo() {
      this.editInfoDialogVisible = false
    },
    // 确认提交用户详情
    confirmUpdateInfo() {
      // console.log(this.memberInfoForm)
      updateMemberInfo(this.memberInfoForm).then(res => {
        // Refactored-TikTok backend uses code 0 for success
        if (res.code === 0 || res.code === 200) {
          this.editInfoDialogVisible = false
          this.$message.success(res.message || res.msg || '更新成功')
          this.getUserInfo()
        } else {
          this.$message.error(res.message || res.msg || '更新失败')
        }
      }).catch(err => {
        this.$message.error('更新失败，请检查网络连接')
      })
    },
    searchConfirm() {
      // console.log("searchConfirm keyword >" + this.searchKeyword)
    },
  }
}

</script>

<style scoped>
@import "@/assets/styles/user.scss";
</style>
