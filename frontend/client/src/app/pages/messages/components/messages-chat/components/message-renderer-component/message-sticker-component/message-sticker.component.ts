import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    OnInit,
    Output,
    ViewChild,
    inject
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChatSticker, ChatStickerPack } from '../../../../../../../core/models/messages/chat-sticker.model';
import { ChatStickerService } from '../../../../../../../core/services/messages/chat/chat-sticker.service';
import { MediaProcessingService } from '../../../../../../../core/services/media/media-processing.service';

@Component({
    selector: 'app-message-sticker-picker',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatTabsModule,
        MatTooltipModule
    ],
    templateUrl: './message-sticker.component.html',
    styleUrl: './message-sticker.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageStickerPickerComponent implements OnInit {

    @Output() stickerSelected = new EventEmitter<ChatSticker>();

    @ViewChild('stickerFileInput')
    stickerFileInput?: ElementRef<HTMLInputElement>;

    private readonly stickerService = inject(ChatStickerService);
    private readonly mediaProcessingService = inject(MediaProcessingService);

    get stickerPacks(): ChatStickerPack[] {
        return this.stickerService.getStickerPacks();
    }

    get recentStickers(): ChatSticker[] {
        return this.stickerService.getRecentStickers();
    }

    get favoriteStickers(): ChatSticker[] {
        return this.stickerService.getFavoriteStickers();
    }

    ngOnInit(): void {
        this.stickerService.loadStickers();
    }

    selectSticker(sticker: ChatSticker): void {
        this.stickerService.addRecentSticker(sticker);
        this.stickerSelected.emit(sticker);
    }

    openCreateSticker(): void {
        this.stickerFileInput?.nativeElement.click();
    }

    async handleStickerFileSelected(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        if (!file) return;

        if (!this.isValidStickerFile(file)) {
            input.value = '';
            return;
        }

        const optimizedStickerUrl = await this.mediaProcessingService.compressSticker(file, 72);
        const optimizedStickerFile = this.base64ToFile(
            optimizedStickerUrl,
            this.getOptimizedStickerName(file.name, optimizedStickerUrl),
            this.getMimeTypeFromBase64(optimizedStickerUrl)
        );

        const sticker = await this.stickerService.createCustomSticker(optimizedStickerFile);

        this.selectSticker(sticker);

        input.value = '';
    }

    toggleFavorite(event: MouseEvent, sticker: ChatSticker): void {
        event.stopPropagation();
        this.stickerService.toggleFavorite(sticker);
    }

    removeCustomSticker(event: MouseEvent, sticker: ChatSticker): void {
        event.stopPropagation();

        if (!sticker.isCustom) return;

        this.stickerService.removeCustomSticker(sticker.id);
    }

    isFavorite(sticker: ChatSticker): boolean {
        return this.favoriteStickers.some(favoriteSticker => favoriteSticker.id === sticker.id);
    }

    private base64ToFile(base64: string, fileName: string, mimeType: string): File {
        const base64Data = base64.split(',')[1] ?? '';
        const byteString = atob(base64Data);
        const bytes = new Uint8Array(byteString.length);

        for (let index = 0; index < byteString.length; index++) {
            bytes[index] = byteString.charCodeAt(index);
        }

        return new File([bytes], fileName, { type: mimeType });
    }

    private getMimeTypeFromBase64(base64: string): string {
        const match = base64.match(/^data:(.*?);base64,/);
        return match?.[1] ?? 'image/webp';
    }

    private getOptimizedStickerName(originalName: string, base64: string): string {
        const extension = this.getMimeTypeFromBase64(base64).split('/')[1] ?? 'webp';
        const normalizedExtension = extension === 'jpeg' ? 'jpg' : extension;
        const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, '');

        return `${nameWithoutExtension}-sticker.${normalizedExtension}`;
    }

    private isValidStickerFile(file: File): boolean {
        const allowedTypes = [
            'image/png',
            'image/webp',
            'image/jpeg',
            'image/gif'
        ];

        const maxSizeInMb = 6;
        const maxSizeInBytes = maxSizeInMb * 1024 * 1024;

        return allowedTypes.includes(file.type) && file.size <= maxSizeInBytes;
    }
}