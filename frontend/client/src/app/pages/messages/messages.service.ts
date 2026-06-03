import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of, shareReplay, tap } from "rxjs";
import { API_CONFIG } from "../../core/config/api.config";

@Injectable({
    providedIn: 'root'
})
export class MessagesService {

    private readonly conversationsCache = new Map<string, any[]>();
    private readonly messagesCache = new Map<string, any[]>()
    private readonly messagesRequestCache = new Map<string, Observable<any>>();;

    constructor(private readonly http: HttpClient) { }

    getConversationsByUserId(userId: string, forceRefresh: boolean = false): Observable<any> {
        const cached = this.conversationsCache.get(userId);

        if (cached && !forceRefresh) {
            return of(cached);
        }

        return this.http.get<any[]>(
            `${API_CONFIG.baseUrl}/messages/conversation/user/${userId}`
        ).pipe(
            tap((response) => {
                this.conversationsCache.set(userId, response ?? []);
            }),
            shareReplay(1)
        );
    }

    getMessages(
        conversationId: string,
        forceRefresh: boolean = false,
        before: string | null = null,
        limit: number = 25
    ): Observable<any> {
        const requestCacheKey = `${conversationId}:${before ?? 'latest'}:${limit}`;

        if (!before) {
            const cached = this.messagesCache.get(conversationId);

            if (cached && !forceRefresh) {
                return of(this.normalizeMessages(cached));
            }
        }

        if (!forceRefresh && this.messagesRequestCache.has(requestCacheKey)) {
            return this.messagesRequestCache.get(requestCacheKey)!;
        }

        const params: Record<string, string> = {
            limit: String(limit)
        };

        if (before) {
            params['before'] = before;
        }

        const request = this.http.get<any[]>(
            `${API_CONFIG.baseUrl}/messages/${conversationId}`,
            { params }
        ).pipe(
            tap((response) => {
                const normalizedResponse = this.normalizeMessages(response ?? []);

                if (!before) {
                    this.messagesCache.set(conversationId, normalizedResponse);
                }
            }),
            shareReplay(1)
        );

        this.messagesRequestCache.set(requestCacheKey, request);

        return request;
    }

    updateMessagesCache(conversationId: string, messages: any[]): void {
        this.messagesCache.set(conversationId, this.normalizeMessages(messages ?? []));
    }

    updateConversationLastMessageInCache(conversationId: string, message: any, currentUserId?: string, shouldIncrementUnread: boolean = false): void {
        if (!conversationId || !message) {
            return;
        }

        this.conversationsCache.forEach((conversations, userId) => {
            const updated = (conversations ?? []).map(conversation => {
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
            }).sort((firstConversation, secondConversation) => {
                const firstDate = new Date(firstConversation?.updatedAt ?? firstConversation?.lastMessage?.createdAt ?? 0).getTime();
                const secondDate = new Date(secondConversation?.updatedAt ?? secondConversation?.lastMessage?.createdAt ?? 0).getTime();

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
        const next = this.normalizeMessages([...current, message]);

        this.messagesCache.set(conversationId, next);
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
        const id = message?.id ?? message?._id;

        if (id) {
            return `id:${id}`;
        }

        const conversationId = message?.conversationId ?? '';
        const senderId = message?.senderId ?? message?.sender?.id ?? '';
        const type = message?.type ?? 'text';
        const text = message?.text ?? '';
        const createdAt = new Date(message?.createdAt ?? 0).getTime();

        return `message:${conversationId}:${senderId}:${type}:${text}:${createdAt}`;
    }
}