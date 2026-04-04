import { Post } from './../../../core/models/feed/post.model';
import { Component, Input, AfterViewInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslateModule } from '@ngx-translate/core';
import { PostComponentService } from './post-component.service';
import { User } from '../../../core/models/user/user.model';
import { UserService } from '../../../core/services/user/user.service';
import { Router } from '@angular/router';
import { PostActionButtonsComponent } from "../post-action-buttons/post-action-buttons.component";
import { PostHeaderComponent } from "./components/post-header-component/post-header.component";
import { PostMediaComponent } from "./components/post-media-component/post-media.component";

@Component({
    selector: "app-post-component",
    templateUrl: "./post.component.html",
    styleUrl: "./post.component.scss",
    imports: [CommonModule, TranslateModule, PostActionButtonsComponent, PostHeaderComponent, PostMediaComponent],
})
export class PostComponent implements AfterViewInit, OnDestroy {
    public current_user: User;
    public router: any;

    constructor(
        private readonly postService: PostComponentService,
        private readonly userService: UserService,
        public angularRouter: Router,
    ) {
        this.current_user = this.userService.getUser();
        this.router = angularRouter;
    }

    @Input() post: Post | undefined;

    backgroundColor: string = '#ffffff';
    textColor: string = '#000000';

    ngAfterViewInit() {
        const firstMedia = this.post?.media?.[0];

        if (firstMedia) {
            if (firstMedia.type === 'image') {
                this.postService.extractColorFromImage(firstMedia.url).then(colors => {
                    this.backgroundColor = colors.bg;
                    this.textColor = colors.text;
                });
            } else if (firstMedia.type === 'video') {
                this.postService.extractColorFromVideo(firstMedia.url).then(colors => {
                    this.backgroundColor = colors.bg;
                    this.textColor = colors.text;
                });
            }
        }
    }

    ngOnDestroy() {
        this.postService.destroyObserver();
    }
}