/**
 * Created By: Vinícius da Silva Santos
 * Creation Date: 2026-03-20
 * Copyright (c) 2026 Dump Software. All rights reserved.
 * This software is licensed under the MIT License. See the LICENSE file in the project root for more information.
 */

import { Component } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";

@Component({
    selector: "app-navbar-component",
    templateUrl: "./navbar.component.html",
    styleUrl: "./navbar.component.scss",
    imports: [TranslateModule]
})
export class NavbarComponent {
    navigationLinks = [
        {
            icon: "home",
            href: "/",
            label: "Início"
        },
        {
            icon: "video",
            href: "/",
            label: "Dumps"
        },
        {
            icon: "search",
            href: "/",
            label: "Buscar"
        },
        {
            icon: "heart",
            href: "/",
            label: "Notificações"
        },
        {
            icon: "add",
            href: "/",
            label: "Salvos"
        }
    ]
}