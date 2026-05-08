import { Component, Injectable, OnInit } from "@angular/core";
import { MessagesSidebarComponent } from "./components/messages-sidebar/messages-sidebar.component";
import { MessagesChatComponent } from "./components/messages-chat/messages-chat.component";
import { UserService } from "../../core/services/user/user.service";
import { MessagesStoreService } from "../../store/conversation.store.service";
import { MessagesService } from "./messages.service";
@Component({
  selector: "app-messages-component",
  templateUrl: "./messages.component.html",
  styleUrls: ["./messages.component.scss"],
  imports: [MessagesSidebarComponent, MessagesChatComponent],
})
@Injectable({
  providedIn: 'root'
})
export class MessagesComponent implements OnInit {
  search = "";
  conversations: any[] = [];
  selectedConversation: any;
  input: string = "";

  constructor(
    private readonly userService: UserService,
    private readonly messagesService: MessagesService,
    private readonly store: MessagesStoreService
  ) { }

  ngOnInit() {
    this.getConversations();

    // 🔥 realtime local (antes do websocket)
    globalThis.addEventListener('conversationCreated', (event: any) => {
      this.getConversations();
    });
    
    this.store.refresh$.subscribe(() => {
      this.getConversations();
    });
  }

  getConversations() {
    this.messagesService.getConversationsByUserId(this.userService?.getUser().id)
      .subscribe((conversations: any) => {

        const sorted = (conversations || []).sort((a: any, b: any) => {
          const dateA = new Date(a?.lastMessage?.createdAt || 0).getTime();
          const dateB = new Date(b?.lastMessage?.createdAt || 0).getTime();
          return dateB - dateA;
        });

        this.conversations = sorted;
        this.store.setConversations(sorted);
      });
  }

  get isMobile(): boolean {
    return window.innerWidth <= 768;
  }

  onSelectUser(conversationDoc: any) {
    this.selectedConversation = conversationDoc;
  }
}