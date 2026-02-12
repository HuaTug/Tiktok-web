import request from '@/utils/request'

// ========== AI Chat API ==========

// Send a chat message (non-streaming)
export function aiChat(data) {
    return request({
        url: '/v1/ai/chat',
        method: 'post',
        data: data
    })
}

// Send a chat message via SSE (streaming) - returns the EventSource URL
export function getAiChatSSEUrl() {
    const baseURL = import.meta.env.VITE_API_BASE_URL || ''
    return `${baseURL}/v1/ai/chat/stream`
}

// List all chat sessions
export function listAiSessions() {
    return request({
        url: '/v1/ai/sessions',
        method: 'get',
    })
}

// Get a specific session with messages
export function getAiSession(sessionId) {
    return request({
        url: '/v1/ai/session',
        method: 'get',
        params: { session_id: sessionId }
    })
}

// Delete a chat session
export function deleteAiSession(sessionId) {
    return request({
        url: '/v1/ai/session',
        method: 'delete',
        params: { session_id: sessionId }
    })
}

// Get available AI tools
export function getAiTools() {
    return request({
        url: '/v1/ai/tools',
        method: 'get',
    })
}
