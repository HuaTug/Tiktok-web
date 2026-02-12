<template>
  <div class="chat-page flex flex-col wh100 overflow-hidden">
    <header class="chat-header">
      <div class="flex items-center gap-3">
        <el-icon class="chat-header-icon">
          <ChatRound/>
        </el-icon>
        <h1 class="chat-header-title">AI 智能助手</h1>
        <!-- 可用工具标签 -->
        <div v-if="aiTools.length" class="tools-tags">
          <el-tooltip
              v-for="tool in aiTools"
              :key="tool.name"
              :content="tool.description"
              placement="bottom"
          >
            <span class="tool-tag">
              <el-icon :size="12"><MagicStick/></el-icon>
              {{ tool.display_name || tool.name }}
            </span>
          </el-tooltip>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <el-tooltip content="刷新会话列表" placement="bottom">
          <el-button type="text" class="chat-icon-btn" @click="loadSessions" :loading="sessionsLoading">
            <el-icon :size="16">
              <Refresh/>
            </el-icon>
          </el-button>
        </el-tooltip>
        <el-button type="text" class="chat-icon-btn">
          <el-icon :size="16">
            <Setting/>
          </el-icon>
        </el-button>
      </div>
    </header>
    <div class="flex flex-1 relative overflow-hidden">
      <!-- 会话列表 -->
      <div
          class="chat-sidebar"
          :class="showChatList ? 'chat-sidebar-open' : 'chat-sidebar-closed'"
      >
        <div class="p-4 space-y-4">
          <div class="flex items-center justify-between mb-6">
            <h2 class="chat-sidebar-title">会话列表</h2>
            <el-button
                type="primary"
                size="small"
                @click="createNewChat"
            >
              <el-icon class="mr-1">
                <Plus/>
              </el-icon>
              新建会话
            </el-button>
          </div>
          <!-- 加载中 -->
          <div v-if="sessionsLoading" class="sessions-loading">
            <el-icon class="is-loading"><Loading/></el-icon>
            <span>加载会话中...</span>
          </div>
          <div v-else class="space-y-2">
            <div
                v-for="chat in chatList"
                :key="chat.id"
                class="chat-session-item"
                :class="{ 'chat-session-active': currentChatId === chat.id }"
                @click="switchChat(chat.id)"
            >
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <el-icon class="chat-session-icon">
                  <ChatRound/>
                </el-icon>
                <span class="truncate">{{ chat.title }}</span>
              </div>
              <el-button
                  v-if="chatList.length > 1"
                  type="text"
                  class="chat-delete-btn"
                  @click.stop="deleteChat(chat.id)"
              >
                <el-icon>
                  <Delete/>
                </el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>
      <div
          class="flex-1 flex flex-col overflow-hidden chat-main"
          :class="{ 'chat-main-shifted': showChatList }"
      >
        <!-- 聊天区域 -->
        <main
            ref="chatContainer"
            class="flex-1 overflow-y-auto px-4 py-6"
            @scroll="handleScroll"
        >
          <!-- 加载会话消息中 -->
          <div v-if="messagesLoading" class="messages-loading">
            <el-icon class="is-loading" :size="24"><Loading/></el-icon>
            <span>加载历史消息中...</span>
          </div>
          <div v-else class="max-w-4xl mx-auto space-y-6">
            <div
                v-for="(msg, index) in messages"
                :key="index"
                class="flex"
                :class="msg.type === 'user' ? 'justify-end' : 'justify-start'"
            >
              <div
                  class="max-w-[88%] flex items-start gap-3"
                  :class="msg.type === 'user' ? 'flex-row-reverse' : ''"
              >
                <div class="chat-avatar">
                  <img
                      :src="msg.type === 'user' ? userAvatar : aiAvatar"
                      :alt="msg.type"
                      class="w-full h-full object-cover"
                  />
                </div>
                <div
                    class="message-bubble"
                    :class="msg.type === 'user' ? 'message-user' : 'message-ai'"
                >
                  <!-- 工具调用标识 -->
                  <div v-if="msg.tool_calls && msg.tool_calls.length" class="tool-call-info">
                    <div v-for="(tc, ti) in msg.tool_calls" :key="ti" class="tool-call-item">
                      <el-icon :size="12"><MagicStick/></el-icon>
                      <span>调用工具: {{ tc.name }}</span>
                      <el-tag v-if="tc.status === 'success'" type="success" size="small">成功</el-tag>
                      <el-tag v-else-if="tc.status === 'error'" type="danger" size="small">失败</el-tag>
                      <el-tag v-else type="info" size="small">执行中</el-tag>
                    </div>
                  </div>
                  <div v-html="formatMessage(msg.content)"></div>
                </div>
              </div>
            </div>
            <div v-if="isTyping" class="flex justify-start">
              <div class="max-w-[88%] flex items-start gap-3">
                <div class="chat-avatar">
                  <img
                      :src="aiAvatar"
                      alt="ai"
                      class="w-full h-full object-cover"
                  />
                </div>
                <div class="message-bubble message-ai">
                  <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <!-- 输入区域 -->
        <footer class="chat-footer">
          <div class="max-w-4xl mx-auto flex items-end gap-3">
            <el-button
                type="text"
                class="chat-icon-btn"
                @click="showChatList = !showChatList"
            >
              <el-icon class="text-xl">
                <Files/>
              </el-icon>
            </el-button>
            <el-input
                v-model="inputMessage"
                type="textarea"
                :autosize="{ minRows: 1, maxRows: 6 }"
                placeholder="请输入您的问题...（支持视频搜索、热门话题查询、创作建议等）"
                resize="none"
                class="flex-1"
                @keyup.enter.exact.prevent="sendMessage"
            />
            <el-button
                v-if="!isReceiving"
                type="primary"
                :disabled="!inputMessage.trim()"
                class="whitespace-nowrap"
                @click="sendMessage"
            >
              发送
              <el-icon class="ml-1" :size="16">
                <Position/>
              </el-icon>
            </el-button>
            <el-button
                v-else
                type="danger"
                class="whitespace-nowrap"
                @click="stopReceiving"
            >
              <el-icon :size="16">
                <VideoPause/>
              </el-icon>
            </el-button>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { aiChat, deleteAiSession, getAiChatSSEUrl, getAiSession, getAiTools, listAiSessions } from "@/api/ai.js";
