import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";
import { User } from "../../../core/models/user/user.model";
import { MemoriesService } from "../../../core/services/memories/memories.service";
import { SkeletonComponent } from "../../../shared/components/skeleton/skeleton.component";
import { Router } from "@angular/router";
import { StoryGroup, StoryViewerStore } from "../../../store/story-viewer.store";
import {AvatarItem} from "../../../shared/components/avatar-item/avatar-item.component";

@Component({
    selector: "app-memories-component",
    templateUrl: "./memories.component.html",
    styleUrl: "./memories.component.scss",
    imports: [CommonModule, TranslateModule, SkeletonComponent, AvatarItem]
})
export class MemoriesComponent implements OnInit {
    @Input() user: User | null = null;
    @Input() width: string = "";
    hasMyMemorie: StoryGroup[] = [];
    
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

    handleMyStory() {
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

        console.log("criar story");
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