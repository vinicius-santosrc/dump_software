import { Component, ElementRef, Input, OnChanges, ViewChild } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { PostMediaComponent } from "../../../shared/components/post-component/components/post-media-component/post-media.component";
import { PostHeaderComponent } from "../../../shared/components/post-component/components/post-header-component/post-header.component";
import { PostActionButtonsComponent } from "../../../shared/components/post-action-buttons/post-action-buttons.component";
import { ThemeService } from "../../../core/services/theme.service";

@Component({
    selector: "app-dump-item-component",
    templateUrl: "./dump-item.component.html",
    styleUrl: "./dump-item.component.scss",
    imports: [MatIcon, MatButtonModule, PostMediaComponent, PostHeaderComponent, PostActionButtonsComponent],
})
export class DumpItemComponent implements OnChanges {

    @ViewChild('video') video!: ElementRef<HTMLVideoElement>;

    @Input() isActive = false;
    @Input() reel: any;

    theme: 'light' | 'dark' = 'light';
    isHorizontalVideo = false;

    static isMuted = false;

    constructor(private readonly themeService: ThemeService) { 
        this.theme = themeService.getTheme();
    }

    ngOnChanges() {
        this.checkVideoOrientation();

        if (!this.video) return;

        const videoEl = this.video.nativeElement;

        videoEl.muted = DumpItemComponent.isMuted;

        if (this.isActive) {
            videoEl.play().catch(() => {});
        } else {
            videoEl.pause();
        }
    }

    checkVideoOrientation(): void {

        const media = this.reel?.media?.[0];

        if (!media) {
            this.isHorizontalVideo = false;
            return;
        }

        const width = Number(media.width || 0);
        const height = Number(media.height || 0);

        this.isHorizontalVideo = width > height;
    }

    togglePlay() {
        const videoEl = this.video.nativeElement;

        if (videoEl.paused) {
            videoEl.play();
        } else {
            videoEl.pause();
        }
    }

    toggleMute() {
        DumpItemComponent.isMuted = !DumpItemComponent.isMuted;

        if (this.video) {
            this.video.nativeElement.muted = DumpItemComponent.isMuted;
        }
    }

    like() {
        console.log('liked');
    }
}