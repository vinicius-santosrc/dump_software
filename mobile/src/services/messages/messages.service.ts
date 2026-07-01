import { API_CONFIG } from "@/config/api";

export type MessageRequestOptions = {
    forceRefresh?: boolean;
    before?: string | null;
    limit?: number;
};

class MessagesService {
    private readonly conversationsCache = new Map<string, any[]>();
    private readonly messagesCache = new Map<string, any[]>();
    private readonly messagesRequestCache = new Map<string, Promise<any[]>>();

    async getConversationsByUserId(userId: string, forceRefresh: boolean = false): Promise<any[]> {
        const cached = this.conversationsCache.get(userId);

        if (cached && !forceRefresh) {
            return cached;
        }

        const response = await this.request<any[]>(
            `${API_CONFIG.baseUrl}/messages/conversation/user/${userId}`
        );

        const conversations = response ?? [];
        this.conversationsCache.set(userId, conversations);

        return conversations;
    }

    async getMessages(
        conversationId: string,
        options: MessageRequestOptions = {}
    ): Promise<any[]> {
        const {
            forceRefresh = false,
            before = null,
            limit = 25
        } = options;

        const requestCacheKey = `${conversationId}:${before ?? 'latest'}:${limit}`;

        if (!before) {
            const cached = this.messagesCache.get(conversationId);

            if (cached && !forceRefresh) {
                return this.normalizeMessages(cached);
            }
        }

        if (!forceRefresh && this.messagesRequestCache.has(requestCacheKey)) {
            return this.messagesRequestCache.get(requestCacheKey)!;
        }

        const queryParams = new URLSearchParams({
            limit: String(limit)
        });

        if (before) {
            queryParams.append('before', before);
        }

        const request = this.request<any[]>(
            `${API_CONFIG.baseUrl}/messages/${conversationId}?${queryParams.toString()}`
        ).then(response => {
            const normalizedResponse = this.normalizeMessages(response ?? []);

            if (!before) {
                this.messagesCache.set(conversationId, normalizedResponse);
            }

            return normalizedResponse;
        });

        this.messagesRequestCache.set(requestCacheKey, request);

        try {
            return await request;
        } finally {
            this.messagesRequestCache.delete(requestCacheKey);
        }
    }

    updateMessagesCache(conversationId: string, messages: any[]): void {
        this.messagesCache.set(conversationId, this.normalizeMessages(messages ?? []));
    }

    updateConversationLastMessageInCache(
        conversationId: string,
        message: any,
        currentUserId?: string,
        shouldIncrementUnread: boolean = false
    ): void {
        if (!conversationId || !message) {
            return;
        }

        this.conversationsCache.forEach((conversations, userId) => {
            const updated = (conversations ?? [])
                .map(conversation => {
                    const currentConversationId = conversation?.id ?? conversation?._id;

                    if (currentConversationId !== conversationId) {
                        return conversation;
                    }

                    const messageCreatedAt = message?.createdAt ?? new Date().toISOString();
                    const unreadCount = conversation?.unreadCount ?? {};
                    const nextUnreadCount = shouldIncrementUnread && currentUserId
                        ? {
                            ...unreadCount,
                            [currentUserId]: Number(unreadCount[currentUserId] ?? 0) + 1
                        }
                        : unreadCount;

                    return {
                        ...conversation,
                        lastMessage: {
                            text: message?.text ?? '',
                            senderId: message?.senderId ?? message?.sender?.id ?? '',
                            createdAt: messageCreatedAt,
                            type: message?.type ?? 'text',
                            mediaType: message?.mediaType ?? null,
                            stickerUrl: message?.stickerUrl ?? null
                        },
                        updatedAt: messageCreatedAt,
                        unreadCount: nextUnreadCount
                    };
                })
                .sort((firstConversation, secondConversation) => {
                    const firstDate = new Date(
                        firstConversation?.updatedAt ?? firstConversation?.lastMessage?.createdAt ?? 0
                    ).getTime();
                    const secondDate = new Date(
                        secondConversation?.updatedAt ?? secondConversation?.lastMessage?.createdAt ?? 0
                    ).getTime();

                    return secondDate - firstDate;
                });

            this.conversationsCache.set(userId, updated);
        });
    }

