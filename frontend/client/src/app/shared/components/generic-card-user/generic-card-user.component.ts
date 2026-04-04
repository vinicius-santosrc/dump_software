import { Component, Input, OnInit } from "@angular/core";
import { User } from "../../../core/models/user/user.model";
import { CommonModule, NgClass } from "@angular/common";
import { MatIcon } from "@angular/material/icon";
import { TranslateModule } from "@ngx-translate/core";
import { Router } from "@angular/router";
import { UserService } from "../../../core/services/user/user.service";

@Component({
    selector: "app-generic-card-user",
    templateUrl: "./generic-card-user.component.html",
    styleUrl: "./generic-card-user.component.scss",
    imports: [NgClass, MatIcon, TranslateModule, CommonModule],
})
export class GenericCardUserComponent implements OnInit {
    @Input() user: User | null | undefined = null;
    @Input() theme: 'light' | 'dark' = 'light';
    @Input() buttonText: string = 'Seguir';
    @Input() showActionButton: boolean = true;
    @Input() actionBtn: (() => void) | null = null;
    @Input() redirectOnClick: boolean = true;
    @Input() fontSize: string = '14px';
    @Input() imageWidth: string = '48px';
    @Input() hasFollowButton: boolean = true;
    router: any;
    current_user: any;
    isFollowing: boolean = false;

    constructor(
        private readonly _router: Router,
        private readonly userService: UserService
    ) {
        this.router = _router;
        this.current_user = this.userService.getUser();
        if (this.user?.id == this.current_user?.id) {
            this.showActionButton = false;
        }
    }

    ngOnInit(): void {
        this.isFollowing = this.user?.followers.includes(this.current_user.id) || false;
    }

    onClickCard() {
        if (this.redirectOnClick) this.router.navigate([this.user?.username]);
    }

    onClickActionButton() {
        if (this.actionBtn) {
            this.actionBtn();
        }
    }

    handleFollowButtonClick() {
        this.userService.followUser(this.userService.getUser().id, this.user?.id || '').subscribe(() => {
            this.isFollowing = !this.isFollowing;
        });
    }
}