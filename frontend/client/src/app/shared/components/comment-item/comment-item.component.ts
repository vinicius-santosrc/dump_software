import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, Inject, inject } from '@angular/core';
import { formatDateToNow } from '../../../core/utils/format-date.util';
import { MatIcon } from "@angular/material/icon";
import { RouterModule } from '@angular/router';
import { GenericActionsModal } from '../comment-actions-modal/generic-actions-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../../core/services/user/user.service';
import { CommentsService } from '../../../core/services/comments/comments.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-comment-item',
  templateUrl: './comment-item.component.html',
  styleUrls: ['./comment-item.component.scss'],
  imports: [CommonModule, MatIcon, RouterModule, TranslateModule]
})
export class CommentItemComponent {
  @Input() comment: any;
  @Input() level = 0;
  @Input() replyingToId: string | null = null;
  @Input() theme?: 'light' | 'dark' = 'light';
  @Input() style: 'simple' | 'default' = 'default';

  @Output() reply = new EventEmitter<string>();
  @Output() sendReply = new EventEmitter<any>();
  @Output() cancelReply = new EventEmitter<void>();

  formatDateToNow = formatDateToNow;

  private readonly _snackBar = inject(MatSnackBar);
  showReplies = false;
  isLoadingReplies = false;
  current_user: any;

  constructor(
    private readonly dialog: MatDialog,
    private readonly userService: UserService,
    private readonly commentsService: CommentsService
  ) {
    this.current_user = userService.getUser();
  }

  onReply() {
    this.reply.emit(this.comment._id);
  }

  onSendReply() {
    this.sendReply.emit(this.comment);
  }

  onCancel() {
    this.cancelReply.emit();
  }

  trackById(index: number, item: any): string {
    return item?.id;
  }

  options() {
    const dialogRef = this.dialog.open(GenericActionsModal, {
      data: {
        actions: [
          { id: 'report', label: 'FEED.POST.ACTIONS.REPORT', type: 'danger' },
          ...(this.current_user.id === this.comment.userId
            ? [
                { id: 'delete', label: 'FEED.POST.ACTIONS.DELETE', type: 'danger' }
              ]
            : [])
        ]
      },
      width: '400px'
    });

    dialogRef.afterClosed().subscribe((action: any) => {
      console.warn(action)
      if (!action) return;

      switch (action.id) {
        case 'report':
          this.commentsService
            .reportComment(this.comment.id, this.current_user.id)
            .subscribe(() => {
               this._snackBar.open('Comentário denunciado. Agradecemos pela colaboração.', undefined, {
                duration: 2000,
              })
            });
          break;

        case 'delete':
          this.commentsService
            .removeComment(this.comment.id)
            .subscribe(() => {
              this._snackBar.open('Comentário removido.', undefined, {
                duration: 2000,
              })
              this.comment.isDeleted = true;
            });
          break;
      }
    });
  }

  toggleReplies() {
    if (this.showReplies) {
      this.showReplies = false;
      return;
    }

    // Simula loading (caso futuramente venha da API)
    this.isLoadingReplies = true;

    setTimeout(() => {
      this.showReplies = true;
      this.isLoadingReplies = false;
    }, 300);
  }
}