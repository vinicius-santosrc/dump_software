import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { BasicInputComponent } from "../../../shared/components/basic-input-component/basic-input.component";
import { AppSettingItemComponent } from "../../../shared/components/app-setting-item/app-setting-item.component";
import { Media, Post } from "../../../core/models/feed/post.model";
import { User } from "../../../core/models/user/user.model";
import { UserService } from "../../../core/services/user/user.service";
import { PostsService } from "../../../core/services/post/post.service";
import { GenericButtonComponent } from "../../../shared/components/generic-button-component/generic-button.component";
import { MatDialog } from "@angular/material/dialog";
import { MediaProcessingService } from "../../../core/services/media/media-processing.service";
import { firstValueFrom } from "rxjs";
import { PostCarouselComponent } from "../../../shared/components/post-component/components/post-carousel-component/post-carousel.component";
import { MatButtonModule } from "@angular/material/button";

@Component({
    selector: "app-create-post-general-component",
    templateUrl: "./create-post-general.component.html",
    styleUrl: "./create-post-general.component.scss",
    imports: [MatIcon, CommonModule, BasicInputComponent, AppSettingItemComponent, GenericButtonComponent, PostCarouselComponent, MatButtonModule]
})
export class CreatePostGeneralComponent implements OnInit {
    @Input() files: File[] = [];
    post: Post = new Post;
    locations: any;
    users: User[] = [] as User[];
    loading: boolean = false;

    private readonly previewMap = new Map<File, string>();

    constructor(
        private readonly userService: UserService,
        private readonly postService: PostsService,
        private readonly dialog: MatDialog,
        private readonly mediaService: MediaProcessingService
    ) { }

    ngOnInit() {
        this.getUsers()
    }

    getPreview(file: File): string {
        if (this.previewMap.has(file)) {
            return this.previewMap.get(file)!;
        }

        const url = URL.createObjectURL(file);
        this.previewMap.set(file, url);
        return url;
    }

    getUsers() {
        this.userService.getRelatedByCurrentUser().subscribe((users: User[] | any) => {
            this.users = users;
        });
    }

    openAudio() { }

    tagPeople(user: User) {
        console.log('Selecionado:', user);
    }

    async sharePost() {
        try {
            this.loading = true;

            await this.prepareMedia();

            delete this.post.id;

            this.postService.createPost(this.post).subscribe({
                next: (res) => {
                    this.loading = false;
                    this.dialog.closeAll();
                },
                error: (err) => {
                    this.loading = false;
                }
            });

        } catch (error) {
            this.loading = false;
        }
    }

    async prepareMedia() {
        const mediaList: Media[] = [];

        for (const file of this.files) {
            const media = await this.mediaService.processFile(file);
            mediaList.push(media as any);
        }

        this.post.media = mediaList;

        const user = await firstValueFrom(this.userService.user$);
        this.post.user = user.id;
    }

    addMoreFiles() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,video/*';
        input.multiple = true;

        input.onchange = (event: any) => {
            const newFiles: File[] = Array.from(event.target.files);
            this.files = [...this.files, ...newFiles];
        };

        input.click();
    }
}