    markConversationAsReadInCache(conversationId: string, userId: string): void {
        if (!conversationId || !userId) {
            return;
        }

        this.conversationsCache.forEach((conversations, cacheUserId) => {
            const updated = (conversations ?? []).map(conversation => {
                const currentConversationId = conversation?.id ?? conversation?._id;

                if (currentConversationId !== conversationId) {
                    return conversation;
                }

                return {
                    ...conversation,
                    unreadCount: {
                        ...(conversation.unreadCount ?? {}),
                        [userId]: 0
                    }
                };
            });

            this.conversationsCache.set(cacheUserId, updated);
        });
    }

    addMessageToCache(conversationId: string, message: any): void {
        if (!conversationId || !message) {
            return;
        }

        const current = this.messagesCache.get(conversationId) ?? [];
        const next = this.normalizeMessages([...current, message]);

        this.messagesCache.set(conversationId, next);
    }

    upsertMessageInCache(conversationId: string, message: any): void {
        if (!conversationId || !message) {
            return;
        }

        const current = this.messagesCache.get(conversationId) ?? [];
        const messageKey = this.getMessageKey(message);
        const existingIndex = current.findIndex(currentMessage => this.getMessageKey(currentMessage) === messageKey);

        const nextMessages = existingIndex >= 0
            ? current.map((currentMessage, index) => (
                index === existingIndex ? { ...currentMessage, ...message } : currentMessage
            ))
            : [...current, message];

        this.messagesCache.set(conversationId, this.normalizeMessages(nextMessages));
    }

    getMessagesCacheSnapshot(conversationId: string): any[] {
        return this.normalizeMessages(this.messagesCache.get(conversationId) ?? []);
    }

    clearMessagesCache(conversationId?: string): void {
        if (conversationId) {
            this.messagesCache.delete(conversationId);

            Array.from(this.messagesRequestCache.keys())
                .filter(key => key.startsWith(`${conversationId}:`))
                .forEach(key => this.messagesRequestCache.delete(key));

            return;
        }

        this.messagesCache.clear();
        this.messagesRequestCache.clear();
    }

    clearConversationsCache(userId?: string): void {
        if (userId) {
            this.conversationsCache.delete(userId);
            return;
        }

        this.conversationsCache.clear();
    }

    private async request<T>(url: string): Promise<T> {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            throw new Error(errorText || `request failed with status ${response.status}`);
        }

        return response.json();
    }

    private normalizeMessages(messages: any[]): any[] {
        const uniqueMessages = new Map<string, any>();

        (messages ?? []).forEach(message => {
            uniqueMessages.set(this.getMessageKey(message), message);
        });

        return Array.from(uniqueMessages.values()).sort((firstMessage, secondMessage) => {
            const firstDate = new Date(firstMessage?.createdAt ?? 0).getTime();
            const secondDate = new Date(secondMessage?.createdAt ?? 0).getTime();

            return firstDate - secondDate;
        });
    }

    private getMessageKey(message: any): string {
        const id = message?.id ?? message?._id ?? message?.messageId ?? message?.message_id;

        if (id) {
            return `id:${id}`;
        }

        const tempId = message?.tempId ?? message?.clientId ?? message?.clientMessageId;

        if (tempId) {
            return `temp:${tempId}`;
        }

        const conversationId = message?.conversationId ?? message?.conversation?.id ?? message?.conversation?._id ?? '';
        const senderId = message?.senderId ?? message?.sender?.id ?? message?.sender?._id ?? '';
        const type = message?.type ?? 'text';
        const text = message?.text ?? '';
        const createdAt = new Date(message?.createdAt ?? 0).getTime();

        return `message:${conversationId}:${senderId}:${type}:${text}:${createdAt}`;
    }
}

export const messagesService = new MessagesService();
export default messagesService;