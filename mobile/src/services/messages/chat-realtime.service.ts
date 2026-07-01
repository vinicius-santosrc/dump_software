import chatService from './chat.service';
import { useInboxStore } from '@/store/inbox.store';
import messagesService from './messages.service';

function normalizeId(value: any): string {
    return String(value ?? "");
}

function getCurrentUserId(user: any): string {
    return normalizeId(user?.id ?? user?._id ?? user?.userId ?? user?.sub ?? "");
}

function getConversationId(data: any): string {
    return normalizeId(
        data?.conversationId ??
        data?.conversation_id ??
        data?.conversation?.id ??
        data?.conversation?._id ??
        data?.id ??
        data?._id ??
        ""
    );
}

function getSenderId(data: any): string {
    return normalizeId(
        data?.senderId ??
        data?.sender_id ??
        data?.sender?.id ??
        data?.sender?._id ??
        data?.userId ??
        data?.user_id ??
        data?.user?.id ??
        data?.user?._id ??
        ""
    );
}

class ChatRealtimeService {
    private initialized = false;
    private initializingPromise: Promise<void> | null = null;
    private currentUser: any = null;

    async init(user: any) {
        const userId = getCurrentUserId(user);
        if (!userId) return;

        this.currentUser = user;

        if (this.initialized) return;

        if (this.initializingPromise) {
            return this.initializingPromise;
        }

        this.initializingPromise = (async () => {
            await chatService.startConnection(userId);

            this.registerHandlers();
            await this.syncOnlineUsers();

            this.initialized = true;
            this.initializingPromise = null;
        })().catch(error => {
            this.initialized = false;
            this.initializingPromise = null;
            throw error;
        });

        return this.initializingPromise;
    }

    async destroy() {
        this.initialized = false;
        this.initializingPromise = null;
        this.currentUser = null;
        useInboxStore.getState().clearActiveConversation();
    }

    setCurrentUser(user: any) {
        this.currentUser = user;
    }

    async setActiveConversation(conversationId: string | null) {
        const store = useInboxStore.getState();

        if (!conversationId) {
            store.clearActiveConversation();
            return;
        }

        const normalizedConversationId = normalizeId(conversationId);
        const userId = getCurrentUserId(this.currentUser);

        store.setActiveConversation({ id: normalizedConversationId } as any);

        if (userId) {
            store.markConversationAsRead(normalizedConversationId, userId);
            messagesService.markConversationAsReadInCache(normalizedConversationId, userId);
        }

        await this.ensureReady();
        await chatService.joinConversation(normalizedConversationId);

        if (userId) {
            await this.markConversationAsRead(normalizedConversationId, userId);
        }
    }

    async sendMessage(data: any) {
        return chatService.sendMessage(data);
    }

    async typing(conversationId: string) {
        const userId = getCurrentUserId(this.currentUser);
        const normalizedConversationId = normalizeId(conversationId);
        if (!normalizedConversationId || !userId) return;

        await this.ensureReady();
        return chatService.typing(normalizedConversationId, userId);
    }

    async stopTyping(conversationId: string) {
        const userId = getCurrentUserId(this.currentUser);
        const normalizedConversationId = normalizeId(conversationId);
        if (!normalizedConversationId || !userId) return;

        await this.ensureReady();
        return chatService.stopTyping(normalizedConversationId, userId);
    }

    private async ensureReady() {
        if (this.initialized) {
            return;
        }

        if (this.initializingPromise) {
            await this.initializingPromise;
            return;
        }

        if (this.currentUser) {
            await this.init(this.currentUser);
        }
    }

    private async markConversationAsRead(conversationId: string, userId: string) {
        try {
            const store = useInboxStore.getState();
            const messageIds = store.activeMessages
                .filter((message: any) => {
                    const messageConversationId = getConversationId(message);
                    const senderId = getSenderId(message);
                    const readBy = message?.readBy ?? message?.readyBy ?? [];

                    return messageConversationId === conversationId &&
                        senderId !== userId &&
                        !readBy.includes(userId);
                })
                .map((message: any) => normalizeId(message?.id ?? message?._id ?? message?.messageId ?? message?.message_id))
                .filter((messageId: string) => messageId && !messageId.startsWith('temp-'));

            if (messageIds.length === 0) {
                return;
            }

            await chatService.markMessagesAsRead(messageIds, userId);
        } catch (error) {
            console.warn('[CHAT_REALTIME] markConversationAsRead failed', error);
        }
    }

    private async syncOnlineUsers() {
        try {
            const onlineUsers = await chatService.getOnlineUsers();
            const store = useInboxStore.getState();

            onlineUsers.forEach((userId: string) => {
                store.setUserOnline(userId);
            });
        } catch (error) {
            console.warn('[CHAT_REALTIME] syncOnlineUsers failed', error);
        }
    }

    private registerHandlers() {
        chatService.onReceiveMessage((raw: any) => {
            const msg = {
                ...raw,
                senderId: getSenderId(raw),
                conversationId: getConversationId(raw)
            };

            this.handleMessage(msg);
        });

        chatService.onMessageRead((data: any) => {
            const conversationId = getConversationId(data);
            const userId = getSenderId(data);

            if (!conversationId || !userId) {
                return;
            }

            useInboxStore.getState().markConversationAsRead(conversationId, userId);
        });

        chatService.onUserOnline((userId: string) => {
            useInboxStore.getState().setUserOnline(userId);
        });

        chatService.onUserOffline((userId: string) => {
            useInboxStore.getState().setUserOffline(userId);
        });

        chatService.onTyping((data: any) => {
            const conversationId = getConversationId(data);
            const userId = getSenderId(data);

            if (!conversationId || !userId) {
                return;
            }

            useInboxStore.getState().setTyping(conversationId, userId);
        });

        chatService.onStopTyping((data: any) => {
            const conversationId = getConversationId(data);
            const userId = getSenderId(data);

            if (!conversationId || !userId) {
                return;
            }

            useInboxStore.getState().stopTyping(conversationId, userId);
        });
    }

    private handleMessage(msg: any) {
        if (!msg?.conversationId) {
            return;
        }

        const store = useInboxStore.getState();
        const currentConversationId = store.getActiveConversation();
        const userId = getCurrentUserId(this.currentUser);
        const conversationId = getConversationId(msg);
        const senderId = getSenderId(msg);
        const activeConversationId = normalizeId(currentConversationId);

        const isMyMessage = senderId === userId;
        const isActiveChat = Boolean(activeConversationId) && activeConversationId === conversationId;
        const shouldIncrementUnread = Boolean(!isMyMessage && !isActiveChat && userId);

        msg.conversationId = conversationId;
        msg.senderId = senderId;

        store.updateLastMessage(conversationId, msg);

        if (shouldIncrementUnread && userId) {
            store.incrementUnread(conversationId, userId);
        }

        if (isActiveChat) {
            store.appendMessage(msg);

            if (!isMyMessage && userId) {
                store.markConversationAsRead(conversationId, userId);
                messagesService.markConversationAsReadInCache(conversationId, userId);
                this.markConversationAsRead(conversationId, userId);
            }
        }

        messagesService.upsertMessageInCache(conversationId, msg);
        messagesService.updateConversationLastMessageInCache(conversationId, msg, userId, shouldIncrementUnread);
    }
}

const chatRealtimeService = new ChatRealtimeService();

export { chatRealtimeService, ChatRealtimeService };
export default chatRealtimeService;
