import { Injectable, ElementRef, QueryList } from '@angular/core';
import { PostsService } from '../../../core/services/post/post.service';
import { UserService } from '../../../core/services/user/user.service';
import { MatDialog } from '@angular/material/dialog';
import { SharePostComponent } from '../share-post-component/share-post-component';

@Injectable({ providedIn: 'root' })
export class PostComponentService {

    private observer: IntersectionObserver | null = null;
    private isMutedGlobal: boolean = false;
    public current_user: any;

    constructor(
        private readonly postsService: PostsService,
        private readonly userService: UserService,
        private readonly dialog: MatDialog
    ) {
        this.userService.user$.subscribe((user: any) => {
            this.current_user = user;
        });
    }

    setupObserver(videoElements: QueryList<ElementRef<HTMLVideoElement>>) {
        if (this.observer) {
            this.observer.disconnect();
        }

        this.observer = new IntersectionObserver((entries) => {
            let mostVisible: { video: HTMLVideoElement; ratio: number } | null = null;

            entries.forEach(entry => {
                const video = entry.target as HTMLVideoElement;
                const ratio = entry.intersectionRatio;

                if (!mostVisible || ratio > mostVisible.ratio) {
                    mostVisible = { video, ratio };
                }
            });

            videoElements.forEach(ref => {
                const video = ref.nativeElement;

                if ((video as any)._userPaused) return;

                if (mostVisible && video === mostVisible.video && mostVisible.ratio > 0.5) {
                    video.play().catch(() => { });
                } else {
                    video.pause();
                }
            });

        }, {
            threshold: [0.25, 0.5, 0.75, 1]
        });

        videoElements.forEach(ref => {
            const video = ref.nativeElement;
            video.muted = this.isMutedGlobal;
            this.observer?.observe(video);
        });
    }

    destroyObserver() {
        this.observer?.disconnect();
    }

    togglePlay(video: HTMLVideoElement) {
        if (video.paused) {
            (video as any)._userPaused = false;
            video.play().catch(() => { });
        } else {
            video.pause();
            (video as any)._userPaused = true;
        }
    }

    toggleMute(videoElements: QueryList<ElementRef<HTMLVideoElement>>) {
        this.isMutedGlobal = !this.isMutedGlobal;

        videoElements.forEach(ref => {
            ref.nativeElement.muted = this.isMutedGlobal;
        });
    }

    extractColorFromImage(imageUrl: string): Promise<{ bg: string, text: string }> {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = imageUrl;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

                let r = 0, g = 0, b = 0, count = 0;

                for (let i = 0; i < imageData.length; i += 4 * 50) {
                    r += imageData[i];
                    g += imageData[i + 1];
                    b += imageData[i + 2];
                    count++;
                }

                r = Math.floor((r / count) * 0.6);
                g = Math.floor((g / count) * 0.6);
                b = Math.floor((b / count) * 0.6);

                const bg = `rgb(${r}, ${g}, ${b})`;
                const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                const text = brightness > 125 ? '#000000' : '#ffffff';

                resolve({ bg, text });
            };
        });
    }

    extractColorFromVideo(videoUrl: string): Promise<{ bg: string, text: string }> {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.crossOrigin = 'anonymous';
            video.src = videoUrl;
            video.muted = true;
            video.playsInline = true;

            video.addEventListener('loadeddata', () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

                let r = 0, g = 0, b = 0, count = 0;

                for (let i = 0; i < imageData.length; i += 4 * 50) {
                    r += imageData[i];
                    g += imageData[i + 1];
                    b += imageData[i + 2];
                    count++;
                }

                r = Math.floor((r / count) * 0.6);
                g = Math.floor((g / count) * 0.6);
                b = Math.floor((b / count) * 0.6);

                const bg = `rgb(${r}, ${g}, ${b})`;
                const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                const text = brightness > 125 ? '#000000' : '#ffffff';

                resolve({ bg, text });
            });

            video.onerror = () => reject();
        });
    }

    handleLike(postId: string | undefined) {
        if (!postId) return;

        return this.postsService.handleLike(postId, this.current_user.id);
    }

    savePost(postId: string | undefined) {
        try {
            // if (postId) this.postsService.handleLike(postId, this.current_user.id);
        }
        catch (error) {
            console.error(error);
        }
    }

    sendPost(postId: string | undefined) {
        if (!postId) {
            console.error('postId undefined in sendPost');
            return;
        }

        try {
            this.dialog.open(SharePostComponent, {
                data: {postId: postId},
                width: '500px'
            });
        }
        catch (error) {
            console.error(error);
        }
    }
}