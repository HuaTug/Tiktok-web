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
    if (token) {
        // Refactored-TikTok 后端期望 Access-Token header
        config.headers['Access-Token'] = token
    }
    return config;
}, error => {
    return Promise.reject(error);
});
let loginDialog = true
// 添加响应拦截器
instance.interceptors.response.use(res => {
    // 未设置状态码则默认成功状态
    // Refactored-TikTok 后端成功码是 10000，也兼容 0 和 200
    const code = res.data.code;
    // 获取错误信息
    const msg = errorCode[code] || res.data.message || res.data.msg || errorCode['default']
    // 二进制数据则直接返回
    if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
        return res.data
    }
    // 未认证
    if (code === 401) {
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
        ElMessage.error(msg)
        return Promise.reject(new Error(msg))
    } else if (code !== 0 && code !== 200 && code !== 10000) {
        // 后端错误码不是 0、200 或 10000 时提示错误
        ElMessage.error(msg)
        return Promise.reject('error')
    } else {
        // 成功时统一将 code 转换为 200 以兼容前端判断逻辑
        // Refactored-TikTok 后端返回 10000 表示成功
        const result = { ...res.data }
        if (result.code === 0 || result.code === 10000) {
            result.code = 200  // 统一转换为 200，兼容前端现有判断
        }
        return result
    }
}, function (error) {
    return Promise.reject(error);
});

export default instance