import { getToken } from "@/utils/auth.js";
import {
    ChatRound,
    Delete,
    Files,
    Loading,
    MagicStick,
    Plus,
    Position,
    Refresh,
    Setting,
    VideoPause,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { nextTick, onMounted, onUnmounted, ref } from "vue";

const showChatList = ref(false);
const inputMessage = ref("");
const isTyping = ref(false);
const isReceiving = ref(false);
const sessionsLoading = ref(false);
const messagesLoading = ref(false);
const chatContainer = ref(null);
const userAvatar =
    "https://niuyin-server.oss-cn-shenzhen.aliyuncs.com/member/2024/10/07/4eb4963fa6bb4f85aa0ba1f748978993.jpeg";
const aiAvatar =
    "https://public.readdy.ai/ai/img_res/ce5e827dc0be17269a8c7efd4050aba6.jpg";
const currentChatId = ref("");
let chatIdCounter = 0;
const chatList = ref([]);
const messages = ref([]);
const aiTools = ref([]);
let currentXHR = null;

// Generate a unique session ID
const generateSessionId = () => {
  chatIdCounter++;
  return `session_${Date.now()}_${chatIdCounter}`;
};

// Format message content (support markdown-like formatting)
const formatMessage = (content) => {
  if (!content) return '';
  let html = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
    .replace(/---/g, '<hr style="margin: 8px 0; border: 0; border-top: 1px solid var(--border-color);">');
  return html;
};

// ========== 后端 API 交互 ==========

// 加载 AI 可用工具列表
const loadTools = async () => {
  try {
    const res = await getAiTools();
    if (res.code === 200 && res.data) {
      aiTools.value = Array.isArray(res.data) ? res.data : (res.data.tools || []);
    }
  } catch (e) {
    console.warn('加载 AI 工具列表失败:', e);
  }
};

// 从后端加载会话列表
const loadSessions = async () => {
  sessionsLoading.value = true;
  try {
    const res = await listAiSessions();
    if (res.code === 200 && res.data) {
      const sessions = Array.isArray(res.data) ? res.data : (res.data.sessions || []);
      if (sessions.length > 0) {
        chatList.value = sessions.map(s => ({
          id: s.session_id || s.id,
          title: s.title || '未命名会话',
          messages: [],
          loaded: false,
        }));
        // 自动选中第一个会话并加载消息
        await switchChat(chatList.value[0].id);
        showChatList.value = true;
        return true;
      }
    }
    return false;
  } catch (e) {
    console.warn('加载会话列表失败，使用本地会话:', e);
    return false;
  } finally {
    sessionsLoading.value = false;
  }
};

// 从后端加载指定会话的消息
const loadSessionMessages = async (sessionId) => {
  const chat = chatList.value.find(c => c.id === sessionId);
  if (!chat || chat.loaded) return;

  messagesLoading.value = true;
  try {
    const res = await getAiSession(sessionId);
    if (res.code === 200 && res.data) {
      const rawMessages = res.data.messages || res.data.history || [];
      chat.messages = rawMessages.map(m => ({
        type: m.role === 'user' ? 'user' : 'ai',
        content: m.content || '',
        tool_calls: m.tool_calls || [],
      }));
      // 如果会话标题从后端返回了，更新它
      if (res.data.title) {
        chat.title = res.data.title;
      }
      chat.loaded = true;
    }
  } catch (e) {
    console.warn('加载会话消息失败:', e);
    // 如果加载失败，显示默认欢迎消息
    if (chat.messages.length === 0) {
      chat.messages = [{
        type: "ai",
        content: "你好！👋 我是你的AI智能助手，有什么我可以帮你的吗？",
      }];
    }
    chat.loaded = true;
  } finally {
    messagesLoading.value = false;
  }
};

// ========== 会话管理 ==========

const welcomeMessage = "你好！👋 我是你的AI智能助手，我可以帮你：\n\n🔍 **搜索视频** - 告诉我你想找什么内容\n🔥 **查看热门** - 了解当前平台热门话题和趋势\n💡 **创作建议** - 为你提供标题、描述、标签和最佳发布时间建议\n❓ **回答问题** - 关于平台使用的任何问题\n\n有什么我可以帮你的吗？";

// 创建本地默认会话
const initDefaultChat = () => {
  const sessionId = generateSessionId();
  const defaultChat = {
    id: sessionId,
    title: "新会话",
    messages: [{ type: "ai", content: welcomeMessage }],
    loaded: true,
  };
  chatList.value.push(defaultChat);
  currentChatId.value = sessionId;
  messages.value = defaultChat.messages;
};

const createNewChat = () => {
  const sessionId = generateSessionId();
  const newChat = {
    id: sessionId,
    title: `新会话 ${chatList.value.length + 1}`,
    messages: [{ type: "ai", content: "你好！我是你的AI助手，有什么我可以帮你的吗？" }],
    loaded: true,
  };
  chatList.value.push(newChat);
  switchChat(newChat.id);
};

const switchChat = async (chatId) => {
  currentChatId.value = chatId;
  const chat = chatList.value.find((c) => c.id === chatId);
  if (chat) {
    // 如果消息未加载过，从后端拉取
    if (!chat.loaded) {
      await loadSessionMessages(chatId);
    }
    messages.value = chat.messages;
    nextTick(() => {
      scrollToBottom();
    });
  }
};

const deleteChat = (chatId) => {
  if (chatList.value.length === 1) {
    ElMessage.warning("至少保留一个会话");
    return;
  }
  const index = chatList.value.findIndex((c) => c.id === chatId);
  if (index > -1) {
    deleteAiSession(chatId).catch(() => {});
    chatList.value.splice(index, 1);
    if (currentChatId.value === chatId) {
      switchChat(chatList.value[0].id);
    }
  }
};

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

// ========== 发送消息 ==========

// SSE 流式发送
const sendMessageSSE = async (message) => {
  isTyping.value = true;
  isReceiving.value = true;

  const currentChat = chatList.value.find((c) => c.id === currentChatId.value);
  if (!currentChat) return;

  try {
    const sseUrl = getAiChatSSEUrl();
    const token = getToken();

    const xhr = new XMLHttpRequest();
    currentXHR = xhr;

    xhr.open('POST', sseUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    if (token) {
      xhr.setRequestHeader('Access-Token', token);
    }

    let aiMessageIndex = -1;
    let receivedText = '';
    let lastProcessedLength = 0;
    let toolCalls = [];

    currentChat.messages.push({ type: "ai", content: "", tool_calls: [] });
    aiMessageIndex = currentChat.messages.length - 1;
    isTyping.value = false;

    xhr.onprogress = () => {
      const newData = xhr.responseText.substring(lastProcessedLength);
      lastProcessedLength = xhr.responseText.length;

      const lines = newData.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const eventData = JSON.parse(line.substring(6));

            if (eventData.type === 'content') {
              receivedText += eventData.content;
              currentChat.messages[aiMessageIndex].content = receivedText;
              scrollToBottom();
            } else if (eventData.type === 'tool_call') {
              // Agent 工具调用事件
              toolCalls.push({
                name: eventData.tool || eventData.name,
                status: eventData.status || 'running',
                result: eventData.result || '',
              });
              currentChat.messages[aiMessageIndex].tool_calls = [...toolCalls];
              scrollToBottom();
            } else if (eventData.type === 'tool_result') {
              // 工具调用结果
              const idx = toolCalls.findIndex(tc => tc.name === (eventData.tool || eventData.name));
              if (idx >= 0) {
                toolCalls[idx].status = eventData.status || 'success';
                toolCalls[idx].result = eventData.result || '';
                currentChat.messages[aiMessageIndex].tool_calls = [...toolCalls];
              }
              scrollToBottom();
            } else if (eventData.type === 'done') {
              if (eventData.title && currentChat.title.startsWith('新会话')) {
                currentChat.title = eventData.title;
              }
            }
          } catch (e) {
            // Ignore parse errors for incomplete chunks
          }
        }
      }
    };

    xhr.onload = () => {
      isReceiving.value = false;
      currentXHR = null;
      scrollToBottom();
    };

    xhr.onerror = () => {
      console.error('SSE request failed, falling back to non-streaming');
      isReceiving.value = false;
      isTyping.value = false;
      currentXHR = null;

      if (aiMessageIndex >= 0 && currentChat.messages[aiMessageIndex].content === '') {
        currentChat.messages.splice(aiMessageIndex, 1);
      }
      sendMessageNonStreaming(message);
    };

    xhr.send(JSON.stringify({
      session_id: currentChatId.value,
      message: message
    }));

  } catch (error) {
    console.error('SSE setup failed:', error);
    isTyping.value = false;
    isReceiving.value = false;
    sendMessageNonStreaming(message);
  }
};

