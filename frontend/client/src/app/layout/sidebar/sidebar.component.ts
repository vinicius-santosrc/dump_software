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
import { WHITE_LIST_NAVIGATIONS } from "../../core/config/api.config";
import { AuthService } from "../../core/services/auth/auth.service";
import { NotificationsSidebarComponent } from "./notifications-sidebar/notifications-sidebar.component";
import { UserService } from "../../core/services/user/user.service";
interface NavigationLink {
    icon: string;
    iconUrl?: string
    route: string;
    isLink: boolean
    label: string;
    action?: (event: Event) => void;
    menuOptions?: {
        label: string;
        icon: string;
        iconUrl?: string;
        action: () => void;
    }[];
}
@Component({
    selector: "app-sidebar-component",
    templateUrl: "./sidebar.component.html",
    styleUrl: "./sidebar.component.scss",
    imports: [TranslateModule, RouterModule, MatIcon, SearchSidebarComponent, CommonModule, MatDialogModule, MatMenuModule, NotificationsSidebarComponent]
})
export class SidebarComponent {
    isSidebarOpen: boolean = localStorage.getItem("sidebar") === "true";
    panels = {
        search: false,
        notifications: false
    };
    showSidebar: boolean = true;
    current_user: any = {};
    isMessagePage: boolean = globalThis.location.pathname === "/messages/inbox";
    selected: string = 'home';
    isInConversations: boolean = globalThis.location.pathname.startsWith("/messages/inbox");
    constructor(private readonly dialog: MatDialog, private readonly router: Router, private readonly authService: AuthService, private readonly userService: UserService) {
        if (WHITE_LIST_NAVIGATIONS.some(route => globalThis.location.pathname.startsWith(route))) {
            this.showSidebar = false;
        }
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                const url = this.router.url;
                this.showSidebar = !WHITE_LIST_NAVIGATIONS.some(route => url.startsWith(route));
                this.isMessagePage = url === "/messages/inbox";
            }
        });
        this.current_user = this.userService.getUser();
    }

    isSelected(item: any): boolean {
        return this.selected == item.icon;
    }

    get isMobile(): boolean {
        return window.innerWidth <= 768;
    }

    navigationLinks: NavigationLink[] = [
        {
            icon: "home",
            // iconUrl: '/assets/app/media/icons/home.svg',
            route: "/",
            isLink: true,
            label: "HEADER.ACTIONS.SIDEBAR.HOME"
        },
        {
            icon: "explore",
            // iconUrl: '/assets/app/media/icons/explore.svg',
            route: "/explore",
            isLink: true,
            label: "HEADER.ACTIONS.SIDEBAR.EXPLORE"
        },
        {
            icon: "movie",
            // iconUrl: '/assets/app/media/icons/reels.svg',
            route: "/dumps",
            isLink: true,
            label: "HEADER.ACTIONS.SIDEBAR.DUMPS"
        },
        {
            icon: "search",
            // iconUrl: '/assets/app/media/icons/search.svg',
            route: "/search",
            isLink: false,
            label: "HEADER.ACTIONS.SIDEBAR.SEARCH",
            action: () => {
                this.handleSearchClick();
            }
        },
        {
            icon: "favorite",
            route: "/",
            isLink: false,
            label: "HEADER.ACTIONS.SIDEBAR.ALERTS",
            action: () => {
                this.handleNotificationsClick();
            }
        },
        {
            icon: "bookmark_added",
            route: "/saves",
            isLink: true,
            label: "HEADER.ACTIONS.SIDEBAR.SAVES"
        },
        {
            icon: "add_circle",
            // iconUrl: '/assets/app/media/icons/create.svg',
            route: "/create",
            isLink: false,
            label: "HEADER.ACTIONS.SIDEBAR.ADD_POST",
            action: () => null,
            menuOptions: [
                {
                    label: 'HEADER.ACTIONS.SIDEBAR.ADD_POST_MENU.POST',
                    icon: "edit",
                    iconUrl: '',
                    action: () => {
                        this.dialog.open(CreatePostComponent, {
                            minWidth: this.isMobile ? '400px' : '1000px',
                        });
                    },
                },
                {
                    label: 'HEADER.ACTIONS.SIDEBAR.ADD_POST_MENU.LIVE',
                    icon: "videocam",
                    iconUrl: '',
                    action: () => null,
                },
                {
                    label: 'HEADER.ACTIONS.SIDEBAR.ADD_POST_MENU.AD',
                    icon: "campaign",
                    iconUrl: '',
                    action: () => null,
                },
                {
                    label: 'HEADER.ACTIONS.SIDEBAR.ADD_POST_MENU.IA',
                    icon: "smart_toy",
                    iconUrl: '',
                    action: () => null,
                }
            ]
        },
        {
            icon: "menu",
            route: "/create",
            isLink: false,
            label: "HEADER.ACTIONS.SIDEBAR.MENU",
            menuOptions: [
                {
                    label: 'HEADER.ACTIONS.SIDEBAR.MENU_OPTIONS.SETTINGS',
                    icon: "settings",
                    iconUrl: '',
                    action: () => null,
                },
                {
                    label: 'HEADER.ACTIONS.SIDEBAR.MENU_OPTIONS.ACTIVITY',
                    icon: "analytics",
                    iconUrl: '',
                    action: () => null,
                },
                {
                    label: 'HEADER.ACTIONS.SIDEBAR.MENU_OPTIONS.SAVES',
                    icon: "flag",
                    iconUrl: '',
                    action: () => null,
                },
                {
                    label: 'HEADER.ACTIONS.SIDEBAR.MENU_OPTIONS.DISPLAY',
                    icon: "brightness_6",
                    iconUrl: '',
                    action: () => null,
                },
                {
                    label: 'HEADER.ACTIONS.SIDEBAR.MENU_OPTIONS.REPORT',
                    icon: "report",
                    iconUrl: '',
                    action: () => null,
                },
                {
                    label: 'HEADER.ACTIONS.SIDEBAR.MENU_OPTIONS.CHANGE_ACCOUNT',
                    icon: "",
                    iconUrl: '',
                    action: () => null,
                },
                {
                    label: 'HEADER.ACTIONS.SIDEBAR.MENU_OPTIONS.DISCONNECT',
                    icon: "",
                    iconUrl: '',
                    action: () => this.handleDisconnect(),
                }
            ]
        },
        {
            icon: "settings",
            route: "/settings",
            isLink: false,
            label: "HEADER.ACTIONS.SIDEBAR.SETTINGS"
        }
    ]

    get mobileNavigationLinks() {
        return [
            {
                icon: "home",
                route: "/",
                isLink: true,
                label: "HEADER.ACTIONS.SIDEBAR.HOME"
            },
            {
                icon: "movie",
                // iconUrl: '/assets/app/media/icons/reels.svg',
                route: "/dumps",
                isLink: true,
                label: "HEADER.ACTIONS.SIDEBAR.DUMPS"
            },
            {
                icon: "add_circle",
                // iconUrl: '/assets/app/media/icons/create.svg',
                route: "/create",
                label: "HEADER.ACTIONS.SIDEBAR.ADD_POST",
                isLink: false,
                action: () => {
                    this.dialog.open(CreatePostComponent, {
                        minWidth: this.isMobile ? '100%' : '1000px',
                    });
                },
            },
            {
                icon: "search",
                // iconUrl: '/assets/app/media/icons/search.svg',
                route: "/search",
                isLink: false,
                label: "HEADER.ACTIONS.SIDEBAR.SEARCH",
                action: () => {
                    this.handleSearchClick();
                }
            },
            {
                icon: "person",
                iconUrl: this.current_user?.thumbnail,
                route: '/' + this.current_user?.username,
                isLink: true,
                label: "HEADER.ACTIONS.SIDEBAR.SEARCH",
            },
        ];
    }

    handleOpenSideBar() {
        this.isSidebarOpen = !this.isSidebarOpen;
        localStorage.setItem("sidebar", this.isSidebarOpen.toString());

        globalThis.dispatchEvent(new CustomEvent('sidebarToggle', {
            detail: this.isSidebarOpen
        }));
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

    handleNavigation(item: any, event: Event) {
        if (!item.isLink && item.action) {
            event.preventDefault();
            event.stopPropagation();
            item.action(event);
        }
    }

    handleDisconnect() {
        this.authService.logout();
    }
}