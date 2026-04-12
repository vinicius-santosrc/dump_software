import { Component, OnInit } from "@angular/core";
import { MessagesSidebarComponent } from "./components/messages-sidebar/messages-sidebar.component";
import { MessagesChatComponent } from "./components/messages-chat/messages-chat.component";
import { UserService } from "../../core/services/user/user.service";
import { MessagesStoreService } from "./conversation.store.service";
import { MessagesService } from "./messages.service";
@Component({
  selector: "app-messages-component",
  templateUrl: "./messages.component.html",
  styleUrls: ["./messages.component.scss"],
  imports: [MessagesSidebarComponent, MessagesChatComponent],
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
  }

  getConversations() {
    this.messagesService.getConversationsByUserId(this.userService?.getUser().id)
      .subscribe((conversations: any) => {
        this.conversations = conversations;
        this.store.setConversations(conversations);
      });
  }

  get isMobile(): boolean {
    return window.innerWidth <= 768;
  }

  onSelectUser(conversationDoc: any) {
    this.selectedConversation = conversationDoc;
  }
}