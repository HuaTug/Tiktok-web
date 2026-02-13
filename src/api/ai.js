import request from '@/utils/request'

// ========== AI Agent Chat API (Eino-based with RAG + ReAct) ==========

// Send a chat message (non-streaming) via Eino Agent
export function aiChat(data) {
    return request({
        url: '/v1/agent/chat',
        method: 'post',
        data: data
    })
}

// Send a chat message via SSE (streaming) - returns the EventSource URL
export function getAiChatSSEUrl() {
    const baseURL = import.meta.env.VITE_API_BASE_URL || ''
    return `${baseURL}/v1/agent/chat/stream`
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

// Check AI Agent health (Eino agent + Ollama + Milvus status)
export function getAiHealth() {
    return request({
        url: '/v1/agent/health',
        method: 'get',
    })
}

// Upload a document to the knowledge base
export function uploadKnowledgeDoc(file) {
    const formData = new FormData()
    formData.append('file', file)
    return request({
        url: '/v1/agent/knowledge/upload',
        method: 'post',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
    })
}

// Trigger re-indexing of knowledge base documents
export function reindexKnowledge() {
    return request({
        url: '/v1/agent/knowledge/reindex',
        method: 'post',
    })
}
