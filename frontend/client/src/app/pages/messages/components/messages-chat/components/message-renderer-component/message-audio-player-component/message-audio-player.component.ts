import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnDestroy,
    ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-message-audio-player',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule
    ],
    templateUrl: './message-audio-player.component.html',
    styleUrl: './message-audio-player.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageAudioPlayerComponent implements AfterViewInit, OnDestroy {

    @Input({ required: true }) src!: string;

    @Input() isMine: boolean = false;

    @Input() senderAvatar?: string;

    @Input() showAvatar: boolean = true;

    @ViewChild('audioElement')
    audioElement?: ElementRef<HTMLAudioElement>;

    isPlaying: boolean = false;

    isLoading: boolean = false;

    duration: number = 0;

    currentTime: number = 0;

    playbackRate: number = 1;

    private readonly playbackRates: number[] = [1, 1.5, 2];

    private animationFrameId?: number;

    constructor(
        private readonly changeDetectorRef: ChangeDetectorRef
    ) { }

    ngAfterViewInit(): void {
        const audio = this.audioElement?.nativeElement;

        if (!audio) return;

        audio.addEventListener('loadedmetadata', this.handleLoadedMetadata);
        audio.addEventListener('timeupdate', this.handleTimeUpdate);
        audio.addEventListener('waiting', this.handleWaiting);
        audio.addEventListener('playing', this.handlePlaying);
        audio.addEventListener('ended', this.handleEnded);
        audio.addEventListener('error', this.handleError);
    }

    ngOnDestroy(): void {
        const audio = this.audioElement?.nativeElement;

        if (audio) {
            audio.pause();

            audio.removeEventListener('loadedmetadata', this.handleLoadedMetadata);
            audio.removeEventListener('timeupdate', this.handleTimeUpdate);
            audio.removeEventListener('waiting', this.handleWaiting);
            audio.removeEventListener('playing', this.handlePlaying);
            audio.removeEventListener('ended', this.handleEnded);
            audio.removeEventListener('error', this.handleError);
        }

        this.stopProgressLoop();
    }

    async togglePlay(): Promise<void> {
        const audio = this.audioElement?.nativeElement;

        if (!audio || !this.src) return;

        if (this.isPlaying) {
            this.pause();
            return;
        }

        try {
            this.isLoading = true;
            this.changeDetectorRef.markForCheck();

            await audio.play();

            this.isPlaying = true;
            this.isLoading = false;

            this.startProgressLoop();
        } catch (error) {
            console.error('[MESSAGE_AUDIO_PLAYER] play error', error);

            this.isPlaying = false;
            this.isLoading = false;
        }

        this.changeDetectorRef.markForCheck();
    }

    pause(): void {
        const audio = this.audioElement?.nativeElement;

        if (!audio) return;

        audio.pause();

        this.isPlaying = false;
        this.stopProgressLoop();

        this.changeDetectorRef.markForCheck();
    }

    seek(event: Event): void {
        const audio = this.audioElement?.nativeElement;
        const input = event.target as HTMLInputElement;

        if (!audio) return;

        const nextTime = Number(input.value);

        audio.currentTime = nextTime;
        this.currentTime = nextTime;

        this.changeDetectorRef.markForCheck();
    }

    changePlaybackRate(): void {
        const audio = this.audioElement?.nativeElement;

        const currentIndex = this.playbackRates.indexOf(this.playbackRate);
        const nextIndex = currentIndex >= this.playbackRates.length - 1 ? 0 : currentIndex + 1;

        this.playbackRate = this.playbackRates[nextIndex];

        if (audio) {
            audio.playbackRate = this.playbackRate;
        }

        this.changeDetectorRef.markForCheck();
    }

    get progressPercentage(): number {
        if (!this.duration) return 0;

        return Math.min((this.currentTime / this.duration) * 100, 100);
    }

    formatTime(value: number): string {
        if (!Number.isFinite(value) || value < 0) {
            return '0:00';
        }

        const minutes = Math.floor(value / 60);
        const seconds = Math.floor(value % 60);

        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    private readonly handleLoadedMetadata = (): void => {
        const audio = this.audioElement?.nativeElement;

        if (!audio) return;

        this.duration = audio.duration || 0;
        this.changeDetectorRef.markForCheck();
    };

    private readonly handleTimeUpdate = (): void => {
        const audio = this.audioElement?.nativeElement;

        if (!audio) return;

        this.currentTime = audio.currentTime || 0;
        this.changeDetectorRef.markForCheck();
    };

    private readonly handleWaiting = (): void => {
        this.isLoading = true;
        this.changeDetectorRef.markForCheck();
    };

    private readonly handlePlaying = (): void => {
        this.isLoading = false;
        this.isPlaying = true;
        this.changeDetectorRef.markForCheck();
    };

    private readonly handleEnded = (): void => {
        this.isPlaying = false;
        this.currentTime = 0;
        this.stopProgressLoop();

        const audio = this.audioElement?.nativeElement;

        if (audio) {
            audio.currentTime = 0;
        }

        this.changeDetectorRef.markForCheck();
    };

    private readonly handleError = (): void => {
        this.isPlaying = false;
        this.isLoading = false;
        this.stopProgressLoop();

        this.changeDetectorRef.markForCheck();
    };

    private startProgressLoop(): void {
        this.stopProgressLoop();

        const update = (): void => {
            const audio = this.audioElement?.nativeElement;

            if (audio) {
                this.currentTime = audio.currentTime || 0;
                this.changeDetectorRef.markForCheck();
            }

            this.animationFrameId = requestAnimationFrame(update);
        };

        this.animationFrameId = requestAnimationFrame(update);
    }

    private stopProgressLoop(): void {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = undefined;
        }
    }
}