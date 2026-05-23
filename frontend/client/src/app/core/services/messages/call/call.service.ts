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
    public onCallDisconnected?: () => void;
    public onReceiveOffer?: (payload: any) => void;
    public onReceiveAnswer?: (payload: any) => void;
    public onReceiveIceCandidate?: (payload: any) => void;

    public onRemoteCameraToggled?: (payload: any) => void;
    public onRemoteMicrophoneToggled?: (payload: any) => void;

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
            }
        }, 300);
    }

    registerEvents(): void {
        this.chatService.hubConnection?.on('IncomingCall', (payload) => {
            this.incomingCall = payload;
            this.callStatus = 'ringing';
        });

        this.chatService.hubConnection?.on('CallAccepted', (payload) => {
            this.activeCall = payload;
            this.callStatus = 'connected';
            if (this.onCallConnected) {
                this.onCallConnected(payload);
            }
        });

        this.chatService.hubConnection?.on('CallRejected', (payload) => {

            this.callStatus = 'rejected';

            setTimeout(() => {
                this.resetCallState();
            }, 2200);
        });

        this.chatService.hubConnection?.on('CallEnded', (payload) => {
            this.callStatus = 'ended';

            if (this.onCallEnded) {
                this.onCallEnded();
            }

            if (this.onCallDisconnected) {
                this.onCallDisconnected();
            }

            setTimeout(() => {
                this.resetCallState();
            }, 300);
        });

        this.chatService.hubConnection?.on('CallCameraToggled', (payload) => {
            console.warn('[CALL] CallCameraToggled', payload);

            if (this.onRemoteCameraToggled) {
                this.onRemoteCameraToggled(payload);
            }
        });

        this.chatService.hubConnection?.on('CallMicrophoneToggled', (payload) => {
            console.warn('[CALL] CallMicrophoneToggled', payload);

            if (this.onRemoteMicrophoneToggled) {
                this.onRemoteMicrophoneToggled(payload);
            }
        });

        this.chatService.hubConnection?.on('ReceiveOffer', (payload) => {
            if (this.onReceiveOffer) {
                this.onReceiveOffer(payload);
            }
        });

        this.chatService.hubConnection?.on('ReceiveAnswer', (payload) => {
            if (this.onReceiveAnswer) {
                this.onReceiveAnswer(payload);
            }
        });

        this.chatService.hubConnection?.on('ReceiveIceCandidate', (payload) => {
            if (this.onReceiveIceCandidate) {
                this.onReceiveIceCandidate(payload);
            }
        });
    }

    async startAudioCall(data: {
        callerId: string;
        targetUserId: string;
        conversationId: string;
    }): Promise<void> {
        if (!this.chatService.hubConnection) {
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
            throw new Error(error);
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
        await this.chatService.hubConnection.invoke('EndCall', finalPayload);
        this.callStatus = 'ended';
    }

    async toggleCallCamera(payload: any): Promise<void> {

        await this.chatService.hubConnection
            ?.invoke('ToggleCallCamera', payload);
    }

    async toggleCallMicrophone(payload: any): Promise<void> {

        await this.chatService.hubConnection
            ?.invoke('ToggleCallMicrophone', payload);
    }

    async sendOffer(payload: any): Promise<void> {

        await this.chatService.hubConnection
            ?.invoke('SendOffer', payload);
    }

    async sendAnswer(payload: any): Promise<void> {

        await this.chatService.hubConnection
            ?.invoke('SendAnswer', payload);
    }

    async sendIceCandidate(payload: any): Promise<void> {

        await this.chatService.hubConnection
            ?.invoke('SendIceCandidate', payload);
    }

    resetCallState(): void {
        this.incomingCall = null;
        this.activeCall = null;
        this.outgoingCall = null;

        this.callStatus = 'idle';
    }
}
