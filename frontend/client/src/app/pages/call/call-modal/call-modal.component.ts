import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { GenericButtonComponent } from '../../../shared/components/generic-button-component/generic-button.component';
import { AvatarItem } from '../../../shared/components/avatar-item/avatar-item.component';

import { CallService } from '../../../core/services/messages/call/call.service';
import { WebrtcService } from '../../../core/services/messages/call/webrtc.service';
import { UserService } from '../../../core/services/user/user.service';

@Component({
    selector: 'app-call-modal',
    standalone: true,
    templateUrl: './call-modal.component.html',
    styleUrl: './call-modal.component.scss',
    imports: [
        CommonModule,
        MatIconModule,
        GenericButtonComponent,
        AvatarItem
    ]
})
export class CallModalComponent implements OnInit, OnDestroy {

    @ViewChild('localVideo')
    localVideo?: ElementRef<HTMLVideoElement>;

    @ViewChild('remoteVideo')
    remoteVideo?: ElementRef<HTMLVideoElement>;

    elapsedSeconds: number = 0;

    private timer?: any;
    private destroyed: boolean = false;
    private mediaInitialized: boolean = false;
    private remoteStreamAttached: boolean = false;
    private pendingIceCandidates: RTCIceCandidateInit[] = [];

    isMuted: boolean = false;
    isCameraOff: boolean = false;

    remoteMuted: boolean = false;
    remoteCameraOff: boolean = false;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,

