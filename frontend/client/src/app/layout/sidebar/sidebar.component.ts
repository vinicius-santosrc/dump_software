/**
 * Created By: Vinícius da Silva Santos
 * Creation Date: 2026-03-20
 * Copyright (c) 2026 Dump Software. All rights reserved.
 * This software is licensed under the MIT License. See the LICENSE file in the project root for more information.
 */

import { Component } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { Router, RouterModule, NavigationEnd } from "@angular/router";
import { MatIcon } from "@angular/material/icon";
import { SearchSidebarComponent } from "./search-sidebar/search-sidebar.component";
import { CommonModule } from "@angular/common";
import { CreatePostComponent } from "../../pages/create-post/create-post.component";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatMenuModule } from "@angular/material/menu";
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { WHITE_LIST_NAVIGATIONS } from "../../core/config/api.config";
import { AuthService } from "../../core/services/auth/auth.service";
import { NotificationsSidebarComponent } from "./notifications-sidebar/notifications-sidebar.component";
import { UserService } from "../../core/services/user/user.service";
import { ThemeMenuComponent } from "../../shared/components/post-component/components/theme-menu/theme-menu.component";
import { SIDEBAR_NAVIGATION } from "./config/sidebar-navigation.config";
import { MOBILE_SIDEBAR_NAVIGATION } from "./config/mobile-sidebar-navigation.config";
import { SidebarUtils } from "../../core/utils/sidebar.utils";
import { User } from "../../core/models/user/user.model";
import { NavigationLink, SidebarMenuOption } from "../../core/models/sidebar/navigation-link.interface";
import { MessagesStoreService } from "../../store/conversation.store.service";
import { MessagesService } from "../../pages/messages/messages.service";

@Component({
    selector: "app-sidebar-component",
    templateUrl: "./sidebar.component.html",
    styleUrl: "./sidebar.component.scss",
    imports: [
    TranslateModule,
    RouterModule,
    MatIcon,
    SearchSidebarComponent,
    CommonModule,
    MatDialogModule,
    MatMenuModule,
    NotificationsSidebarComponent,
    MatSlideToggleModule,
    MatButtonModule,
    ThemeMenuComponent
]
})
export class SidebarComponent {
    isSidebarOpen: boolean = localStorage.getItem("sidebar") === "true";
    isSidebarHovering: boolean = false;
    panels = {
        search: false,
        notifications: false
    };
    showSidebar: boolean = true;
    current_user!: User;
    isMessagePage: boolean = globalThis.location.pathname === "/messages/inbox";
    selected: string = 'home';
    isInConversations: boolean = globalThis.location.pathname.startsWith("/messages/inbox");
    isDarkMode: boolean = localStorage.getItem('theme') === 'dark';
    showDisplayMenu: boolean = false;
    unreadMessagesCount: number = 0;

