import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { CommonModule, NgClass } from "@angular/common";
import { MatIcon } from "@angular/material/icon";
import { TranslateModule } from "@ngx-translate/core";
import { Router } from "@angular/router";
import { UserService } from "../../../core/services/user/user.service";
import { SkeletonComponent } from "../skeleton/skeleton.component";
import { LoaderComponent } from "../loader-component/loader.component";
import {AvatarItem} from "../avatar-item/avatar-item.component";

@Component({
    selector: "app-generic-card-user",
    templateUrl: "./generic-card-user.component.html",
    styleUrl: "./generic-card-user.component.scss",
    imports: [NgClass, MatIcon, TranslateModule, CommonModule, SkeletonComponent, LoaderComponent, AvatarItem],
})
export class GenericCardUserComponent implements OnInit {
    @Input() user: any;
    @Input() theme: 'light' | 'dark' = 'light';
    @Input() buttonText: string = '';
    @Input() showActionButton: boolean = true;
    @Input() actionBtn: (() => void) | null = null;
    @Input() redirectOnClick: boolean = true;
    @Input() fontSize: string = '14px';
    @Input() imageWidth: string = '48px';
    @Input() hasFollowButton: boolean = true;
    @Input() actionBtnCheckBox: boolean = false;
    @Input() loading: boolean = false;
    @Output() toggleSelection = new EventEmitter<string>();
    router: any;
    current_user: any;
    isFollowing: boolean = false;
    isSelected: boolean = false;
    isFollowLoading: boolean = false;

    constructor(
        private readonly _router: Router,
        private readonly userService: UserService
    ) {
        this.router = _router;
        this.userService.user$.subscribe((user: any) => {
            this.current_user = user;
        });
    }

    ngOnInit(): void {
        if (this.user?.id == this.current_user?.id) {
            this.showActionButton = false;
        }
        this.isFollowing = this.user?.followers.includes(this.current_user.id) || false;
    }

    onClickCard() {
        if (this.actionBtnCheckBox) {
            this.isSelected = !this.isSelected;
            if (this.user?.id) {
                this.toggleSelection.emit(this.user.id);
            }
            return;
        }

        if (this.redirectOnClick) this.router.navigate([this.user?.username]);
    }

    onClickActionButton() {
        if (this.actionBtn) {
            this.actionBtn();
        }
    }

    handleFollowButtonClick() {
        if (this.isFollowLoading) return;

        this.isFollowLoading = true;

        this.userService.followUser(this.userService.getUser().id, this.user?.id || '')
            .subscribe({
                next: () => {
                    this.isFollowing = !this.isFollowing;
                    this.isFollowLoading = false;
                },
                error: () => {
                    this.isFollowLoading = false;
                }
            });
    }
}