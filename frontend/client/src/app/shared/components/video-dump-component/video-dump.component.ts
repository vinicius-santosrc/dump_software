import {
    AfterViewInit,
    Component,
    ElementRef,
    Input,
    OnDestroy,
    OnInit,
    OnChanges,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import { VideoDumpService } from './video-dump.service';
import { MatIcon } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-video-dump',
    templateUrl: './video-dump.component.html',
    styleUrls: ['./video-dump.component.scss'],
    imports: [CommonModule, MatIcon, MatButtonModule],
    standalone: true
})
export class VideoDumpComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {

    @Input() src!: string;
    @Input() thumbnail!: string;
    @Input() autoplay = true;

    @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;

    isMuted = true;
    observer?: IntersectionObserver;

    isPaused = true;
    progress = 0;
    showLike = false;
    lastTap = 0;

    isLoading = false;
    isVisible = false;
    userPaused = false;

    hasLoaded = false;

    private currentSub: any;
    private muteSub: any;

    constructor(private readonly videoService: VideoDumpService) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (!changes['src'] || changes['src'].firstChange) {
            return;
        }

        const video = this.videoRef?.nativeElement;
        this.hasLoaded = false;
        this.isLoading = false;
        this.progress = 0;
        this.isPaused = true;
        this.userPaused = false;

        if (video) {
            video.pause();
            video.removeAttribute('src');
            video.load();

            if (this.isVisible && this.autoplay) {
                this.loadVideo();
                this.safePlay();
            }
        }
    }

    ngOnInit(): void {
        this.isMuted = this.videoService.getMute();

        this.muteSub = this.videoService.muted$.subscribe(muted => {
            this.isMuted = muted;
            if (this.videoRef) {
                this.videoRef.nativeElement.muted = muted;
            }
        });

        this.currentSub = this.videoService.currentPlaying$.subscribe(current => {
            const video = this.videoRef?.nativeElement;
            if (!video) return;
            if (current && current !== video) {
                this.pauseVideo(false);
            }
        });
    }

    ngAfterViewInit(): void {
        const video = this.videoRef?.nativeElement;
        if (!video) return;

        video.muted = this.isMuted ?? true;
        video.playsInline = true;

        this.observer = new IntersectionObserver(
            ([entry]) => {
                this.isVisible = entry.isIntersecting && entry.intersectionRatio >= 0.7;

                if (this.isVisible) {
                    if (!this.hasLoaded) {
                        this.loadVideo();
                    }

                    if (this.autoplay && !this.userPaused) {
                        this.safePlay();
                    }
                    return;
                }

                this.pauseVideo(false);
            },
            { threshold: [0, 0.35, 0.7, 0.9], rootMargin: '80px 0px' }
        );

        this.observer.observe(video);

        video.addEventListener('play', () => {
            this.isPaused = false;
            this.isLoading = false;
        });

        video.addEventListener('pause', () => {
            this.isPaused = true;
        });

        video.addEventListener('loadeddata', () => {
            this.isLoading = false;

            if (this.isVisible && this.autoplay && !this.userPaused && video.paused) {
                this.safePlay();
            }
        });

        video.addEventListener('canplay', () => {
            this.isLoading = false;

            if (this.isVisible && this.autoplay && !this.userPaused && video.paused) {
                this.safePlay();
            }
        });

        video.addEventListener('waiting', () => {
            this.isLoading = true;
        });

        video.addEventListener('playing', () => {
            this.isLoading = false;
        });
    }

    loadVideo() {
        if (this.hasLoaded || !this.src) return;

        const video = this.videoRef?.nativeElement;
        if (!video) return;

        this.isLoading = true;
        video.src = this.src;
        video.load();
        this.hasLoaded = true;

        if (this.isVisible && this.autoplay && !this.userPaused) {
            this.safePlay();
        }
    }

    play() {
        this.togglePlay();
    }

    togglePlay() {
        const video = this.videoRef?.nativeElement;
        if (!video) return;

        if (!this.hasLoaded) {
            this.loadVideo();
        }

        if (video.paused) {
            this.userPaused = false;
            this.safePlay();
            return;
        }

        this.pauseVideo(true);
    }

    private safePlay() {
        const video = this.videoRef?.nativeElement;
        if (!video) return;

        if (!this.src) return;

        if (!this.hasLoaded) {
            this.loadVideo();
            return;
        }

        this.videoService.setCurrent(video);

        video.play()
            .then(() => {
                this.isPaused = false;
                this.isLoading = false;
            })
            .catch(() => {
                this.isPaused = true;
                this.isLoading = false;
            });
    }

    private pauseVideo(fromUser: boolean) {
        const video = this.videoRef?.nativeElement;
        if (!video) return;

        if (fromUser) {
            this.userPaused = true;
        }

        video.pause();
        this.isPaused = true;
        this.isLoading = false;
    }

    toggleMute() {
        this.videoService.toggleMute();
    }

    onTimeUpdate() {
        const video = this.videoRef.nativeElement;
        if (!video.duration) return;
        this.progress = (video.currentTime / video.duration) * 100;
    }

    ngOnDestroy(): void {
        if (this.observer) this.observer.disconnect();
        const video = this.videoRef?.nativeElement;
        if (video) {
            video.pause();
            video.removeAttribute('src');
            video.load();
        }
        this.currentSub?.unsubscribe?.();
        this.muteSub?.unsubscribe?.();
    }
}