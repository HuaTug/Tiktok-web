<template>
  <div class="flex flex-col wh100 b-radius1 overflow-hidden">
    <header
        class="w-full h-[60px] border-b border-gray-100 flex items-center px-6 justify-between"
    >
      <div class="flex items-center gap-3">
        <el-icon class="text-blue-500 text-xl">
          <ChatRound/>
        </el-icon>
        <h1 class="text-lg font-medium">AI 智能助手</h1>
      </div>
      <div class="flex items-center gap-4">
        <el-button type="text" class="!rounded-button">
          <el-icon :size="16">
            <Setting/>
          </el-icon>
        </el-button>
      </div>
    </header>
    <div class="flex flex-1 relative overflow-hidden">
      <!-- 会话列表 -->
      <div
          class="w-[300px] border-r border-gray-100 transition-all duration-300 ease-in-out transform h-full absolute z-10"
          :class="showChatList ? 'translate-x-0' : '-translate-x-[300px]'"
      >
        <div class="p-4 space-y-4">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-medium">会话列表</h2>
            <el-button
                type="primary"
                class="!rounded-button"
                @click="createNewChat"
            >
              <el-icon class="mr-1">
                <Plus/>
              </el-icon>
              新建会话
            </el-button>
          </div>
          <div class="space-y-2">
            <div
                v-for="chat in chatList"
                :key="chat.id"
                class="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-100"
                :class="{ 'bg-blue-50': currentChatId === chat.id }"
                @click="switchChat(chat.id)"
            >
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <el-icon>
                  <ChatRound/>
                </el-icon>
                <span class="truncate">{{ chat.title }}</span>
              </div>
              <el-button
                  v-if="chatList.length > 1"
                  type="text"
                  class="!rounded-button"
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
          class="flex-1 flex flex-col overflow-hidden"
          :class="{ 'ml-[300px]': showChatList }"
          style="transition: .3s all"
      >
        <!-- 聊天区域 -->
        <main
            ref="chatContainer"
            class="flex-1 overflow-y-auto px-4 py-6"
            @scroll="handleScroll"
        >
          <div class="max-w-4xl mx-auto space-y-6">
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
                <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <img
                      :src="msg.type === 'user' ? userAvatar : aiAvatar"
                      :alt="msg.type"
                      class="w-full h-full object-cover"
                  />
                </div>
                <div
                    class="message-bubble"
                    :class="msg.type === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'"
                    v-html="formatMessage(msg.content)"
                >
                </div>
              </div>
            </div>
            <div v-if="isTyping" class="flex justify-start">
              <div class="max-w-[88%] flex items-start gap-3">
                <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <img
                      :src="aiAvatar"
                      alt="ai"
                      class="w-full h-full object-cover"
                  />
                </div>
                <div class="message-bubble bg-white text-gray-800">
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
        <footer class="border-t border-gray-100 p-4">
          <div class="max-w-4xl mx-auto flex items-end gap-4">
            <el-button
                type="text"
                class="!rounded-button"
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
                placeholder="请输入您的问题..."
                resize="none"
                class="flex-1 !rounded-button"
                @keyup.enter.exact.prevent="sendMessage"
            />
            <el-button
                v-if="!isReceiving"
                type="primary"
                :disabled="!inputMessage.trim()"
                class=" !rounded-button whitespace-nowrap"
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
                class=" !rounded-button whitespace-nowrap"
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
import { aiChat, deleteAiSession } from "@/api/ai.js";
import { getToken } from "@/utils/auth.js";
import {
    ChatRound,
    Delete,
    Files,
    Plus,
    Position,
    Setting,
    VideoPause,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { nextTick, onMounted, onUnmounted, ref } from "vue";

const showChatList = ref(false);
const inputMessage = ref("");
const isTyping = ref(false);
const isReceiving = ref(false);
const chatContainer = ref(null);
const userAvatar =
    "https://niuyin-server.oss-cn-shenzhen.aliyuncs.com/member/2024/10/07/4eb4963fa6bb4f85aa0ba1f748978993.jpeg";
const aiAvatar =
    "https://public.readdy.ai/ai/img_res/ce5e827dc0be17269a8c7efd4050aba6.jpg";
const currentChatId = ref("");
let chatIdCounter = 0;
const chatList = ref([]);
const messages = ref([]);
let currentXHR = null; // For aborting SSE requests

// Generate a unique session ID
const generateSessionId = () => {
  chatIdCounter++;
  return `session_${Date.now()}_${chatIdCounter}`;
};

// Format message content (support markdown-like formatting)
const formatMessage = (content) => {
  if (!content) return '';
  // Basic markdown-like formatting
  let html = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
    .replace(/---/g, '<hr style="margin: 8px 0; border: 0; border-top: 1px solid #e5e7eb;">');
  return html;
};

// Initialize with a default chat
const initDefaultChat = () => {
  const sessionId = generateSessionId();
  const defaultChat = {
    id: sessionId,
    title: "默认会话",
    messages: [
      {
        type: "ai",
        content: "你好！👋 我是你的AI智能助手，我可以帮你：\n\n🔍 **搜索视频** - 告诉我你想找什么内容\n🔥 **查看热门** - 了解当前平台热门话题和趋势\n💡 **创作建议** - 为你提供标题、描述、标签和最佳发布时间建议\n❓ **回答问题** - 关于平台使用的任何问题\n\n有什么我可以帮你的吗？",
      },
    ],
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
    messages: [
      {
        type: "ai",
        content: "你好！我是你的AI助手，有什么我可以帮你的吗？",
      },
    ],
  };
  chatList.value.push(newChat);
  switchChat(newChat.id);
};

const switchChat = (chatId) => {
  currentChatId.value = chatId;
  const chat = chatList.value.find((c) => c.id === chatId);
  if (chat) {
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
    // Also delete from backend
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

// Send message via SSE streaming
const sendMessageSSE = async (message) => {
  isTyping.value = true;
  isReceiving.value = true;

  const currentChat = chatList.value.find((c) => c.id === currentChatId.value);
  if (!currentChat) return;

  try {
    const baseURL = import.meta.env.VITE_API_BASE_URL || '';
    const token = getToken();
    
    // Use XMLHttpRequest for streaming POST request
    const xhr = new XMLHttpRequest();
    currentXHR = xhr;
    
    xhr.open('POST', `${baseURL}/v1/ai/chat/stream`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    if (token) {
      xhr.setRequestHeader('Access-Token', token);
    }
    
    let aiMessageIndex = -1;
    let receivedText = '';
    let lastProcessedLength = 0;
    
    // Add empty AI message placeholder
    currentChat.messages.push({
      type: "ai",
      content: "",
    });
    aiMessageIndex = currentChat.messages.length - 1;
    isTyping.value = false;
    
    xhr.onprogress = () => {
      const newData = xhr.responseText.substring(lastProcessedLength);
      lastProcessedLength = xhr.responseText.length;
      
      // Parse SSE events
      const lines = newData.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const eventData = JSON.parse(line.substring(6));
            
            if (eventData.type === 'content') {
              receivedText += eventData.content;
              currentChat.messages[aiMessageIndex].content = receivedText;
              scrollToBottom();
            } else if (eventData.type === 'done') {
              // Update session title if provided
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
      
      // Fallback to non-streaming
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

// Fallback: send message without streaming
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
      currentChat.messages.push({
        type: "ai",
        content: res.data.reply || "抱歉，我暂时无法回答你的问题。",
      });
      
      // Update title
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
    currentChat.messages.push({
      type: "user",
      content: message,
    });
    
    // Auto-name session from first user message
    const userMsgCount = currentChat.messages.filter(m => m.type === 'user').length;
    if (userMsgCount === 1) {
      currentChat.title =
          message.slice(0, 20) + (message.length > 20 ? "..." : "");
    }
  }
  inputMessage.value = "";
  await scrollToBottom();
  
  // Try SSE streaming first, fallback to non-streaming
  await sendMessageSSE(message);
};

const handleScroll = () => {
  if (!chatContainer.value) return;
  const {scrollTop} = chatContainer.value;
  if (scrollTop === 0) {
    // Load more history messages if needed
  }
};

onMounted(() => {
  initDefaultChat();
  scrollToBottom();
});

onUnmounted(() => {
  // Cleanup
  if (currentXHR) {
    currentXHR.abort();
    currentXHR = null;
  }
});
</script>

<style scoped>
.message-bubble {
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  white-space: pre-wrap;
  word-break: break-word;
}

.message-bubble :deep(strong) {
  font-weight: 600;
}

.message-bubble :deep(hr) {
  margin: 8px 0;
  border: 0;
  border-top: 1px solid #e5e7eb;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #94a3b8;
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
