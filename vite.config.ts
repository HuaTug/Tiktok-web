import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

import path from 'path'; // 需安装此模块

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue(),],
    css: {
        // 预处理器配置项
        preprocessorOptions: {
            less: {
                math: "always",
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    server: {
        proxy: {
            // 代理 MinIO video bucket - 用于视频资源
            '/video': {
                target: 'http://localhost:9002',
                changeOrigin: true,
                secure: false,
                // 直接转发到 MinIO
                rewrite: (path) => path
            },
            // 代理 MinIO picture bucket - 用于封面和头像
            '/picture': {
                target: 'http://localhost:9002',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path
            },
            // 代理 MinIO 视频资源，解决 ERR_BLOCKED_BY_ORB 跨域问题
            '/tiktok-user-content': {
                target: 'http://localhost:9002',
                changeOrigin: true,
                secure: false,
                // 不重写路径，直接转发
                rewrite: (path) => path
            },
            '/tiktok-avatarurl': {
                target: 'http://localhost:9002',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path
            },
            // 代理热点缓存 bucket
            '/tiktok-cache-hot': {
                target: 'http://localhost:9002',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path
            }
        }
    }
})
