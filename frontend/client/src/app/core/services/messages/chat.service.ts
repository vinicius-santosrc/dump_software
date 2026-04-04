import * as signalR from '@microsoft/signalr';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
    private hubConnection!: signalR.HubConnection;

    startConnection() {
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5207/chat')
            .withAutomaticReconnect()
            .build();

        this.hubConnection.start();
    }

    joinConversation(conversationId: string) {
        this.hubConnection.invoke('JoinConversation', conversationId);
    }

    sendMessage(data: any) {
        this.hubConnection.invoke('SendMessage', data);
    }

    onReceiveMessage(callback: (msg: any) => void) {
        this.hubConnection.on('ReceiveMessage', callback);
    }

    getConversation(currentUserId: string, otherUserId: string) {
        return this.hubConnection.invoke('GetConversation', currentUserId, otherUserId);
    }
}