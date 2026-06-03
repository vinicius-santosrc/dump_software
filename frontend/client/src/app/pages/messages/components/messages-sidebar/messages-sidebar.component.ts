import { Component, Output, EventEmitter, Injectable } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { User } from "../../../../core/models/user/user.model";
import { UserService } from "../../../../core/services/user/user.service";
import { ConversationMessages } from "../../../../core/models/messages/messages.model";
import { CreateConversationComponent } from "../../../../shared/components/create-conversation-component/create-conversation-component";
import { MatDialog } from "@angular/material/dialog";
import { MessagesStoreService } from "../../../../store/conversation.store.service";
import { CommonModule } from "@angular/common";
import { ConversationItemComponent } from "../../../../shared/components/conversation-item/conversation-item.component";
import { MatButton } from "@angular/material/button";
import { TranslateModule } from "@ngx-translate/core";
import { BasicInputComponent } from "../../../../shared/components/basic-input-component/basic-input.component";
import { MatTabGroup, MatTab } from "@angular/material/tabs";
import { MemoriesComponent } from "../../../../layout/header/memories-component/memories.component";

@Component({
    selector: "app-messages-sidebar",
    templateUrl: "./messages-sidebar.component.html",
    styleUrls: ["./messages-sidebar.component.scss"],
    imports: [MatIcon, CommonModule, ConversationItemComponent, MatButton, TranslateModule, BasicInputComponent, MatTabGroup, MatTab, MemoriesComponent]
})
@Injectable({
    providedIn: 'root'
})
export class MessagesSidebarComponent {
    conversations$: any;
    typing$: any;
    @Output() onSelectUser = new EventEmitter<any>();
    current_user: any;

    constructor(
        private readonly userService: UserService,
        private readonly dialog: MatDialog,
        private readonly store: MessagesStoreService
    ) {
        this.userService.user$.subscribe((user: any) => {
            this.current_user = user;
        });
        this.conversations$ = this.store.conversationsObs$;
        this.typing$ = this.store.typingObs$;
    }

    onSelect(user: any) {
        this.onSelectUser.emit(user);
    }

    get isMobile(): boolean {
        return window.innerWidth <= 768;
    }

    goBack() {
        globalThis.history.back();
    }

    getUserById(convo: ConversationMessages, id: string): User | undefined {
        return convo.participants.find((user: User) => user.id === id);
    }

    getConversationName(convo: ConversationMessages): string {
        if (!convo || !convo.participants) return '';

        // chat privado
        if (convo.participants.length === 2) {
            const otherUser = convo.participants.find((u: User) => u.id !== this.current_user.id);
            return otherUser?.fullName || '';
        }

        // grupo → nomes separados por vírgula
        return convo.participants
            .map((u: User) => u.fullName)
            .join(', ');
    }
    getConversationAvatar(convo: ConversationMessages): string {
        if (!convo || !convo.participants) return '/assets/app/media/default-avatar.webp';

        // chat privado
        if (convo.participants.length === 2) {
            const otherUser = convo.participants.find((u: User) => u.id !== this.current_user.id);
            return otherUser?.profilePictureUrl || '/assets/app/media/default-avatar.webp';
        }
        return '/assets/app/media/default-avatar.webp';
    }

    isTyping(convoId: string, typingMap: any): boolean {
        if (!typingMap) return false;

        const users = typingMap[convoId] ?? [];
        return users.length > 0;
    }

    getLastMessage(convo: ConversationMessages): string {
        const lastMessage: any = convo?.lastMessage;

        if (!lastMessage) {
            return '';
        }

        const prefix = lastMessage?.senderId === this.current_user?.id ? 'Você: ' : '';

        return `${prefix}${this.getLastMessagePreview(lastMessage)}`;
    }

    private getLastMessagePreview(lastMessage: any): string {
        const type = lastMessage?.type ?? 'text';
        const text = lastMessage?.text ?? '';
        const mediaType = lastMessage?.mediaType ?? '';

        if (type === 'image' || mediaType.startsWith('image/') || text.startsWith('data:image')) {
            return '📷 Imagem';
        }

        if (type === 'audio' || mediaType.startsWith('audio/') || text.startsWith('data:audio')) {
            return '🎙️ Áudio';
        }

        if (type === 'sticker' || lastMessage?.stickerUrl || text.includes('/stickers/') || text.includes('assets/stickers/')) {
            return 'Sticker';
        }

        return text;
    }

    public clickCreateConversation() {
        this.dialog.open(CreateConversationComponent, {
            width: '650px',
            height: '75vh'
        }).afterClosed().subscribe((newConversation) => {
            if (!newConversation) return;

            this.store.conversationsObs$.subscribe((current) => {
                this.store.setConversations([newConversation, ...current]);
            });
        });
    }

    getUnreadCount(convo: any): number {
        const userId = this.current_user?.id;

        if (!userId || !convo) {
            return 0;
        }

        const unreadCount = convo.unreadCount ?? convo.unreadCounts ?? convo.unread ?? {};

        if (typeof unreadCount === 'number') {
            return unreadCount;
        }

        return Number(unreadCount[userId] ?? 0);
    }
    hasUnread(convo: any): boolean {
        return this.getUnreadCount(convo) > 0;
    }
}