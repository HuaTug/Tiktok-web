// 快速调试工具 - 在浏览器控制台粘贴此代码

console.log('%c=== 🔍 TikTok Web 快速诊断工具 ===', 'color: #00ff00; font-size: 16px; font-weight: bold;');
console.log('');

// 1. 检查Cookies
console.log('%c1️⃣ 检查 Cookies', 'color: #00bfff; font-weight: bold;');
const cookies = document.cookie;
if (cookies) {
    const hasToken = cookies.includes('token=');
    console.log('  Cookies内容:', cookies);
    console.log('  包含token:', hasToken ? '✅ 是' : '❌ 否');
    if (hasToken) {
        const token = cookies.split('token=')[1]?.split(';')[0];
        console.log('  Token值:', token?.substring(0, 50) + '...');
    }
} else {
    console.log('  ❌ Cookies为空');
}
console.log('');

// 2. 检查localStorage
console.log('%c2️⃣ 检查 localStorage', 'color: #00bfff; font-weight: bold;');
const lsKeys = Object.keys(localStorage);
if (lsKeys.length > 0) {
    console.log('  localStorage keys:', lsKeys);
    lsKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
            try {
                const parsed = JSON.parse(value);
                console.log(`  ${key}:`, parsed);
            } catch {
                console.log(`  ${key}:`, value.substring(0, 50) + '...');
            }
        }
    });
} else {
    console.log('  ⚠️ localStorage为空');
}
console.log('');

// 3. 检查sessionStorage
console.log('%c3️⃣ 检查 sessionStorage', 'color: #00bfff; font-weight: bold;');
const ssKeys = Object.keys(sessionStorage);
if (ssKeys.length > 0) {
    console.log('  sessionStorage keys:', ssKeys);
    ssKeys.forEach(key => {
        const value = sessionStorage.getItem(key);
        console.log(`  ${key}:`, value?.substring(0, 50) + '...');
    });
} else {
    console.log('  ⚠️ sessionStorage为空');
}
console.log('');

// 4. 测试API连接
console.log('%c4️⃣ 测试后端API连接', 'color: #00bfff; font-weight: bold;');
const testAPI = async () => {
    try {
        // 测试不需要认证的接口（应该返回401或10013）
        const response = await fetch('http://localhost:8888/v2/video/feed');
        const data = await response.json();
        console.log('  API响应状态:', response.status);
        console.log('  API响应code:', data.code);
        console.log('  API响应message:', data.message);
        
        if (data.code === 10013 || data.code === 401) {
            console.log('  ✅ 后端服务正常运行（需要认证）');
        } else if (data.code === 10000 || data.code === 0) {
            console.log('  ✅ 后端服务正常运行（返回数据）');
        } else {
            console.log('  ⚠️ 后端返回未知状态:', data.code);
        }
    } catch (error) {
        console.log('  ❌ 后端服务连接失败:', error.message);
        console.log('  请检查后端是否在 http://localhost:8888 运行');
    }
};
testAPI();

// 5. 提供清除缓存的函数
console.log('');
console.log('%c5️⃣ 清除缓存', 'color: #00bfff; font-weight: bold;');
console.log('  如需清除所有缓存，请运行: clearAll()');
window.clearAll = function() {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach(c => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    console.log('%c✅ 所有缓存已清除！请刷新页面。', 'color: #00ff00; font-weight: bold;');
};

// 6. 提供手动设置token的函数（用于测试）
console.log('');
console.log('%c6️⃣ 手动测试工具', 'color: #00bfff; font-weight: bold;');
console.log('  测试登录: testLogin("username", "password")');
window.testLogin = async function(username, password) {
    console.log('🔐 测试登录:', username);
    try {
        const response = await fetch('http://localhost:8888/v1/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        console.log('登录响应:', data);
        
        if (data.data && data.data.token) {
            console.log('%c✅ 登录成功！', 'color: #00ff00; font-weight: bold;');
            console.log('Token:', data.data.token);
            
            // 保存token
            document.cookie = `token=${data.data.token}; path=/; max-age=259200`;
            console.log('✅ Token已保存到Cookies');
            
            // 尝试保存到localStorage
            try {
                localStorage.setItem('token', JSON.stringify({token: data.data.token}));
                console.log('✅ Token已保存到localStorage');
            } catch (e) {
                console.warn('⚠️ 无法保存到localStorage:', e);
            }
            
            console.log('%c请刷新页面以应用更改', 'color: #ffff00; font-weight: bold;');
        } else {
            console.log('%c❌ 登录失败！', 'color: #ff0000; font-weight: bold;');
            console.log('错误:', data.data?.base?.msg || data.message);
        }
    } catch (error) {
        console.log('%c❌ 登录请求失败！', 'color: #ff0000; font-weight: bold;');
        console.log('错误:', error);
    }
};

console.log('');
console.log('%c=== 📋 诊断完成 ===', 'color: #00ff00; font-size: 16px; font-weight: bold;');
console.log('');
console.log('%c可用命令:', 'color: #ffff00; font-weight: bold;');
console.log('  clearAll() - 清除所有缓存');
console.log('  testLogin("username", "password") - 测试登录');
console.log('');
console.log('%c测试账号:', 'color: #ffff00; font-weight: bold;');
console.log('  用户名: testuser');
console.log('  密码: test123456');
console.log('  示例: testLogin("testuser", "test123456")');