        private readonly dialogRef: MatDialogRef<CallModalComponent>,
        public readonly callService: CallService,
        public readonly webrtcService: WebrtcService,
        private readonly userService: UserService
    ) { }

    async ngOnInit(): Promise<void> {
        this.registerWebrtcEvents();
        await this.initializeMedia();
        this.startTimer();

        this.callService.onCallEnded = () => {

            if (this.destroyed) {
                return;
            }

            this.destroyed = true;

            this.webrtcService.destroy();

            this.dialogRef.close();
        };

        this.callService.onCallDisconnected = () => {

            if (this.destroyed) {
                return;
            }

            this.destroyed = true;

            this.webrtcService.destroy();

            this.dialogRef.close();
        };

        this.callService.onRemoteCameraToggled = (payload) => {

            console.warn('[CALL MODAL] remote camera toggled', payload);

            if (payload?.conversationId !== this.signalingPayload.conversationId) {
                return;
            }

            this.remoteCameraOff = !!payload?.cameraOff;
        };

        this.callService.onRemoteMicrophoneToggled = (payload) => {

            console.warn('[CALL MODAL] remote microphone toggled', payload);

            if (payload?.conversationId !== this.signalingPayload.conversationId) {
                return;
            }

            this.remoteMuted = !!payload?.muted;
        };
    }

    ngOnDestroy(): void {

        if (this.destroyed) {
            return;
        }

        this.destroyed = true;

        this.webrtcService.destroy();

        clearInterval(this.timer);
    }

    get isVideoCall(): boolean {
        return this.data?.type === 'video';
    }

    get user(): any {
        return this.data?.user;
    }

    private get signalingPayload(): any {

        return {
            callerId:
                this.callService.activeCall?.callerId ||
                this.data?.payload?.callerId ||
                this.data?.callerId,

            targetUserId:
                this.callService.activeCall?.targetUserId ||
                this.data?.payload?.targetUserId ||
                this.data?.targetUserId,

            conversationId:
                this.callService.activeCall?.conversationId ||
                this.data?.payload?.conversationId ||
                this.data?.conversationId,

            type:
                this.callService.activeCall?.type ||
                this.data?.payload?.type ||
                this.data?.type
        };
    }

    private get currentUserId(): string {

        return this.userService.getUser()?.id || '';
    }

    private get isLocalCaller(): boolean {

        const payload = this.signalingPayload;

        return this.data?.isCaller === true ||
            (!!this.currentUserId && payload?.callerId === this.currentUserId);
    }

    private get remoteUserId(): string {

        const payload = this.signalingPayload;

        if (this.isLocalCaller) {
            return payload?.targetUserId;
        }

        return payload?.callerId;
    }

    get formattedDuration(): string {

        const minutes = Math.floor(this.elapsedSeconds / 60)
            .toString()
            .padStart(2, '0');

        const seconds = (this.elapsedSeconds % 60)
            .toString()
            .padStart(2, '0');

        return `${minutes}:${seconds}`;
    }

    private registerWebrtcEvents(): void {

        this.callService.onReceiveOffer = async (payload) => {

            console.warn('[CALL MODAL] onReceiveOffer', payload);

            if (!payload?.offer) {
                return;
            }

            await this.ensureMediaReady();

            await this.webrtcService
                .setRemoteDescription(payload.offer);

            await this.flushPendingIceCandidates();

            const answer =
                await this.webrtcService.createAnswer();

            if (!answer) {
                return;
            }

            try {
                await this.callService.sendAnswer({
                    targetUserId:
                        payload.callerId,

                    callerId:
                        payload.targetUserId,

                    answer: {
                        type: answer.type,
                        sdp: answer.sdp
                    }
                });
            }
            catch (error) {
                console.error('[WEBRTC] failed to send answer', {
                    error,
                    payload,
                    answer
                });
            }
        };

        this.callService.onReceiveAnswer = async (payload) => {
            if (!this.webrtcService.peer) {
                return;
            }

            await this.webrtcService
                .setRemoteDescription(payload.answer);

            await this.flushPendingIceCandidates();
        };

        this.callService.onReceiveIceCandidate = async (payload) => {
            if (!payload?.candidate) {
                return;
            }

            if (!this.webrtcService.peer?.remoteDescription) {
                this.pendingIceCandidates.push(payload.candidate);
                return;
            }

            await this.webrtcService.addIceCandidate(payload.candidate);
        };
    }

    async toggleCallCamera(payload: any): Promise<void> {
        await this.callService.toggleCallCamera(payload);
    }

    async toggleCallMicrophone(payload: any): Promise<void> {
        await this.callService.toggleCallMicrophone(payload);
    }

    private async ensureMediaReady(): Promise<void> {
        if (!this.webrtcService.peer) {
            await this.webrtcService.createPeer();
            this.registerPeerIceCandidateHandler();
        }

        if (this.mediaInitialized) {
            return;
        }

        const stream = await this.webrtcService.initializeLocalStream(this.isVideoCall);
        this.mediaInitialized = true;

        if (this.localVideo?.nativeElement) {
            this.localVideo.nativeElement.srcObject = stream;
        }
    }

    private registerPeerIceCandidateHandler(): void {

        this.webrtcService.peer?.addEventListener(
            'icecandidate',
            async (event) => {

                if (!event.candidate) {
                    return;
                }

                const payload = this.signalingPayload;

                const candidate = {
                    candidate: event.candidate.candidate,
                    sdpMid: event.candidate.sdpMid,
                    sdpMLineIndex: event.candidate.sdpMLineIndex,
                    usernameFragment: event.candidate.usernameFragment
                };

                const targetUserId = this.remoteUserId;

                if (!targetUserId) {
                    return;
                }

                try {
                    await this.callService.sendIceCandidate({
                        callerId: this.currentUserId || payload?.callerId,
                        targetUserId,
                        candidate
                    });
                }
                catch (error) {
                    console.error('[WEBRTC] failed to send ICE candidate', {
                        error,
                        callerId: this.currentUserId || payload?.callerId,
                        targetUserId,
                        candidate
                    });
                }
            }
        );
    }

    private async flushPendingIceCandidates(): Promise<void> {

        if (!this.webrtcService.peer?.remoteDescription) {
            return;
        }

        while (this.pendingIceCandidates.length > 0) {

            const candidate = this.pendingIceCandidates.shift();

            if (!candidate) {
                continue;
            }

            await this.webrtcService.addIceCandidate(candidate);
        }
    }

    private attachRemoteStreamWhenReady(): void {

        if (this.remoteStreamAttached) {
            return;
        }

        const tryAttach = () => {

            if (
                this.remoteVideo?.nativeElement &&
                this.webrtcService.remoteStream &&
                this.webrtcService.remoteStream.getTracks().length > 0
            ) {
                this.remoteStreamAttached = true;
                this.remoteVideo.nativeElement.srcObject =
                    this.webrtcService.remoteStream;

                this.remoteVideo.nativeElement
                    .play()
                    .catch(() => {});

                return true;
            }

            return false;
        };

        if (tryAttach()) {
            return;
        }

        const interval = setInterval(() => {

            if (this.destroyed || tryAttach()) {
                clearInterval(interval);
            }

        }, 250);
    }

    async initializeMedia(): Promise<void> {

        try {

            await this.ensureMediaReady();
            const payload = this.signalingPayload;
            const shouldCreateOffer = this.isLocalCaller;

            if (shouldCreateOffer) {

                const offer = await this.webrtcService.createOffer();

                if (offer) {

                    if (!this.remoteUserId) {
                        console.warn('[WEBRTC] offer ignored: missing remoteUserId', {
                            payload,
                            data: this.data
                        });

                        return;
                    }

                    try {
                        await this.callService.sendOffer({
                            callerId:
                                this.currentUserId || payload?.callerId,

                            targetUserId:
                                this.remoteUserId,

                            offer: {
                                type: offer.type,
                                sdp: offer.sdp
                            }
                        });
                    }
                    catch (error) {
                        console.error('[WEBRTC] failed to send offer', {
                            error,
                            payload,
                            offer
                        });
                    }
                }
            }

            this.attachRemoteStreamWhenReady();

        }
        catch (error) {

            console.error('[CALL] initializeMedia', error);
        }
    }

    startTimer(): void {

        this.timer = setInterval(() => {

            this.elapsedSeconds++;

        }, 1000);
    }

    async toggleMute(): Promise<void> {

        this.webrtcService.toggleMute();

        this.isMuted = !this.isMuted;

        await this.callService.toggleCallMicrophone({
            callerId: this.currentUserId || this.signalingPayload.callerId,
            targetUserId: this.remoteUserId,
            conversationId: this.signalingPayload.conversationId,
            muted: this.isMuted
        });
    }

    async toggleCamera(): Promise<void> {

        this.webrtcService.toggleCamera();

        this.isCameraOff = !this.isCameraOff;

        await this.callService.toggleCallCamera({
            callerId: this.currentUserId || this.signalingPayload.callerId,
            targetUserId: this.remoteUserId,
            conversationId: this.signalingPayload.conversationId,
            cameraOff: this.isCameraOff
        });
    }

    async endCall(): Promise<void> {

        const payload = this.signalingPayload;

        await this.callService.endCall({
            callerId:
                this.currentUserId || payload?.callerId,

            targetUserId:
                this.remoteUserId,

            conversationId:
                payload?.conversationId ||
                this.data?.conversationId,

            type:
                payload?.type ||
                this.data?.type
        });

        this.dialogRef.close();
    }
}