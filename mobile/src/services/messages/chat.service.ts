import { API_CONFIG } from '@/config/api';
import * as signalR from '@microsoft/signalr';

function normalizeSignalRArgs(args: any[]) {
  if (args.length <= 1) {
    return args[0];
  }

  const [conversationId, userId, extra] = args;

  return {
    ...(typeof extra === 'object' && extra !== null ? extra : {}),
    conversationId,
    userId
  };
}

class ChatService {
  public hubConnection!: signalR.HubConnection;

  constructor() { }

  private async ensureConnected() {
    if (!this.hubConnection) {
      throw new Error('Chat connection was not initialized');
    }

    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    if (this.hubConnection.state === signalR.HubConnectionState.Connecting || this.hubConnection.state === signalR.HubConnectionState.Reconnecting) {
      await new Promise<void>((resolve, reject) => {
        let attempts = 0;

        const interval = setInterval(() => {
          attempts += 1;

          if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
            clearInterval(interval);
            resolve();
            return;
          }

          if (this.hubConnection.state === signalR.HubConnectionState.Disconnected) {
            clearInterval(interval);
            reject(new Error('Chat connection disconnected while waiting to connect'));
            return;
          }

          if (attempts >= 50) {
            clearInterval(interval);
            reject(new Error('Timeout waiting for chat connection'));
          }
        }, 100);
      });

      return;
    }

    await this.hubConnection.start();
  }

  private async safeInvoke<T = any>(methodName: string, ...args: any[]): Promise<T> {
    await this.ensureConnected();
    return this.hubConnection.invoke<T>(methodName, ...args);
  }

  async startConnection(userId: string) {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.joinUserRoom(userId);
      return;
    }

    if (!this.hubConnection || this.hubConnection.state === signalR.HubConnectionState.Disconnected) {
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_CONFIG.baseUrl}/chat?userId=${encodeURIComponent(userId)}`)
        .withAutomaticReconnect()
        .build();
    }

    await this.ensureConnected();
    await this.joinUserRoom(userId);
  }

  joinConversation(conversationId: string) {
    return this.safeInvoke('JoinConversation', conversationId);
  }

  joinUserRoom(userId: string) {
    return this.safeInvoke('JoinUserRoom', userId);
  }

  getOnlineUsers(): Promise<string[]> {
    return this.safeInvoke<string[]>('GetOnlineUsers');
  }

  sendMessage(data: any) {
    return this.hubConnection.invoke('SendMessage', data);
  }

  async markAsRead(messageId: string, userId: string) {
    await fetch(`${API_CONFIG.baseUrl}/messages/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messageId,
        userId
      })
    });
  }

  async markMessagesAsRead(messageIds: string[], userId: string) {
    const uniqueMessageIds = Array.from(new Set(messageIds.filter(Boolean)));

    await Promise.all(uniqueMessageIds.map(messageId => this.markAsRead(messageId, userId)));
  }


  // =========================
  // EVENTOS (SOCKET PURO)
  // =========================

  onReceiveMessage(callback: any) {
    if (!this.hubConnection) return;

    const handler = (...args: any[]) => callback(normalizeSignalRArgs(args));

    this.hubConnection.off('ReceiveMessage');
    this.hubConnection.on('ReceiveMessage', handler);
  }

  onMessageRead(callback: (msg: any) => void) {
    if (!this.hubConnection) return;

    const handler = (...args: any[]) => callback(normalizeSignalRArgs(args));

    this.hubConnection.off('MessageRead');
    this.hubConnection.on('MessageRead', handler)
  }

  onUserOnline(callback: (userId: string) => void) {
    if (!this.hubConnection) return;

    const handler = (...args: any[]) => callback(String(args[0] ?? ''));

    this.hubConnection.off('UserOnline');
    this.hubConnection.on('UserOnline', handler);
  }

  onUserOffline(callback: (userId: string) => void) {
    if (!this.hubConnection) return;

    const handler = (...args: any[]) => callback(String(args[0] ?? ''));

    this.hubConnection.off('UserOffline');
    this.hubConnection.on('UserOffline', handler);
  }

  onTyping(callback: (data: any) => void) {
    if (!this.hubConnection) return;

    const handler = (...args: any[]) => callback(normalizeSignalRArgs(args));

    this.hubConnection.off('Typing');
    this.hubConnection.on('Typing', handler);
  }

  onStopTyping(callback: (data: any) => void) {
    if (!this.hubConnection) return;

    const handler = (...args: any[]) => callback(normalizeSignalRArgs(args));

    this.hubConnection.off('StopTyping');
    this.hubConnection.on('StopTyping', handler);
  }

  // =========================
  // EMIT EVENTS
  // =========================


  async typing(conversationId: string, userId: string) {
    return this.safeInvoke("Typing", conversationId, userId);
  }

  async stopTyping(conversationId: string, userId: string) {
    return this.safeInvoke("StopTyping", conversationId, userId);
  }

  clearAll() {
    if (!this.hubConnection) return;

    this.hubConnection.off('ReceiveMessage');
    this.hubConnection.off('MessageRead');
    this.hubConnection.off('UserOnline');
    this.hubConnection.off('UserOffline');
    this.hubConnection.off('Typing');
    this.hubConnection.off('StopTyping');
  }
}

export const chatService = new ChatService();
export default chatService;
