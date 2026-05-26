import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { ExploreFacadeService } from "../../../core/services/explore/explore-facade.service";
import { ExplorePostCard } from "../../../core/models/feed/explore.model";
import { GenericTextComponent } from "../../../shared/components/generic-text/generic-text.component";

@Component({
    selector: "app-explore-post-card",
    standalone: true,
    imports: [CommonModule, MatIconModule, GenericTextComponent],
    templateUrl: "./explore-post-card.component.html",
    styleUrl: "./explore-post-card.component.scss"
})
export class ExplorePostCardComponent {
    @Input({ required: true }) post!: ExplorePostCard;

    @Output() opened = new EventEmitter<ExplorePostCard>();
    @Output() liked = new EventEmitter<ExplorePostCard>();
    @Output() commented = new EventEmitter<ExplorePostCard>();
    @Output() saved = new EventEmitter<ExplorePostCard>();

    constructor(private readonly exploreFacade: ExploreFacadeService) { }

    open(): void {
        this.opened.emit(this.post);
    }

    like(event: MouseEvent): void {
        event.stopPropagation();
        this.liked.emit(this.post);
    }

    comment(event: MouseEvent): void {
        event.stopPropagation();
        this.commented.emit(this.post);
    }

    save(event: MouseEvent): void {
        event.stopPropagation();
        this.saved.emit(this.post);
    }

    getPostIcon(): string {
        return this.exploreFacade.getPostIcon(this.post.type);
    }

    formatMetric(value: number): string {
        return this.exploreFacade.formatMetric(value);
    }
}