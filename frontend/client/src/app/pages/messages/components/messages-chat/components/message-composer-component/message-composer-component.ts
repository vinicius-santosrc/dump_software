import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    OnDestroy,
    Output,
    ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BasicInputComponent } from "../../../../../../shared/components/basic-input-component/basic-input.component";
import { ChatSticker } from '../../../../../../core/models/messages/chat-sticker.model';
import { MessageStickerPickerComponent } from "../message-renderer-component/message-sticker-component/message-sticker.component";
import { TranslateModule } from '@ngx-translate/core';

export type ChatComposerMessageType = 'text' | 'image' | 'audio' | 'sticker';

export interface ChatComposerPayload {
    type: ChatComposerMessageType;
    text?: string;
    file?: File;
    blob?: Blob;
    stickerUrl?: string;
}

@Component({
    selector: 'app-message-composer-component',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatTooltipModule,
        BasicInputComponent,
        MessageStickerPickerComponent,
        TranslateModule
    ],
    templateUrl: './message-composer-component.html',
    styleUrl: './message-composer-component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageComposerComponent {

    @Output() send = new EventEmitter<ChatComposerPayload>();

    @Output() typing = new EventEmitter<void>();

    @Output() stopTyping = new EventEmitter<void>();

    @ViewChild('imageInput') imageInput?: ElementRef<HTMLInputElement>;

    messageText: string = '';

    pendingImage?: File;

    pendingImagePreviewUrl: string = '';

    isRecording: boolean = false;

    recordingTime: number = 0;

    private mediaRecorder?: MediaRecorder;

    private audioChunks: Blob[] = [];

    private recordingInterval?: ReturnType<typeof setInterval>;

    readonly emojis: string[] = [
        '😂', '❤️', '🔥', '😍', '😭', '👏', '🙏', '😎',
        '😳', '🥹', '🤣', '💀', '✨', '🤍', '👍', '👀',
        '😡', '😅', '😉', '🤯', '🥰', '😴', '😬', '🙌'
    ];

    addEmoji(emoji: string): void {
        this.messageText = `${this.messageText}${emoji}`;
    }

    sendTextMessage(): void {
        const text = this.messageText.trim();

        if (!text && !this.pendingImage) return;

        if (this.pendingImage) {
            this.send.emit({
                type: 'image',
                file: this.pendingImage
            });
        }

        if (text) {
            this.send.emit({
                type: 'text',
                text
            });
        }

        this.messageText = '';
        this.removePendingImage();
    }

    openImagePicker(): void {
        this.imageInput?.nativeElement.click();
    }

    handleImageSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        if (!file) return;

        if (!file.type.startsWith('image/')) {
            input.value = '';
            return;
        }

        this.setPendingImage(file);

        input.value = '';
    }

    removePendingImage(): void {
        this.pendingImage = undefined;

        if (this.pendingImagePreviewUrl) {
            URL.revokeObjectURL(this.pendingImagePreviewUrl);
        }

        this.pendingImagePreviewUrl = '';
    }

    private setPendingImage(file: File): void {
        this.removePendingImage();

        this.pendingImage = file;
        this.pendingImagePreviewUrl = URL.createObjectURL(file);
    }

    async toggleMicrophone(): Promise<void> {
        if (this.isRecording) {
            this.stopRecording();
            return;
        }

        await this.startRecording();
    }

    cancelRecording(): void {
        if (!this.mediaRecorder) {
            this.clearRecordingState();
            return;
        }

        this.mediaRecorder.onstop = null;

        if (this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }

        this.mediaRecorder.stream.getTracks().forEach(track => track.stop());

        this.clearRecordingState();
    }

    sendSticker(sticker: ChatSticker): void {
        if (!sticker?.url) {
            return;
        }

        this.send.emit({
            type: 'sticker',
            stickerUrl: sticker.url
        });
    }

    formatRecordingTime(): string {
        const minutes = Math.floor(this.recordingTime / 60);
        const seconds = this.recordingTime % 60;

        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    private async startRecording(): Promise<void> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });

            this.audioChunks = [];
            this.mediaRecorder = new MediaRecorder(stream);

            this.mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, {
                    type: 'audio/webm'
                });

                if (audioBlob.size > 0) {
                    this.send.emit({
                        type: 'audio',
                        blob: audioBlob
                    });
                }

                stream.getTracks().forEach(track => track.stop());
                this.clearRecordingState();
            };

            this.mediaRecorder.start();
            this.isRecording = true;
            this.startRecordingTimer();
        } catch (error) {
            console.error('[MESSAGE_COMPOSER] Microphone permission error', error);
            this.clearRecordingState();
        }
    }

    private stopRecording(): void {
        if (!this.mediaRecorder) return;

        if (this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
    }

    private startRecordingTimer(): void {
        this.recordingTime = 0;

        this.recordingInterval = setInterval(() => {
            this.recordingTime++;
        }, 1000);
    }

    private clearRecordingState(): void {
        this.isRecording = false;
        this.recordingTime = 0;
        this.audioChunks = [];

        if (this.recordingInterval) {
            clearInterval(this.recordingInterval);
            this.recordingInterval = undefined;
        }

        this.mediaRecorder = undefined;
    }

    onTyping() {
        this.typing.emit();
    }
    onStopTyping() {
        this.stopTyping.emit();
    }
}