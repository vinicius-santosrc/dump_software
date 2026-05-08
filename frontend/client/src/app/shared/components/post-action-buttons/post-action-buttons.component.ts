import { Component, Input, DoCheck } from "@angular/core";
import { CommonModule } from '@angular/common';
import { Post } from "../../../core/models/feed/post.model";
import { PostComponentService } from "../post-component/post-component.service";
import { UserService } from "../../../core/services/user/user.service";
import { Router } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { OWNER_POST_ACTIONS, VISITOR_POST_ACTIONS } from "../../../core/config/post-actions.config";
import { GenericActionsModal } from "../comment-actions-modal/generic-actions-modal.component";
import { PostActionHandlerService } from "../../../core/services/actions/post-action-handler.service";

@Component({
    selector: 'app-post-action-buttons',
    standalone: true,
    templateUrl: './post-action-buttons.component.html',
    styleUrls: ['./post-action-buttons.component.scss'],
    imports: [CommonModule, MatIconModule, MatDialogModule, MatButtonModule],
})
export class PostActionButtonsComponent implements DoCheck {
    @Input() post: Post | undefined = {} as Post;
    @Input() theme: 'light' | 'dark' = 'light';
    @Input() type: 'post' | 'reel' = 'post';
    @Input() showOptions: boolean = false;
    liked = false;
    current_user: any;
    router: any;

    constructor(
        private readonly postService: PostComponentService,
        private readonly userService: UserService,
        public angularRouter: Router,
        private readonly dialog: MatDialog,
        private readonly actionHandler: PostActionHandlerService
    ) {
        this.userService.user$.subscribe((user: any) => {
            this.current_user = user;
        });
        this.router = angularRouter;
    }
    ngDoCheck(): void {
        if (this.post && this.current_user) {
            this.liked = this.post.likes?.includes(this.current_user.id) ?? false;
        }
    }

    handleLike(postId: string | undefined) {
        if (!this.post || !this.current_user?.id || !postId) return;

        const userId = this.current_user.id;

        const prevLikes = [...(this.post.likes || [])];
        const prevLiked = this.liked;

        if (this.liked) {
            this.post.likes = prevLikes.filter(l => l !== userId);
            this.liked = false;
        } else {
            if (!prevLikes.includes(userId)) {
                this.post.likes = [...prevLikes, userId];
            }
            this.liked = true;
        }

        this.postService.handleLike(postId)?.subscribe({
            next: (result: any) => {
                const likes = this.post?.likes || [];

                if (result === true) {
                    if (!likes.includes(userId)) {
                        this.post!.likes = [...likes, userId];
                    }
                    this.liked = true;
                } else if (result === false) {
                    this.post!.likes = likes.filter(l => l !== userId);
                    this.liked = false;
                }
            },
            error: () => {
                this.post!.likes = prevLikes;
                this.liked = prevLiked;
            }
        });
    }

    handleSave() {
        this.postService.savePost(this.post?.id)
    }

    async handleComment(post: any) {
        const { PostPageComponent } = await import('../../../pages/posts/postpage.component');
        this.dialog.closeAll();
        this.dialog.open(PostPageComponent, {
            data: { post }
        });
    }

    handleSend() {
        if (!this.post?.id) {
            console.error('postId undefined no handleSend', this.post);
            return;
        }
        this.postService.sendPost(this.post.id);
    }

    handleRepost() { }

    options() {
        const dialogRef = this.dialog.open(GenericActionsModal, {
            data: {
                actions: this.current_user.id === this.post?.user.id ? OWNER_POST_ACTIONS : VISITOR_POST_ACTIONS
            },
            width: '400px'

        });

        dialogRef.afterClosed().subscribe((action: any) => {
            if (!action) return;
            this.actionHandler.handle(action, this.post);
        });
    }
}