    constructor(
        private readonly dialog: MatDialog,
        private readonly router: Router,
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly conversationStore: MessagesStoreService,
        private readonly messagesService: MessagesService
    ) {
        if (WHITE_LIST_NAVIGATIONS.some(route => globalThis.location.pathname.startsWith(route))) {
            this.showSidebar = false;
        }
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                const url = this.router.url;
                this.showSidebar = !WHITE_LIST_NAVIGATIONS.some(route => url.startsWith(route));
                this.isMessagePage = url === "/messages/inbox";
                this.updateSelectedByRoute(url);
            }
        });
        this.userService.user$.subscribe(user => {
            if (!user) return;
            this.current_user = user;
            this.initializeNavigation();
            this.updateUnreadMessagesCount(this.conversationStore.conversations$.value ?? []);
            this.loadUnreadMessagesCounter(user.id);
        });

        this.conversationStore.conversations$.subscribe(conversations => {
            this.updateUnreadMessagesCount(conversations ?? []);
        });
        this.updateSelectedByRoute(this.router.url);
    }

    private loadUnreadMessagesCounter(userId: string): void {
        if (!userId) {
            return;
        }

        this.messagesService.getConversationsByUserId(userId, true)
            .subscribe({
                next: (conversations: any[]) => {
                    const sorted = [...(conversations ?? [])].sort((firstConversation, secondConversation) => {
                        const firstDate = new Date(firstConversation?.updatedAt ?? firstConversation?.lastMessage?.createdAt ?? 0).getTime();
                        const secondDate = new Date(secondConversation?.updatedAt ?? secondConversation?.lastMessage?.createdAt ?? 0).getTime();

                        return secondDate - firstDate;
                    });

                    this.conversationStore.setConversations(sorted);
                    this.updateUnreadMessagesCount(sorted);
                },
                error: (error) => {
                    console.error('Failed to load unread messages counter', error);
                }
            });
    }

    getNavigationUnreadCount(item: NavigationLink): number {
        if (item.id !== 'send' && item.id !== 'inbox') {
            return 0;
        }

        return this.unreadMessagesCount;
    }

    hasNavigationUnread(item: NavigationLink): boolean {
        return this.getNavigationUnreadCount(item) > 0;
    }

    private updateUnreadMessagesCount(conversations: any[]): void {
        const userId = this.current_user?.id;

        if (!userId) {
            this.unreadMessagesCount = 0;
            return;
        }

        this.unreadMessagesCount = (conversations ?? []).reduce((total, conversation) => {
            const unreadCount = conversation?.unreadCount ?? conversation?.unreadCounts ?? conversation?.unread ?? {};

            if (typeof unreadCount === 'number') {
                return total + unreadCount;
            }

            return total + Number(unreadCount[userId] ?? 0);
        }, 0);
    }

    isSelected(item: NavigationLink): boolean {
        return this.selected == item.icon;
    }

    get isMobile(): boolean {
        return window.innerWidth <= 768;
    }

    navigationLinks: NavigationLink[] = [];
    mobileNavigationLinks: NavigationLink[] = [];

    private initializeNavigation(): void {
        this.navigationLinks =
            SIDEBAR_NAVIGATION.map(item =>
                SidebarUtils.resolveProfileNavigation(
                    item,
                    this.current_user
                )
            );

        this.mobileNavigationLinks =
            MOBILE_SIDEBAR_NAVIGATION.map(item =>
                SidebarUtils.resolveProfileNavigation(
                    item,
                    this.current_user
                )
            );
    }

    updateSelectedByRoute(url: string) {

        const matchedItem = this.navigationLinks.find((item) => {

            if (!item.route || item.route === '/') {
                return url === '/';
            }

            return url.startsWith(item.route);
        });

        if (matchedItem) {
            this.selected = matchedItem.icon;
            return;
        }

        const mobileMatchedItem = this.mobileNavigationLinks.find((item) => {

            if (!item.route || item.route === '/') {
                return url === '/';
            }

            return url.startsWith(item.route);
        });

        if (mobileMatchedItem) {
            this.selected = mobileMatchedItem.icon;
        }
    }

    handleOpenSideBar() {
        this.isSidebarOpen = !this.isSidebarOpen;
        localStorage.setItem("sidebar", this.isSidebarOpen.toString());

        globalThis.dispatchEvent(new CustomEvent('sidebarToggle', {
            detail: this.isSidebarOpen
        }));
    }

    handleSidebarMouseEnter(): void {
        if (this.isSidebarOpen) return;

        this.isSidebarHovering = true;
    }

    handleSidebarMouseLeave(): void {
        if (this.isSidebarOpen) return;

        this.isSidebarHovering = false;
    }

    openPanel(panel: keyof typeof this.panels) {
        Object.keys(this.panels).forEach(p => this.panels[p as keyof typeof this.panels] = false);
        this.panels[panel] = true;

        this.isSidebarOpen = true;
        localStorage.setItem("sidebar", "true");

        globalThis.dispatchEvent(new CustomEvent('sidebarToggle', {
            detail: true
        }));
    }

    handleNotificationsClick() {
        this.openPanel('notifications');
    }

    handleSearchClick() {
        this.openPanel('search');
    }

    closePanels() {
        Object.keys(this.panels).forEach(p => this.panels[p as keyof typeof this.panels] = false);
    }


    navigate(item: SidebarMenuOption): void {
        switch (item.type) {
            case 'route':
                if (item.route) {
                    this.router.navigate([item.route]);
                }
                break;

            case 'panel':
                this.handlePanel(item);
                break;

            case 'menu':
                break;

            case 'action':
                this.handleAction(item);
                break;
        }
    }

    private handlePanel(item: any): void {
        switch (item.id) {
            case 'search':
                this.handleSearchClick();
                break;
            case 'notifications':
                this.handleNotificationsClick();
                break;
            case 'inbox':
                this.handleNotificationsClick();
                break;
        }
    }

    private handleAction(item: any): void {
        switch (item.id) {
            case 'disconnect':
                this.handleDisconnect();
                break;

            case 'post':
                this.dialog.open(CreatePostComponent, {
                    minWidth: this.isMobile
                        ? '400px'
                        : '1000px',
                });
                break;
        }
    }

    handleDisconnect() {
        this.authService.logout();
    }
}