// 非流式降级发送
const sendMessageNonStreaming = async (message) => {
  isTyping.value = true;
  isReceiving.value = true;

  const currentChat = chatList.value.find((c) => c.id === currentChatId.value);
  if (!currentChat) return;

  try {
    const res = await aiChat({
      session_id: currentChatId.value,
      message: message
    });

    isTyping.value = false;

    if (res.code === 200 && res.data) {
      const aiMsg = {
        type: "ai",
        content: res.data.reply || "抱歉，我暂时无法回答你的问题。",
        tool_calls: res.data.tool_calls || [],
      };
      currentChat.messages.push(aiMsg);

      if (res.data.title && currentChat.title.startsWith('新会话')) {
        currentChat.title = res.data.title;
      }
    } else {
      currentChat.messages.push({
        type: "ai",
        content: "抱歉，服务暂时不可用，请稍后再试。",
      });
    }
  } catch (error) {
    console.error('Chat request failed:', error);
    isTyping.value = false;
    currentChat.messages.push({
      type: "ai",
      content: "网络连接失败，请检查网络后重试。",
    });
  } finally {
    isReceiving.value = false;
    await scrollToBottom();
  }
};

const stopReceiving = () => {
  if (currentXHR) {
    currentXHR.abort();
    currentXHR = null;
  }
  isReceiving.value = false;
  isTyping.value = false;
};

