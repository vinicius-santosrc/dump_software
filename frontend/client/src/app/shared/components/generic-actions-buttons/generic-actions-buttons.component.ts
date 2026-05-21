import { Component, Input, OnInit, OnChanges, SimpleChanges } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { User } from "../../../core/models/user/user.model";
import { UserService } from "../../../core/services/user/user.service";
import { CreateConversationService } from "../create-conversation-component/create-conversation.service";
import { MatDialog } from "@angular/material/dialog";
import { ProfileEditComponent } from "../../../pages/profile/edit/profile-edit.component";
import { ArchivedComponent } from "../../../pages/profile/archived/archived.component";

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

    constructor(private readonly userService: UserService, private readonly createConversationService: CreateConversationService, private readonly dialog: MatDialog) {
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
            return [
                {
                    label: 'Editar perfil',
                    onClick: () => this.handleEdit(),
                    class: 'followingBtn'
                },
                {
                    label: 'Arquivados',
                    onClick: () => this.handleArchived(),
                    class: 'followingBtn'
                },
            ];
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
        this.createConversationService.createConversation([this.user?.id, this.current_user.id]).subscribe(() => {
            const newUrl = `/messages/inbox`;

            globalThis.location.href = newUrl;
        })
    }

    handleFollowButtonClick() {
        if (!this.user) return;

        this.userService.followUser(this.userService.getUser().id, this.user?.id || '').subscribe(() => {
            this.isFollowing = !this.isFollowing;
        });
    }

    get isMobile(): boolean {
        return window.innerWidth <= 768;
    }

    handleEdit() {
        this.dialog.open(ProfileEditComponent, {
            minWidth: this.isMobile ? '400px' : '1000px',
        })
    }

    handleArchived() {
        this.dialog.open(ArchivedComponent, {
            minWidth: this.isMobile ? '400px' : '1000px',
        })
    }

}