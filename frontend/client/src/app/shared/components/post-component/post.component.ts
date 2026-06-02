import { Post } from './../../../core/models/feed/post.model';
import { Component, Input, AfterViewInit, OnDestroy, Injectable } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslateModule } from '@ngx-translate/core';
import { PostComponentService } from './post-component.service';
import { User } from '../../../core/models/user/user.model';
import { UserService } from '../../../core/services/user/user.service';
import { Router } from '@angular/router';
import { PostActionButtonsComponent } from "../post-action-buttons/post-action-buttons.component";
import { PostHeaderComponent } from "./components/post-header-component/post-header.component";
import { PostMediaComponent } from "./components/post-media-component/post-media.component";
import { PostCommentsComponent } from "./components/post-comments-component/post-comments.component";
import { ThemeService } from '../../../core/services/theme.service';

@Component({
    selector: "app-post-component",
    templateUrl: "./post.component.html",
    styleUrl: "./post.component.scss",
    imports: [CommonModule, TranslateModule, PostActionButtonsComponent, PostHeaderComponent, PostMediaComponent, PostCommentsComponent],
})
@Injectable({
    providedIn: 'root'
})
export class PostComponent implements AfterViewInit, OnDestroy {
    public current_user: User | undefined = {} as User;
    public router: any;

    constructor(
        private readonly postService: PostComponentService,
        private readonly userService: UserService,
        private readonly themeService: ThemeService,
        public angularRouter: Router,
    ) {
        this.userService.user$.subscribe((user: any) => {
            this.current_user = user;
        });
        this.router = angularRouter;
    }

    @Input() post: Post | undefined;

    backgroundColor: string = '#ffffff';
    textColor: string = '#000000';

    ngAfterViewInit() {
        const firstMedia = this.post?.media?.[0];

        if (firstMedia) {
            switch (this.themeService.getTheme()) {
                case 'light':
                    this.backgroundColor = '#ffffff'
                    this.textColor = 'rgb(0,0,0)'
                    break;
                case 'dark':
                    this.backgroundColor = "rgb(12, 16, 20)"
                    this.textColor = "#ffffff"
                    break;
            }
        }
    }

    ngOnDestroy() {
        this.postService.destroyObserver();
    }

    onLikeChanged(liked: boolean) {
        if (!this.post || !this.current_user?.id) return;

        const likes = this.post.likes || [];

        if (liked) {
            if (!likes.includes(this.current_user.id)) {
                this.post.likes = [...likes, this.current_user.id];
            }
        } else {
            this.post.likes = likes.filter(l => l !== this.current_user?.id);
        }
    }
}