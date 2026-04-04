import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-post-comments',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './post-comments.component.html',
    styleUrl: './post-comments.component.scss'
})
export class PostCommentsComponent {
    @Input() comments: any[] = [];
    @Input() theme?: 'light' | 'dark' = 'light';

    replyingToId: string | null = null;
    replyText: string = '';

    startReply(commentId: string) {
        this.replyingToId = commentId;
        this.replyText = '';
    }

    cancelReply() {
        this.replyingToId = null;
        this.replyText = '';
    }

    sendReply(comment: any) {
        if (!this.replyText.trim()) return;

        // simulação local (depois você conecta com API)
        const newReply = {
            _id: crypto.randomUUID(),
            content: this.replyText,
            user: { username: 'you' },
            responses: []
        };

        comment.responses = comment.responses || [];
        comment.responses.push(newReply);

        this.cancelReply();
    }
}