import { Component, Input } from "@angular/core";
import { NgClass } from "@angular/common";
import { Router } from "@angular/router";

@Component({
    selector: 'app-avatar-item',
    templateUrl: './avatar-item.component.html',
    styleUrl: './avatar-item.component.scss',
    imports: [NgClass],
})

export class AvatarItem {
    @Input() user?: any;
    @Input() src?: string = "";
    @Input() width: string = '32px';
    @Input() height: string = '32px';
    @Input() redirectURL?: string = "";
    @Input() redirectOnClick?: boolean = true;

    @Input() seenMemorie?: boolean = false;

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