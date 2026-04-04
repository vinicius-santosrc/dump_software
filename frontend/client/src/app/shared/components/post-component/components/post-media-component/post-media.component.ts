import { Component, Input, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoDumpComponent } from '../../../video-dump-component/video-dump.component';
import { PostCarouselComponent } from "../post-carousel-component/post-carousel.component";

@Component({
    selector: 'app-post-media',
    standalone: true,
    imports: [CommonModule, VideoDumpComponent, PostCarouselComponent],
    templateUrl: './post-media.component.html',
    styleUrl: './post-media.component.scss'
})
export class PostMediaComponent implements AfterViewInit {

    @Input() media: any[] = [];

    currentIndex: number = 0;

    @ViewChildren('video') videoElements!: QueryList<ElementRef<HTMLVideoElement>>;

    ngAfterViewInit() {
        // se quiser depois você move o observer pra cá
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
}