import { Component } from "@angular/core";
import { MessagesSidebarComponent } from "./components/messages-sidebar/messages-sidebar.component";
import { MessagesChatComponent } from "./components/messages-chat/messages-chat.component";
import { UserService } from "../../core/services/user/user.service";

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
  selector: "app-messages-component",
  templateUrl: "./messages.component.html",
  styleUrls: ["./messages.component.scss"],
  imports: [MessagesSidebarComponent, MessagesChatComponent],
})
export class MessagesComponent {
  search = "";
  relatedUsers: any[] = [];
  selectedUser: any = null;
  input: string = "";
  
  constructor(
    private readonly useservice: UserService
  ) {
    this.getRelatedUsers();
  }

  getRelatedUsers() {
    this.useservice.getRelatedByCurrentUser().subscribe((users: any) => {
      this.relatedUsers = users;
    });
  }

  onSelectUser(user: any) {
    this.selectedUser = user;
  }
}