import { getToken } from "@/utils/auth.js";
import errorCode from '@/utils/errorCode';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 20000,
});

// 添加请求拦截器
instance.interceptors.request.use(config => {
    const token = getToken()
    console.log('🌐 [REQUEST] 发起请求:', config.url)
    console.log('🔑 [REQUEST] 从Cookies读取token:', token ? `${token.substring(0, 30)}...` : '❌ 无token')
    if (token) {
        // Refactored-TikTok 后端期望 Access-Token header
        config.headers['Access-Token'] = token
        console.log('✅ [REQUEST] 已添加 Access-Token header')
    } else {
        console.warn('⚠️ [REQUEST] 未找到token，将发送无认证请求')
    }
    return config;
}, error => {
    console.error('❌ [REQUEST] 请求拦截器错误:', error)
    return Promise.reject(error);
});
let loginDialog = true
// 添加响应拦截器
instance.interceptors.response.use(res => {
    console.log('📥 [RESPONSE] 收到响应:', res.config.url)
    console.log('📥 [RESPONSE] 响应数据:', res.data)
    
    // 检查响应数据是否存在
    if (!res.data) {
        console.error('❌ [RESPONSE] 响应数据为空:', res.config.url)
        ElMessage.error('服务器返回异常，请稀后重试')
        return Promise.reject('响应数据为空')
    }
    
    // 未设置状态码则默认成功状态
    // Refactored-TikTok 后端有两种响应格式:
    // 1. 直接返回 { code, msg/message, data }
    // 2. 返回 { base: { code, msg }, ...otherFields }
    let code = res.data.code;
    let msg = res.data.message || res.data.msg;
    
    // 检查是否是 base 嵌套格式
    if (code === undefined && res.data.base && res.data.base.code !== undefined) {
        code = res.data.base.code;
        msg = res.data.base.msg || res.data.base.message;
        console.log('🔄 [RESPONSE] 检测到 base 格式响应，code:', code)
    }
    
    // 获取错误信息
    msg = errorCode[code] || msg || errorCode['default']
    
    // 二进制数据则直接返回
    if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
        return res.data
    }
    
    // 未认证
    if (code === 401 || code === 10004 || code === 10013) {
        console.error('❌ [RESPONSE] 未认证! code:', code)
        console.error('❌ [RESPONSE] 错误信息:', msg)
        // 展示重新登陆逻辑
        if (loginDialog) {
            loginDialog = false
            ElMessageBox.confirm('登录状态已过期，是否选择重新登录', '提示', {
                confirmButtonText: '重新登录', cancelButtonText: '取消', type: 'warning'
            }).then(() => {
                location.href = '/login';
            }).catch(() => {
                loginDialog = true
            });
            return Promise.reject('请重新登录。')
        }
    } else if (code === 500) {
        console.error('❌ [RESPONSE] 服务器错误! code:', code, 'msg:', msg)
        ElMessage.error(msg)
        return Promise.reject(new Error(msg))
    } else if (code !== 0 && code !== 200 && code !== 10000) {
        // 后端错误码不是 0、200 或 10000 时提示错误
        console.error('❌ [RESPONSE] 业务错误! code:', code, 'msg:', msg)
        
        // 特殊处理后端panic错误
        let userMsg = msg
        if (code === 10001 && msg && msg.includes('panic: [happened in biz handler')) {
            console.error('⚠️ [RESPONSE] 检测到后端服务异常，原始错误:', msg)
            userMsg = '视频服务暂时不可用，请稍后重试'
            ElMessage.error(userMsg)
            return Promise.reject(new Error(userMsg))
        } else if (msg && msg.includes('runtime error: invalid memory address')) {
            console.error('⚠️ [RESPONSE] 检测到后端空指针错误，原始错误:', msg)
            userMsg = '系统内部错误，工程师正在紧急修复中'
            ElMessage.error(userMsg)
            return Promise.reject(new Error(userMsg))
        }
        
        // 对于普通业务错误（如 "already exists"、"not found" 等），返回响应让调用方处理
        // 不显示全局错误提示，让调用方决定如何处理
        return { ...res.data, code: code }
    } else {
        // 成功时统一将 code 转换为 200 以兼容前端判断逻辑
        // Refactored-TikTok 后端返回 10000 表示成功
        console.log('✅ [RESPONSE] 请求成功! code:', code)
        const result = { ...res.data, code: 200 }  // 统一设置 code 为 200
        console.log('🔄 [RESPONSE] 将code从', code, '转换为 200')
        console.log('🔄 [RESPONSE] 返回的result对象:', JSON.stringify(result))
        console.log('🔄 [RESPONSE] result.code:', result.code, 'typeof:', typeof result.code)
        return result
    }
}, function (error) {
    console.error('🌐 [RESPONSE] 网络错误:', error)
    console.error('🌐 [RESPONSE] 错误详情:', error.response?.data)
    
    // 检查是否是认证错误（即使连接被关闭）
    if (error.response?.data?.code === 10004 || error.response?.data?.code === 10013) {
        console.error('❌ [RESPONSE] 未认证! code:', error.response.data.code)
        console.error('❌ [RESPONSE] 错误信息:', error.response.data.message || error.response.data.msg)
        // 展示重新登陆逻辑
        if (loginDialog) {
            loginDialog = false
            ElMessageBox.confirm('登录状态已过期，是否选择重新登录', '提示', {
                confirmButtonText: '重新登录', cancelButtonText: '取消', type: 'warning'
            }).then(() => {
                location.href = '/login';
            }).catch(() => {
                loginDialog = true
            });
            return Promise.reject('请重新登录。')
        }
    }
    
    // 网络连接错误处理
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        ElMessage.error('请求超时，请检查网络连接')
    } else if (error.message.includes('Network Error') || error.message.includes('conn closed') || error.message.includes('remote or network error')) {
        ElMessage.error('网络连接失败，请稍后重试')
    } else if (error.message.includes('404') || error.message.includes('Not Found')) {
        ElMessage.error('请求的资源不存在')
    } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        ElMessage.error('没有权限执行此操作')
    } else {
        ElMessage.error('网络请求失败，请稍后重试')
    }
    
    return Promise.reject(error);
});

export default instance
