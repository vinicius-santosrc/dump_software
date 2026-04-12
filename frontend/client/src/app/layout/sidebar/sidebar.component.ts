/**
 * Created By: Vinícius da Silva Santos
 * Creation Date: 2026-03-20
 * Copyright (c) 2026 Dump Software. All rights reserved.
 * This software is licensed under the MIT License. See the LICENSE file in the project root for more information.
 */

import { Component } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { RouterModule } from "@angular/router";
import { MatIcon } from "@angular/material/icon";
import { SearchSidebarComponent } from "./search-sidebar/search-sidebar.component";
import { CommonModule } from "@angular/common";
import { CreatePostComponent } from "../../pages/create-post/create-post.component";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";

@Component({
    selector: "app-sidebar-component",
    templateUrl: "./sidebar.component.html",
    styleUrl: "./sidebar.component.scss",
    imports: [TranslateModule, RouterModule, MatIcon, SearchSidebarComponent, CommonModule, MatDialogModule]
})
export class SidebarComponent {
    isSidebarOpen: boolean = localStorage.getItem("sidebar") === "true";
    isSearchOpen: boolean = false;
    isMessagePage: boolean = globalThis.location.pathname === "/messages/inbox"
    constructor(private readonly dialog: MatDialog) { }

    navigationLinks = [
        {
            icon: "home",
            route: "/",
            isLink: true,
            label: "HEADER.ACTIONS.SIDEBAR.HOME"
        },
        {
            icon: "movie",
            route: "/dumps",
            isLink: true,
            label: "HEADER.ACTIONS.SIDEBAR.DUMPS"
        },
        {
            icon: "search",
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
            label: "HEADER.ACTIONS.SIDEBAR.ALERTS"
        },
        {
            icon: "bookmark_added",
            route: "/add",
            isLink: true,
            label: "HEADER.ACTIONS.SIDEBAR.SAVES"
        },
        {
            icon: "add_circle",
            route: "/create",
            isLink: false,
            label: "HEADER.ACTIONS.SIDEBAR.ADD_POST",
            action: () => {
                this.dialog.open(CreatePostComponent, {
                    minWidth: '1000px',
                });
            }
        },
        {
            icon: "menu",
            route: "/create",
            isLink: false,
            label: "HEADER.ACTIONS.SIDEBAR.MENU"
        },
        {
            icon: "settings",
            route: "/settings",
            isLink: false,
            label: "HEADER.ACTIONS.SIDEBAR.SETTINGS"
        }
    ]

    mobileNavigationLinks = [
        {
            icon: "home",
            route: "/",
            label: "HEADER.ACTIONS.SIDEBAR.HOME"
        },
        {
            icon: "movie",
            route: "/dumps",
            label: "HEADER.ACTIONS.SIDEBAR.DUMPS"
        },
        {
            icon: "add_circle",
            route: "/create",
            label: "HEADER.ACTIONS.SIDEBAR.ADD_POST"
        },
        {
            icon: "favorite",
            route: "/alerts",
            label: "HEADER.ACTIONS.SIDEBAR.ALERTS"
        },
        {
            icon: "search",
            route: "/search",
            label: "HEADER.ACTIONS.SIDEBAR.SEARCH"
        }
    ];

    handleOpenSideBar() {
        this.isSidebarOpen = !this.isSidebarOpen;
        localStorage.setItem("sidebar", this.isSidebarOpen.toString());

        globalThis.dispatchEvent(new CustomEvent('sidebarToggle', {
            detail: this.isSidebarOpen
        }));
    }

    handleSearchClick() {
        this.isSearchOpen = true;
        this.isSidebarOpen = true;

        localStorage.setItem("sidebar", "true");

        globalThis.dispatchEvent(new CustomEvent('sidebarToggle', {
            detail: true
        }));
    }

    closeSearch() {
        this.isSearchOpen = false;
    }

    handleNavigation(item: any, event: Event) {
        if (!item.isLink && item.action) {
            event.preventDefault();
            event.stopPropagation();
            item.action(event);
        }
    }
}