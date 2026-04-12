import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MessagesService } from "../../../pages/messages/messages.service";
import { UserService } from "../../../core/services/user/user.service";
import { MessagesStoreService } from "../../../pages/messages/conversation.store.service";
import { CommonModule } from "@angular/common";
import { ConversationItemComponent } from "../conversation-item/conversation-item.component";
import { ChatService } from "../../../core/services/messages/chat.service";
import { Message } from "../../../core/models/messages/messages.model";

@Component({
    selector: "app-share-post-component",
    templateUrl: "./share-post-component.html",
    styleUrl: "./share-post-component.scss",
    imports: [MatIcon, CommonModule, ConversationItemComponent],
})
export class SharePostComponent implements OnInit {
    @Inject(MAT_DIALOG_DATA) public data!: { postId: string };
    conversations$: any;
    typing$: any;
    current_user: any;
    selectedConversations: string[] = [];
    constructor(
        private readonly dialog: MatDialog,
        private readonly store: MessagesStoreService,
        private readonly userService: UserService,
        private readonly chatService: ChatService,
        private readonly messagesService: MessagesService
    ) {
        this.conversations$ = this.store.conversationsObs$;
        this.typing$ = this.store.typingObs$;

        this.userService.user$.subscribe(user => {
            this.current_user = user;
        });

        console.warn('DATA RECEBIDA:', this.data);
        console.warn('POST ID:', this.data?.postId);
    }
    
    ngOnInit() {
        this.userService.user$.subscribe(user => {
            if (!user) return;

            this.messagesService
                .getConversationsByUserId(user.id)
                .subscribe((convos: any) => {
                    this.store.setConversations(convos);
                });
        });
    }

    close() {
        this.dialog.closeAll();
    }

    onSelect(convo: any) {
        const id = convo.id;

        if (this.selectedConversations.includes(id)) {
            this.selectedConversations = this.selectedConversations.filter(c => c !== id);
        } else {
            this.selectedConversations.push(id);
        }
    }

    send() {
        if (!this.selectedConversations.length) return;

        this.selectedConversations.forEach(convoId => {
            const tempId = 'temp-' + Date.now() + '-' + convoId;

            const message: Message = {
                id: tempId,
                conversationId: convoId,
                senderId: this.current_user.id,
                text: globalThis.location.origin + '/p/' + this.data?.postId,
                createdAt: new Date().toISOString(),
                readyBy: [],
            };


            this.chatService.sendMessage({
                conversationId: message.conversationId,
                userId: message.senderId,
                text: message.text,
                tempId
            });
        });

        this.close();
    }
}