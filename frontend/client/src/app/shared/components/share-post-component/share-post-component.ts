import { Component, inject, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MessagesService } from "../../../pages/messages/messages.service";
import { UserService } from "../../../core/services/user/user.service";
import { MessagesStoreService } from "../../../store/conversation.store.service";
import { CommonModule } from "@angular/common";
import { ConversationItemComponent } from "../conversation-item/conversation-item.component";
import { ChatService } from "../../../core/services/messages/chat.service";
import { Message } from "../../../core/models/messages/messages.model";
import { GenericButtonComponent } from "../generic-button-component/generic-button.component";
import {
    MatSnackBar
} from '@angular/material/snack-bar';
import { BasicInputComponent } from "../basic-input-component/basic-input.component";
import { User } from "../../../core/models/user/user.model";
import { LoaderComponent } from "../loader-component/loader.component";
import { TranslateModule } from "@ngx-translate/core";
@Component({
    selector: "app-share-post-component",
    templateUrl: "./share-post-component.html",
    styleUrl: "./share-post-component.scss",
    imports: [MatIcon, CommonModule, ConversationItemComponent, GenericButtonComponent, BasicInputComponent, LoaderComponent, TranslateModule],
})
export class SharePostComponent implements OnInit {
    private readonly _snackBar = inject(MatSnackBar);
    conversations$: any;
    typing$: any;
    current_user: any;
    selectedConversations: string[] = [];
    input: string = "";
    filteredConversations: any[] = [];
    isLoading: boolean = true;
    private convosCache: any[] = [];
    constructor(
        private readonly dialog: MatDialog,
        private readonly store: MessagesStoreService,
        private readonly userService: UserService,
        private readonly chatService: ChatService,
        private readonly messagesService: MessagesService,
        @Inject(MAT_DIALOG_DATA) public data: { postId?: string, storyId?: string }
    ) {
        this.conversations$ = this.store.conversationsObs$;
        this.typing$ = this.store.typingObs$;

        this.conversations$.subscribe((convos: any[]) => {
            this.convosCache = convos || [];
            this.applyFilter(this.input);
        });

        this.userService.user$.subscribe(user => {
            this.current_user = user;
        });
    }

    ngOnInit() {
        this.userService.user$.subscribe(user => {
            if (!user) return;

            this.isLoading = true;

            this.messagesService
                .getConversationsByUserId(user.id)
                .subscribe((convos: any) => {
                    this.store.setConversations(convos);
                    this.convosCache = convos || [];
                    this.applyFilter(this.input);
                    this.isLoading = false;
                }, () => {
                    this.isLoading = false;
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

            let text = "";
            if (this.data?.postId) {
                text = globalThis.location.origin + '/p/' + this.data?.postId
            }
            else {
                text = globalThis.location.origin + '/memories/' + this.data?.storyId
            }

            const message: Message = {
                id: tempId,
                conversationId: convoId,
                senderId: this.current_user.id,
                text: text,
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

        this._snackBar.open('Enviado!', undefined, {
            duration: 2000,
        });
        this.close();
    }

    applyFilter(event: any) {
        this.input = event;
        const convos = this.convosCache || [];

        if (event == "") {
            this.filteredConversations = convos;
            return;
        }

        const term = event.toLowerCase();

        this.filteredConversations = convos.filter(c => {
            // remove o usuário atual da lista
            const others = (c.participants || []).filter((p: User) => p.id !== this.current_user?.id);

            // string pesquisável (nome + username)
            const names = others
                .map((p: User) => (p.fullName || p.username || '').toLowerCase())
                .join(' ');

            // última mensagem
            const lastMessage = (c.lastMessage?.text || '').toLowerCase();

            // match
            return names.includes(term) || lastMessage.includes(term);
        });
    }
}