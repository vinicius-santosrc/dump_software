import { Component, Input, ViewChildren, QueryList, ElementRef, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoDumpComponent } from '../../../video-dump-component/video-dump.component';
import { PostCarouselComponent } from "../post-carousel-component/post-carousel.component";
import { PostsService } from '../../../../../core/services/post/post.service';
import { UserService } from '../../../../../core/services/user/user.service';

@Component({
    selector: 'app-post-media',
    standalone: true,
    imports: [CommonModule, VideoDumpComponent, PostCarouselComponent],
    templateUrl: './post-media.component.html',
    styleUrl: './post-media.component.scss'
})
export class PostMediaComponent implements AfterViewInit {

    @Input() media: any[] = [];
    @Input() postId: string | undefined = '';
    @Output() likeChanged = new EventEmitter<boolean>();
    isLoading: boolean = true;

    current_user: any;

    currentIndex: number = 0;

    @ViewChildren('video') videoElements!: QueryList<ElementRef<HTMLVideoElement>>;

    private tapTimeout: any;
    showLike = false;
    showDislike = false;

    constructor(private readonly postService: PostsService, private readonly userService: UserService) { 
        this.current_user = this.userService.getUser();
    }

    ngAfterViewInit() {
    }

    next() {
        if (this.currentIndex < this.media.length - 1) {
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