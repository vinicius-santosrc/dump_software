import { Injectable } from '@angular/core';
import { PostsService } from '../post/post.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PostActionHandlerService {
    constructor(
        private readonly postsService: PostsService,
        private readonly snackBar: MatSnackBar
    ) { }

    handle(action: any, post: any): Subscription | void {
        switch (action.id) {
            case 'archive':
                return this.postsService.archivePost(post.id).subscribe(() => {
                    post.archived = true;
                    this.snackBar.open('Publicação arquivada.', undefined, { duration: 2000 });
                });

            case 'delete':
                return this.postsService.deletePost(post.id).subscribe(() => {
                    post.isDeleted = true;
                    this.snackBar.open('Publicação excluída.', undefined, { duration: 2000 });
                });
        }
    }
}