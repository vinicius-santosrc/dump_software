import { AfterViewInit, Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { CommonModule } from '@angular/common';
import { Post } from "../../../core/models/feed/post.model";
import { PostComponentService } from "../post-component/post-component.service";
import { UserService } from "../../../core/services/user/user.service";
import { Router } from "@angular/router";
import { MatIcon } from "@angular/material/icon";

@Component({
    selector: 'app-post-action-buttons',
    templateUrl: './post-action-buttons.component.html',
    styleUrls: ['./post-action-buttons.component.scss'],
    imports: [CommonModule, MatIcon],
})
export class PostActionButtonsComponent implements OnChanges {
    @Input() post: Post | undefined = {} as Post;
    @Input() theme: 'light' | 'dark' = 'light';
    liked = false;
    current_user: any;
    router: any;


    constructor(
        private readonly postService: PostComponentService,
        private readonly userService: UserService,
        public angularRouter: Router,
    ) {
        this.userService.user$.subscribe((user: any) => {
            this.current_user = user;
        });
        this.router = angularRouter;
    }
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['post'] && this.post && this.current_user) {
            this.liked = this.post.likes?.includes(this.current_user.id) ?? false;
        }
    }

    handleLike(postId: string | undefined) {
        this.postService.handleLike(postId)?.subscribe({
            next: (result: any) => {
                if (result) {
                    this.liked = true;
                    this.post!.likes = [...(this.post!.likes || []), this.current_user.id];
                } else {
                    this.liked = false;
                    this.post!.likes = (this.post!.likes || []).filter(l => l !== this.current_user.id);
                }
            },
            error: () => {
                // não faz nada em caso de erro
            }
        });
    }

    handleSave() {
        this.postService.savePost(this.post?.id)
    }

    handleSend() {
        if (!this.post?.id) {
            console.error('postId undefined no handleSend', this.post);
            return;
        }
        this.postService.sendPost(this.post.id);
    }
}