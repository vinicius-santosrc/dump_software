import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { ExploreCommunitySignal, ExploreSticker } from "../../../core/models/feed/explore.model";

@Component({
    selector: "app-explore-engagement-lab",
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: "./explore-engagement-lab.component.html",
    styleUrl: "./explore-engagement-lab.component.scss"
})
export class ExploreEngagementLabComponent {
    @Input() trendingStickers: ExploreSticker[] = [];
    @Input() communitySignals: ExploreCommunitySignal[] = [];
}