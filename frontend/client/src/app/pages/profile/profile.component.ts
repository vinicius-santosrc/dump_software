/**
 * Created By: Vinícius da Silva Santos
 * Creation Date: 2026-03-31
 * Copyright (c) 2026 Dump Software. All rights reserved.
 * This software is licensed under the MIT License. See the LICENSE file in the project root for more information.
 */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { RouterModule } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { User } from "../../core/models/user/user.model";
import { UserService } from "../../core/services/user/user.service";
import { ProfileComponentService } from './profile.component.service';
import { Post } from "../../core/models/feed/post.model";
import { MatIcon } from "@angular/material/icon";
import { MatDialog } from "@angular/material/dialog";
import { GenericCardUserComponent } from "../../shared/components/generic-card-user/generic-card-user.component";
import { GenericActionsButtonsComponent } from "../../shared/components/generic-actions-buttons/generic-actions-buttons.component";
import { PostActionButtonsComponent } from "../../shared/components/post-action-buttons/post-action-buttons.component";
import { NotFoundComponent } from "../../shared/components/404-page/404.component";
import { SkeletonComponent } from "../../shared/components/skeleton/skeleton.component";
import { LoaderComponent } from "../../shared/components/loader-component/loader.component";
import {AvatarItem} from "../../shared/components/avatar-item/avatar-item.component";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { FollowersModalComponent } from "./actions/followers/followers.component";
import { FollowingModalComponent } from "./actions/following/following.component";
import { PostPageComponent } from "../posts/postpage.component";
import { TranslateModule } from "@ngx-translate/core";

@Component({
    selector: "app-profile-component",
    templateUrl: "./profile.component.html",
    styleUrl: "./profile.component.scss",
    imports: [CommonModule, RouterModule, MatIcon, GenericCardUserComponent, GenericActionsButtonsComponent, PostActionButtonsComponent, NotFoundComponent, SkeletonComponent, LoaderComponent, AvatarItem, TranslateModule]
})
export class ProfileComponent implements OnInit {
    user: User | any;
    loading: boolean = true;
    username: string | null = "";
    current_user: any;
    posts: Post[] | undefined;
    backgroundColor: string = '#ffffff';
    router: any;
    activeTab: 'posts' | 'media' | 'likes' = 'posts';

    constructor(
        private readonly route: ActivatedRoute,
        private readonly userService: UserService,
        private readonly profileService: ProfileComponentService,
        private readonly _router: Router,
        private readonly dialog: MatDialog,
        private readonly location: Location,
        private readonly sanitizer: DomSanitizer,
    ) {
        this.router = _router;
    }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const username = params.get('username');
            this.username = username;
            this.getUserData(username ?? "");
        });
        this.userService.user$.subscribe((user: any) => {
            this.current_user = user;
        });
        this.profileService.backgroundColor$.subscribe(color => {
            this.backgroundColor = color;
        });
    }

    getUserData(username: string) {
        this.loading = true;
        this.profileService.getUserByUsername(username).subscribe({
            next: (user: any) => {
                this.user = user;
                this.getUserPosts(user.id);
                this.profileService.setBackgroundFromImage(user.profilePictureUrl, user.username);
            },
            error: (err) => {
                if (err.status === 404) {
                    this.loading = false;
                    this.user = null;
                }
            }
        });
    }

    getUserPosts(userId: string) {
        this.profileService.getPostsByUser(userId).subscribe((posts: Post[]) => {
            this.posts = posts.reverse();
            this.loading = false;
        })
    }

    navigateToPost(post: Post) {
        // change URL WITHOUT triggering route
        this.location.go(`/p/${post.id}`);

        // open modal
        const dialogRef = this.dialog.open(PostPageComponent, {
            data: { post }
        });

        dialogRef.afterClosed().subscribe(() => {
            // restore profile URL
            this.location.go(`/${this.username}`);
        });
    }

    get filteredPosts() {
        if (!this.posts) return [];

        switch (this.activeTab) {
            case 'media':
                return this.posts.filter(p => p.media?.length > 0);
            case 'likes':
                return this.posts.filter(p => p.likes?.length > 0);
            default:
                return this.posts;
        }
    }

    setTab(tab: any) {
        this.activeTab = tab;
    }

    formatBio(text: string): SafeHtml {
        if (!text) return '';

        const formatted = text.replace(/@([a-zA-Z0-9_]+)/g, (match, username) => {
            return `<span class="mention" style="color: #1881E2; cursor: pointer" data-username="${username}">@${username}</span>`;
        });

        return this.sanitizer.bypassSecurityTrustHtml(formatted);
    }

    onBioClick(event: Event) {
        const target = event.target as HTMLElement;

        if (target.classList.contains('mention')) {
            const username = target.getAttribute('data-username');
            if (username) {
                this.router.navigate([`/${username}`]);
            }
        }
    }

    openFollowers() {
        this.dialog.open(FollowersModalComponent, {
            width: '800px',
            data: {user: this.user, users: this.user.followers}
        })
    }

    openFollowing() {
        this.dialog.open(FollowingModalComponent, {
            width: '800px',
            data: { user: this.user, users: this.user.following }
        })
    }

}