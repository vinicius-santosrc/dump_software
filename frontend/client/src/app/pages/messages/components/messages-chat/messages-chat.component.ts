import { Component, Input, OnChanges, ViewChild, ElementRef, OnInit } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { ChatService } from "../../../../core/services/messages/chat.service";
import { UserService } from "../../../../core/services/user/user.service";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MessagesService } from "../../messages.service";
import { MessageRendererComponent } from "./components/message-renderer-component/message-renderer-component";
import { MessagesStoreService } from "../../../../store/conversation.store.service";
import { ChatViewHelper } from "../../helpers/chat-view.helper";
import { GenericButtonComponent } from "../../../../shared/components/generic-button-component/generic-button.component";
import { MessagesSidebarComponent } from "../messages-sidebar/messages-sidebar.component";
import { MatButtonModule } from "@angular/material/button";
import { MessagesComponent } from "../../messages.component";
import { BasicInputComponent } from "../../../../shared/components/basic-input-component/basic-input.component";
import { TranslateModule } from "@ngx-translate/core";

@Component({
    selector: "app-messages-chat",
    standalone: true,
    templateUrl: "./messages-chat.component.html",
    styleUrls: ["./messages-chat.component.scss"],
    imports: [MatIcon, FormsModule, CommonModule, MessageRendererComponent, GenericButtonComponent, MatButtonModule, BasicInputComponent, TranslateModule]
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
        private readonly messagesStore: MessagesStoreService,
        private readonly messagesSidebar: MessagesSidebarComponent,
        private readonly messagesComponent: MessagesComponent
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
            msg?.sender?.id !== userId &&
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
            return 'MESSAGES_INBOX.CHAT.POST.SENT';
        }

        const allParticipants = this.conversation?.participants?.length ?? 1;

        if (msg.readBy.length === allParticipants) {
            return 'MESSAGES_INBOX.CHAT.POST.READ';
        }

        return 'MESSAGES_INBOX.CHAT.POST.DELIVERED';
    }

    isLastMessageFromMe(msg: any, index: number): boolean {
        const nextMsg = this.messages[index + 1];
        return !nextMsg || nextMsg?.sender.id !== msg?.sender.id;
    }

    getUserById(userId: string) {
        return this.usersMap?.get(userId);
    }

    isUserOnline(userId: string): boolean {
        return this.messagesStore.getOnlineUsers()?.has(userId) ?? false;
    }

    //

    openCreateConversations() {
        this.messagesSidebar.clickCreateConversation()
    }

    closeConversation() {
        this.conversation = null;
        this.messagesComponent.selectedConversation = null;
    }

    get isMobile(): boolean {
        return window.innerWidth <= 768;
    }

}

