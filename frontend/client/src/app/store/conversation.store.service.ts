import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { UserService } from "../core/services/user/user.service";

@Injectable({ providedIn: 'root' })
export class MessagesStoreService {
    constructor(private readonly userService: UserService) { }
    public readonly conversations$ = new BehaviorSubject<any[]>([]);
    conversationsObs$ = this.conversations$.asObservable();

    private readonly typing$ = new BehaviorSubject<{ [key: string]: string[] }>({});
    typingObs$ = this.typing$.asObservable();

    public readonly activeConversationId$ = new BehaviorSubject<string | null>(null);
    activeConversationIdObs$ = this.activeConversationId$.asObservable();

    private readonly onlineUsers$ = new BehaviorSubject<Set<string>>(new Set());
    onlineUsersObs$ = this.onlineUsers$.asObservable();

    private readonly usersMap$ = new BehaviorSubject<Map<string, any>>(new Map());
    usersMapObs$ = this.usersMap$.asObservable();

    public readonly activeMessages$ = new BehaviorSubject<any[]>([]);
    activeMessagesObs$ = this.activeMessages$.asObservable();

    private readonly _refresh$ = new BehaviorSubject<void>(undefined);
    refresh$ = this._refresh$.asObservable();

    setActiveMessages(messages: any[]) {
        this.activeMessages$.next(this.normalizeMessages(messages ?? []));
    }

    appendMessage(message: any) {
        if (!message) {
            return;
        }

        const current = this.activeMessages$.value ?? [];
        const messageKey = this.getMessageKey(message);
        const existingIndex = current.findIndex(currentMessage => this.getMessageKey(currentMessage) === messageKey);

        const nextMessages = existingIndex >= 0
            ? current.map((currentMessage, index) => index === existingIndex ? { ...currentMessage, ...message } : currentMessage)
            : [...current, message];

        this.activeMessages$.next(this.normalizeMessages(nextMessages));

        const conversationId = message?.conversationId ?? message?.conversation?.id ?? message?.conversation?._id;

        if (conversationId) {
            this.updateLastMessage(conversationId, message);
        }
    }

    private normalizeMessages(messages: any[]): any[] {
        const normalizedMessages = messages ?? [];

        const uniqueMessages = new Map<string, any>();

        (normalizedMessages ?? []).forEach(message => {
            uniqueMessages.set(this.getMessageKey(message), message);
        });

        return Array.from(uniqueMessages.values()).sort((firstMessage, secondMessage) => {
            const firstDate = new Date(firstMessage?.createdAt ?? 0).getTime();
            const secondDate = new Date(secondMessage?.createdAt ?? 0).getTime();

            return firstDate - secondDate;
        });
    }

    setActiveConversation(id: string) {
        this.activeConversationId$.next(id);

        const userId = this.userService?.getUser()?.id;
        if (userId) {
            this.markAsRead(id, userId);
        }
    }

    clearActiveConversation() {
        this.activeConversationId$.next(null);
    }

    getActiveConversation() {
        return this.activeConversationId$.value;
    }

    setConversations(convs: any[]) {
        const current = this.conversations$.value ?? [];
        const currentById = new Map<string, any>();

        current.forEach(conversation => {
            const id = this.getConversationId(conversation);

            if (id) {
                currentById.set(id, conversation);
            }
        });

        const merged = (convs ?? []).map(conversation => {
            const id = this.getConversationId(conversation);
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

        this.conversations$.next(this.sortConversationsByLastActivity(merged));
    }

    updateLastMessage(conversationId: string, message: any) {
        if (!conversationId || !message) {
            return;
        }

        const current = this.conversations$.value ?? [];
        const messageCreatedAt = message?.createdAt ?? new Date().toISOString();

        const updated = current.map(conversation => {
            if (this.getConversationId(conversation) !== conversationId) {
                return conversation;
            }

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
                updatedAt: messageCreatedAt
            };
        });

        this.conversations$.next(this.sortConversationsByLastActivity(updated));
    }

    incrementUnread(conversationId: string, userId: string) {
        if (!conversationId || !userId) {
            return;
        }

        const updated = this.conversations$.value.map(conversation => {
            if (this.getConversationId(conversation) !== conversationId) {
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

        this.conversations$.next(this.sortConversationsByLastActivity(updated));
    }

    markAsRead(conversationId: string, userId: string) {
        if (!conversationId || !userId) {
            return;
        }

        const updated = this.conversations$.value.map(conversation => {
            if (this.getConversationId(conversation) !== conversationId) {
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

        this.conversations$.next(this.sortConversationsByLastActivity(updated));

        const messages = this.activeMessages$.value.map(message => {
            if ((message.conversationId ?? message.conversation?.id) !== conversationId) return message;

            const readBy = message.readBy ?? message.readyBy ?? [];

            if (!readBy.includes(userId)) {
                return {
                    ...message,
                    readBy: [...readBy, userId],
                    readyBy: [...readBy, userId]
                };
            }

            return message;
        });

        this.activeMessages$.next(messages);
    }
    private sortConversationsByLastActivity(conversations: any[]): any[] {
        return [...(conversations ?? [])].sort((firstConversation, secondConversation) => {
            const firstDate = new Date(firstConversation?.updatedAt ?? firstConversation?.lastMessage?.createdAt ?? 0).getTime();
            const secondDate = new Date(secondConversation?.updatedAt ?? secondConversation?.lastMessage?.createdAt ?? 0).getTime();

            return secondDate - firstDate;
        });
    }

    private getConversationId(conversation: any): string {
        return conversation?.id ?? conversation?._id ?? '';
    }

    setTyping(conversationId: string, userId: string) {
        const current = this.typing$.value;

        const users = new Set(current[conversationId] ?? []);
        users.add(userId);

        this.typing$.next({
            ...current,
            [conversationId]: Array.from(users)
        });
    }

    stopTyping(conversationId: string, userId: string) {
        const current = this.typing$.value;

        const users = new Set(current[conversationId] ?? []);
        users.delete(userId);

        this.typing$.next({
            ...current,
            [conversationId]: Array.from(users)
        });
    }

    setUserOnline(userId: string) {
        const current = new Set(this.onlineUsers$.value);
        current.add(userId);
        this.onlineUsers$.next(current);
    }

    setUserOffline(userId: string) {
        const current = new Set(this.onlineUsers$.value);
        current.delete(userId);
        this.onlineUsers$.next(current);
    }

    getOnlineUsers(): Set<string> {
        return this.onlineUsers$.value;
    }

    isUserOnline(userId: string): boolean {
        if (!userId) {
            return false;
        }

        return this.onlineUsers$.value.has(userId);
    }

    setUsers(users: any[]) {
        const map = new Map<string, any>();

        users.forEach(user => {
            map.set(user.id, user);
        });

        this.usersMap$.next(map);
    }

    addConversation(conversation: any) {
        const current = this.conversations$.value ?? [];

        const conversationId = this.getConversationId(conversation);
        const exists = current.some(c => this.getConversationId(c) === conversationId);
        if (exists) return;

        this.conversations$.next([conversation, ...current]);
    }
    refreshTrigger() {
        this._refresh$.next();
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
