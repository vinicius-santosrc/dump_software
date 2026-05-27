import {
    ChangeDetectionStrategy,
    Component,
    inject,
} from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-theme-menu',
    standalone: true,
    imports: [
        MatIconModule,
        MatSlideToggleModule,
        MatButtonModule,
        TranslateModule
    ],
    templateUrl: './theme-menu.component.html',
    styleUrl: './theme-menu.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeMenuComponent {

    public isDarkMode = false;

    constructor() {
        this.initializeTheme();
    }

    public toggleDarkMode(enabled: boolean): void {

        this.isDarkMode = enabled;

        document.body.classList.toggle(
            'dark-theme',
            enabled
        );

        localStorage.setItem(
            'theme',
            enabled ? 'dark' : 'light'
        );
    }

    private initializeTheme(): void {

        const savedTheme =
            localStorage.getItem('theme');

        this.isDarkMode =
            savedTheme === 'dark';

        document.body.classList.toggle(
            'dark-theme',
            this.isDarkMode
        );
    }

    public goBack(): void {
        history.back();
    }
}