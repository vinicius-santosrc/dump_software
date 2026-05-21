import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Inject, OnChanges, OnDestroy, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Comments, Post } from '../../core/models/feed/post.model';
import { ActivatedRoute } from '@angular/router';
import { PostsService } from '../../core/services/post/post.service';
import { PostActionButtonsComponent } from "../../shared/components/post-action-buttons/post-action-buttons.component";
import { PostMediaComponent } from "../../shared/components/post-component/components/post-media-component/post-media.component";
import { PostHeaderComponent } from "../../shared/components/post-component/components/post-header-component/post-header.component";
import { PostComponentService } from '../../shared/components/post-component/post-component.service';
import { PostCommentsComponent } from "../../shared/components/post-component/components/post-comments-component/post-comments.component";
import { CommentsService } from '../../core/services/comments/comments.service';
import { BasicInputComponent } from "../../shared/components/basic-input-component/basic-input.component";
import { GenericButtonComponent } from "../../shared/components/generic-button-component/generic-button.component";

@Component({
    selector: 'app-post-page',
    imports: [CommonModule, PostActionButtonsComponent, PostMediaComponent, PostHeaderComponent, PostCommentsComponent, MatDividerModule, BasicInputComponent, GenericButtonComponent],
    templateUrl: './postpage.component.html',
    styleUrl: './postpage.component.scss',
    standalone: true
})
export class PostPageComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
    post!: Post;
    postId: string = "";
    isModal: boolean = false;
    backgroundColor: string = '#ffffff';
    textColor: string = '#000000';
    comments: Comments[] = [];

    constructor(
        private readonly route: ActivatedRoute,
        private readonly postService: PostsService,
        private readonly postComponentService: PostComponentService,
        private readonly commentsService: CommentsService,
        @Optional() @Inject(MAT_DIALOG_DATA) public data?: { post: Post }
    ) {}

    ngOnInit(): void {
        // if opened via modal
        if (this.data?.post) {
            this.post = this.data.post;
            this.isModal = true;
            if (this.data.post.id) { 
                this.getComments(this.data?.post.id);
            }
            return;
        }

        // if accessed via URL (refresh)
        this.route.paramMap.subscribe((params: any) => {
            const postId = params.get('postId');
            this.postId = postId;

            this.getPost(postId);
            this.getComments(postId);
        });
    }

    ngOnChanges(): void {
        this.getComments(this.postId);
    }

    ngAfterViewInit() {
        const firstMedia = this.post?.media?.[0];

        if (firstMedia) {
            if (firstMedia.type === 'image') {
                this.postComponentService.extractColorFromImage(firstMedia.url).then(colors => {
                    this.backgroundColor = colors.bg;
                    this.textColor = colors.text;
                });
            } else if (firstMedia.type === 'video') {
                this.postComponentService.extractColorFromVideo(firstMedia.url).then(colors => {
                    this.backgroundColor = colors.bg;
                    this.textColor = colors.text;
                });
            }
        }
    }

    ngOnDestroy() {
        this.postComponentService.destroyObserver();
    }

    getPost(id: string) {
        this.postService.getById(id).subscribe(post => {
            this.post = post as Post;
        });
    }

    close() {
        globalThis.history.back();
    }

    getComments(postId: string) {
        this.commentsService.getByPostId(postId).subscribe((comments: any) => {
            this.comments = comments;
        });
    }
}