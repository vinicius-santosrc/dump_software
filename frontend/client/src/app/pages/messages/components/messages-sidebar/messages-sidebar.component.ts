import { Component, Input, Output, EventEmitter } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { User } from "../../../../core/models/user/user.model";
import { UserService } from "../../../../core/services/user/user.service";
import { ConversationMessages } from "../../../../core/models/messages/messages.model";
import { CreateConversationComponent } from "../../../../shared/components/create-conversation-component/create-conversation-component";
import { MatDialog } from "@angular/material/dialog";
import { MessagesStoreService } from "../../conversation.store.service";
import { CommonModule } from "@angular/common";
import { ConversationItemComponent } from "../../../../shared/components/conversation-item/conversation-item.component";

@Component({
    selector: "app-messages-sidebar",
    templateUrl: "./messages-sidebar.component.html",
    styleUrls: ["./messages-sidebar.component.scss"],
    imports: [MatIcon, CommonModule, ConversationItemComponent]
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
        if (convo.participants.length === 2) {
            if (convo?.lastMessage?.senderId == this.current_user.id) {
                return "Você: " + convo?.lastMessage?.text
            }
            return convo?.lastMessage?.text
        }
        return '';
    }

    clickCreateConversation() {
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
        if (!convo?.unreadCount) return 0;

        return convo.unreadCount[this.current_user.id] ?? 0;
    }
}