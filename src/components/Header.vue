<template>
  <!--  导航栏-->
  <el-header class="niuyin-header">
    <div class="nav-left"></div>
    <!-- 导航栏中间区域 -->
    <NavCenter/>
    <!-- 导航栏右侧区域 -->
    <NavRight :user="user" @darkChangeEmit="emitDarkChange"/>
  </el-header>
</template>

<script>
import NavCenter from "@/components/nav/NavCenter.vue"
import NavRight from "@/components/nav/NavRight.vue";
import {getInfo} from "@/api/member.js";
import {userInfoX} from "@/store/userInfoX";
import {getToken} from "@/utils/auth.js";

export default {
  name: "Header",
  computed: {},
  components: {NavCenter, NavRight},
  props: {},
  data() {
    return {
      user: userInfoX().userInfo || {},
    }
  },
  created() {
    this.getUserInfo()
  },
  emits: ['themeChangeEmit'],
  methods: {
    // 获取用户信息
    getUserInfo() {
      console.log('👤 [HEADER] 检查用户信息...')
      console.log('👤 [HEADER] 当前 this.user:', this.user)
      console.log('👤 [HEADER] 当前 token:', getToken())
      
      if (getToken() !== undefined) {
        console.log('✅ [HEADER] Token存在，检查用户信息是否需要获取')
        if (!this.user || typeof this.user !== 'object') {
          console.log('📞 [HEADER] 用户信息不存在，调用API获取...')
          getInfo().then(res => {
            console.log('📥 [HEADER] 收到用户信息响应:', res)
            if (res.code === 200) {
              // Refactored-TikTok 后端返回的用户信息在 data.User 中
              const userData = res.data?.User || res.data?.user || res.data
              console.log('💾 [HEADER] 保存用户信息:', userData)
            console.log('🖼️ [HEADER] 用户头像信息:', {
              avatar_url: userData?.avatar_url,
              avatar: userData?.avatar,
              'avatar_url长度': userData?.avatar_url?.length
            })
              this.user = userData
              userInfoX().setUserInfo(userData)
              console.log('✅ [HEADER] 用户信息保存完成')
            } else {
              console.error('❌ [HEADER] 获取用户信息失败, code:', res.code)
            }
          }).catch(err => {
            console.error('❌ [HEADER] 获取用户信息异常:', err)
          })
        } else {
          console.log('✅ [HEADER] 用户信息已存在，无需重新获取')
        }
      } else {
        console.warn('⚠️ [HEADER] Token不存在，跳过获取用户信息')
      }
    },
    // 换肤事件
    emitDarkChange(dark) {
      this.$emit('themeChangeEmit', dark)
    }
  },
}
</script>

<style>
@import "@/assets/styles/header.scss";
</style>
