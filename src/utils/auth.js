import Cookies from 'js-cookie'

const TokenKey = 'token'

export function hasToken() {
    return getToken() != null || getToken() != undefined || getToken() != ''
}

export function getToken() {
    console.log('🍪 [AUTH] getToken被调用')
    
    // 方式1: 从Cookies读取
    let token = Cookies.get(TokenKey)
    console.log('🍪 [AUTH] 从Cookies读取:', token ? `${token.substring(0, 30)}...` : '❌ 无')
    
    // 方式2: 如果Cookies没有，尝试从localStorage读取
    if (!token) {
        // 先尝试从'token'键读取（auth.js保存的）
        let storedValue = localStorage.getItem(TokenKey)
        console.log('🍪 [AUTH] localStorage[token]:', storedValue ? (storedValue.substring(0, 50) + '...') : '❌ 无')
        
        // 如果'token'键没有，尝试从'tokenX'键读取（Pinia persist保存的）
        if (!storedValue) {
            storedValue = localStorage.getItem('tokenX')
            console.log('🍪 [AUTH] localStorage[tokenX]:', storedValue ? (storedValue.substring(0, 50) + '...') : '❌ 无')
        }
        
        if (storedValue) {
            // 处理可能的JSON格式
            try {
                const parsed = JSON.parse(storedValue)
                // 如果是对象，取token字段；否则使用原值
                token = parsed.token || parsed
                console.log('🍪 [AUTH] 解析JSON后的token:', token ? `${token.substring(0, 30)}...` : '❌ 无')
            } catch {
                // 如果不是JSON，直接使用
                token = storedValue
                console.log('🍪 [AUTH] 直接使用的token:', token ? `${token.substring(0, 30)}...` : '❌ 无')
            }
            
            // 确保token是字符串且不是对象
            if (token && typeof token === 'object') {
                token = token.token || JSON.stringify(token)
                console.log('🍪 [AUTH] token是对象，提取后:', token ? `${token.substring(0, 30)}...` : '❌ 无')
            }
            
            // 如果localStorage有，同步回Cookies（使用纯token字符串）
            if (token && typeof token === 'string' && token.length > 20) {
                console.log('🍪 [AUTH] 从localStorage恢复token到Cookies')
                Cookies.set(TokenKey, token, {
                    expires: 3,
                    path: '/',
                    sameSite: 'Lax'
                })
            }
        }
    }
    
    const returnToken = (token && typeof token === 'string') ? token : null
    console.log('🍪 [AUTH] 最终返回token:', returnToken ? `${returnToken.substring(0, 30)}...` : '❌ 无')
    console.log('🍪 [AUTH] token类型:', typeof returnToken)
    
    return returnToken
}

export function setToken(token) {
    console.log('🍪 [AUTH] setToken被调用')
    console.log('🍪 [AUTH] 要保存的token:', token)
    console.log('🍪 [AUTH] token类型:', typeof token)
    console.log('🍪 [AUTH] token长度:', token?.length)
    
    // 尝试多种方式保存token
    
    // 方式1: 使用js-cookie（原有方式）
    const result1 = Cookies.set(TokenKey, token, {
        expires: 3,  // 3天过期
        path: '/',
        sameSite: 'Lax'
    })
    console.log('🍪 [AUTH] 方式1 Cookies.set返回值:', result1)
    
    // 方式2: 直接使用document.cookie（备用方式）
    try {
        const expires = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toUTCString()
        document.cookie = `${TokenKey}=${token}; expires=${expires}; path=/; SameSite=Lax`
        console.log('🍪 [AUTH] 方式2 document.cookie直接设置完成')
    } catch (e) {
        console.error('🍪 [AUTH] 方式2失败:', e)
    }
    
    // 方式3: 同时保存到localStorage作为备份
    try {
        localStorage.setItem(TokenKey, token)
        console.log('🍪 [AUTH] 方式3 localStorage备份完成')
    } catch (e) {
        console.error('🍪 [AUTH] 方式3失败:', e)
    }
    
    console.log('🍪 [AUTH] 保存后立即读取:')
    console.log('  - Cookies.get:', Cookies.get(TokenKey))
    console.log('  - document.cookie:', document.cookie)
    console.log('  - localStorage:', localStorage.getItem(TokenKey))
    
    return result1
}

export function removeToken() {
    console.log('🍪 [AUTH] removeToken被调用')
    Cookies.remove(TokenKey)
    localStorage.removeItem(TokenKey)
    console.log('🍪 [AUTH] Token已从Cookies和localStorage中移除')
    return true
}
