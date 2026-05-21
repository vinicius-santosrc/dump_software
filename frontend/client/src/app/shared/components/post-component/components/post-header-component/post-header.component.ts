import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericCardUserComponent } from '../../../generic-card-user/generic-card-user.component';
import { User } from '../../../../../core/models/user/user.model';
import { MatButtonModule } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { Post } from '../../../../../core/models/feed/post.model';
import { MatDialog } from '@angular/material/dialog';
import { GenericActionsModal } from '../../../comment-actions-modal/generic-actions-modal.component';
import { UserService } from '../../../../../core/services/user/user.service';
import { PostsService } from '../../../../../core/services/post/post.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PostActionHandlerService } from '../../../../../core/services/actions/post-action-handler.service';
import { OWNER_POST_ACTIONS, VISITOR_POST_ACTIONS } from '../../../../../core/config/post-actions.config';
import { GenericTextComponent } from "../../../generic-text/generic-text.component";

@Component({
    selector: 'app-post-header',
    standalone: true,
    imports: [CommonModule, GenericCardUserComponent, MatButtonModule, MatIcon, GenericTextComponent],
    templateUrl: './post-header.component.html',
    styleUrl: './post-header.component.scss'
})
export class PostHeaderComponent {
    private readonly _snackBar = inject(MatSnackBar);
    @Input() user: any = {} as User;
    @Input() post: any = {} as Post;
    @Input() caption: string | undefined;
    @Input() theme: 'dark' | 'light' = 'light';
    @Input() isModal: boolean = false;
    @Input() showOptions: boolean = true;

    current_user: any;

    constructor(
        private readonly dialog: MatDialog,
        private readonly userService: UserService,
        private readonly postsService: PostsService,
        private readonly actionHandler: PostActionHandlerService
    ) { 
        this.current_user = this.userService.getUser();
    }

    handleAction(action: any) {
        switch (action.id) {
            case 'archive':
                this.postsService.archivePost(this.post.id).subscribe(() => {
                    this.post.archived = true;
                    this._snackBar.open('Publicação arquivada.', undefined, { duration: 2000 });
                });
                break;

            case 'delete':
                this.postsService.deletePost(this.post.id).subscribe(() => {
                    this.post.isDeleted = true;
                    this._snackBar.open('Publicação excluída.', undefined, { duration: 2000 });
                });
                break;
        }
    }

    options() {
        const dialogRef = this.dialog.open(GenericActionsModal, {
            data: {
                actions: this.current_user.id === this.post.user.id ? OWNER_POST_ACTIONS(this.post?.archived) : VISITOR_POST_ACTIONS
            },
            width: '400px'
        
        });

        dialogRef.afterClosed().subscribe((action: any) => {
            if (!action) return;
            this.actionHandler.handle(action, this.post);
        });
    }
}