import { Component, EventEmitter, Output, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BasicInputComponent } from "../../../shared/components/basic-input-component/basic-input.component";
import { MatIcon } from "@angular/material/icon";
import { NotificationService } from '../../../core/services/notification/notification.service';
import { LoaderComponent } from "../../../shared/components/loader-component/loader.component";
import { GenericCardUserComponent } from "../../../shared/components/generic-card-user/generic-card-user.component";
import { PostMediaComponent } from "../../../shared/components/post-component/components/post-media-component/post-media.component";
import { RecentSearchService } from '../../../core/services/search/recent-search.service';
import { Router } from '@angular/router';
import { MatButtonModule } from "@angular/material/button";
import { Notification } from '../../../core/models/notification/notification.model';
import { AvatarItem } from "../../../shared/components/avatar-item/avatar-item.component";
import { formatDateToNow } from '../../../core/utils/format-date.util';
import { TranslateModule } from '@ngx-translate/core';
import { MatTabGroup, MatTab, MatTabLabel } from "@angular/material/tabs";
import { MessagesComponent } from "../../../pages/messages/messages.component";

@Component({
    selector: 'app-notifications-sidebar',
    imports: [CommonModule, FormsModule, BasicInputComponent, MatIcon, LoaderComponent, GenericCardUserComponent, PostMediaComponent, MatButtonModule, AvatarItem, TranslateModule, MatTabGroup, MatTab, MatTabLabel, MessagesComponent],
    templateUrl: './notifications-sidebar.component.html',
    styleUrl: './notifications-sidebar.component.scss'
})
export class NotificationsSidebarComponent implements AfterViewInit, OnInit {

    @Output() close = new EventEmitter<void>();

    @ViewChild('input') input!: ElementRef<HTMLInputElement>;

    query: string = '';

    notifications: Notification[] = [];
    loading = false;
    formatDateToNow = formatDateToNow

    constructor(
        private readonly notificationService: NotificationService,
        private readonly recentSearchService: RecentSearchService,
        private readonly router: Router,
    ) { }

    onSearchChange(query: string) {
        // not used anymore
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.input?.nativeElement.focus();
        }, 0);
    }

    handleClose() {
        this.close.emit();
    }

    onOverlayClick(event: MouseEvent) {
        if ((event.target as HTMLElement).classList.contains('overlay')) {
            this.handleClose();
        }
    }

    recentSearches: any = [];

    ngOnInit() {
        this.load();
    }

    load() {
        this.loading = true;

        this.notificationService.getNotifications().subscribe(res => {
            this.notifications = res;
            this.loading = false;
        });
    }

    remove(id: string) {
        this.load();
    }

    clear() {
        this.load();
    }

    add_recent(item: any) {
        this.recentSearchService.add(item);
    }

    handleMobileTabChange(index: number): void {
        if (index === 1) {
            this.openMessages();
        }
    }

    openMessages() {
        this.router.navigate(['/messages/inbox']);
    }
}