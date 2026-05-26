import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { ExploreInsight } from "../../../core/models/feed/explore.model";

@Component({
    selector: "app-explore-insights",
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: "./explore-insights.component.html",
    styleUrl: "./explore-insights.component.scss"
})
export class ExploreInsightsComponent {
    @Input() insights: ExploreInsight[] = [];
}