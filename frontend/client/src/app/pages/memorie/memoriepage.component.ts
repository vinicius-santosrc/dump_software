import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MemoriesService } from "../../core/services/memories/memories.service";
import { Memorie } from "../../core/models/feed/memorie.model";
import { MemorieCardComponent } from "./memorie-card/memorie-card.component";
import { StoryGroup, StoryViewerStore } from "../../store/story-viewer.store";
import { Subject, takeUntil } from "rxjs";
import { MatButtonModule } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";

@Component({
    selector: 'app-memories-page-component',
    templateUrl: './memoriepage.component.html',
    styleUrl: './memoriepage.component.scss',
    imports: [MemorieCardComponent, MatButtonModule, MatIcon]
})
export class MemoriePageComponent implements OnInit, OnDestroy {
    memorieId: string = "";
    username: string = "";
    memorie: Memorie | null = null;
    groups: StoryGroup[] = [];
    activeGroupIndex: number = 0;
    activeStoryIndex: number = 0;
    private readonly destroy$ = new Subject<void>();
    public loading: boolean = true;

    get activeGroup(): StoryGroup | null {
        return this.groups[this.activeGroupIndex] ?? null;
    }

    get activeStory(): Memorie | null {
        return this.storyViewerStore.getActiveStory() as Memorie | null;
    }

    get previousGroup(): StoryGroup | null {
        if (this.activeGroupIndex <= 0) {
            return null;
        }

        return this.groups[this.activeGroupIndex - 1] ?? null;
    }

