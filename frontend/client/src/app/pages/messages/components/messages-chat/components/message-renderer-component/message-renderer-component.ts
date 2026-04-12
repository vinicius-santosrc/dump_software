import { Component, Input, OnChanges } from '@angular/core';
import { Message } from '../../../../../../core/models/messages/messages.model';
import { CommonModule, Location } from '@angular/common';
import { PostsService } from '../../../../../../core/services/post/post.service';
import { Post } from '../../../../../../core/models/feed/post.model';
import { PostMediaComponent } from "../../../../../../shared/components/post-component/components/post-media-component/post-media.component";
import { PostPageComponent } from '../../../../../posts/postpage.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-message-renderer',
    templateUrl: './message-renderer-component.html',
    styleUrls: ['./message-renderer-component.scss'],
    imports: [CommonModule, PostMediaComponent]
})
export class MessageRendererComponent implements OnChanges {
    @Input() message: Message | undefined;
    @Input() isMine: boolean = false;
    type: 'text' | 'post' | 'image' = 'text'
    postId?: string;

    constructor(
        private readonly postService: PostsService,
        private readonly location: Location,
        private readonly dialog: MatDialog
    ) { }

    ngOnChanges() {
        if (!this.message?.text) {
            this.type = 'text';
            return;
        }

        const match = this.message.text.match(/\/p\/([a-zA-Z0-9-]+)/);

        if (match) {
            this.type = 'post';
            this.postId = match[1];
            this.postService.getById(this.postId).subscribe((post: Post | any) => {
                if (this.message) {
                    this.message.post = post;
                }
            });
        } else {
            this.type = 'text';
        }
    }

    goToPost(post: Post | undefined) {
        // change URL WITHOUT triggering route
        this.location.go(`/p/${post?.id}`);

        // open modal
        const dialogRef = this.dialog.open(PostPageComponent, {
            data: { post }
        });

        dialogRef.afterClosed().subscribe(() => {
            // restore profile URL
            this.location.go(`/messages/inbox`);
        });
    }
}
