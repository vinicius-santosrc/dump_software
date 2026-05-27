import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { ExplorePostCardComponent } from "../explore-post-card/explore-post-card.component";
import { ExplorePostCard, ExploreSection } from "../../../core/models/feed/explore.model";
import { ExploreFacadeService } from "../../../core/services/explore/explore-facade.service";
import { TranslateModule } from "@ngx-translate/core";

@Component({
    selector: "app-explore-section",
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, ExplorePostCardComponent, TranslateModule],
    templateUrl: "./explore-section.component.html",
    styleUrl: "./explore-section.component.scss"
})
export class ExploreSectionComponent {
    @Input({ required: true }) section!: ExploreSection;

    @Output() sectionOpened = new EventEmitter<ExploreSection>();
    @Output() quickReelsOpened = new EventEmitter<any>();
    @Output() liked = new EventEmitter<ExplorePostCard>();
    @Output() saved = new EventEmitter<ExplorePostCard>();
    @Output() commented = new EventEmitter<ExplorePostCard>();

    constructor(private readonly exploreFacade: ExploreFacadeService) { }

    openSection(): void {
        this.sectionOpened.emit(this.section);
    }

    toggleSection(event: MouseEvent): void {
        event.stopPropagation();
        this.section.expanded = !this.section.expanded;
    }

    openQuickReels(post: ExplorePostCard): void {
        this.quickReelsOpened.emit({
            section: this.section,
            post
        });
    }

    get visiblePosts(): ExplorePostCard[] {
        return this.exploreFacade.getVisiblePosts(this.section);
    }
}