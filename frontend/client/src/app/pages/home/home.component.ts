/**
 * Created By: Vinícius da Silva Santos
 * Creation Date: 2026-03-17
 * Copyright (c) 2026 Dump Software. All rights reserved.
 * This software is licensed under the MIT License. See the LICENSE file in the project root for more information.
 */

import { Component, Input } from "@angular/core";
import { FeedComponent } from "../feed/feed.component";

@Component({
    selector: "app-home-page",
    templateUrl: "./home.component.html",
    styleUrl: "./home.component.scss",
    imports: [FeedComponent],
})
export class HomePage {
    @Input() width: any;
}