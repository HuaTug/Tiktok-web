// 清理脚本 - 清除无效头像和重新获取用户信息
console.log('🧹 开始清理...')

// 1. 清理所有存储
localStorage.clear()
sessionStorage.clear()

// 清理所有cookies
document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/");
});

console.log('✅ 清理完成，即将重新加载页面...')

// 2. 重新加载页面
setTimeout(() => {
    location.reload()
}, 1000)