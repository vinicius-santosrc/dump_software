import { Component, Input, ViewChildren, QueryList, ElementRef, AfterViewInit, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoDumpComponent } from '../../../video-dump-component/video-dump.component';
import { PostCarouselComponent } from "../post-carousel-component/post-carousel.component";
import { PostsService } from '../../../../../core/services/post/post.service';
import { UserService } from '../../../../../core/services/user/user.service';

import { Media } from '../../../../../core/models/feed/post.model';
import { LoaderComponent } from "../../../loader-component/loader.component";

@Component({
    selector: 'app-post-media',
    standalone: true,
    imports: [CommonModule, VideoDumpComponent, PostCarouselComponent, LoaderComponent],
    templateUrl: './post-media.component.html',
    styleUrl: './post-media.component.scss'
})
export class PostMediaComponent implements AfterViewInit, OnDestroy, OnChanges {

    @Input() media: Media[] = [];
    @Input() postId: string | undefined = '';
    @Output() likeChanged = new EventEmitter<boolean>();

    resolvedMedia: Media[] = [];
    isLoading: boolean = true;
    isLoadingFullMedia: boolean = false;
    hasLoadedFullMedia: boolean = false;

    current_user: any;

    currentIndex: number = 0;

    @ViewChildren('video') videoElements!: QueryList<ElementRef<HTMLVideoElement>>;

    private tapTimeout: any;
    private mediaObserver?: IntersectionObserver;
    private lazyMediaLoadTimer?: any;
    private readonly lazyFullMediaDelayMs = 2500;
    private viewInitialized: boolean = false;
    showLike = false;
    showDislike = false;

    constructor(
        private readonly postService: PostsService,
        private readonly userService: UserService,
        private readonly hostElement: ElementRef<HTMLElement>
    ) {
        this.current_user = this.userService.getUser();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['media']) {
            this.resolvedMedia = [...(this.media ?? [])];
            this.isLoading = this.hasLazyMedia();
            this.hasLoadedFullMedia = false;
            this.isLoadingFullMedia = false;
            this.currentIndex = 0;

            if (this.viewInitialized) {
                this.scheduleLazyMediaLoad();
            }
        }
    }

    ngAfterViewInit() {
        this.viewInitialized = true;
        this.resolvedMedia = [...(this.media ?? [])];
        this.isLoading = this.hasLazyMedia();
        this.scheduleLazyMediaLoad();
    }

    private scheduleLazyMediaLoad() {
        queueMicrotask(() => {
            this.observeMediaVisibility();
        });
    }

    ngOnDestroy() {
        this.mediaObserver?.disconnect();
        if (this.lazyMediaLoadTimer) {
            clearTimeout(this.lazyMediaLoadTimer);
            this.lazyMediaLoadTimer = undefined;
        }
        if (this.tapTimeout) {
            clearTimeout(this.tapTimeout);
        }
    }

    private observeMediaVisibility() {
        this.mediaObserver?.disconnect();

        if (!this.hasLazyMedia()) return;

        this.mediaObserver = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting || entry.intersectionRatio < 0.6) {
                    return;
                }

                this.scheduleFullMediaLoadAfterIdle();
                this.mediaObserver?.disconnect();
            },
            {
                root: null,
                threshold: 0.6,
                rootMargin: '0px 0px'
            }
        );

        this.mediaObserver.observe(this.hostElement.nativeElement);
    }

    private scheduleFullMediaLoadAfterIdle(): void {
        if (this.hasLoadedFullMedia || this.isLoadingFullMedia || this.lazyMediaLoadTimer) {
            return;
        }

        const load = () => {
            this.lazyMediaLoadTimer = undefined;
            this.loadFullMedia();
        };

        const requestIdle = (globalThis as any).requestIdleCallback;

        if (typeof requestIdle === 'function') {
            this.lazyMediaLoadTimer = requestIdle(load, { timeout: this.lazyFullMediaDelayMs });
            return;
        }

        this.lazyMediaLoadTimer = setTimeout(load, this.lazyFullMediaDelayMs);
    }

    private hasLazyMedia(): boolean {
        return this.resolvedMedia.some(item => !item.url);
    }

    private loadFullMedia() {
        if (!this.postId || this.hasLoadedFullMedia || this.isLoadingFullMedia) {
            return;
        }

        this.isLoadingFullMedia = true;

        this.postService.getPostMedia(this.postId).subscribe({
            next: (response: any) => {
                const fullMedia = response?.media;

                if (Array.isArray(fullMedia) && fullMedia.length > 0) {
                    this.resolvedMedia = fullMedia;
                    this.hasLoadedFullMedia = true;
                }

                this.isLoading = false;
                this.isLoadingFullMedia = false;
            },
            error: () => {
                this.isLoading = false;
                this.isLoadingFullMedia = false;
            }
        });
    }

    next() {
        if (this.currentIndex < this.resolvedMedia.length - 1) {
            this.currentIndex++;
        }
    }

    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
        }
    }

    goTo(index: number) {
        this.currentIndex = index;
    }

    onMediaLoad() {
        this.isLoading = false;
    }

    handleTap() {
        if (this.postId == "") return;
        if (this.tapTimeout) {
            clearTimeout(this.tapTimeout);
            this.tapTimeout = null;

            this.postService.handleLike(this.postId ?? "", this.current_user.id)?.subscribe({
                next: (result: any) => {
                    if (result) {
                        this.showLike = true;
                        this.likeChanged.emit(true);
                        setTimeout(() => this.showLike = false, 600);
                    } 
                    else {
                        this.showDislike = true;
                        this.likeChanged.emit(false);
                        setTimeout(() => this.showDislike = false, 600);
                    }
                },
                error: () => {
                    // não faz nada em caso de erro
                }
            });
            return;
        }

        this.tapTimeout = setTimeout(() => {
            const videoEl = this.videoElements?.first?.nativeElement;

            if (videoEl) {
                if (videoEl.paused) {
                    videoEl.play();
                } else {
                    videoEl.pause();
                }
            }

            this.tapTimeout = null;
        }, 250);
    }
}