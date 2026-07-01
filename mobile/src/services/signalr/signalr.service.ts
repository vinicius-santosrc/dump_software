

import { API_CONFIG } from '@/config/api.config';
import * as signalR from '@microsoft/signalr';

type SignalRCallback = (...args: any[]) => void;

class SignalrService {
    private hubConnection: signalR.HubConnection | null = null;
    private currentUserId = '';
    private startingConnectionPromise: Promise<void> | null = null;

    get connection(): signalR.HubConnection | null {
        return this.hubConnection;
    }

    get isConnected(): boolean {
        return this.hubConnection?.state === signalR.HubConnectionState.Connected;
    }

    get isConnecting(): boolean {
        return this.hubConnection?.state === signalR.HubConnectionState.Connecting;
    }

    async startConnection(userId: string): Promise<void> {
        if (!userId) {
            return;
        }

        if (this.isConnected && this.currentUserId === userId) {
            return;
        }

        if (this.isConnecting && this.startingConnectionPromise) {
            return this.startingConnectionPromise;
        }

        if (this.hubConnection && this.currentUserId !== userId) {
            await this.stopConnection();
        }

        this.currentUserId = userId;

        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${API_CONFIG.baseUrl}/chatHub?userId=${encodeURIComponent(userId)}`, {
                transport: signalR.HttpTransportType.WebSockets,
                skipNegotiation: true
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        this.hubConnection.onreconnecting(() => {
            console.warn('[SignalR] reconnecting...');
        });

        this.hubConnection.onreconnected(() => {
            console.warn('[SignalR] reconnected');
        });

        this.hubConnection.onclose(() => {
            console.warn('[SignalR] disconnected');
        });

        this.startingConnectionPromise = this.hubConnection
            .start()
            .then(() => {
                console.warn('[SignalR] connected');
            })
            .finally(() => {
                this.startingConnectionPromise = null;
            });

        return this.startingConnectionPromise;
    }

    async stopConnection(): Promise<void> {
        if (!this.hubConnection) {
            return;
        }

        this.clearAll();

        if (this.hubConnection.state !== signalR.HubConnectionState.Disconnected) {
            await this.hubConnection.stop();
        }

        this.hubConnection = null;
        this.currentUserId = '';
        this.startingConnectionPromise = null;
    }

    on(event: string, callback: SignalRCallback): void {
        if (!event || !this.hubConnection) {
            return;
        }

        this.hubConnection.on(event, callback);
    }

    off(event: string, callback?: SignalRCallback): void {
        if (!event || !this.hubConnection) {
            return;
        }

        if (callback) {
            this.hubConnection.off(event, callback);
            return;
        }

        this.hubConnection.off(event);
    }

    async invoke(method: string, ...args: any[]): Promise<any> {
        if (!this.hubConnection) {
            throw new Error('SignalR connection not initialized');
        }

        await this.waitUntilConnected();

        if (this.hubConnection.state !== signalR.HubConnectionState.Connected) {
            return;
        }

        return this.hubConnection.invoke(method, ...args);
    }

    clearAll(): void {
        if (!this.hubConnection) {
            return;
        }

        this.hubConnection.off('ReceiveMessage');
        this.hubConnection.off('MessageRead');
        this.hubConnection.off('UserOnline');
        this.hubConnection.off('UserOffline');
        this.hubConnection.off('Typing');
        this.hubConnection.off('StopTyping');
    }

    private async waitUntilConnected(): Promise<void> {
        if (!this.hubConnection) {
            return;
        }

        if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
            return;
        }

        if (this.startingConnectionPromise) {
            await this.startingConnectionPromise;
            return;
        }

        if (this.hubConnection.state === signalR.HubConnectionState.Connecting) {
            await new Promise<void>((resolve) => {
                const interval = setInterval(() => {
                    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 100);
            });
        }
    }
}

export const signalrService = new SignalrService();
export default signalrService;