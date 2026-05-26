import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { ExploreLiveCard } from "../../../core/models/feed/explore.model";
import { GenericTextComponent } from "../../../shared/components/generic-text/generic-text.component";

@Component({
    selector: "app-explore-live-rail",
    standalone: true,
    imports: [CommonModule, GenericTextComponent],
    templateUrl: "./explore-live-rail.component.html",
    styleUrl: "./explore-live-rail.component.scss"
})
export class ExploreLiveRailComponent {
    @Input() liveCards: ExploreLiveCard[] = [];
}