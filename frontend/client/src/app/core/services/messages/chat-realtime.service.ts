import { Injectable } from "@angular/core";
import { ChatService } from "./chat.service";
import { MessagesStoreService } from "../../../pages/messages/conversation.store.service";
import { UserService } from "../user/user.service";
import { MessagesService } from "../../../pages/messages/messages.service";

@Injectable({ providedIn: 'root' })
export class ChatRealtimeService {

    private initialized = false;
    user$: any;

    constructor(
        private readonly chatService: ChatService,
        private readonly store: MessagesStoreService,
        private readonly userService: UserService,
        private readonly messagesService: MessagesService
    ) {
        this.userService.user$.subscribe(user => {
            this.user$ = user;
            if(!user) return
            this.init();
        })
    }

    async init() {
        if (this.initialized) return;
        this.initialized = true;

        const userId = this.user$;

        await this.chatService.startConnection(userId);

        this.registerHandlers();
    }

    private registerHandlers() {

        this.chatService.onReceiveMessage((msg: any) => {
            this.handleMessage(msg);
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
        const isActiveChat =
            currentConversationId != null &&
            currentConversationId === msg.conversationId;
        if (isActiveChat) {
            this.store.appendMessage(msg);

            if (!isMyMessage) {
                this.store.markAsRead(msg.conversationId, userId);
            }

        } else {
            this.store.incrementUnread(msg.conversationId, userId);
        }
    }
}