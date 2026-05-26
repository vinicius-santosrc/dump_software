/**
 * Created By: Vinícius da Silva Santos
 * Creation Date: 2026-03-17
 * Copyright (c) 2026 Dump Software. All rights reserved.
 * This software is licensed under the MIT License. See the LICENSE file in the project root for more information.
 */

import { Component, HostListener, OnInit } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { Post } from "../../core/models/feed/post.model";
import { PostsService } from "../../core/services/post/post.service";
import { UserService } from "../../core/services/user/user.service";
import { PostComponent } from "../../shared/components/post-component/post.component";
import { CardComponent } from "../../shared/components/card-component/card-component";
import { User } from "../../core/models/user/user.model";
import { Topic } from "../../core/models/feed/topic.model";
import { Router } from "@angular/router";
import { GenericCardUserComponent } from "../../shared/components/generic-card-user/generic-card-user.component";
import { MemoriesComponent } from "../../layout/header/memories-component/memories.component";
import { SkeletonComponent } from "../../shared/components/skeleton/skeleton.component";
import { GenericButtonComponent } from "../../shared/components/generic-button-component/generic-button.component";
import { MatTabsModule } from '@angular/material/tabs';
import { FooterAuthComponent } from "../../shared/components/footer-auth-component/footer-auth-component";
import { TopicService } from '../../core/services/topic/topic.service';
import { HeaderComponent } from "../../layout/header/header.component";

@Component({
    selector: "app-feed-component",
    templateUrl: "./feed.component.html",
    styleUrl: "./feed.component.scss",
    imports: [TranslateModule, PostComponent, CardComponent, GenericCardUserComponent, MemoriesComponent, SkeletonComponent, GenericButtonComponent, MatTabsModule, FooterAuthComponent, HeaderComponent]
})
export class FeedComponent implements OnInit {
    posts: Post[] = [];
    loading: boolean = true;
    loadingMore: boolean = false;
    hasMorePosts: boolean = true;
    cursor?: string;
    readonly limit: number = 5;
    private readonly loadedPostIds = new Set<string>();
    public current_user: any;
    relatedUsers: User[] = [];
    router: any;
    topics: Topic[] = [];

    constructor(
        public postsService: PostsService,
        public userService: UserService,
        public _router: Router,
        private readonly topicService: TopicService
    ) {
        this.userService.user$.subscribe((user: any) => {
            this.current_user = user;
        });
        this.router = _router;
    }

    ngOnInit(): void {
        this.getPosts();
        this.getRelatedUsers();
        this.getTendingTopics();
    }
    getPosts(reset: boolean = false) {
        if (this.loadingMore || (!this.hasMorePosts && !reset)) {
            return;
        }

        if (!this.current_user?.id) {
            return;
        }

        if (reset) {
            this.cursor = undefined;
            this.posts = [];
            this.hasMorePosts = true;
            this.loadedPostIds.clear();
            this.postsService.clearFeedCache();
        }

        if (!this.cursor) {
            this.loading = true;
        } else {
            this.loadingMore = true;
        }

        this.postsService
            .getByCurrentUser(this.current_user.id, this.cursor, this.limit)
            .subscribe({
                next: (posts) => {
                    const parsedPosts = posts as Post[];

                    parsedPosts.sort((a, b) => {
                        return new Date(b.createdAt ?? '').getTime() - new Date(a.createdAt ?? '').getTime();
                    });

                    const uniquePosts = parsedPosts.filter(post => {
                        if (this.loadedPostIds.has(post.id ?? "")) {
                            return false;
                        }

                        this.loadedPostIds.add(post.id ?? "");
                        return true;
                    });

                    this.posts = [...this.posts, ...uniquePosts]
                        .sort((a, b) => {
                            return new Date(b.createdAt ?? '').getTime() - new Date(a.createdAt ?? '').getTime();
                        });

                    this.hasMorePosts = parsedPosts.length >= this.limit;

                    const lastPost = parsedPosts[parsedPosts.length - 1];

                    if (lastPost?.createdAt) {
                        this.cursor = lastPost.createdAt;
                    }

                    if (uniquePosts.length === 0) {
                        this.hasMorePosts = false;
                    }

                    this.loading = false;
                    this.loadingMore = false;
                },
                error: (error) => {
                    console.error('[FEED] getPosts', error);
                    this.loading = false;
                    this.loadingMore = false;
                }
            });
    }

    getRelatedUsers() {
        this.userService.getRelatedByCurrentUser().subscribe(users => {
            this.relatedUsers = users as User[];
        });
    }

    getTendingTopics() {

        this.topicService
            .getTrending()
            .subscribe({
                next: (topics) => {
                    this.topics = topics;
                },
                error: (error) => {
                    console.error('[TRENDING] getTendingTopics', error);
                }
            });
    }

    @HostListener('window:scroll', [])
    onWindowScroll(): void {
        if (this.loading || this.loadingMore || !this.hasMorePosts) {
            return;
        }

        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const viewportHeight = window.innerHeight;
        const fullHeight = document.documentElement.scrollHeight;

        const distanceFromBottom = fullHeight - (scrollTop + viewportHeight);

        if (distanceFromBottom <= 800) {
            this.getPosts();
        }
    }

    navigateToProfile(user: User) {
        this.router.navigate([`/${user.username}`]);
    }

}