const sendMessage = async () => {
  const message = inputMessage.value.trim();
  if (!message) return;

  const currentChat = chatList.value.find((c) => c.id === currentChatId.value);
  if (currentChat) {
    currentChat.messages.push({ type: "user", content: message });

    // 首条用户消息自动命名会话
    const userMsgCount = currentChat.messages.filter(m => m.type === 'user').length;
    if (userMsgCount === 1) {
      currentChat.title = message.slice(0, 20) + (message.length > 20 ? "..." : "");
    }
  }
  inputMessage.value = "";
  await scrollToBottom();

  await sendMessageSSE(message);
};

const handleScroll = () => {
  if (!chatContainer.value) return;
  const { scrollTop } = chatContainer.value;
  if (scrollTop === 0) {
    // 未来可扩展：加载更多历史消息
  }
};

// ========== 生命周期 ==========

onMounted(async () => {
  // 并行加载工具列表和会话列表
  const [, hasRemoteSessions] = await Promise.all([
    loadTools(),
    loadSessions(),
  ]);
  // 如果后端没有返回会话，创建本地默认会话
  if (!hasRemoteSessions) {
    initDefaultChat();
  }
  scrollToBottom();
});

onUnmounted(() => {
  if (currentXHR) {
    currentXHR.abort();
    currentXHR = null;
  }
});
</script>

