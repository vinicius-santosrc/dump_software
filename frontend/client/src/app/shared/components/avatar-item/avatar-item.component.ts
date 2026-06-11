import { Component, Input, inject } from "@angular/core";
import { NgClass } from "@angular/common";
import { Router } from "@angular/router";
import { MessagesStoreService } from "../../../store/conversation.store.service";

@Component({
    selector: 'app-avatar-item',
    templateUrl: './avatar-item.component.html',
    styleUrl: './avatar-item.component.scss',
    imports: [NgClass],
})

export class AvatarItem {
    private readonly messagesStore = inject(MessagesStoreService);

    @Input() user?: any;
    @Input() multipleUsers?: any;
    @Input() src?: string = "";
    @Input() width: string = '32px';
    @Input() height: string = '32px';
    @Input() redirectURL?: string = "";
    @Input() redirectOnClick?: boolean = true;

    @Input() seenMemorie?: boolean = false;

    get showOnlineIndicator(): boolean {
        const userId = this.user?.id ?? this.user?._id;

        if (!userId) {
            return Boolean(this.user?.isOnline);
        }

        return this.messagesStore.isUserOnline(userId) || Boolean(this.user?.isOnline);
    }

    constructor(
        private readonly router: Router
    ) { }

    onClickCard(): void {
        if (this.redirectOnClick) {
            if (this.redirectURL) {
                this.router.navigate([`${this.redirectURL}`]);
            }
            if (this.seenMemorie) {
                this.router.navigate([`/memories/${this.user.username}`], {
                    replaceUrl: true
                });
            }
        }
    }

    onImageError() {
        this.src = '/assets/app/media/default-avatar.webp';
    }
}