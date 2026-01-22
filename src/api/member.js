//将登陆的接口分离
import request from '@/utils/request'

// 登录方法
export function login(username, password) {
    const data = {
        username,
        password
    }
    return request({
        url: '/v1/user/login',
        method: 'post',
        data: data
    })
}

export const userLogin = (loginForm) => {
    return request.post('/v1/user/login', {
        username: loginForm.name,
        password: loginForm.password
    }).then(res => {
        // 返回响应，让调用方处理token保存
        // 这样可以统一在LoginNew.vue中保存到所有存储位置
        console.log('userLogin API response:', res)
        return res
    })
}

export const userSmsLogin = (telephone, smsCode) => {
    return request.post('/v1/user/verifycode', {
        telephone,
        smsCode
    })
}

// 发送验证码
export function sendCode(data) {
    return request({
        url: '/v1/user/sendcode',
        method: 'post',
        data: data
    })
}

// 注册方法
export function register(data) {
    return request({
        url: '/v1/user/create/',
        method: 'post',
        data: data
    })
}

// 获取用户详细信息
export function getInfo() {
    return request({
        url: '/v1/user/get',
        method: 'get'
    })
}

// 获取用户详细信息
export function getPersonInfo(userId) {
    return request({
        url: '/v1/user/get',
        method: 'get',
        params: { user_id: userId }
    })
}


// 退出方法
export function logout() {
    return request({
        url: '/logout',
        method: 'post'
    })
}


//更新用户信息
export function updateUserProfile(data) {
    return request({
        url: '/v1/user/update',
        method: 'post',
        data: data
    })
}

// 获取头像上传预签名URL
export function getAvatarUploadUrl(fileExtension) {
    return request.post('/v1/user/avatar/upload-url', {
        file_extension: fileExtension
    })
}

// 上传头像到OSS
export function uploadAvatarToOss(uploadUrl, file) {
    return fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
            'Content-Type': file.type
        }
    })
}

// 更新用户头像
export function updateAvatar(avatarUrl) {
    return request.post('/v1/user/avatar/update', {
        avatar_url: avatarUrl
    })
}

// 更新用户头像（直接上传方式）
export function uploadAvatarDirectly(formData) {
    return request({
        url: '/v1/user/update',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

//更新用户详情
export function updateMemberInfo(data) {
    return request({
        url: '/v1/user/update',
        method: 'post',
        data: data
    })
}

// 查询用户
export function queryUser(data) {
    return request({
        url: '/v1/user/query/',
        method: 'post',
        data: data
    })
}

// 检查用户是否存在
export function checkUserExists(userId) {
    return request({
        url: '/v1/user/check',
        method: 'post',
        data: { user_id: userId }
    })
}

// 删除用户
export function deleteUser(userId) {
    return request({
        url: '/v1/user/delete',
        method: 'delete',
        params: { user_id: userId }
    })
}
