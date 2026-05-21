import { Injectable } from '@angular/core';
import { PostsService } from '../post/post.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root'
})
export class PostActionHandlerService {
    constructor(
        private readonly postsService: PostsService,
        private readonly snackBar: MatSnackBar,
        private readonly translateService: TranslateService
    ) { }

    handle(action: any, post: any): Subscription | void {
        switch (action.id) {
            case 'archive':
                return this.postsService.archivePost(post.id).subscribe(() => {
                    post.archived = true;
                    this.snackBar.open(this.translateService.instant('FEED.POST.POST_ARCHIVED'), undefined, { duration: 2000 });
                });
            case 'unarchive':
                return this.postsService.unarchivePost(post.id).subscribe(() => {
                    post.archived = false;
                    this.snackBar.open(this.translateService.instant('FEED.POST.POST_UNARCHIVED'), undefined, { duration: 2000 });
                });
            case 'delete':
                return this.postsService.deletePost(post.id).subscribe(() => {
                    post.isDeleted = true;
                    this.snackBar.open(this.translateService.instant('FEED.POST.POST_DELETED'), undefined, { duration: 2000 });
                });
        }
    }
}