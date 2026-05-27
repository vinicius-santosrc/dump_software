import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, ViewChild } from "@angular/core";
import { GenericButtonComponent } from "../../../shared/components/generic-button-component/generic-button.component";
import { AvatarItem } from "../../../shared/components/avatar-item/avatar-item.component";
import { CommonModule } from '@angular/common';
import { CallService } from '../../../core/services/messages/call/call.service';
import { UserService } from '../../../core/services/user/user.service';
import { CallModalComponent } from '../call-modal/call-modal.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: "app-pre-call",
    standalone: true,
    templateUrl: "./pre-call.component.html",
    styleUrl: "./pre-call.component.scss",
    imports: [CommonModule, GenericButtonComponent, AvatarItem, TranslateModule]
})

export class PreCallComponent implements AfterViewInit, OnDestroy {

    @ViewChild('previewVideo')
    previewVideo?: ElementRef<HTMLVideoElement>;

    currentUser: any;
    private previewStream?: MediaStream;

    isMuted: boolean = false;
    isCameraOff: boolean = false;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private readonly dialogRef: MatDialogRef<PreCallComponent>,
        private readonly callService: CallService,
        private readonly userService: UserService,
        private readonly dialog: MatDialog
    ) {
        this.userService.user$.subscribe(user => {
            this.currentUser = user;
        });
        this.dialogRef.beforeClosed().subscribe(() => {
            this.stopPreviewStream();
        });
    }

    ngAfterViewInit(): void {
        if (this.data?.type !== 'video') {
            return;
        }

        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        })
            .then(stream => {
                this.previewStream = stream;

                if (this.previewVideo?.nativeElement) {
                    this.previewVideo.nativeElement.srcObject = this.previewStream;
                }
            })
            .catch(error => {
                console.error(error);
            });
    }

    toggleCamera(): void {
        const stream = this.previewStream;
        if (!stream) {
            return;
        }

        stream.getVideoTracks().forEach(track => {
            track.enabled = !track.enabled;
        });

        this.isCameraOff = !this.isCameraOff;
    }

    toggleMute(): void {

        const stream = this.previewStream;

        if (!stream) {
            return;
        }

        stream.getAudioTracks().forEach(track => {
            track.enabled = !track.enabled;
        });

        this.isMuted = !this.isMuted;
    }

    ngOnDestroy(): void {
        this.stopPreviewStream();
    }

    private stopPreviewStream(): void {

        if (this.previewVideo?.nativeElement) {
            this.previewVideo.nativeElement.pause();
            this.previewVideo.nativeElement.srcObject = null;
        }

        this.previewStream?.getTracks().forEach(track => {
            track.stop();
        });

        this.previewStream = undefined;
    }

    get callTitle(): string {
        return this.data?.user?.fullName || this.data?.user?.username || 'Usuário';
    }

    get avatar(): string {
        return this.data?.user?.profilePictureUrl || 'assets/app/media/default-avatar.webp';
    }

    get callStatus(): string {
        return this.callService.callStatus;
    }

    async call(): Promise<void> {

        if (!this.currentUser?.id || !this.data?.user?.id) {
            return;
        }

        this.callService.onCallConnected = (payload: any) => {
            this.stopPreviewStream();
            this.dialogRef.close();

            this.dialog.open(CallModalComponent, {
                width: '100vw',
                height: '100vh',
                maxWidth: '100vw',
                panelClass: 'full-screen-dialog',
                data: {
                    type: this.data.type,
                    user: this.data.user,
                    conversationId: this.data.conversationId,
                    payload,
                    isCaller: true
                }
            });
        };

        if (this.data?.type === 'video') {

            await this.callService.startVideoCall({
                callerId: this.currentUser.id,
                targetUserId: this.data.user.id,
                conversationId: this.data.conversationId
            });
        }
        else {

            await this.callService.startAudioCall({
                callerId: this.currentUser.id,
                targetUserId: this.data.user.id,
                conversationId: this.data.conversationId
            });
        }
    }
}