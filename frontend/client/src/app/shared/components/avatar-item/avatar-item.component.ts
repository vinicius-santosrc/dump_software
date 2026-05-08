import { Component, Input, OnInit } from "@angular/core";
import { NgClass } from "@angular/common";
import { MemoriesService } from "../../../core/services/memories/memories.service";
import { StoryViewerStore } from "../../../store/story-viewer.store";
import { Router } from "@angular/router";

@Component({
    selector: 'app-avatar-item',
    templateUrl: './avatar-item.component.html',
    styleUrl: './avatar-item.component.scss',
    imports: [NgClass],
})
export class AvatarItem implements OnInit {
    @Input() user?: any;
    @Input() src?: string = "";
    @Input() width: string = '32px';
    @Input() height: string = '32px';
    @Input() redirectURL?: string = "";
    @Input() redirectOnClick?: boolean = true;

    @Input() seenMemorie?: boolean = false;

    memoriesList: any;

    constructor(private readonly memoriesService: MemoriesService,
        private readonly storyViewerStore: StoryViewerStore,
        private readonly router: Router
    ) { }

    ngOnInit(): void {
        this.getAllMoments()
    }

    public async getAllMoments() {

        const response = await this.memoriesService
            .getByUser(this.user?.id ?? "");

        this.memoriesList = Array.isArray(response) ? response : [];

        if ((Array.isArray(response) ? response : []).length > 0) {
            this.seenMemorie = true;
        }
    }

    onClickCard() {
        if (this.redirectOnClick) {
            if (this.redirectURL) {
                return this.router.navigate([`${this.redirectURL}`]);
            }
            if (this.seenMemorie) {
                this.storyViewerStore.open(this.memoriesList, 0, 0);
                this.router.navigate([`/memories/${this.user.username}`]);
                // return globalThis.location.href = '/memories/' + this.user.username
            }
        }
        return;
    }
}