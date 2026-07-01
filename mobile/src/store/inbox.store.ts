import { Conversation, Message } from '@/models/messages/messages.model';
import { User } from '@/models/user/user.model';
import { create } from 'zustand';

type InboxStore = {
    conversations: Conversation[];
    activeConversation: Conversation | null;
    activeConversationId: string | null;
    activeMessages: Message[];
    usersMap: Map<string, User>;
    onlineUsers: Set<string>;
    typingMap: Record<string, string[]>;

    setConversations: (conversations: Conversation[]) => void;
    setActiveConversation: (conversation: Conversation | null) => void;
    setActiveConversationId: (conversationId: string | null) => void;
    getActiveConversation: () => string | null;
    setActiveMessages: (messages: Message[]) => void;
    appendMessage: (message: Message) => void;
    setUsers: (users: User[]) => void;
    clearActiveConversation: () => void;
    updateLastMessage: (conversationId: string, message: Message) => void;
    incrementUnread: (conversationId: string, userId: string) => void;
    markConversationAsRead: (conversationId: string, userId: string) => void;
    setTyping: (conversationId: string, userId: string) => void;
    stopTyping: (conversationId: string, userId: string) => void;
    setUserOnline: (userId: string) => void;
    setUserOffline: (userId: string) => void;
    getOnlineUsers: () => Set<string>;
    isUserOnline: (userId: string) => boolean;
    addConversation: (conversation: Conversation) => void;
};

function getConversationId(conversation: any): string {
    return conversation?.id ?? conversation?._id ?? '';
}

function getMessageKey(message: any): string {
    const tempId = message?.tempId ?? message?.clientId ?? message?.clientMessageId;

    if (tempId) {
        return `temp:${tempId}`;
    }

    const id = message?.id ?? message?._id ?? message?.messageId ?? message?.message_id;

    if (id) {
        return `id:${id}`;
    }

    const conversationId = message?.conversationId ?? message?.ConversationId ?? message?.conversation_id ?? message?.conversation?.id ?? message?.conversation?._id ?? '';
    const senderId = message?.senderId ?? message?.SenderId ?? message?.userId ?? message?.UserId ?? message?.sender?.id ?? message?.sender?._id ?? '';
    const type = message?.type ?? message?.Type ?? 'text';
    const text = message?.text ?? message?.Text ?? '';
    const createdAt = new Date(message?.createdAt ?? message?.CreatedAt ?? 0).getTime();

    return `message:${conversationId}:${senderId}:${type}:${text}:${createdAt}`;
}

function normalizeMessages(messages: any[]): any[] {
    const uniqueMessages = new Map<string, any>();

    (messages ?? []).forEach(message => {
        uniqueMessages.set(getMessageKey(message), message);
    });

    return Array.from(uniqueMessages.values()).sort((firstMessage, secondMessage) => {
        const firstDate = new Date(firstMessage?.createdAt ?? 0).getTime();
        const secondDate = new Date(secondMessage?.createdAt ?? 0).getTime();

        return firstDate - secondDate;
    });
}

function sortConversationsByLastActivity(conversations: any[]): any[] {
    return [...(conversations ?? [])].sort((firstConversation, secondConversation) => {
        const firstDate = new Date(firstConversation?.updatedAt ?? firstConversation?.lastMessage?.createdAt ?? 0).getTime();
        const secondDate = new Date(secondConversation?.updatedAt ?? secondConversation?.lastMessage?.createdAt ?? 0).getTime();

        return secondDate - firstDate;
    });
}

