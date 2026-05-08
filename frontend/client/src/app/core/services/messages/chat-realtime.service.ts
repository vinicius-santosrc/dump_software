import { Injectable } from "@angular/core";
import { ChatService } from "./chat.service";
import { MessagesStoreService } from "../../../store/conversation.store.service";
import { UserService } from "../user/user.service";
import { MessagesService } from "../../../pages/messages/messages.service";
import { NotificationService } from "./notification.service";

@Injectable({ providedIn: 'root' })
export class ChatRealtimeService {

    private initialized = false;
    user$: any;

    constructor(
        private readonly chatService: ChatService,
        private readonly store: MessagesStoreService,
        private readonly userService: UserService,
        private readonly messagesService: MessagesService,
        private readonly notificationService: NotificationService
    ) {
        this.userService.user$.subscribe(user => {
            this.user$ = user;
            if (!user) return
            this.init();
        })
    }

    async init() {
        if (this.initialized) return;
        this.initialized = true;

        const userId = this.user$?.id;

        await this.chatService.startConnection(userId);

        this.registerHandlers();
    }

    private registerHandlers() {

        this.chatService.onReceiveMessage((raw: any) => {

            const msg = {
                ...raw,
                senderId: raw.senderId ?? raw.sender?.id,
                conversationId: raw.conversationId ?? raw.conversation?.id
            };

            this.handleMessage(msg);

            const currentConversationId = this.store.getActiveConversation();
            const userId = this.userService.getUser()?.id;
            const isMyMessage = msg.senderId === userId;

            const isActiveChat =
                currentConversationId != null &&
                currentConversationId === msg.conversationId;

            if (!isMyMessage && !isActiveChat) {
                this.notificationService.show({
                    type: 'message',
                    redirect: "/messages/inbox",
                    message: msg.text,
                    conversation: msg.conversation,
                    sender: msg.sender,
                    text: msg.text
                });
            }
        });

        this.chatService.onMessageRead((data: any) => {
            this.store.markAsRead(data.conversationId, data.userId);
        });

        this.chatService.onUserOnline((userId: string) => {
            this.store.setUserOnline(userId);
        });

        this.chatService.onUserOffline((userId: string) => {
            this.store.setUserOffline(userId);
        });

        this.chatService.onTyping((data: any) => {
            this.store.setTyping(data.conversationId, data.userId);
        });

        this.chatService.onStopTyping((data: any) => {
            this.store.stopTyping(data.conversationId, data.userId);
        });
    }

    private handleMessage(msg: any) {

        // sidebar sempre
        this.store.updateLastMessage(msg.conversationId, msg);
        const currentConversationId = this.store.getActiveConversation();
        const userId = this.userService.getUser()?.id;

        const isMyMessage = msg.senderId === userId;

        const conversations = this.store.conversations$.value ?? [];

        const updated = conversations.map(c => {
            if (c.id !== msg.conversationId) return c;

            const unread = { ...(c.unreadCount ?? {}) };

            if (!isMyMessage) {
                unread[userId] = (unread[userId] ?? 0) + 1;
            }

            return {
                ...c,
                lastMessage: msg,
                unreadCount: unread
            };
        });

        this.store.setConversations(updated);
        this.store.refreshTrigger();

        const isActiveChat =
            currentConversationId != null &&
            currentConversationId === msg.conversationId;

        if (isActiveChat) {
            this.store.appendMessage(msg);

            if (!isMyMessage) {
                this.store.markAsRead(msg.conversationId, userId);
            }
        }
    }
}