import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { UserService } from "../../core/services/user/user.service";

@Injectable({ providedIn: 'root' })
export class MessagesStoreService {
    constructor(private readonly userService: UserService) {}
    private readonly conversations$ = new BehaviorSubject<any[]>([]);
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

    setActiveMessages(messages: any[]) {
        this.activeMessages$.next(messages ?? []);
    }

    appendMessage(message: any) {
        const current = this.activeMessages$.value ?? [];

        const exists = current.some(m => m.id === message.id);
        if (exists) return;

        this.activeMessages$.next([...current, message]);
    }

    setActiveConversation(id: string) {
        this.activeConversationId$.next(id);

        const userId = this.userService?.getUser()?.id;
        if (userId) {
            this.markAsRead(id, userId);
        }
    }

    getActiveConversation() {
        return this.activeConversationId$.value;
    }

    setConversations(convs: any[]) {
        this.conversations$.next(convs ?? []);
    }

    updateLastMessage(conversationId: string, message: any) {
        const current = this.conversations$.value ?? [];

        const updated = current.map(c => {
            if (c.id === conversationId) {
                return { ...c, lastMessage: message };
            }
            return c;
        });

        this.conversations$.next(updated);
    }

    incrementUnread(conversationId: string, userId: string) {
        const updated = this.conversations$.value.map(c => {
            if (c.id === conversationId) {
                const unread = c.unreadCount ?? {};

                return {
                    ...c,
                    unreadCount: {
                        ...unread,
                        [userId]: (unread[userId] ?? 0) + 1
                    }
                };
            }
            return c;
        });

        this.conversations$.next(updated);
    }

    markAsRead(conversationId: string, userId: string) {

        // 🔥 1. sidebar unread reset
        const updated = this.conversations$.value.map(c => {
            if (c.id === conversationId) {
                return {
                    ...c,
                    unreadCount: {
                        ...(c.unreadCount ?? {}),
                        [userId]: 0
                    }
                };
            }
            return c;
        });

        this.conversations$.next(updated);

        // 🔥 2. chat messages sync read
        const msgs = this.activeMessages$.value.map(m => {
            if (m.conversationId !== conversationId) return m;

            const readBy = m.readBy ?? [];

            if (!readBy.includes(userId)) {
                return {
                    ...m,
                    readBy: [...readBy, userId]
                };
            }

            return m;
        });

        this.activeMessages$.next(msgs);
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

    setUsers(users: any[]) {
        const map = new Map<string, any>();

        users.forEach(user => {
            map.set(user.id, user);
        });

        this.usersMap$.next(map);
    }

}
