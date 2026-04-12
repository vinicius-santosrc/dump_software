import { Component, Input, OnChanges, ViewChild, ElementRef, OnInit } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { ChatService } from "../../../../core/services/messages/chat.service";
import { UserService } from "../../../../core/services/user/user.service";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MessagesService } from "../../messages.service";
import { MessageRendererComponent } from "./components/message-renderer-component/message-renderer-component";
import { MessagesStoreService } from "../../conversation.store.service";
import { ChatViewHelper } from "../../helpers/chat-view.helper";

@Component({
    selector: "app-messages-chat",
    standalone: true,
    templateUrl: "./messages-chat.component.html",
    styleUrls: ["./messages-chat.component.scss"],
    imports: [MatIcon, FormsModule, CommonModule, MessageRendererComponent]
})

export class MessagesChatComponent implements OnInit, OnChanges {
    @Input() conversation: any;
    onlineUsers$: any;
    usersMap: Map<string, any> = new Map();
    messages: any[] = [];
    pendingMessages: { [tempId: string]: any } = {};

    current_user: any;
    input: string = '';

    isGroup: boolean = false;
    conversationUser: any;

    typingUsers: Set<string> = new Set();
    typingTimeout: any;

    @ViewChild('scrollContainer') chatBody!: ElementRef;

    constructor(
        private readonly chatService: ChatService,
        private readonly userService: UserService,
        private readonly messagesService: MessagesService,
        private readonly messagesStore: MessagesStoreService
    ) {
        this.userService.user$.subscribe((user: any) => {
            this.current_user = user;
        });
        this.onlineUsers$ = this.messagesStore.onlineUsersObs$;
        this.messagesStore.usersMapObs$.subscribe((map) => {
            this.usersMap = map ?? new Map();
        });
    }

    ngOnInit() {
        this.messagesStore.activeMessagesObs$
            .subscribe((msgs) => {

                if (!msgs) return;

                this.messages = msgs;
            });
    }

    ngOnChanges() {
        if (!this.conversation?.id) return;

        this.messagesStore.setUsers(this.conversation.participants)
        this.messagesStore.setActiveConversation(this.conversation.id);

        this.isGroup = this.conversation.participants?.length > 2;

        this.chatService.joinConversation(this.conversation.id);

        this.loadMessages();

        setTimeout(() => {
            this.markMessagesAsRead();
        }, 300);

    }

    // =========================
    // MESSAGES
    // =========================

    sendMessage() {
        const tempId = 'temp-' + Date.now();

        const message = {
            id: tempId,
            conversationId: this.conversation.id,
            senderId: this.current_user.id,
            text: this.input,
            createdAt: new Date().toISOString(),
            readBy: [this.current_user.id],
            status: 'sending'
        };

        this.pendingMessages[tempId] = message;

        this.chatService.sendMessage({
            conversationId: message.conversationId,
            userId: message.senderId,
            text: message.text,
            tempId
        });

        this.input = '';
        setTimeout(() => this.scrollToBottom(), 0);
    }

    loadMessages() {
        this.messagesService.getMessages(this.conversation.id)
            .subscribe((msgs: any) => {

                this.messagesStore.setActiveMessages(msgs);

                setTimeout(() => this.scrollToBottom(), 0);
            });
    }

    markMessagesAsRead() {

        const userId = this.current_user.id;

        const unread = this.messages.filter(msg =>
            msg.senderId !== userId &&
            !msg.readBy?.includes(userId)
        );

        unread.forEach(msg => {
            this.chatService.markAsRead(msg.id, userId);
        });

        // 🔥 NÃO altera messages localmente
        this.messagesStore.markAsRead(this.conversation.id, userId);
    }

    // =========================
    // TYPING (LOCAL ONLY UI)
    // =========================

    onTyping() {
        this.chatService.typing(
            this.conversation.id,
            this.current_user.id
        );

        clearTimeout(this.typingTimeout);

        this.typingTimeout = setTimeout(() => {
            this.chatService.stopTyping(
                this.conversation.id,
                this.current_user.id
            );
        }, 1200);
    }

    onStopTyping() {
        this.chatService.stopTyping(
            this.conversation.id,
            this.current_user.id
        );
    }

    // =========================
    // SCROLL
    // =========================

    private scrollToBottom() {
        if (!this.chatBody) return;
        this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
    }

    // =======================
    // CHAT VIEW HELPER
    // =======================

    getConversationName(): string {
        return ChatViewHelper.getConversationName(
            this.conversation,
            this.current_user.id
        );
    }

    getConversationAvatar(): string {
        return ChatViewHelper.getConversationAvatar(
            this.conversation,
            this.current_user.id
        );
    }

    getConversationUser(): string {
        return ChatViewHelper.getConversationUser(
            this.conversation,
            this.current_user.id
        );
    }

    ///

    getMessageStatus(msg: any): string {
        if (!msg.readBy || msg.readBy.length <= 1) {
            return 'Enviado';
        }

        const allParticipants = this.conversation?.participants?.length ?? 1;

        if (msg.readBy.length === allParticipants) {
            return 'Lido';
        }

        return 'Entregue';
    }

    isLastMessageFromMe(msg: any, index: number): boolean {
        const nextMsg = this.messages[index + 1];
        return !nextMsg || nextMsg.senderId !== msg.senderId;
    }

    getUserById(userId: string) {
        return this.usersMap?.get(userId);
    }

    isUserOnline(userId: string): boolean {
        return this.messagesStore.getOnlineUsers()?.has(userId) ?? false;
    }
}