import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentItemComponent } from "../../../comment-item/comment-item.component";
import { LoaderComponent } from "../../../loader-component/loader.component";
import { BasicInputComponent } from "../../../basic-input-component/basic-input.component";
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-post-comments',
    standalone: true,
    imports: [CommonModule, CommentItemComponent, LoaderComponent, BasicInputComponent, TranslateModule],
    templateUrl: './post-comments.component.html',
    styleUrl: './post-comments.component.scss'
})
export class PostCommentsComponent implements OnChanges {
    @Input() comments: any[] = [];
    @Input() theme?: 'light' | 'dark' = 'light';
    @Input() isLoading: boolean = false;
    @Input() type: 'comment' | 'commentSimple' = 'comment';

    structuredComments: any[] = [];

    replyingToId: string | null = null;
    replyText: string = '';

    ngOnChanges() {
        if (this.isLoading) return;

        if (this.type === 'commentSimple') {
            this.structuredComments = this.comments || [];
        } else {
            this.structuredComments = this.buildCommentTree(this.comments);
        }
    }

    private buildCommentTree(comments: any[]): any[] {
        if (!comments) return [];

        const map = new Map<string, any>();
        const roots: any[] = [];

        // initialize map
        comments.forEach(comment => {
            map.set(comment.id, { ...comment, responses: [] });
        });

        // build tree
        comments.forEach(comment => {
            const current = map.get(comment.id);

            if (comment.parentId) {
                const parent = map.get(comment.parentId);
                if (parent) {
                    parent.responses.push(current);
                }
            } else {
                roots.push(current);
            }
        });

        return roots;
    }

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
            id: crypto.randomUUID(),
            parentId: comment.id,
            content: this.replyText,
            user: { username: 'you' },
            responses: []
        };

        this.comments = [...this.comments, newReply];
        this.structuredComments = this.buildCommentTree(this.comments);

        this.cancelReply();
    }

    trackById(index: number, item: any) {
        return item.id;
    }
}