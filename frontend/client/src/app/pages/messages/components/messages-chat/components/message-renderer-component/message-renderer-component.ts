import { CommonModule, Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Component, Input, OnChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { Message } from '../../../../../../core/models/messages/messages.model';
import { Post } from '../../../../../../core/models/feed/post.model';
import { PostsService } from '../../../../../../core/services/post/post.service';
import { MemoriesService } from '../../../../../../core/services/memories/memories.service';
import { PostMediaComponent } from '../../../../../../shared/components/post-component/components/post-media-component/post-media.component';
import { GenericTextComponent } from '../../../../../../shared/components/generic-text/generic-text.component';
import { PostPageComponent } from '../../../../../posts/postpage.component';
import { MessageAudioPlayerComponent } from "./message-audio-player-component/message-audio-player.component";

type MessageRenderType = 'text' | 'post' | 'story' | 'image' | 'audio' | 'sticker';

@Component({
    selector: 'app-message-renderer',
    standalone: true,
    templateUrl: './message-renderer-component.html',
    styleUrls: ['./message-renderer-component.scss'],
    imports: [
    CommonModule,
    PostMediaComponent,
    TranslateModule,
    GenericTextComponent,
    MessageAudioPlayerComponent,
    MatIconModule
]
})
export class MessageRendererComponent implements OnChanges {
    @Input() message: Message | any | undefined;
    @Input() isMine: boolean = false;

    type: MessageRenderType = 'text';
    postId?: string;
    contentUnavailable: boolean = false;

    constructor(
        private readonly postService: PostsService,
        private readonly memoriesService: MemoriesService,
        private readonly location: Location,
        private readonly dialog: MatDialog
    ) { }

    ngOnChanges(): void {
        this.resetState();
        this.resolveMessageType();
    }

    get messageText(): string {
        return this.message?.text ?? '';
    }

    get mediaUrl(): string {
        return this.message?.mediaUrl || this.message?.text || '';
    }

    get stickerUrl(): string {
        return this.message?.stickerUrl || this.message?.text || '';
    }

    get audioUrl(): string {
        return this.message?.mediaUrl || this.message?.text || '';
    }

    get imageMedia(): Array<{ type: 'image'; url: string }> {
        if (!this.mediaUrl) return [];

        return [{
            type: 'image',
            url: this.mediaUrl
        }];
    }

    get messageTime(): string {
        const dateValue = this.message?.createdAt ?? this.message?.updatedAt;

        if (!dateValue) {
            return '';
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return '';
        }

        return new Intl.DateTimeFormat('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    get isSending(): boolean {
        return this.message?.status === 'sending' || String(this.message?.id ?? '').startsWith('temp-');
    }

    get hasSendFailed(): boolean {
        return this.message?.status === 'failed';
    }

    get statusText(): string {
        if (!this.isMine) {
            return '';
        }

        if (this.hasSendFailed) {
            return 'Falha ao enviar';
        }

        if (this.isSending) {
            return 'Enviando...';
        }

        // Status reais como "Enviada", "Entregue" e "Lida" já são atualizados pelo fluxo de WebSocket
        // no componente pai. O renderer mostra apenas estados temporários locais para não duplicar.
        return '';
    }

    goToStory(story: any): void {
        if (this.contentUnavailable || !story?.username) {
            return;
        }

        this.location.go(`/memories/${story.username}/${story.id}`);
        globalThis.dispatchEvent(new Event('popstate'));
    }

    goToPost(post: Post | undefined): void {
        if (this.contentUnavailable || !post) {
            return;
        }

        this.location.go(`/p/${post?.id}`);

        const dialogRef = this.dialog.open(PostPageComponent, {
            data: { post }
        });

        dialogRef.afterClosed().subscribe(() => {
            this.location.go('/messages/inbox');
        });
    }

    private resetState(): void {
        this.type = 'text';
        this.postId = undefined;
        this.contentUnavailable = false;
    }

    private resolveMessageType(): void {
        if (!this.message) {
            this.contentUnavailable = true;
            return;
        }

        const explicitType = this.message?.type as MessageRenderType | undefined;

        if (explicitType && ['text', 'post', 'story', 'image', 'audio', 'sticker'].includes(explicitType)) {
            this.type = explicitType;
        }

        if (this.isImageMessage()) {
            this.type = 'image';
            return;
        }

        if (this.isAudioMessage()) {
            this.type = 'audio';
            return;
        }

        if (this.isStickerMessage()) {
            this.type = 'sticker';
            return;
        }

        if (!this.messageText) {
            this.contentUnavailable = true;
            return;
        }

        const postMatch = this.messageText.match(/\/p\/([a-zA-Z0-9-]+)/);
        const storyMatch = this.messageText.match(/\/memories\/([^/]+)\/([a-zA-Z0-9-]+)/);

        if (postMatch) {
            this.resolvePostMessage(postMatch[1]);
            return;
        }

        if (storyMatch) {
            this.resolveStoryMessage(storyMatch[1], storyMatch[2]);
            return;
        }

        this.type = 'text';
    }

    private resolvePostMessage(postId: string): void {
        this.type = 'post';
        this.postId = postId;

        this.postService.getById(postId).subscribe({
            next: (post: Post | any) => {
                if (!post) {
                    this.contentUnavailable = true;
                    return;
                }

                if (this.message) {
                    this.message.post = post;
                }
            },
            error: () => {
                this.contentUnavailable = true;
            }
        });
    }

    private resolveStoryMessage(username: string, storyId: string): void {
        this.type = 'story';

        if (!this.message) return;

        this.message.story = {
            username,
            id: storyId
        } as any;

        this.memoriesService.getById(storyId)
            .then((story: any) => {
                if (!story) {
                    this.contentUnavailable = true;
                    return;
                }

                if (this.message) {
                    this.message.story = story;
                }
            })
            .catch(() => {
                this.contentUnavailable = true;
            });
    }

    private isImageMessage(): boolean {
        const type = this.message?.type;
        const mediaType = this.message?.mediaType ?? '';
        const source = this.message?.mediaUrl || this.message?.text || '';

        return type === 'image'
            || mediaType.startsWith('image/')
            || source.startsWith('data:image');
    }

    private isAudioMessage(): boolean {
        const type = this.message?.type;
        const mediaType = this.message?.mediaType ?? '';
        const source = this.message?.mediaUrl || this.message?.text || '';

        return type === 'audio'
            || mediaType.startsWith('audio/')
            || source.startsWith('data:audio');
    }

    private isStickerMessage(): boolean {
        const type = this.message?.type;
        const source = this.message?.stickerUrl || this.message?.text || '';

        return type === 'sticker'
            || source.includes('/stickers/')
            || source.includes('assets/stickers/');
    }
}