<style scoped>
.chat-page {
  border-radius: var(--card-radius);
  background: var(--bg-base);
}

/* Header */
.chat-header {
  width: 100%;
  height: 56px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  padding: 0 20px;
  justify-content: space-between;
  background: var(--bg-elevated);
}

.chat-header-icon {
  color: var(--niuyin-primary-color);
  font-size: 20px;
}

.chat-header-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
}

.chat-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  transition: all var(--transition-fast);
}

.chat-icon-btn:hover {
  background: var(--hover-bg);
  color: var(--niuyin-primary-color);
}

/* Sidebar */
.chat-sidebar {
  width: 280px;
  border-right: 1px solid var(--border-color);
  background: var(--bg-elevated);
  transition: transform 0.3s ease;
  height: 100%;
  position: absolute;
  z-index: 10;
}

.chat-sidebar-open {
  transform: translateX(0);
}

.chat-sidebar-closed {
  transform: translateX(-280px);
}

.chat-sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
}

.chat-session-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.chat-session-item:hover {
  background: var(--hover-bg);
}

.chat-session-active {
  background: var(--active-bg);
  color: var(--niuyin-primary-color);
}

.chat-session-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.chat-session-active .chat-session-icon {
  color: var(--niuyin-primary-color);
}

.chat-delete-btn {
  opacity: 0;
  color: var(--text-muted);
  transition: opacity var(--transition-fast);
}

.chat-session-item:hover .chat-delete-btn {
  opacity: 1;
}

.chat-delete-btn:hover {
  color: #f56c6c;
}

/* Main area */
.chat-main {
  transition: margin-left 0.3s ease;
  background: var(--bg-base);
}

.chat-main-shifted {
  margin-left: 280px;
}

/* Avatar */
.chat-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid var(--border-color);
}

/* Message bubbles */
.message-bubble {
  padding: 12px 16px;
  border-radius: 14px;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 14px;
  line-height: 1.6;
}

.message-user {
  background: var(--niuyin-primary-color);
  color: #fff;
  border-bottom-right-radius: 4px;
  box-shadow: 0 2px 8px rgba(254, 44, 85, 0.15);
}

.message-ai {
  background: var(--bg-elevated);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  border-bottom-left-radius: 4px;
  box-shadow: var(--shadow-sm);
}

.message-bubble :deep(strong) {
  font-weight: 600;
}

.message-bubble :deep(hr) {
  margin: 8px 0;
  border: 0;
  border-top: 1px solid var(--border-color);
}

/* Tools tags in header */
.tools-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-left: 8px;
}

.tool-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  background: var(--hover-bg);
  color: var(--text-secondary);
  border: 1px solid var(--border-color-light);
  cursor: default;
  transition: all var(--transition-fast);
}

.tool-tag:hover {
  color: var(--niuyin-primary-color);
  border-color: var(--niuyin-primary-color);
  background: rgba(254, 44, 85, 0.06);
}

/* Loading states */
.sessions-loading,
.messages-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 0;
  color: var(--text-muted);
  font-size: 13px;
}

/* Tool call info in messages */
.tool-call-info {
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--border-color);
}

.tool-call-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
  padding: 3px 0;
}

.tool-call-item .el-tag {
  margin-left: auto;
}

/* Footer */
.chat-footer {
  border-top: 1px solid var(--border-color);
  padding: 14px 16px;
  background: var(--bg-elevated);
}

/* Typing indicator */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 4px;
}

.typing-indicator span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: var(--text-muted);
  animation: typing 1s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.4s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes typing {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
</style>
