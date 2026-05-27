import {
    AfterViewInit,
    Component,
    ElementRef,
    Input,
    OnDestroy,
    OnInit,
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
export class VideoDumpComponent implements OnInit, OnDestroy, AfterViewInit {

    @Input() src!: string;
    @Input() thumbnail!: string;

    @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;

    isMuted = true;
    observer?: IntersectionObserver;

    isPaused = true;
    progress = 0;
    showLike = false;
    lastTap = 0;

    isLoading = true;

    hasLoaded = false;

    private currentSub: any;
    private muteSub: any;

    constructor(private readonly videoService: VideoDumpService) { }

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
                video.pause();
                this.isPaused = true;
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
                if (entry.isIntersecting) {
                    if (!this.hasLoaded) {
                        this.loadVideo();
                    }
                    this.play();
                } else {
                    video.pause();
                    this.isPaused = true;
                }
            },
            { threshold: 0.45, rootMargin: '250px 0px' }
        );

        this.observer.observe(video);

        video.addEventListener('play', () => this.isPaused = false);
        video.addEventListener('pause', () => this.isPaused = true);

        video.addEventListener('loadeddata', () => {
            this.isLoading = false;
        });

        video.addEventListener('waiting', () => {
            this.isLoading = true;
        });

        video.addEventListener('playing', () => {
            this.isLoading = false;
        });
    }

    loadVideo() {
        if (this.hasLoaded) return;

        const video = this.videoRef?.nativeElement;
        if (!video) return;

        video.src = this.src;
        video.load();
        this.hasLoaded = true;
    }

    play() {
        const video = this.videoRef.nativeElement;
        if (!this.hasLoaded) {
            this.loadVideo();
        }
        this.videoService.setCurrent(video);
        video.play().catch(() => { });
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
        this.currentSub?.unsubscribe?.();
        this.muteSub?.unsubscribe?.();
    }
}