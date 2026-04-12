import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { BasicInputComponent } from "../../../shared/components/basic-input-component/basic-input.component";
import { AppSettingItemComponent } from "../../../shared/components/app-setting-item/app-setting-item.component";
import { Media, Post } from "../../../core/models/feed/post.model";
import { User } from "../../../core/models/user/user.model";
import { UserService } from "../../../core/services/user/user.service";
import { PostsService } from "../../../core/services/post/post.service";

@Component({
    selector: "app-create-post-general-component",
    templateUrl: "./create-post-general.component.html",
    styleUrl: "./create-post-general.component.scss",
    imports: [MatIcon, CommonModule, BasicInputComponent, AppSettingItemComponent]
})
export class CreatePostGeneralComponent implements OnInit {
    @Input() files: File[] = [];
    post: Post = new Post;
    locations: any;
    users: User[] = [] as User[];
    loading: boolean = false;

    private previewMap = new Map<File, string>();

    constructor(
        private readonly userService: UserService,
        private readonly postService: PostsService
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
                    console.log('Post criado:', res);
                    this.loading = false;
                },
                error: (err) => {
                    console.error('Erro ao criar post:', err);
                    this.loading = false;
                }
            });

        } catch (error) {
            console.error('Erro no sharePost:', error);
            this.loading = false;
        }
    }

    toBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.readAsDataURL(file);

            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    }

    getImageDimensions(base64: string): Promise<{ width: string, height: string }> {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64;

            img.onload = () => {
                resolve({
                    width: img.width.toString(),
                    height: img.height.toString()
                });
            };
        });
    }

    async prepareMedia() {
        const mediaList: Media[] = [];

        for (const file of this.files) {
            const base64 = await this.toBase64(file);

            let width = '';
            let height = '';

            if (file.type.startsWith('image')) {
                const dimensions = await this.getImageDimensions(base64);
                width = dimensions.width;
                height = dimensions.height;
            }

            mediaList.push({
                url: base64,
                width,
                height,
                type: file.type.startsWith('image') ? 'image' : 'video'
            });
        }

        this.post.media = mediaList;
        this.userService.user$.subscribe((user: User) => {
            this.post.user = user.id;
        });
    }
}