import { defineStore } from "pinia";
import { ref, computed } from "vue";

export interface ChatMessage {
    type: "user" | "ai";
    content: string;
    timestamp?: number;
}

export interface ChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: number;
    updatedAt: number;
}

export const useAiChatStore = defineStore(
    "aiChat",
    () => {
        const chatList = ref<ChatSession[]>([]);
        const currentChatId = ref<string>("");
        const availableTools = ref<any[]>([]);
        let chatIdCounter = 0;

        // 当前会话
        const currentChat = computed(() =>
            chatList.value.find((c) => c.id === currentChatId.value) || null
        );

        // 当前消息列表
        const currentMessages = computed(() =>
            currentChat.value?.messages || []
        );

        // 生成唯一 session ID
        const generateSessionId = () => {
            chatIdCounter++;
            return `session_${Date.now()}_${chatIdCounter}`;
        };

        // 创建新会话
        const createChat = (title?: string): string => {
            const sessionId = generateSessionId();
            const newChat: ChatSession = {
                id: sessionId,
                title: title || `新会话 ${chatList.value.length + 1}`,
                messages: [
                    {
                        type: "ai",
                        content: buildWelcomeMessage(),
                        timestamp: Date.now(),
                    },
                ],
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
            chatList.value.unshift(newChat);
            currentChatId.value = sessionId;
            return sessionId;
        };

        // 构建欢迎消息（基于可用工具动态生成）
        const buildWelcomeMessage = (): string => {
            const toolDescriptions = availableTools.value.length > 0
                ? availableTools.value
                    .map((t) => `- **${t.name}**：${t.description}`)
                    .join("\n")
                : "";

            let msg = "你好！👋 我是你的 AI 智能助手，我可以帮你：\n\n";
            msg += "🔍 **搜索视频** — 告诉我你想找什么内容\n";
            msg += "🔥 **查看热门** — 了解当前平台热门话题和趋势\n";
            msg += "💡 **创作建议** — 为你提供标题、描述、标签和最佳发布时间建议\n";
            msg += "❓ **回答问题** — 关于平台使用的任何问题\n";

            if (toolDescriptions) {
                msg += "\n---\n📦 **当前可用工具**：\n" + toolDescriptions;
            }

            msg += "\n\n有什么我可以帮你的吗？";
            return msg;
        };

        // 切换会话
        const switchChat = (chatId: string) => {
            currentChatId.value = chatId;
        };

        // 删除会话
        const removeChat = (chatId: string) => {
            const index = chatList.value.findIndex((c) => c.id === chatId);
            if (index > -1) {
                chatList.value.splice(index, 1);
                // 如果删除的是当前会话，切换到第一个
                if (currentChatId.value === chatId && chatList.value.length > 0) {
                    currentChatId.value = chatList.value[0].id;
                }
            }
        };

        // 追加用户消息
        const addUserMessage = (content: string) => {
            const chat = currentChat.value;
            if (!chat) return;
            chat.messages.push({
                type: "user",
                content,
                timestamp: Date.now(),
            });
            chat.updatedAt = Date.now();

            // 首条用户消息自动命名会话
            const userMsgCount = chat.messages.filter((m) => m.type === "user").length;
            if (userMsgCount === 1) {
                chat.title = content.slice(0, 20) + (content.length > 20 ? "..." : "");
            }
        };

        // 追加 AI 消息占位
        const addAiMessagePlaceholder = (): number => {
            const chat = currentChat.value;
            if (!chat) return -1;
            chat.messages.push({
                type: "ai",
                content: "",
                timestamp: Date.now(),
            });
            chat.updatedAt = Date.now();
            return chat.messages.length - 1;
        };

        // 更新 AI 消息内容（流式追加）
        const updateAiMessage = (index: number, content: string) => {
            const chat = currentChat.value;
            if (!chat || index < 0 || index >= chat.messages.length) return;
            chat.messages[index].content = content;
            chat.updatedAt = Date.now();
        };

        // 移除指定索引的消息
        const removeMessage = (index: number) => {
            const chat = currentChat.value;
            if (!chat || index < 0 || index >= chat.messages.length) return;
            chat.messages.splice(index, 1);
        };

        // 更新会话标题
        const updateChatTitle = (chatId: string, title: string) => {
            const chat = chatList.value.find((c) => c.id === chatId);
            if (chat) {
                chat.title = title;
                chat.updatedAt = Date.now();
            }
        };

        // 设置可用工具
        const setTools = (tools: any[]) => {
            availableTools.value = tools;
        };

        // 从后端加载会话列表（合并到本地）
        const loadSessionsFromServer = (serverSessions: any[]) => {
            if (!serverSessions || serverSessions.length === 0) return;

            for (const s of serverSessions) {
                const exists = chatList.value.find((c) => c.id === s.session_id);
                if (!exists) {
                    chatList.value.push({
                        id: s.session_id,
                        title: s.title || "未命名会话",
                        messages: [],
                        createdAt: s.created_at ? new Date(s.created_at).getTime() : Date.now(),
                        updatedAt: s.updated_at ? new Date(s.updated_at).getTime() : Date.now(),
                    });
                }
            }

            // 按更新时间排序，最近的在前
            chatList.value.sort((a, b) => b.updatedAt - a.updatedAt);
        };

        // 从后端加载会话消息
        const loadMessagesFromServer = (chatId: string, serverMessages: any[]) => {
            const chat = chatList.value.find((c) => c.id === chatId);
            if (!chat || !serverMessages) return;

            chat.messages = serverMessages.map((m: any) => ({
                type: m.role === "user" ? "user" : "ai",
                content: m.content || "",
                timestamp: m.created_at ? new Date(m.created_at).getTime() : Date.now(),
            }));

            // 如果没有消息，添加欢迎消息
            if (chat.messages.length === 0) {
                chat.messages.push({
                    type: "ai",
                    content: buildWelcomeMessage(),
                    timestamp: Date.now(),
                });
            }
        };

        // 确保至少有一个会话
        const ensureDefaultChat = () => {
            if (chatList.value.length === 0) {
                createChat("默认会话");
            } else if (!currentChatId.value || !chatList.value.find(c => c.id === currentChatId.value)) {
                currentChatId.value = chatList.value[0].id;
            }
        };

        return {
            chatList,
            currentChatId,
            availableTools,
            currentChat,
            currentMessages,
            generateSessionId,
            createChat,
            switchChat,
            removeChat,
            addUserMessage,
            addAiMessagePlaceholder,
            updateAiMessage,
            removeMessage,
            updateChatTitle,
            setTools,
            loadSessionsFromServer,
            loadMessagesFromServer,
            ensureDefaultChat,
        };
    },
    {
        persist: true,
    }
);
