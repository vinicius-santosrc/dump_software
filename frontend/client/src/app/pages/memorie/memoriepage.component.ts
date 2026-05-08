import { Component, HostListener, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MemoriesService } from "../../core/services/memories/memories.service";
import { Memorie } from "../../core/models/feed/memorie.model";
import { MemorieCardComponent } from "./memorie-card/memorie-card.component";
import { StoryGroup, StoryViewerStore } from "../../store/story-viewer.store";
import { MemoriesComponent } from "../../layout/header/memories-component/memories.component";

@Component({
    selector: 'app-memories-page-component',
    templateUrl: './memoriepage.component.html',
    styleUrl: './memoriepage.component.scss',
    imports: [MemorieCardComponent, MemoriesComponent]
})
export class MemoriePageComponent implements OnInit {
    memorieId: string = "";
    username: string = "";
    memorie: Memorie | null = null;
    groups: StoryGroup[] = [];
    activeGroupIndex: number = 0;
    activeStoryIndex: number = 0;

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
        private readonly storyViewerStore: StoryViewerStore
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe(async (params: any) => {
            const memorieId = params.get('memorieId') ?? '';
            const username = params.get('username') ?? '';

            this.memorieId = memorieId;
            this.username = username;

            await this.initializeViewer();
        });
    }

    async initializeViewer() {
        const hasStoreData = this.storyViewerStore.isOpened() && this.storyViewerStore.getGroups().length > 0;

        if (hasStoreData) {
            this.groups = this.storyViewerStore.getGroups();

            const groupIndexFromUsername = this.username
                ? this.storyViewerStore.findGroupIndexByUsername(this.username)
                : this.storyViewerStore.getActiveGroupIndex();

            if (groupIndexFromUsername >= 0) {
                this.storyViewerStore.setActiveGroupIndex(groupIndexFromUsername);
            }

            if (this.memorieId) {
                const storyIndex = this.storyViewerStore.findStoryIndexById(this.memorieId);
                if (storyIndex >= 0) {
                    this.storyViewerStore.setActiveStoryIndex(storyIndex);
                }
            }

            this.syncFromStore();
            return;
        }

        if (this.memorieId) {
            const story = await this.getById(this.memorieId);

            const hasGroups = this.storyViewerStore.getGroups().length > 0;

            if (!hasGroups && story) {
                this.storyViewerStore.setFromSingleStory(story);
            } else if (this.memorieId) {
                this.storyViewerStore.setActiveById(this.memorieId);
            }

            this.syncFromStore();
        }
    }

    syncFromStore() {
        this.groups = this.storyViewerStore.getGroups();
        this.activeGroupIndex = this.storyViewerStore.getActiveGroupIndex();
        this.activeStoryIndex = this.storyViewerStore.getActiveStoryIndex();

        const activeStory = this.storyViewerStore.getActiveStory();

        this.memorie = activeStory ? { ...activeStory } as Memorie : null;
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
        this.router.navigate(['/']);
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