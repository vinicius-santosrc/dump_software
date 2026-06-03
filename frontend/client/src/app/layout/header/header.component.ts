/**
 * Created By: Vinícius da Silva Santos
 * Creation Date: 2026-03-20
 * Copyright (c) 2026 Dump Software. All rights reserved.
 * This software is licensed under the MIT License. See the LICENSE file in the project root for more information.
 */

import { Component, Input, OnInit } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { UserService } from "../../core/services/user/user.service";
import { Router, NavigationEnd, RouterLink } from "@angular/router";
import { CommonModule, NgStyle } from "@angular/common";
import { WHITE_LIST_NAVIGATIONS } from "../../core/config/api.config";
import { ThemeService } from "../../core/services/theme.service";
import { GenericButtonComponent } from "../../shared/components/generic-button-component/generic-button.component";
import { AvatarItem } from "../../shared/components/avatar-item/avatar-item.component";
import { NotificationsSidebarComponent } from "../sidebar/notifications-sidebar/notifications-sidebar.component";
import { MatDialog } from "@angular/material/dialog";
import { ProfileEditComponent } from "../../pages/profile/edit/profile-edit.component";

@Component({
    selector: "app-header",
    templateUrl: "./header.component.html",
    styleUrl: "./header.component.scss",
    imports: [TranslateModule, NgStyle, CommonModule, RouterLink, GenericButtonComponent, AvatarItem, NotificationsSidebarComponent]
})

export class HeaderComponent implements OnInit {
    public isHidden: boolean = false;
    private lastScrollTop: number = 0;
    @Input() width: string = "";
    public logo = "assets/app/media/anim/icon/splash-screen.svg";
    public current_user: any;
    public isHome: boolean = false;
    showHeader: boolean = true;
    showDumpLogo: boolean = false;
    theme: 'light' | 'dark' = 'light';
    panels = {
        notifications: false
    };

    isMessagePage: boolean = globalThis.location.pathname.startsWith('/messages');
    constructor(
        public userService: UserService,
        public router: Router,
        private readonly themeService: ThemeService,
        private readonly dialog: MatDialog
    ) {
        this.theme = this.themeService.getTheme();
        this.logo = this.theme === 'light' ? 'assets/app/media/anim/icon/splash-screen.svg' : 'assets/app/media/anim/icon/splash-screen-light.svg';
        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY || document.documentElement.scrollTop;

            if (currentScroll > 60) {
                this.showDumpLogo = false;
            }
            else {
                this.showDumpLogo = true;
            }

            if (currentScroll > this.lastScrollTop && currentScroll > 50) {
                // scroll down
                this.isHidden = true;
            } else {
                // scroll up
                this.isHidden = false;
            }

            this.lastScrollTop = Math.max(0, currentScroll);
        });
        if (WHITE_LIST_NAVIGATIONS.some(route => globalThis.location.pathname.startsWith(route))) {
            this.showHeader = false;
        }

        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                // força atualização do template
                this.isMessagePage = globalThis.location.pathname.startsWith('/messages');
                const url = this.router.url;
                this.showHeader = !WHITE_LIST_NAVIGATIONS.some(route => url.startsWith(route));
                this.isHome = this.router.url === '/';
                this.showDumpLogo = this.router.url === '/';
            }
        });
    }

    ngOnInit(): void {
        this.userService.user$.subscribe((user: any) => {
            this.current_user = user;
        });

        this.listenSidebar();
        this.isHome = this.router.url === '/';

        if (WHITE_LIST_NAVIGATIONS.some(route => globalThis.location.pathname.startsWith(route))) {
            this.showHeader = false;
        }
    }

    get isMobile(): boolean {
        return window.innerWidth <= 768;
    }

    listenSidebar() {
        const updateWidth = (isOpen: boolean) => {
            this.width = isOpen
                ? 'calc(100% - 540px)'
                : 'calc(100% - 388px)';
        };

        // estado inicial
        const initial = localStorage.getItem('sidebar') === 'true';
        updateWidth(initial);

        globalThis.addEventListener('sidebarToggle', (event: any) => {
            updateWidth(event.detail);
        });
    }

    openMessages() {
        this.router.navigate(['/messages/inbox']);
    }

    openNotifications() {
        this.openPanel('notifications');
    }

    openPanel(panel: keyof typeof this.panels) {
        Object.keys(this.panels).forEach(p => this.panels[p as keyof typeof this.panels] = false);
        this.panels[panel] = true;
    }

    closePanels() {
        Object.keys(this.panels).forEach(p => this.panels[p as keyof typeof this.panels] = false);
    }

    openSettings() {
        this.dialog.open(ProfileEditComponent, {
            minWidth: this.isMobile ? '400px' : '1000px',
        })
    }
};