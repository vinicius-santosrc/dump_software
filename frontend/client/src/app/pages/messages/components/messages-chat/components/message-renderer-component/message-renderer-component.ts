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

@Component({
    selector: 'app-message-renderer',
    templateUrl: './message-renderer-component.html',
    styleUrls: ['./message-renderer-component.scss'],
    imports: [CommonModule, PostMediaComponent, TranslateModule]
})
export class MessageRendererComponent implements OnChanges {
    @Input() message: Message | undefined;
    @Input() isMine: boolean = false;
    type: 'text' | 'post' | 'story' | 'image' = 'text'
    postId?: string;

    constructor(
        private readonly postService: PostsService,
        private readonly memoriesService: MemoriesService,
        private readonly location: Location,
        private readonly dialog: MatDialog
    ) { }

    ngOnChanges() {
        if (!this.message?.text) {
            this.type = 'text';
            return;
        }

        // POST
        const postMatch = this.message.text.match(/\/p\/([a-zA-Z0-9-]+)/);

        // STORY
        const storyMatch = this.message.text.match(/\/memories\/([^\/]+)\/([a-zA-Z0-9-]+)/);

        if (postMatch) {
            this.type = 'post';
            this.postId = postMatch[1];

            this.postService.getById(this.postId).subscribe((post: Post | any) => {
                if (this.message) {
                    this.message.post = post;
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
                    if (this.message) {
                        this.message.story = story;
                    }
                }).catch(() => {
                    // fallback silencioso
                });
            }

        } else {
            this.type = 'text';
        }
    }
    goToStory(story: any) {
        if (!story?.username) return;

        this.location.go(`/memories/${story.username}/${story.id}`);

        // abre igual Instagram (sem reload)
        globalThis.dispatchEvent(new Event('popstate'));
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
