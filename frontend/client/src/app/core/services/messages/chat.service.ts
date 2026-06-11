import * as signalR from '@microsoft/signalr';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../../config/api.config';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  public hubConnection!: signalR.HubConnection;

  constructor(
    private readonly http: HttpClient,
    private readonly notificationService: NotificationService
  ) { }

  async startConnection(userId: string) {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_CONFIG.baseUrl}/chat?userId=${userId}`)
      .withAutomaticReconnect()
      .build();

    await this.hubConnection.start();
    await this.joinUserRoom(userId);
  }

  joinConversation(conversationId: string) {
    return this.hubConnection.invoke('JoinConversation', conversationId);
  }

  joinUserRoom(userId: string) {
    return this.hubConnection.invoke('JoinUserRoom', userId);
  }

  getOnlineUsers(): Promise<string[]> {
    return this.hubConnection.invoke('GetOnlineUsers');
  }

  sendMessage(data: any) {
    return this.hubConnection.invoke('SendMessage', data);
  }

  markAsRead(messageId: string, userId: string) {
    return this.http.post(`${API_CONFIG.baseUrl}/messages/read`, {
      messageId,
      userId
    }).subscribe();
  }

  // =========================
  // EVENTOS (SOCKET PURO)
  // =========================

  onReceiveMessage(callback: any) {
    if (!this.hubConnection) return;

    this.hubConnection.off("ReceiveMessage");
    this.hubConnection.on("ReceiveMessage", callback);
  }

  onMessageRead(callback: (msg: any) => void) {
    if (!this.hubConnection) return;

    this.hubConnection.off('MessageRead');
    this.hubConnection.on('MessageRead', callback);
  }

  onUserOnline(callback: (userId: string) => void) {
    if (!this.hubConnection) return;

    this.hubConnection.off('UserOnline');
    this.hubConnection.on('UserOnline', callback);
  }

  onUserOffline(callback: (userId: string) => void) {
    if (!this.hubConnection) return;

    this.hubConnection.off('UserOffline');
    this.hubConnection.on('UserOffline', callback);
  }

  onTyping(callback: (data: any) => void) {
    if (!this.hubConnection) return;

    this.hubConnection.off('Typing');
    this.hubConnection.on('Typing', callback);
  }

  onStopTyping(callback: (data: any) => void) {
    if (!this.hubConnection) return;

    this.hubConnection.off('StopTyping');
    this.hubConnection.on('StopTyping', callback);
  }

  // =========================
  // EMIT EVENTS
  // =========================

  typing(conversationId: string, userId: string) {
    return this.hubConnection.invoke("Typing", conversationId, userId);
  }

  stopTyping(conversationId: string, userId: string) {
    return this.hubConnection.invoke("StopTyping", conversationId, userId);
  }

  clearAll() {
    this.hubConnection.off('ReceiveMessage');
    this.hubConnection.off('MessageRead');
    this.hubConnection.off('UserOnline');
    this.hubConnection.off('UserOffline');
    this.hubConnection.off('Typing');
    this.hubConnection.off('StopTyping');
  }
}