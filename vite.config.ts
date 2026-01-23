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
            // MinIO 容器端口映射: 宿主机 9002 -> 容器 9000
            '/video': {
                target: 'http://localhost:9002',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path
            },
            // 代理 MinIO picture bucket - 用于封面和头像
            '/picture': {
                target: 'http://localhost:9002',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path
            },
            // 代理 MinIO 视频资源
            '/tiktok-user-content': {
                target: 'http://localhost:9002',
                changeOrigin: true,
                secure: false,
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
