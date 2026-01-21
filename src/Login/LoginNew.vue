<template xmlns="">
  <div class="container">
    <!-- <div class="logo"></div> -->
    <!-- 登录区域 -->
    <div class="content">
      <!-- 配图 -->
      <div class="pic"></div>
      <!-- 表单 -->
      <div class="field">
        <!-- [移动端]标题 -->
        <h2 class="mobile-title">
          <div class="title" style="padding: 10px;">欢迎使用芝士芝士学爆</div>
        </h2>
        <!-- 表单 -->
        <div class="form-cont">
          <el-tabs class="form" v-model="loginType" style="float:none;">
            <el-tab-pane label="账号密码登录" name="up"></el-tab-pane>
            <el-tab-pane label="手机短信登录" name="sms"></el-tab-pane>
          </el-tabs>
          <div>
            <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form">
              <!-- 账号密码登录 -->
              <div v-if="loginType === 'up'">
                <el-form-item prop="username">
                  <el-input v-model="loginForm.username" type="text" auto-complete="off" placeholder="账号">
                    <template #prefix>
                      <el-icon class="el-input__icon">
                        <User/>
                      </el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item prop="password">
                  <el-input v-model="loginForm.password" type="password" auto-complete="off" placeholder="密码"
                            @keyup.enter.native="handleLogin">
                    <template #prefix>
                      <el-icon class="el-input__icon">
                        <Lock/>
                      </el-icon>
                    </template>
                  </el-input>
                </el-form-item>
              </div>

              <!-- 手机短信登录 -->
              <div v-if="loginType === 'sms'">
                <el-form-item prop="telephone">
                  <el-input v-model="loginForm.telephone" type="text" auto-complete="off" placeholder="请输入手机号">
                    <template #prefix>
                      <el-icon class="el-input__icon">
                        <Iphone/>
                      </el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item prop="phoneCode">
                  <el-input v-model="loginForm.smsCode" type="text" auto-complete="off" placeholder="短信验证码"
                            class="sms-login-mobile-code-prefix" @keyup.enter.native="handleLogin">
                    <template #prefix>
                      <el-icon class="el-input__icon">
                        <Key/>
                      </el-icon>
                    </template>
                    <template #append>
                      <span v-if="mobileCodeTimer <= 0" class="getMobileCode cb" @click="getSmsCode"
                            style="cursor: pointer;">获取验证码</span>
                      <span v-if="mobileCodeTimer > 0" class="getMobileCode">{{ mobileCodeTimer }}秒后重试</span>
                    </template>
                  </el-input>
                </el-form-item>
              </div>

              <!-- 登录按钮 -->
              <el-form-item class="w100" v-if="loginType != 'qr'">
                <el-button :loading="loading"
                           type="primary"
                           class="w100"
                           @click.native.prevent="handleLogin">
                  <span v-if="!loading">登 录</span>
                  <span v-else>登 录 中...</span>
                </el-button>
                <div style="float: right" v-if="register">
                  <router-link class="link-type" :to="'/register'">立即注册
                  </router-link>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </div>
    <!-- footer -->
    <div class="footer">
      <span>Copyright © 2022-2023 niuyin All Rights Reserved</span>
    </div>
  </div>
</template>
<script>
import {userLogin, userSmsLogin} from "@/api/member.js";
import {tokenX} from "@/store/tokenX";
import {userInfoX} from "@/store/userInfoX";
import {setToken} from "@/utils/auth.js";

