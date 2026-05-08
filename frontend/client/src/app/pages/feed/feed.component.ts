/**
 * Created By: Vinícius da Silva Santos
 * Creation Date: 2026-03-17
 * Copyright (c) 2026 Dump Software. All rights reserved.
 * This software is licensed under the MIT License. See the LICENSE file in the project root for more information.
 */

import { Component, OnInit } from "@angular/core";
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
@Component({
    selector: "app-feed-component",
    templateUrl: "./feed.component.html",
    styleUrl: "./feed.component.scss",
    imports: [TranslateModule, PostComponent, CardComponent, GenericCardUserComponent, MemoriesComponent, SkeletonComponent, GenericButtonComponent, MatTabsModule, FooterAuthComponent]
})
export class FeedComponent implements OnInit {
    posts: Post[] = [];
    loading: boolean = true;
    public current_user: any;
    relatedUsers: User[] = [];
    router: any;
    topics: Topic[] = [
        {
            id: '1',
            title: 'bbb2026',
            postsRelated: 10,
            trendingScore: 98,
            growthRate: 45,
            lastActivityAt: new Date(),
            createdAt: new Date('2026-01-10'),
            engagement: {
                likes: 540000,
                comments: 210000,
                shares: 80000
            },
            category: 'memes',
            location: {
                country: 'BR',
                city: 'São Paulo'
            },
            topPosts: []
        },
        {
            id: '2',
            title: 'neymar',
            postsRelated: 9,
            trendingScore: 95,
            growthRate: 30,
            lastActivityAt: new Date(),
            createdAt: new Date('2026-02-01'),
            engagement: {
                likes: 420000,
                comments: 150000,
                shares: 60000
            },
            category: 'sports',
            location: {
                country: 'BR'
            },
            topPosts: []
        },
        {
            id: '3',
            title: 'championsleague',
            postsRelated: 7.5,
            trendingScore: 97,
            growthRate: 38,
            lastActivityAt: new Date(),
            createdAt: new Date('2026-02-15'),
            engagement: {
                likes: 600000,
                comments: 200000,
                shares: 90000
            },
            category: 'sports',
            location: {
                country: 'EU'
            },
            topPosts: []
        },
        {
            id: '4',
            title: 'ia',
            postsRelated: 6,
            trendingScore: 99,
            growthRate: 60,
            lastActivityAt: new Date(),
            createdAt: new Date('2026-01-05'),
            engagement: {
                likes: 800000,
                comments: 250000,
                shares: 120000
            },
            category: 'tech',
            location: {
                country: 'US'
            },
            topPosts: []
        },
        {
            id: '5',
            title: 'chatgpt',
            postsRelated: 4,
            trendingScore: 96,
            growthRate: 50,
            lastActivityAt: new Date(),
            createdAt: new Date('2026-01-20'),
            engagement: {
                likes: 720000,
                comments: 210000,
                shares: 100000
            },
            category: 'tech',
            location: {
                country: 'US'
            },
            topPosts: []
        },
        {
            id: '6',
            title: 'cs2',
            postsRelated: 3,
            trendingScore: 87,
            growthRate: 19,
            lastActivityAt: new Date(),
            createdAt: new Date('2026-02-10'),
            engagement: {
                likes: 300000,
                comments: 90000,
                shares: 40000
            },
            category: 'sports',
            location: {
                country: 'BR'
            },
            topPosts: []
        },
        {
            id: '7',
            title: 'memesbr',
            postsRelated: 2,
            trendingScore: 100,
            growthRate: 70,
            lastActivityAt: new Date(),
            createdAt: new Date('2026-01-01'),
            engagement: {
                likes: 1000000,
                comments: 400000,
                shares: 200000
            },
            category: 'memes',
            location: {
                country: 'BR'
            },
            topPosts: []
        },
        {
            id: '8',
            title: 'academia',
            postsRelated: 1,
            trendingScore: 92,
            growthRate: 25,
            lastActivityAt: new Date(),
            createdAt: new Date('2026-02-05'),
            engagement: {
                likes: 500000,
                comments: 180000,
                shares: 70000
            },
            category: 'other',
            location: {
                country: 'BR'
            },
            topPosts: []
        },
        {
            id: '9',
            title: 'empreendedorismo',
            postsRelated: 0.8,
            trendingScore: 90,
            growthRate: 27,
            lastActivityAt: new Date(),
            createdAt: new Date('2026-01-25'),
            engagement: {
                likes: 410000,
                comments: 140000,
                shares: 65000
            },
            category: 'business' as any,
            location: {
                country: 'BR'
            },
            topPosts: []
        },
        {
            id: '10',
            title: 'foryou',
            postsRelated: 0.77,
            trendingScore: 100,
            growthRate: 80,
            lastActivityAt: new Date(),
            createdAt: new Date('2026-01-01'),
            engagement: {
                likes: 1500000,
                comments: 500000,
                shares: 300000
            },
            category: 'memes',
            location: {
                country: 'GLOBAL'
            },
            topPosts: []
        }
    ];

    constructor(
        public postsService: PostsService,
        public userService: UserService,
        public _router: Router
    ) {
        this.userService.user$.subscribe((user: any) => {
            this.current_user = user;
        });
        this.router = _router;
    }

    ngOnInit(): void {
        this.getPosts();
        this.getRelatedUsers();
    }
    getPosts() {
        this.loading = true;
        this.postsService.getByCurrentUser(this.current_user.id).subscribe(posts => {
            this.posts = (posts) as Post[];
            this.posts = this.posts.reverse();
            this.loading = false;
        });
    }

    getRelatedUsers() {
        this.userService.getRelatedByCurrentUser().subscribe(users => {
            this.relatedUsers = users as User[];
        });
    }

    getTendingTopics() {
        
    }

    navigateToProfile(user: User) {
        this.router.navigate([`/${user.username}`]);
    }

}