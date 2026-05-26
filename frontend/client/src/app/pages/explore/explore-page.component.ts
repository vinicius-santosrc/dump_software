import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import {
    ExploreCommunitySignal,
    ExploreInsight,
    ExploreLiveCard,
    ExplorePostCard,
    ExploreSection,
    ExploreSticker,
    ExploreTopic
} from "../../core/models/feed/explore.model";
import { ExploreFacadeService } from "../../core/services/explore/explore-facade.service";
import { BasicInputComponent } from "../../shared/components/basic-input-component/basic-input.component";
import { ExploreSectionComponent } from "./explore-section/explore-section.component";
import { ExploreInsightsComponent } from "./explore-insights/explore-insights.component";
import { ExploreLiveRailComponent } from "./explore-live-rail/explore-live-rail.component";
import { ExploreTopicRailComponent } from "./explore-topic-rail/explore-topic-rail.component";
import { ExploreEngagementLabComponent } from "./explore-engagement-lab/explore-engagement-lab.component";
import { ExploreSectionModalComponent } from "./explore-section-modal/explore-section-modal.component";
import { ExploreReelsLoopComponent } from "./explore-reels-loop/explore-reels-loop.component";
import { GenericTextComponent } from "../../shared/components/generic-text/generic-text.component";

@Component({
    selector: "app-explore-page",
    templateUrl: "./explore-page.component.html",
    styleUrl: "./explore-page.component.scss",
    standalone: true,
    imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    BasicInputComponent,
    ExploreTopicRailComponent,
    ExploreLiveRailComponent,
    ExploreInsightsComponent,
    ExploreEngagementLabComponent,
    ExploreSectionComponent,
    GenericTextComponent
]
})
export class ExplorePageComponent implements OnInit {
    searchTerm = "";
    selectedTopicId = "trending";
    loadingTopics = true;
    loadingSections = true;

    topics: ExploreTopic[] = [];
    liveCards: ExploreLiveCard[] = [];
    insights: ExploreInsight[] = [];
    sections: ExploreSection[] = [];
    trendingStickers: ExploreSticker[] = [];
    communitySignals: ExploreCommunitySignal[] = [];

    activeSection: ExploreSection | null = null;
    activeReelSection: ExploreSection | null = null;
    activeReelIndex = 0;

    constructor(
        private readonly dialog: MatDialog,
        private readonly exploreFacade: ExploreFacadeService
    ) { }

    ngOnInit(): void {
        this.loadExploreData();
    }

    get selectedTopic(): ExploreTopic | undefined {
        return this.topics.find(topic => topic.id === this.selectedTopicId);
    }

    get filteredSections(): ExploreSection[] {
        return this.exploreFacade.filterSections(
            this.sections,
            this.selectedTopicId,
            this.searchTerm
        );
    }

    selectTopic(topic: ExploreTopic): void {
        this.selectedTopicId = topic.id;
    }

    openSectionModal(section: ExploreSection): void {
        this.activeSection = section;

        this.dialog.open(ExploreSectionModalComponent, {
            width: "min(920px, calc(100vw - 24px))",
            maxWidth: "100vw",
            maxHeight: "92vh",
            panelClass: "explore-section-dialog",
            autoFocus: false,
            data: { section }
        }).afterClosed().subscribe((payload?: any) => {
            if (!payload) {
                return;
            }

            this.openQuickReels(payload.section, payload.post);
        });
    }

    openQuickReels(section: ExploreSection, post: ExplorePostCard): void {
        this.activeReelSection = section;
        this.activeReelIndex = Math.max(0, section.posts.findIndex(item => item.id === post.id));

        this.dialog.open(ExploreReelsLoopComponent, {
            width: "min(460px, 100vw)",
            maxWidth: "100vw",
            height: "100dvh",
            maxHeight: "100dvh",
            panelClass: "explore-reels-dialog",
            autoFocus: false,
            data: {
                section,
                posts: section.posts,
                startIndex: this.activeReelIndex
            }
        });
    }

    toggleLike(post: ExplorePostCard): void {
        this.exploreFacade.toggleLike(post);
    }

    toggleSave(post: ExplorePostCard): void {
        this.exploreFacade.toggleSave(post);
    }

    commentPost(post: ExplorePostCard): void {
        this.exploreFacade.commentPost(post);
    }

    private loadExploreData(): void {
        this.loadingTopics = true;
        this.loadingSections = true;

        this.exploreFacade.getExploreState().subscribe({
            next: state => {
                this.topics = state.topics;
                this.liveCards = state.liveCards;
                this.insights = state.insights;
                this.sections = state.sections;
                this.trendingStickers = state.trendingStickers;
                this.communitySignals = state.communitySignals;
                this.loadingTopics = false;
                this.loadingSections = false;
            },
            error: error => {
                console.error("[EXPLORE] Erro ao carregar explore", error);
                this.loadingTopics = false;
                this.loadingSections = false;
            }
        });
    }
}