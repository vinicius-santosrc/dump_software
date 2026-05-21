import { Injectable } from '@angular/core';
import { ChatService } from '../chat.service';

@Injectable({
    providedIn: 'root'
})
export class CallService {

    public incomingCall: any = null;
    public activeCall: any = null;

    public outgoingCall: any = null;
    public onCallConnected?: (payload: any) => void;
    public onCallEnded?: () => void;

    public callStatus:
        | 'idle'
        | 'calling'
        | 'ringing'
        | 'connected'
        | 'rejected'
        | 'unavailable'
        | 'ended' = 'idle';

    private eventsRegistered: boolean = false;

    constructor(
        private readonly chatService: ChatService
    ) {
        this.waitForConnection();
    }

    private waitForConnection(): void {
        const interval = setInterval(() => {
            if (
                this.chatService.hubConnection &&
                !this.eventsRegistered
            ) {
                this.registerEvents();
                this.eventsRegistered = true;
                clearInterval(interval);
                console.warn('[CALL] SignalR listeners registered');
            }
        }, 300);
    }

    registerEvents(): void {
        this.chatService.hubConnection?.on('IncomingCall', (payload) => {
            console.warn('[CALL] IncomingCall', payload);
            this.incomingCall = payload;
            this.callStatus = 'ringing';
        });

        this.chatService.hubConnection?.on('CallAccepted', (payload) => {
            console.warn('[CALL] CallAccepted', payload);
            this.activeCall = payload;
            this.callStatus = 'connected';
            if (this.onCallConnected) {
                this.onCallConnected(payload);
            }
        });

        this.chatService.hubConnection?.on('CallRejected', (payload) => {
            console.warn('[CALL] CallRejected', payload);

            this.callStatus = 'rejected';

            setTimeout(() => {
                this.resetCallState();
            }, 2200);
        });

        this.chatService.hubConnection?.on('CallEnded', (payload) => {
            console.warn('[CALL] CallEnded', payload);

            this.callStatus = 'ended';

            if (this.onCallEnded) {
                this.onCallEnded();
            }

            setTimeout(() => {
                this.resetCallState();
            }, 300);
        });

        this.chatService.hubConnection?.on('ReceiveOffer', (payload) => {
            console.warn('[WEBRTC] ReceiveOffer', payload);
        });

        this.chatService.hubConnection?.on('ReceiveAnswer', (payload) => {
            console.warn('[WEBRTC] ReceiveAnswer', payload);
        });

        this.chatService.hubConnection?.on('ReceiveIceCandidate', (payload) => {
            console.warn('[WEBRTC] ReceiveIceCandidate', payload);
        });
    }

    async startAudioCall(data: {
        callerId: string;
        targetUserId: string;
        conversationId: string;
    }): Promise<void> {
        if (!this.chatService.hubConnection) {
            console.error('[CALL] hubConnection not initialized');
            return;
        }
        this.outgoingCall = data;
        this.callStatus = 'calling';
        await this.chatService.hubConnection.invoke('CallUser', {
            ...data,
            type: 'audio'
        });
    }

    async startVideoCall(data: {
        callerId: string;
        targetUserId: string;
        conversationId: string;
    }): Promise<void> {
        if (!this.chatService.hubConnection) {
            console.error('[CALL] hubConnection not initialized');
            return;
        }
        this.outgoingCall = data;
        this.callStatus = 'calling';
        try {
            await this.chatService.hubConnection.invoke('CallUser', {
                ...data,
                type: 'video'
            });
        }
        catch(error: any) {
            console.error('Error starting video call', error);
        }
    }

    async acceptCall(payload: any): Promise<void> {
        this.activeCall = payload;
        this.callStatus = 'connected';
        if (this.onCallConnected) {
            this.onCallConnected(payload);
        }

        await this.chatService.hubConnection.invoke('AcceptCall', payload);

        this.incomingCall = null;
    }

    async rejectCall(payload: any): Promise<void> {
        await this.chatService.hubConnection.invoke('RejectCall', payload);

        this.resetCallState();
    }

    async endCall(payload: any): Promise<void> {

        const activePayload =
            this.activeCall ||
            this.incomingCall ||
            this.outgoingCall ||
            {};

        const finalPayload = {
            callerId:
                payload?.callerId ||
                activePayload?.callerId,

            targetUserId:
                payload?.targetUserId ||
                activePayload?.targetUserId,

            conversationId:
                payload?.conversationId ||
                activePayload?.conversationId,

            type:
                payload?.type ||
                activePayload?.type
        };

        console.warn('[CALL] EndCall payload', finalPayload);

        await this.chatService.hubConnection.invoke('EndCall', finalPayload);

        this.callStatus = 'ended';
    }

    resetCallState(): void {
        this.incomingCall = null;
        this.activeCall = null;
        this.outgoingCall = null;

        this.callStatus = 'idle';
    }
}