export const useInboxStore = create<InboxStore>((set, get) => ({
    conversations: [],
    activeConversation: null,
    activeConversationId: null,
    activeMessages: [],
    usersMap: new Map(),
    onlineUsers: new Set(),
    typingMap: {},

    setConversations: conversations => {
        const current = get().conversations ?? [];
        const currentById = new Map<string, any>();

        current.forEach(conversation => {
            const id = getConversationId(conversation);

            if (id) {
                currentById.set(id, conversation);
            }
        });

        const merged = (conversations ?? []).map(conversation => {
            const id = getConversationId(conversation);
            const currentConversation = id ? currentById.get(id) : undefined;

            if (!currentConversation) {
                return conversation;
            }

            const currentDate = new Date(currentConversation?.updatedAt ?? currentConversation?.lastMessage?.createdAt ?? 0).getTime();
            const incomingDate = new Date(conversation?.updatedAt ?? conversation?.lastMessage?.createdAt ?? 0).getTime();
            const shouldKeepCurrentLastMessage = currentDate > incomingDate;

            return {
                ...conversation,
                lastMessage: shouldKeepCurrentLastMessage
                    ? currentConversation.lastMessage
                    : conversation.lastMessage,
                updatedAt: shouldKeepCurrentLastMessage
                    ? currentConversation.updatedAt
                    : conversation.updatedAt,
                unreadCount: {
                    ...(conversation.unreadCount ?? {}),
                    ...(currentConversation.unreadCount ?? {})
                }
            };
        });

        set({ conversations: sortConversationsByLastActivity(merged) });
    },

    setActiveConversation: conversation => {
        set({
            activeConversation: conversation,
            activeConversationId: getConversationId(conversation)
        });
    },

    setActiveConversationId: conversationId => {
        set({
            activeConversationId: conversationId,
            activeConversation: conversationId ? ({ id: conversationId } as Conversation) : null
        });
    },

    getActiveConversation: () => {
        return get().activeConversationId;
    },

    setActiveMessages: messages => set({ activeMessages: normalizeMessages(messages ?? []) }),

    appendMessage: message => {
        if (!message) {
            return;
        }

        const current = get().activeMessages ?? [];
        const messageKey = getMessageKey(message);
        const existingIndex = current.findIndex(currentMessage => getMessageKey(currentMessage) === messageKey);

        const nextMessages = existingIndex >= 0
            ? current.map((currentMessage, index) => index === existingIndex ? { ...currentMessage, ...message } : currentMessage)
            : [...current, message];

        set({ activeMessages: normalizeMessages(nextMessages) });

        const conversationId = message?.conversationId ?? message?.ConversationId ?? message?.conversation_id ?? message?.conversation?.id ?? message?.conversation?._id;

        if (conversationId) {
            get().updateLastMessage(conversationId, message);
        }
    },

    setUsers: users => {
        const map = new Map<string, User>();

        users.forEach(user => {
            const userId = user?.id ?? (user as any)?._id;

            if (userId) {
                map.set(userId, user);
            }
        });

        set({ usersMap: map });
    },

    clearActiveConversation: () => set({
        activeConversation: null,
        activeConversationId: null,
        activeMessages: []
    }),

    updateLastMessage: (conversationId, message) => {
        if (!conversationId || !message) {
            return;
        }

        const current = get().conversations ?? [];
        const messageCreatedAt = message?.createdAt ?? new Date().toISOString();

        const updated = current.map(conversation => {
            if (getConversationId(conversation) !== conversationId) {
                return conversation;
            }

            return {
                ...conversation,
                lastMessage: {
                    text: message?.text ?? message?.Text ?? '',
                    senderId: message?.senderId ?? message?.SenderId ?? message?.userId ?? message?.UserId ?? message?.sender?.id ?? '',
                    createdAt: messageCreatedAt,
                    type: message?.type ?? message?.Type ?? 'text',
                    mediaType: message?.mediaType ?? message?.MediaType ?? null,
                    stickerUrl: message?.stickerUrl ?? message?.StickerUrl ?? null
                },
                updatedAt: messageCreatedAt
            };
        });

        set({ conversations: sortConversationsByLastActivity(updated) });
    },

    incrementUnread: (conversationId, userId) => {
        if (!conversationId || !userId) {
            return;
        }

        const updated = get().conversations.map((conversation: any) => {
            if (getConversationId(conversation) !== conversationId) {
                return conversation;
            }

            const unreadCount = conversation.unreadCount ?? {};
            const currentUnread = Number(unreadCount[userId] ?? 0);

            return {
                ...conversation,
                unreadCount: {
                    ...unreadCount,
                    [userId]: currentUnread + 1
                }
            };
        });

        set({ conversations: sortConversationsByLastActivity(updated) });
    },

    markConversationAsRead: (conversationId, userId) => {
        if (!conversationId || !userId) {
            return;
        }

        const conversations = get().conversations.map((conversation: any) => {
            if (getConversationId(conversation) !== conversationId) {
                return conversation;
            }

            return {
                ...conversation,
                unreadCount: {
                    ...(typeof conversation.unreadCount === 'object' ? conversation.unreadCount : {}),
                    [userId]: 0
                }
            };
        });

        const activeMessages = get().activeMessages.map((message: any) => {
            const messageConversationId = message?.conversationId ?? message?.ConversationId ?? message?.conversation_id ?? message?.conversation?.id ?? message?.conversation?._id;

            if (messageConversationId !== conversationId) {
                return message;
            }

            const readBy = message?.readBy ?? message?.readyBy ?? [];

            if (!readBy.includes(userId)) {
                return {
                    ...message,
                    readBy: [...readBy, userId],
                    readyBy: [...readBy, userId]
                };
            }

            return message;
        });

        set({
            conversations: sortConversationsByLastActivity(conversations),
            activeMessages
        });
    },

    setTyping: (conversationId, userId) => {
        const current = get().typingMap;

        const users = new Set(current[conversationId] ?? []);
        users.add(userId);

        set({
            typingMap: {
                ...current,
                [conversationId]: Array.from(users)
            }
        });
    },

    stopTyping: (conversationId, userId) => {
        const current = get().typingMap;

        const users = new Set(current[conversationId] ?? []);
        users.delete(userId);

        set({
            typingMap: {
                ...current,
                [conversationId]: Array.from(users)
            }
        });
    },

    setUserOnline: userId => {
        const current = new Set(get().onlineUsers);
        current.add(userId);
        set({ onlineUsers: current });
    },

    setUserOffline: userId => {
        const current = new Set(get().onlineUsers);
        current.delete(userId);
        set({ onlineUsers: current });
    },

    getOnlineUsers: () => get().onlineUsers,

    isUserOnline: userId => {
        if (!userId) {
            return false;
        }

        return get().onlineUsers.has(userId);
    },

    addConversation: conversation => {
        const current = get().conversations ?? [];
        const conversationId = getConversationId(conversation);
        const exists = current.some(currentConversation => getConversationId(currentConversation) === conversationId);

        if (exists) {
            return;
        }

        set({ conversations: [conversation, ...current] });
    }
}));