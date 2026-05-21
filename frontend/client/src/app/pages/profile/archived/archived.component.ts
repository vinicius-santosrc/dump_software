import { Component, OnInit } from "@angular/core";
import { CommonModule, Location } from "@angular/common";
import { GenericModalComponent } from "../../../shared/components/generic-modal/generic-modal.component";
import { TranslateModule } from "@ngx-translate/core";
import { PostsService } from "../../../core/services/post/post.service";
import { UserService } from "../../../core/services/user/user.service";
import { PostComponent } from "../../../shared/components/post-component/post.component";
import { LoaderComponent } from "../../../shared/components/loader-component/loader.component";
import { Post } from "../../../core/models/feed/post.model";
import { PostPageComponent } from "../../posts/postpage.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
    selector: "app-archived-component",
    templateUrl: "./archived.component.html",
    styleUrl: "./archived.component.scss",
    imports: [CommonModule, GenericModalComponent, TranslateModule, PostComponent, LoaderComponent]
})
export class ArchivedComponent implements OnInit{
    archivedPosts: any[] | null = null;
    isLoading = true;

    constructor(private readonly postService: PostsService, private readonly userService: UserService,
        private readonly dialog: MatDialog,
        private readonly location: Location,
    ) {}

    ngOnInit(): void {
        this.isLoading = true;

        const userId = this.userService.getUser().id;

        this.postService.getArchivedByUser(userId).subscribe({
            next: (response: any) => {
                this.archivedPosts = Array.isArray(response)
                    ? response
                    : Array.isArray(response?.posts)
                        ? response.posts
                        : [];
                this.isLoading = false;
            },
            error: () => {
                this.archivedPosts = [];
                this.isLoading = false;
            }
        });
    }

     navigateToPost(post: Post) {
            // change URL WITHOUT triggering route
            this.location.go(`/p/${post.id}`);
    
            // open modal
            const dialogRef = this.dialog.open(PostPageComponent, {
                data: { post }
            });
    
            dialogRef.afterClosed().subscribe(() => {
                // restore profile URL
                // this.location.go(`/${this.username}`);
            });
        }
}