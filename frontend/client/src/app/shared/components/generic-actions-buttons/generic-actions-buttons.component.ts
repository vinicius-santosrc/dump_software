import { Component, Input, OnInit, OnChanges, SimpleChanges } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { User } from "../../../core/models/user/user.model";
import { UserService } from "../../../core/services/user/user.service";

@Component({
    selector: "app-generic-actions-buttons",
    templateUrl: './generic-actions-buttons.component.html',
    styleUrl: './generic-actions-buttons.component.scss',
    imports: [TranslateModule]
})
export class GenericActionsButtonsComponent implements OnInit, OnChanges {
    isFollowing = false;
    current_user: any;

    @Input() user?: User | null = null;

    constructor(private readonly userService: UserService) {
        this.userService.user$.subscribe((user: any) => {
            this.current_user = user;
        });
    }

    ngOnInit() {
        this.updateFollowingState();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['user']) {
            this.updateFollowingState();
        }
    }

    private updateFollowingState() {
        if (!this.user || !this.current_user) return;

        this.isFollowing = this.user.followers?.includes(this.current_user.id) || false;
    }

    get buttons() {
        if (this.user?.id === this.current_user?.id) {
            return [];
        }
        return [
            {
                label: this.isFollowing
                    ? 'FEED.CARD.BUTTON.UNFOLLOW'
                    : 'FEED.CARD.BUTTON.FOLLOW',
                onClick: () => this.handleFollowButtonClick(),
                class: this.isFollowing ? 'followingBtn' : 'followBtn'
            },
            {
                label: 'FEED.CARD.BUTTON.TALK',
                onClick: () => this.talkButton(),
                class: 'sendMessage'
            }
        ];
    }

    talkButton() {

    }

    handleFollowButtonClick() {
        if (!this.user) return;

        this.userService.followUser(this.userService.getUser().id, this.user?.id || '').subscribe(() => {
            this.isFollowing = !this.isFollowing;
        });
    }

}