export default {
  name: "Login",
  data() {
    return {
      codeUrl: "",
      // 二维码登录
      qrCodeUrl: "",
      uuid: "",
      qrCodeState: "",
      timer: "",
      showQRCodeErrorMask: false,
      mobileCodeTimer: 0,
      // 验证码开关
      captchaEnabled: true,
      // 注册开关
      register: true,
      loginType: "up",
      loginForm: {
        username: "",
        password: "",
        telephone: "",
        smsCode: "",
      },
      loginRules: {
        username: [
          {required: true, trigger: "blur", message: "请输入您的账号"},
        ],
        password: [
          {required: true, trigger: "blur", message: "请输入您的密码"},
        ],
        code: [{required: true, trigger: "change", message: "请输入验证码"}],
        telephone: [
          {required: true, trigger: "blur", message: "手机号不能为空"},
          {
            validator: function (rule, value, callback) {
              if (/^(?:(?:\+|00)86)?1(?:3[\d]|4[5-79]|5[0-35-9]|6[5-7]|7[0-8]|8[\d]|9[189])\d{8}$/.test(value) === false) {
                callback(new Error("手机号格式错误"));
              } else {
                callback();
              }
            }, trigger: "blur"
          }
        ]
      },
      loading: false,
      redirect: undefined,
    };
  },
  watch: {
    // $route: {
    //   handler: function (route) {
    //     this.redirect = route.query && route.query.redirect;
    //   },
    //   immediate: true,
    // },
  },
  created() {
  },
  methods: {
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          if(this.loginType==="up"){
            new Promise((resolve, reject) => {
              console.log('🔐 [LOGIN] 开始登录流程...')
              console.log('🔐 [LOGIN] 用户名:', this.loginForm.username)
              
              userLogin({ name: this.loginForm.username, password: this.loginForm.password }).then(res => {
                console.log('🔐 [LOGIN] 收到登录响应:')
                console.log('  - res.code:', res.code)
                console.log('  - res.data:', res.data)
                console.log('  - res.data.token:', res.data?.token)
                console.log('  - res.data.base:', res.data?.base)
                
                // 检查业务逻辑层面的成功状态
                if (res.code === 200 && res.data && res.data.token) {
                  console.log('✅ [LOGIN] 登录成功，开始保存token...')
                  
                  // 保存token到三个地方：Cookies, tokenX store, 和用户信息
                  console.log('💾 [TOKEN] 保存到 Cookies...')
                  setToken(res.data.token)
                  console.log('💾 [TOKEN] Cookies中的token:', document.cookie)
                  
                  console.log('💾 [TOKEN] 保存到 tokenX store...')
                  tokenX().setToken(res.data.token)
                  console.log('💾 [TOKEN] tokenX store中的token:', tokenX().token)
                  
                  // 保存用户信息
                  if (res.data.user) {
                    console.log('👤 [USER] 保存用户信息:', res.data.user)
                    userInfoX().setUserInfo(res.data.user)
                    console.log('👤 [USER] userInfoX store中的用户:', userInfoX().userInfo)
                  } else {
                    console.warn('⚠️ [USER] 响应中没有用户信息')
                  }
                  
                  console.log('🎉 [LOGIN] Token和用户信息保存完成！')
                  console.log('🔍 [VERIFY] 验证保存结果:')
                  console.log('  - Cookie token:', document.cookie.includes('token=') ? '✅ 存在' : '❌ 不存在')
                  console.log('  - tokenX.token:', tokenX().token ? '✅ 存在' : '❌ 不存在')
                  console.log('  - userInfoX.userInfo:', userInfoX().userInfo ? '✅ 存在' : '❌ 不存在')
                  
                  const successMsg = res.data?.base?.msg || res.message || '登录成功'
                  this.$message.success(successMsg)
                  
                  console.log('📍 [ROUTER] 跳转到首页...')
                  this.$router.push('/')
                  resolve()
                } else {
                  // 登录失败
                  console.error('❌ [LOGIN] 登录失败！')
                  console.error('  - res.code:', res.code)
                  console.error('  - res.data:', res.data)
                  console.error('  - res.data.token 是否存在:', !!res.data?.token)
                  
                  const errorMsg = res.data?.base?.msg || res.message || '登录失败'
                  this.$message.error(errorMsg)
                  reject(new Error(errorMsg))
                }
              }).catch(error => {
                console.error('❌ [LOGIN] 登录请求异常:', error)
                this.$message.error('登录失败，请检查网络连接')
                reject(error)
              })
            })
          }else if(this.loginType==="sms"){
            new Promise((resolve, reject) => {
              userSmsLogin(this.loginForm.telephone, this.loginForm.smsCode).then(res => {
                console.log('SMS login response:', res)
                // 检查业务逻辑层面的成功状态
                if (res.code === 200 && res.data && res.data.token) {
                  // 保存token到三个地方：Cookies, tokenX store, 和用户信息
                  setToken(res.data.token)
                  tokenX().setToken(res.data.token)
                  
                  // 保存用户信息
                  if (res.data.user) {
                    userInfoX().setUserInfo(res.data.user)
                  }
                  
                  const successMsg = res.data?.base?.msg || res.message || '登录成功'
                  this.$message.success(successMsg)
                  this.$router.push('/')
                  resolve()
                } else {
                  // 登录失败
                  const errorMsg = res.data?.base?.msg || res.message || '登录失败'
                  this.$message.error(errorMsg)
                  reject(new Error(errorMsg))
                }
              }).catch(error => {
                console.error('SMS login error:', error)
                this.$message.error('登录失败，请检查网络连接')
                reject(error)
              })
            })
          }
        }
      });
    },
    /** ========== 手机短信登录 ========== */
    getSmsCode() {
      if (this.mobileCodeTimer > 0) return;
      this.$refs.loginForm.validate(valid => {
        if (!valid) return;
        // sendSmsCode(this.loginForm.telephone).then(res => {
          this.$message.success("获取验证码成功")
          this.mobileCodeTimer = 60;
          let msgTimer = setInterval(() => {
            this.mobileCodeTimer = this.mobileCodeTimer - 1;
            if (this.mobileCodeTimer <= 0) {
              clearInterval(msgTimer);
            }
          }, 1000);
        // });
      });
    }
  },
  beforeDestroy() {
    clearTimeout(this.timer);
  },
};
</script>

<style scoped>
@import "@/assets/styles/login-new.scss";

.oauth-login-item img {
  height: 25px;
  width: 25px;
}

.oauth-login-item span:hover {
  text-decoration: underline red;
  color: red;
}

.sms-login-mobile-code-prefix {
  :deep(.el-input__prefix) {
    top: 22%;
  }
}
</style>
