import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ExploreTopic } from "../../../core/models/feed/explore.model";

@Component({
    selector: "app-explore-topic-rail",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./explore-topic-rail.component.html",
    styleUrl: "./explore-topic-rail.component.scss"
})
export class ExploreTopicRailComponent {
    @Input() topics: ExploreTopic[] = [];
    @Input() selectedTopicId: string = "trending";

    @Output() topicSelected = new EventEmitter<ExploreTopic>();

    selectTopic(topic: ExploreTopic): void {
        this.topicSelected.emit(topic);
    }
}