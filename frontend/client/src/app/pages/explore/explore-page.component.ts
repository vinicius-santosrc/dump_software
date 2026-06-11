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
import { SearchService } from "../../core/services/search/search.service";
import { RecentSearchService } from "../../core/services/search/recent-search.service";
import { SearchResponse } from "../../core/models/search/search.model";
import { BasicInputComponent } from "../../shared/components/basic-input-component/basic-input.component";
import { LoaderComponent } from "../../shared/components/loader-component/loader.component";
import { GenericCardUserComponent } from "../../shared/components/generic-card-user/generic-card-user.component";
import { PostMediaComponent } from "../../shared/components/post-component/components/post-media-component/post-media.component";
import { ExploreSectionComponent } from "./explore-section/explore-section.component";
import { ExploreInsightsComponent } from "./explore-insights/explore-insights.component";
import { ExploreLiveRailComponent } from "./explore-live-rail/explore-live-rail.component";
import { ExploreTopicRailComponent } from "./explore-topic-rail/explore-topic-rail.component";
import { ExploreEngagementLabComponent } from "./explore-engagement-lab/explore-engagement-lab.component";
import { ExploreSectionModalComponent } from "./explore-section-modal/explore-section-modal.component";
import { ExploreReelsLoopComponent } from "./explore-reels-loop/explore-reels-loop.component";
import { GenericTextComponent } from "../../shared/components/generic-text/generic-text.component";
import { TranslateModule } from "@ngx-translate/core";
import { debounceTime, distinctUntilChanged, Subject, switchMap, tap, finalize } from "rxjs";
import { SkeletonComponent } from "../../shared/components/skeleton/skeleton.component";

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
    LoaderComponent,
    GenericCardUserComponent,
    PostMediaComponent,
    ExploreTopicRailComponent,
    ExploreLiveRailComponent,
    ExploreInsightsComponent,
    ExploreEngagementLabComponent,
    ExploreSectionComponent,
    GenericTextComponent,
    TranslateModule,
    SkeletonComponent
]
})
export class ExplorePageComponent implements OnInit {
    searchTerm = "";
    searchResults: SearchResponse = {} as SearchResponse;
    searchLoading = false;
    recentSearches: any[] = [];
    private readonly searchInput$ = new Subject<string>();

    selectedTopicId = "trending";
    loadingTopics = true;
    loadingSections = true;

    topics: ExploreTopic[] = [];
    liveCards: ExploreLiveCard[] = [];
    insights: ExploreInsight[] = [];
    sections: ExploreSection[] = [];
    trendingStickers: ExploreSticker[] = [];
    communitySignals: ExploreCommunitySignal[] = [];

    get hasSearchResults(): boolean {
        return Boolean(
            this.searchTerm &&
            !this.searchLoading &&
            ((this.searchResults?.users?.length ?? 0) > 0 || (this.searchResults?.posts?.length ?? 0) > 0)
        );
    }

    activeSection: ExploreSection | null = null;
    activeReelSection: ExploreSection | null = null;
    activeReelIndex = 0;

    constructor(
        private readonly dialog: MatDialog,
        private readonly exploreFacade: ExploreFacadeService,
        private readonly searchService: SearchService,
        private readonly recentSearchService: RecentSearchService
    ) { }

    ngOnInit(): void {
        this.loadExploreData();
        this.loadRecentSearches();
        this.bindSearch();
    }

    onSearchChange(query: string): void {
        this.searchTerm = query?.trim() ?? "";

        if (!this.searchTerm) {
            this.searchLoading = false;
            this.searchResults = {} as SearchResponse;
            return;
        }

        this.searchInput$.next(this.searchTerm);
    }

    addRecentSearch(item: any): void {
        this.recentSearchService.add(item);
        this.loadRecentSearches();
    }

    removeRecentSearch(id: string): void {
        this.recentSearchService.remove(id);
        this.loadRecentSearches();
    }

    clearRecentSearches(): void {
        this.recentSearchService.clear();
        this.loadRecentSearches();
    }

    private loadRecentSearches(): void {
        this.recentSearches = this.recentSearchService.getAll();
    }

    private bindSearch(): void {
        this.searchInput$
            .pipe(
                debounceTime(250),
                distinctUntilChanged(),
                tap(() => this.searchLoading = true),
                switchMap(query => this.searchService.search(query).pipe(
                    finalize(() => this.searchLoading = false)
                ))
            )
            .subscribe({
                next: (res: any) => {
                    this.searchResults = res ?? {} as SearchResponse;
                },
                error: error => {
                    console.error("[EXPLORE_SEARCH] Erro ao buscar", error);
                    this.searchResults = {} as SearchResponse;
                }
            });
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