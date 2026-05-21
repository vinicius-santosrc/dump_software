import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { CallModalComponent } from '../call-modal/call-modal.component';
import { CallService } from '../../../core/services/messages/call/call.service';

@Component({
    selector: 'app-incoming-call-modal',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule
    ],
    templateUrl: './incoming-call-modal.component.html',
    styleUrls: ['./incoming-call-modal.component.scss']
})
export class IncomingCallModalComponent {

    constructor(
        public readonly callService: CallService,
        private readonly dialog: MatDialog
    ) { }

    get incomingCall(): any {
        return this.callService.incomingCall;
    }

    async handleAccept(): Promise<void> {

        if (!this.incomingCall) {
            return;
        }

        const incomingCall = { ...this.incomingCall };

        await this.callService.acceptCall(incomingCall);

        const callType = incomingCall?.type || 'audio';

        this.dialog.open(CallModalComponent, {
            width: '100vw',
            height: '100vh',
            maxWidth: '100vw',
            panelClass: 'full-screen-dialog',
            data: {
                type: callType,
                user: incomingCall?.caller,
                conversationId: incomingCall?.conversationId,
                payload: incomingCall
            }
        });
    }

    async handleReject(): Promise<void> {
        if (!this.incomingCall) {
            return;
        }

        await this.callService.rejectCall(this.incomingCall);
    }
}
