import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { API_CONFIG } from '../../config/api.config';

@Injectable({
    providedIn: 'root'
})
export class SignalrService {

    private hubConnection?: signalR.HubConnection;

    async startConnection(userId: string): Promise<void> {
        if (
            this.hubConnection?.state === signalR.HubConnectionState.Connected ||
            this.hubConnection?.state === signalR.HubConnectionState.Connecting
        ) {
            return;
        }

        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${API_CONFIG.baseUrl}/chatHub?userId=${userId}`)
            .withAutomaticReconnect()
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

        if (this.hubConnection.state === signalR.HubConnectionState.Disconnected) {
            await this.hubConnection.start();
        }

        console.warn('[SignalR] connected');
    }

    async stopConnection(): Promise<void> {
        if (!this.hubConnection) {
            return;
        }

        await this.hubConnection.stop();
    }

    on(event: string, callback: (...args: any[]) => void): void {
        this.hubConnection?.on(event, callback);
    }

    off(event: string): void {
        this.hubConnection?.off(event);
    }

    async invoke(method: string, data?: any): Promise<any> {

        if (!this.hubConnection) {
            throw new Error('SignalR connection not initialized');
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

        if (this.hubConnection.state !== signalR.HubConnectionState.Connected) {
            return;
        }

        return await this.hubConnection.invoke(method, data);
    }

    get connection(): signalR.HubConnection | undefined {
        return this.hubConnection;
    }
}
