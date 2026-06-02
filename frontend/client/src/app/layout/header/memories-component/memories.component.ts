import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";
import { User } from "../../../core/models/user/user.model";
import { MemoriesService } from "../../../core/services/memories/memories.service";
import { SkeletonComponent } from "../../../shared/components/skeleton/skeleton.component";
import { Router } from "@angular/router";
import { StoryGroup, StoryViewerStore } from "../../../store/story-viewer.store";
import { AvatarItem } from "../../../shared/components/avatar-item/avatar-item.component";
import { MatMenu, MatMenuTrigger } from "@angular/material/menu";
import { MatIcon } from "@angular/material/icon";
import { getMemoriesCreationMenu } from "../../../core/utils/memorie.utils";

@Component({
    selector: "app-memories-component",
    templateUrl: "./memories.component.html",
    styleUrl: "./memories.component.scss",
    imports: [CommonModule, TranslateModule, SkeletonComponent, AvatarItem, MatMenu, MatIcon, MatMenuTrigger]
})
export class MemoriesComponent implements OnInit {
    @Input() user: User | null = null;
    @Input() width: string = "";
    @Input() showMyMemorie: boolean = true;
    hasMyMemorie: StoryGroup[] = [];
    displayMenu: boolean = false;
    optionsMenu: any = [];

    constructor(
        private readonly memoriesService: MemoriesService,
        private readonly router: Router,
        private readonly storyViewerStore: StoryViewerStore
    ) { }
    memoriesList: StoryGroup[] = [];
    loading: boolean = true;

    get isMobile(): boolean {
        return window.innerWidth <= 768;
    }

    ngOnInit(): void {
        this.getAllMoments();
        this.optionsMenu = getMemoriesCreationMenu(this.hasMyMemorie.length > 0);
        if (this.isMobile) {
            this.width = '100%';
        }
    }

    public async getAllMoments() {
        this.loading = true;

        const response = await this.memoriesService
            .getFeed(this.user?.id ?? "");

        this.memoriesList = Array.isArray(response) ? response : [];

        this.hasMyMemorie = this.memoriesList.filter(
            (group: StoryGroup) => group?.user?.id === this.user?.id
        );

        this.loading = false;
    }

    handleMyStory(action: string) {
        if (this.hasMyMemorie.length > 0) {
            const groupIndex = this.memoriesList.findIndex(
                (group: StoryGroup) => group?.user?.id === this.user?.id
            );

            if (groupIndex >= 0) {
                this.storyViewerStore.open(this.memoriesList, groupIndex, 0);
                this.router.navigate([`/memories/${this.user?.username}`]);
            }
            return;
        }
        this.displayMenu = true;

        switch (action) {
            case 'viewCurrentStory':
                // this.handleMyStory('viewCurrentStory');
                break;
            case 'createStory':
                this.router.navigate(['/create-story']);
                break;
            case 'createPost':
                this.router.navigate(['/create-post']);
                break;
            case 'createLive':
                this.router.navigate(['/create-live']);
                break;
            case 'createEvent':
                this.router.navigate(['/create-event']);
                break;
        }
    }

    clickStory(username: string) {
        const groupIndex = this.memoriesList.findIndex(
            (group: StoryGroup) => group?.user?.username === username
        );

        if (groupIndex >= 0) {
            this.storyViewerStore.open(this.memoriesList, groupIndex, 0);
        }

        this.router.navigate([`/memories/${username}`]);
    }
}