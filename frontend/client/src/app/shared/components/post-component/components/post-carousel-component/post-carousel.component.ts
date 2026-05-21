import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoDumpComponent } from '../../../video-dump-component/video-dump.component';

@Component({
    selector: 'app-post-carousel',
    standalone: true,
    imports: [CommonModule, VideoDumpComponent],
    templateUrl: './post-carousel.component.html',
    styleUrl: './post-carousel.component.scss'
})
export class PostCarouselComponent {

    @Input() media: any[] = [];
    @Input() isPreview: boolean = false;
    @Input() getPreview?: (file: File) => string;

    currentIndex: number = 0;

    private startX: number = 0;
    private currentX: number = 0;
    private isDragging: boolean = false;
    private readonly threshold: number = 50; // mínimo para trocar slide

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

    onTouchStart(event: TouchEvent) {
        this.startX = event.touches[0].clientX;
        this.isDragging = true;
    }

    onTouchMove(event: TouchEvent) {
        if (!this.isDragging) return;
        this.currentX = event.touches[0].clientX;
    }

    onTouchEnd() {
        if (!this.isDragging) return;

        const diff = this.startX - this.currentX;

        if (Math.abs(diff) > this.threshold) {
            if (diff > 0) {
                this.next(); // swipe left
            } else {
                this.prev(); // swipe right
            }
        }

        this.isDragging = false;
        this.startX = 0;
        this.currentX = 0;
    }
}