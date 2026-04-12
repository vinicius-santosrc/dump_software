/**
 * Created By: Vinícius da Silva Santos
 * Creation Date: 2026-03-20
 * Copyright (c) 2026 Dump Software. All rights reserved.
 * This software is licensed under the MIT License. See the LICENSE file in the project root for more information.
 */

import { Component, Input, OnInit } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { UserService } from "../../core/services/user/user.service";
import { MemoriesComponent } from "./memories-component/memories.component";
import { Router, NavigationEnd } from "@angular/router";
import { NgStyle } from "@angular/common";

@Component({
    selector: "app-header",
    templateUrl: "./header.component.html",
    styleUrl: "./header.component.scss",
    imports: [TranslateModule, MemoriesComponent, NgStyle]
})
    
export class HeaderComponent implements OnInit{
    public isHidden: boolean = false;
    private lastScrollTop: number = 0;
    @Input() width: string = "";
    public readonly logo = "assets/app/media/anim/icon/splash-screen.svg";
    public current_user: any;
    public isHome: boolean = false;
    constructor(
        public userService: UserService,
        public router: Router
    ) { 
        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY || document.documentElement.scrollTop;

            if (currentScroll > this.lastScrollTop && currentScroll > 50) {
                // scroll down
                this.isHidden = true;
            } else {
                // scroll up
                this.isHidden = false;
            }

            this.lastScrollTop = Math.max(0, currentScroll);
        });

        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                // força atualização do template
                this.isHome = this.router.url === '/';
            }
        });
    }    

    ngOnInit(): void {
        this.userService.user$.subscribe((user: any) => {
            this.current_user = user;
        });

        this.listenSidebar();
        this.isHome = this.router.url === '/';
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
};