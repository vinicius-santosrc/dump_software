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
import { MatDialog } from '@angular/material/dialog';
import { PreCallComponent } from "../../../call/pre-call/pre-call.component";
import {
    ChatComposerPayload,
    MessageComposerComponent
} from "./components/message-composer-component/message-composer-component";
import { MediaProcessingService } from "../../../../core/services/media/media-processing.service";

@Component({
    selector: "app-messages-chat",
    standalone: true,
    templateUrl: "./messages-chat.component.html",
    styleUrls: ["./messages-chat.component.scss"],
    imports: [
        MatIcon,
        FormsModule,
        CommonModule,
        MessageRendererComponent,
        GenericButtonComponent,
        MatButtonModule,
        BasicInputComponent,
        TranslateModule,
        MessageComposerComponent
    ]
})

export class MessagesChatComponent implements OnInit, OnChanges {
    @Input() conversation: any;
    onlineUsers$: any;
    usersMap: Map<string, any> = new Map();
    messages: any[] = [];

    ilustrationDirect: string = '/assets/app/media/undraw_message-sent_iyz6.svg'

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
        private readonly messagesComponent: MessagesComponent,
        private readonly mediaProcessingService: MediaProcessingService,
        private readonly dialog: MatDialog,
        private readonly store: MessagesStoreService
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

                if (!msgs) {
                    return;
                }

                this.messages = this.normalizeMessages(msgs);

