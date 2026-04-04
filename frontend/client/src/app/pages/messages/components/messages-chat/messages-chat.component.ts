import { HttpClientModule } from "@angular/common/http";
import { Component, Input, OnChanges, OnInit } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { ChatService } from "../../../../core/services/messages/chat.service";
import { UserService } from "../../../../core/services/user/user.service";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MessagesService } from "../../messages.service";

interface Message {
    text: string;
    fromMe: boolean;
    time?: string;
}

interface Conversation {
    id: number;
    name: string;
    avatar: string;
    lastMessage: string;
    time: string;
    active?: boolean;
    messages: Message[];
}

@Component({
    selector: "app-messages-chat",
    standalone: true,
    templateUrl: "./messages-chat.component.html",
    styleUrls: ["./messages-chat.component.scss"],
    imports: [MatIcon, FormsModule, CommonModule, HttpClientModule]
})

export class MessagesChatComponent implements OnInit, OnChanges {
    @Input() user: any;
    messages: any[] = [];
    current_user: any;
    input: string = "";
    activeConversation: any;

    constructor(private chatService: ChatService, private readonly userService: UserService, private readonly messagesService: MessagesService) {
        this.current_user = this.userService.getUser();
    }

    ngOnInit() {
        this.chatService.startConnection();

        this.chatService.onReceiveMessage((msg) => {
            this.messages.push(msg);
        });
    }

    ngOnChanges() {
        if (this.user) {
            this.loadMessages();
            this.chatService.joinConversation("69d083d5b4cc14f7db173345");
        }
    }

    sendMessage() {
        const message = {
            conversationId: "69d083d5b4cc14f7db173345",
            userId: this.current_user.id,
            text: this.input
        };

        this.chatService.sendMessage(message);
        this.input = '';
    }

    loadMessages() {
        this.messagesService.loadMessages('69d083d5b4cc14f7db173345').subscribe((msgs: any) => {
            this.messages = msgs;
        });
    }
}