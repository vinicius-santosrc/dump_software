import { Component, Input, OnChanges } from '@angular/core';
import { Message } from '../../../../../../core/models/messages/messages.model';
import { CommonModule, Location } from '@angular/common';
import { PostsService } from '../../../../../../core/services/post/post.service';
import { Post } from '../../../../../../core/models/feed/post.model';
import { PostMediaComponent } from "../../../../../../shared/components/post-component/components/post-media-component/post-media.component";
import { PostPageComponent } from '../../../../../posts/postpage.component';
import { MatDialog } from '@angular/material/dialog';
import { MemoriesService } from '../../../../../../core/services/memories/memories.service';
import { TranslateModule } from '@ngx-translate/core';
import { GenericTextComponent } from "../../../../../../shared/components/generic-text/generic-text.component";

@Component({
    selector: 'app-message-renderer',
    templateUrl: './message-renderer-component.html',
    styleUrls: ['./message-renderer-component.scss'],
    imports: [CommonModule, PostMediaComponent, TranslateModule, GenericTextComponent]
})
export class MessageRendererComponent implements OnChanges {
    @Input() message: Message | undefined;
    @Input() isMine: boolean = false;
    type: 'text' | 'post' | 'story' | 'image' = 'text'
    postId?: string;
    public contentUnavailable: boolean = false;

    constructor(
        private readonly postService: PostsService,
        private readonly memoriesService: MemoriesService,
        private readonly location: Location,
        private readonly dialog: MatDialog
    ) { }

    ngOnChanges() {
        if (!this.message?.text) {
            this.type = 'text';
            this.contentUnavailable = true;
            return;
        }

        this.contentUnavailable = false;

        // POST
        const postMatch = this.message.text.match(/\/p\/([a-zA-Z0-9-]+)/);

        // STORY
        const storyMatch = this.message.text.match(/\/memories\/([^\/]+)\/([a-zA-Z0-9-]+)/);

        if (postMatch) {
            this.type = 'post';
            this.postId = postMatch[1];

            this.postService.getById(this.postId).subscribe({
                next: (post: Post | any) => {
                    if (!post) {
                        this.contentUnavailable = true;
                        return;
                    }

                    if (this.message) {
                        this.message.post = post;
                    }
                },
                error: () => {
                    this.contentUnavailable = true;
                }
            });

        } else if (storyMatch) {
            this.type = 'story';

            if (this.message) {
                const username = storyMatch[1];
                const storyId = storyMatch[2];

                this.message.story = {
                    username,
                    id: storyId
                } as any;

                // 🔥 igual post: busca preview do story
                this.memoriesService.getById(storyId).then((story: any) => {
                    if (!story) {
                        this.contentUnavailable = true;
                        return;
                    }

                    if (this.message) {
                        this.message.story = story;
                    }
                }).catch(() => {
                    this.contentUnavailable = true;
                });
            }

        } else {
            this.type = 'text';
        }
    }
    goToStory(story: any) {
        if (this.contentUnavailable) {
            return;
        }
        if (!story?.username) return;

        this.location.go(`/memories/${story.username}/${story.id}`);

        // abre igual Instagram (sem reload)
        globalThis.dispatchEvent(new Event('popstate'));
    }

    goToPost(post: Post | undefined) {
        if (this.contentUnavailable || !post) {
            return;
        }
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
