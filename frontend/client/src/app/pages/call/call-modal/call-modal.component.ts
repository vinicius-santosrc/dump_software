import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { GenericButtonComponent } from '../../../shared/components/generic-button-component/generic-button.component';
import { AvatarItem } from '../../../shared/components/avatar-item/avatar-item.component';

import { CallService } from '../../../core/services/messages/call/call.service';
import { WebrtcService } from '../../../core/services/messages/call/webrtc.service';

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

    isMuted: boolean = false;
    isCameraOff: boolean = false;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,

        private readonly dialogRef: MatDialogRef<CallModalComponent>,
        public readonly callService: CallService,
        public readonly webrtcService: WebrtcService
    ) { }

    async ngOnInit(): Promise<void> {

        await this.initializeMedia();

        this.startTimer();

        this.callService.onCallEnded = () => {

            this.webrtcService.destroy();

            this.dialogRef.close();
        };
    }

    ngOnDestroy(): void {

        this.webrtcService.destroy();

        clearInterval(this.timer);
    }

    get isVideoCall(): boolean {
        return this.data?.type === 'video';
    }

    get user(): any {
        return this.data?.user;
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

    async initializeMedia(): Promise<void> {

        try {

            await this.webrtcService.createPeer();

            const stream = await this.webrtcService
                .initializeLocalStream(this.isVideoCall);

            if (this.localVideo?.nativeElement) {

                this.localVideo.nativeElement.srcObject = stream;
            }

            setTimeout(() => {

                if (
                    this.remoteVideo?.nativeElement &&
                    this.webrtcService.remoteStream
                ) {

                    this.remoteVideo.nativeElement.srcObject =
                        this.webrtcService.remoteStream;
                }

            }, 300);

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

    toggleMute(): void {

        this.webrtcService.toggleMute();

        this.isMuted = !this.isMuted;
    }

    toggleCamera(): void {

        this.webrtcService.toggleCamera();

        this.isCameraOff = !this.isCameraOff;
    }

    async endCall(): Promise<void> {

        const payload =
            this.callService.activeCall ||
            this.data?.payload ||
            {};

        await this.callService.endCall({
            callerId: payload?.callerId,
            targetUserId: payload?.targetUserId,
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