    get nextGroup(): StoryGroup | null {
        return this.groups[this.activeGroupIndex + 1] ?? null;
    }

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly memorieService: MemoriesService,
        private readonly storyViewerStore: StoryViewerStore,
        private readonly cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.route.paramMap
            .pipe(takeUntil(this.destroy$))
            .subscribe(async (params: any) => {
                this.loading = true;
                this.memorie = null;

                const memorieId = params.get('memorieId') ?? '';
                const username = params.get('username') ?? '';

                this.memorieId = memorieId;
                this.username = username;

                await this.initializeViewer();

                this.syncFromStore();
                this.loading = false;

                this.cdr.markForCheck();
                this.cdr.detectChanges();
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    async initializeViewer() {
        const normalizedMemorieId =
            this.memorieId === 'undefined' ||
            this.memorieId === 'null'
                ? ''
                : this.memorieId;

        this.memorieId = normalizedMemorieId;

        const hasStoreData = this.storyViewerStore.isOpened() && this.storyViewerStore.getGroups().length > 0;

        if (hasStoreData) {
            this.groups = this.storyViewerStore.getGroups();

            const existingGroupIndex = this.username
                ? this.storyViewerStore.findGroupIndexByUsername(this.username)
                : this.storyViewerStore.getActiveGroupIndex();

            if (existingGroupIndex >= 0) {
                this.storyViewerStore.setActiveGroupIndex(existingGroupIndex);

                if (this.username) {
                    await this.hydrateActiveGroupByUsername(this.username);
                }

                if (this.memorieId) {
                    const storyIndex = this.storyViewerStore.findStoryIndexById(this.memorieId);

                    if (storyIndex >= 0) {
                        this.storyViewerStore.setActiveStoryIndex(storyIndex);
                    }
                }

                return;
            }
        }

        if (this.username && !this.memorieId) {
            await this.hydrateActiveGroupByUsername(this.username);

            if (this.storyViewerStore.getGroups().length <= 0) {
                const response = await this.memorieService.getByUsername(this.username);
                const stories = Array.isArray(response) ? response : [];

                if (stories.length > 0) {
                    this.storyViewerStore.open(
                        [{
                            user: stories[0].user,
                            stories,
                            lastStoryAt: stories[0].createdAt
                        }],
                        0,
                        0
                    );
                }
            }

            return;
        }

        if (this.memorieId) {
            const story = await this.getById(this.memorieId);

            if (story) {
                const existingGroups = this.storyViewerStore.getGroups();
                const hasGroups = existingGroups.length > 0;

                if (!hasGroups) {
                    this.storyViewerStore.setFromSingleStory(story);
                }
                else {
                    const existingGroupIndex = this.storyViewerStore
                        .findGroupIndexByUsername(story.user?.username ?? '');

                    if (existingGroupIndex === -1) {
                        const mergedGroups: StoryGroup[] = [
                            ...existingGroups,
                            {
                                user: story.user,
                                stories: [story],
                                lastStoryAt: story.createdAt
                            }
                        ];

                        this.storyViewerStore.open(
                            mergedGroups,
                            mergedGroups.length - 1,
                            0
                        );
                    }
                    else {
                        this.storyViewerStore.setActiveGroupIndex(existingGroupIndex);
                        this.storyViewerStore.setActiveById(this.memorieId);
                    }
                }
            }
        }
    }

    private async hydrateActiveGroupByUsername(username: string): Promise<void> {
        try {
            const response = await this.memorieService.getByUsername(username);
            const stories = Array.isArray(response) ? response : [];

            if (stories.length <= 0) {
                return;
            }

            this.storyViewerStore.updateGroupStoriesByUsername(username, stories);
        }
        catch (error) {
            console.error('Erro ao hidratar stories por username:', error);
        }
    }

    syncFromStore() {
        this.groups = this.storyViewerStore.getGroups();
        this.activeGroupIndex = this.storyViewerStore.getActiveGroupIndex();
        this.activeStoryIndex = this.storyViewerStore.getActiveStoryIndex();

        const activeStory = this.storyViewerStore.getActiveStory();

        this.memorie = activeStory ? { ...activeStory } as Memorie : null;
        this.cdr.markForCheck();
    }

    async getById(memorieId: string): Promise<Memorie | null> {
        try {
            const res = await this.memorieService.getById(memorieId);
            this.memorie = res as Memorie;
            return this.memorie;
        }
        catch (error) {
            console.error('Erro ao buscar memorie por id:', error);
            return null;
        }
    }

    nextStory() {
        const result = this.storyViewerStore.next();

        if (result.finished) {
            this.closeViewer();
            return;
        }

        this.syncFromStore();
        this.updateRoute();
    }

    prevStory() {
        const result = this.storyViewerStore.prev();

        if (result.reachedStart) {
            return;
        }

        this.syncFromStore();
        this.updateRoute();
    }

    openGroup(groupIndex: number, storyIndex: number = 0) {
        this.storyViewerStore.setActiveGroupIndex(groupIndex);
        this.storyViewerStore.setActiveStoryIndex(storyIndex);

        this.syncFromStore();
        this.updateRoute();
    }

    goToPreviousGroup() {
        if (this.activeGroupIndex <= 0) {
            return;
        }

        this.openGroup(this.activeGroupIndex - 1, 0);
    }

    goToNextGroup() {
        if (this.activeGroupIndex >= this.groups.length - 1) {
            return;
        }

        this.openGroup(this.activeGroupIndex + 1, 0);
    }

    handleViewerClick(event: MouseEvent) {
        const target = event.currentTarget as HTMLElement | null;
        if (!target) {
            return;
        }

        const rect = target.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const isLeftSide = clickX < rect.width / 2;

        if (isLeftSide) {
            this.prevStory();
            return;
        }

        this.nextStory();
    }

    @HostListener('window:keydown', ['$event'])
    handleKeyboardNavigation(event: KeyboardEvent) {
        if (event.key === 'ArrowLeft') {
            this.prevStory();
            return;
        }

        if (event.key === 'ArrowRight') {
            this.nextStory();
            return;
        }

        if (event.key === 'Escape') {
            this.closeViewer();
        }
    }

    closeViewer() {
        this.storyViewerStore.close();
        globalThis.history.back();
    }

    updateRoute() {
        const activeGroup = this.storyViewerStore.getActiveGroup();

        if (!activeGroup?.user?.username) {
            return;
        }

        const newUrl = `/memories/${activeGroup.user.username}`;

        globalThis.history.replaceState({}, '', newUrl);
    }
}