                setTimeout(() => {
                    this.scrollToBottom();
                }, 0);
            });
    }

    ngOnChanges() {
        if (!this.conversation?.id) {
            return;
        }

        this.messages = [];

        this.messagesStore.setUsers(this.conversation.participants);
        this.messagesStore.setActiveConversation(this.conversation.id);

        this.isGroup = this.conversation.participants?.length > 2;

        this.chatService.joinConversation(this.conversation.id);

        this.messagesService
            .getMessages(this.conversation.id, true)
            .subscribe((msgs: any) => {

                this.messages = this.normalizeMessages(msgs ?? []);

                this.messagesStore.setActiveMessages(this.messages);

                this.messagesService.updateMessagesCache(
                    this.conversation.id,
                    this.messages
                );

                setTimeout(() => {
                    this.scrollToBottom();
                    this.markMessagesAsRead();
                }, 100);
            });
    }

    ngOnDestroy(): void {
        this.store.clearActiveConversation();
    }

    // =========================
    // MESSAGES
    // =========================

    handleComposerSend(payload: ChatComposerPayload): void {
        switch (payload.type) {
            case 'text':
                this.sendMessage(payload.text);
                break;

            case 'image':
                this.sendImageMessage(payload.file);
                break;

            case 'audio':
                this.sendAudioMessage(payload.blob);
                break;

            case 'sticker':
                this.sendStickerMessage(payload.stickerUrl);
                break;
        }
    }

    sendMessage(text: string = this.input): void {
        const messageText = text?.trim();

        if (!messageText || !this.conversation?.id || !this.current_user?.id) {
            return;
        }

        const message = {
            conversationId: this.conversation.id,
            senderId: this.current_user.id,
            text: messageText,
            type: 'text'
        };

        this.sendRealtimeMessage(message);

        this.input = '';
        setTimeout(() => this.scrollToBottom(), 0);
    }

    private sendImageMessage(file?: File): void {
        if (!file || !this.conversation?.id || !this.current_user?.id) {
            return;
        }

        this.mediaProcessingService.compressChatImage(file, 640, 0.42).then((compressedFile) => {
            return this.fileToBase64(compressedFile).then(base64 => {
                const message = {
                    conversationId: this.conversation.id,
                    senderId: this.current_user.id,
                    text: base64,
                    mediaType: compressedFile.type || file.type,
                    fileName: compressedFile.name || file.name
                };

                this.sendRealtimeMessage(message);

                setTimeout(() => this.scrollToBottom(), 0);
            });
        });
    }

    private sendAudioMessage(blob?: Blob): void {
        if (!blob || !this.conversation?.id || !this.current_user?.id) {
            return;
        }

        this.mediaProcessingService.compressAudio(blob, {
            bitRate: 24_000,
            sampleRate: 16_000
        }).then((compressedBlob) => {
            return this.blobToBase64(compressedBlob).then(base64 => {
                const message = {
                    conversationId: this.conversation.id,
                    senderId: this.current_user.id,
                    text: base64,
                    type: 'audio',
                    mediaUrl: base64,
                    mediaType: compressedBlob.type || blob.type
                };

                this.sendRealtimeMessage(message);

                setTimeout(() => this.scrollToBottom(), 0);
            });
        });
    }

    private sendStickerMessage(stickerUrl?: string): void {
        if (!stickerUrl || !this.conversation?.id || !this.current_user?.id) {
            return;
        }

        const tempId = 'temp-' + Date.now();

        const message = {
            id: tempId,
            conversationId: this.conversation.id,
            senderId: this.current_user.id,
            text: stickerUrl,
            createdAt: new Date().toISOString(),
            readBy: [this.current_user.id],
            status: 'sending'
        };

        this.sendRealtimeMessage(message);

        setTimeout(() => this.scrollToBottom(), 0);
    }
    private sendRealtimeMessage(message: any): void {
        const tempId = 'temp-' + Date.now();
        this.chatService.sendMessage({
            conversationId: message.conversationId,
            userId: message.senderId,
            text: message.text,
            tempId
        });
    }

    private normalizeMessages(messages: any[]): any[] {
        const uniqueMessages = new Map<string, any>();

        (messages ?? []).forEach(message => {
            uniqueMessages.set(this.getMessageUniqueKey(message), message);
        });

        return Array.from(uniqueMessages.values()).sort((firstMessage, secondMessage) => {
            const firstDate = new Date(firstMessage?.createdAt ?? 0).getTime();
            const secondDate = new Date(secondMessage?.createdAt ?? 0).getTime();

            return firstDate - secondDate;
        });
    }

    private getMessageUniqueKey(message: any): string {
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

    private fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;

            reader.readAsDataURL(file);
        });
    }

    private blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;

            reader.readAsDataURL(blob);
        });
    }

    loadMessages() {
        this.messagesService.getMessages(this.conversation.id)
            .subscribe((msgs: any) => {

                this.messagesStore.setActiveMessages(this.normalizeMessages(msgs ?? []));

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

    onTyping(): void {
        if (!this.conversation?.id || !this.current_user?.id) {
            return;
        }

        this.chatService.typing(
            this.conversation.id,
            this.current_user.id
        );

        clearTimeout(this.typingTimeout);

        this.typingTimeout = setTimeout(() => {
            this.onStopTyping();
        }, 1200);
    }

    onStopTyping(): void {
        if (!this.conversation?.id || !this.current_user?.id) {
            return;
        }

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

    shouldShowDateSeparator(msg: any, index: number): boolean {
        if (!msg?.createdAt) {
            return false;
        }

        if (index === 0) {
            return true;
        }

        const previousMessage = this.messages[index - 1];

        if (!previousMessage?.createdAt) {
            return true;
        }

        return !this.isSameMessageDay(previousMessage.createdAt, msg.createdAt);
    }

    getDateSeparatorLabel(msg: any): string {
        const messageDate = this.toLocalDate(msg?.createdAt);

        if (!messageDate) {
            return '';
        }

        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (this.isSameMessageDay(messageDate, today)) {
            return 'Hoje';
        }

        if (this.isSameMessageDay(messageDate, yesterday)) {
            return 'Ontem';
        }

        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: messageDate.getFullYear() === today.getFullYear() ? undefined : 'numeric'
        }).format(messageDate);
    }

    private isSameMessageDay(firstDateValue: string | Date, secondDateValue: string | Date): boolean {
        const firstDate = this.toLocalDate(firstDateValue);
        const secondDate = this.toLocalDate(secondDateValue);

        if (!firstDate || !secondDate) {
            return false;
        }

        return firstDate.getFullYear() === secondDate.getFullYear()
            && firstDate.getMonth() === secondDate.getMonth()
            && firstDate.getDate() === secondDate.getDate();
    }

    private toLocalDate(value: string | Date): Date | null {
        const date = value instanceof Date ? value : new Date(value);

        if (Number.isNaN(date.getTime())) {
            return null;
        }

        return date;
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

    openAudioCall(): void {
        const user = this.conversation?.participants
            ?.find((participant: any) => participant?.id !== this.current_user?.id);

        if (!user) {
            return;
        }

        this.dialog.open(PreCallComponent, {
            minWidth: '80vw',
            data: {
                type: 'audio',
                user,
                conversationId: this.conversation?.id
            }
        });
    }

    openVideoCall(): void {
        const user = this.conversation?.participants
            ?.find((participant: any) => participant?.id !== this.current_user?.id);

        if (!user) {
            return;
        }

        this.dialog.open(PreCallComponent, {
            minWidth: '80vw',
            data: {
                type: 'video',
                user,
                conversationId: this.conversation?.id
            }
        });
    }
}
