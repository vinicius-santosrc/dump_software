import { CommonModule } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogClose } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { ExploreFacadeService } from "../../../core/services/explore/explore-facade.service";
import { ExplorePostCard, ExploreSection } from "../../../core/models/feed/explore.model";

@Component({
    selector: "app-explore-reels-loop",
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogClose],
    templateUrl: "./explore-reels-loop.component.html",
    styleUrl: "./explore-reels-loop.component.scss"
})
export class ExploreReelsLoopComponent implements OnInit {
    section: ExploreSection;
    posts: ExplorePostCard[] = [];
    startIndex: number = 0;

    constructor(
        @Inject(MAT_DIALOG_DATA)
        private readonly data: {
            section: ExploreSection;
            posts: ExplorePostCard[];
            startIndex: number;
        },
        private readonly exploreFacade: ExploreFacadeService
    ) {
        this.section = data.section;
        this.posts = data.posts ?? [];
        this.startIndex = data.startIndex ?? 0;
    }

    ngOnInit(): void {
        queueMicrotask(() => {
            const item = document.querySelector<HTMLElement>(`#explore-reel-${this.startIndex}`);
            item?.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "start" });
        });
    }

    toggleLike(post: ExplorePostCard, event?: MouseEvent): void {
        event?.stopPropagation();
        this.exploreFacade.toggleLike(post);
    }

    toggleSave(post: ExplorePostCard, event?: MouseEvent): void {
        event?.stopPropagation();
        this.exploreFacade.toggleSave(post);
    }

    sharePost(post: ExplorePostCard, event?: MouseEvent): void {
        event?.stopPropagation();
        this.exploreFacade.sharePost(post);
    }

    commentPost(post: ExplorePostCard, event?: MouseEvent): void {
        event?.stopPropagation();
        this.exploreFacade.commentPost(post);
    }

    formatMetric(value: number): string {
        return this.exploreFacade.formatMetric(value);
    }
}