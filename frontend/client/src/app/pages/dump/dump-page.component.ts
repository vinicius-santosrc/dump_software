import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, AfterViewInit, QueryList, ViewChildren, ElementRef, OnInit, Inject, Optional } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { DumpItemComponent } from "./dump-item/dump-item.component";
import { PostsService } from "../../core/services/post/post.service";
import { UserService } from "../../core/services/user/user.service";
import { MatIcon } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { ActivatedRoute } from "@angular/router";

@Component({
    selector: "app-dump-page-component",
    templateUrl: "./dump-page.component.html",
    styleUrl: "./dump-page.component.scss",
    imports: [TranslateModule, DumpItemComponent, MatIcon, MatButtonModule]
})
export class DumpPageComponent implements AfterViewInit, OnInit {
    @Optional() @Inject(MAT_DIALOG_DATA) data: any;
    @ViewChildren(DumpItemComponent, { read: ElementRef }) items!: QueryList<ElementRef>;

    activeReelId: string | null = null;
    current_user: any;
    reels: any;

    postId: string | null = null;

    observer!: IntersectionObserver;

    constructor(
        private readonly postsService: PostsService,
        private readonly usersService: UserService,
        private readonly route: ActivatedRoute,
    ) {
        this.current_user = this.usersService.getUser();
    }

    ngOnInit(): void {
        this.getDumps();
        
        this.route.paramMap.subscribe((params: any) => {
            const postId = params.get('postId');
            this.postId = postId;
            if (postId) {
                // this.profileService.setBackgroundFromImage("rgb(12, 16, 20)");

            }
        });
    }

    ngAfterViewInit(): void {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('data-id');

                    if (id && this.activeReelId !== id) {
                        this.activeReelId = id;

                        globalThis.history.replaceState({}, '', `/dumps/${id}`);
                    }
                }
            });
        }, { threshold: 0.6, root: null, rootMargin: "0px" });

        setTimeout(() => {
            const elements = document.querySelectorAll('.reel-item');
            elements.forEach(el => this.observer.observe(el));
        });
    }

    async getDumps() {
        this.postsService.getDumpsByCurrentUser(this.current_user.id).subscribe((dumps) => {
            this.reels = dumps;
        })
    }
    

    private getReelElements(): HTMLElement[] {
        return Array.from(document.querySelectorAll('.reel-item')) as HTMLElement[];
    }

    private findCurrentIndex(elements: HTMLElement[]): number {
        // Prefer activeReelId if available
        if (this.activeReelId) {
            const idx = elements.findIndex(el => el.getAttribute('data-id') === this.activeReelId);
            if (idx !== -1) return idx;
        }

        // Fallback: pick the element closest to the center of the viewport
        const viewportCenter = window.innerHeight / 2;
        let bestIdx = 0;
        let bestDistance = Number.POSITIVE_INFINITY;

        elements.forEach((el, i) => {
            const rect = el.getBoundingClientRect();
            const elCenter = rect.top + rect.height / 2;
            const dist = Math.abs(elCenter - viewportCenter);
            if (dist < bestDistance) {
                bestDistance = dist;
                bestIdx = i;
            }
        });

        return bestIdx;
    }

    onScroll(event: any) {
        const elements = this.getReelElements();
        if (!elements.length) return;

        const viewportCenter = window.innerHeight / 2;

        let closestId: string | null = null;
        let closestDistance = Number.POSITIVE_INFINITY;

        elements.forEach((el) => {
            const rect = el.getBoundingClientRect();
            const elCenter = rect.top + rect.height / 2;
            const distance = Math.abs(elCenter - viewportCenter);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestId = el.getAttribute('data-id');
            }
        });

        if (closestId && this.activeReelId !== closestId) {
            this.activeReelId = closestId;
            window.history.replaceState({}, '', `/dumps/${closestId}`);
        }
    }

    scrollToTop() {
        const container = document.querySelector('.reels-container') as HTMLElement;
        if (!container) return;

        const elements = this.getReelElements();
        if (!elements.length) return;

        const current = this.findCurrentIndex(elements);

        // fallback: scroll by viewport if index detection fails
        if (current <= 0) {
            container.scrollBy({ top: -container.clientHeight, behavior: 'smooth' });
            return;
        }

        const prev = elements[current - 1];

        // force correct alignment
        prev.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    scrollToBottom() {
        const elements = this.getReelElements();
        if (!elements.length) return;

        const current = this.findCurrentIndex(elements);
        if (current < elements.length - 1) {
            const next = elements[current + 1];
            next.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}