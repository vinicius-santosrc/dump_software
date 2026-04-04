import {
    Component,
    ElementRef,
    Input,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import { VideoDumpService } from './video-dump.service';
import { MatIcon } from "@angular/material/icon";

@Component({
    selector: 'app-video-dump',
    templateUrl: './video-dump.component.html',
    styleUrls: ['./video-dump.component.scss'],
    imports: [MatIcon],
})
export class VideoDumpComponent implements OnInit, OnDestroy {

    @Input() src!: string;

    @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;

    isMuted = true;
    observer!: IntersectionObserver;

    isPaused = true;
    progress = 0;
    showLike = false;
    lastTap = 0;

    isLoading = true;

    private currentSub: any;
    private muteSub: any;

    private tapTimeout: any;

    constructor(private videoService: VideoDumpService) { }

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
        const video = this.videoRef.nativeElement;

        video.muted = this.isMuted;
        video.playsInline = true;

        this.observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    this.play();
                } else {
                    video.pause();
                    this.isPaused = true;
                }
            },
            { threshold: 0.5 }
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

    play() {
        const video = this.videoRef.nativeElement;
        this.videoService.setCurrent(video);
        video.play().catch(() => { });
    }

    toggleMute() {
        this.videoService.toggleMute();
    }

    handleTap(event: PointerEvent) {
        if (this.tapTimeout) {
            clearTimeout(this.tapTimeout);
            this.tapTimeout = null;

            // DOUBLE TAP (like)
            this.showLike = true;
            setTimeout(() => {
                this.showLike = false;
            }, 600);

            return;
        }

        this.tapTimeout = setTimeout(() => {
            const video = this.videoRef.nativeElement;

            if (video.paused) {
                this.play();
            } else {
                video.pause();
                this.isPaused = true;
            }

            this.tapTimeout = null;
        }, 250);
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