/**
 * Created By: Vinícius da Silva Santos
 * Creation Date: 2026-03-31
 * Copyright (c) 2026 Dump Software. All rights reserved.
 * This software is licensed under the MIT License. See the LICENSE file in the project root for more information.
 */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonModule, Location } from '@angular/common';
import { User } from "../../core/models/user/user.model";
import { UserService } from "../../core/services/user/user.service";
import { ProfileComponentService } from './profile.component.service';
import { Post } from "../../core/models/feed/post.model";
import { MatIcon } from "@angular/material/icon";
import { PostPageComponent } from "../posts/postpage.component";
import { MatDialog } from "@angular/material/dialog";
import { GenericCardUserComponent } from "../../shared/components/generic-card-user/generic-card-user.component";
import { GenericActionsButtonsComponent } from "../../shared/components/generic-actions-buttons/generic-actions-buttons.component";
import { PostActionButtonsComponent } from "../../shared/components/post-action-buttons/post-action-buttons.component";

@Component({
    selector: "app-profile-component",
    templateUrl: "./profile.component.html",
    styleUrl: "./profile.component.scss",
    imports: [CommonModule, MatIcon, GenericCardUserComponent, GenericActionsButtonsComponent, PostActionButtonsComponent]
    ,
})
export class ProfileComponent implements OnInit {
    user: User | any;
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
        private readonly location: Location
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
        this.profileService.getUserByUsername(username).subscribe((user: any) => {
            this.user = user;
            this.getUserPosts(user.id)
            this.profileService.setBackgroundFromImage(user.profilePictureUrl, user.username);
        });
    }

    getUserPosts(userId: string) {
        this.profileService.getPostsByUser(userId).subscribe((posts: Post[]) => {
            this.posts = posts;
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

}