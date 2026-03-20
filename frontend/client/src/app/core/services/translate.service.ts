import { Injectable } from '@angular/core';
import { locale as pt } from '../../config/i18n/pt';
import { locale as en } from '../../config/i18n/en';
import { locale as es } from '../../config/i18n/es';
import { TranslateService } from '@ngx-translate/core';

export interface Locale {
    lang: string;
    data: any;
}

@Injectable({
    providedIn: 'root'
})
export class TranslationService {
    private readonly langIds: any = [];

    constructor(private readonly translate: TranslateService) {
        // languages available in the app
        this.translate.addLangs(['pt', 'en', 'es']);

        // default language
        this.translate.setDefaultLang('pt');

        // load static translation objects
        this.loadTranslations(pt, en, es);

        // restore saved language or use default
        const savedLang = localStorage.getItem('language');
        const lang: string = savedLang ?? this.translate.getDefaultLang() ?? 'pt';

        this.translate.use(lang);
        localStorage.setItem('language', lang);
    }

    public loadTranslations(...args: Locale[]): void {
        const locales = [...args];

        locales.forEach(locale => {
            // use setTranslation() with the third argument set to true
            // to append translations instead of replacing them
            this.translate.setTranslation(locale.lang, locale.data, true);

            this.langIds.push(locale.lang);
        });

        // add new languages to the list
        this.translate.addLangs(this.langIds);
    }

    setLanguage(lang: string) {
        if (lang) {
            this.translate.use(lang);
            localStorage.setItem('language', lang);
        }
    }

    public getSelectedLanguage(): string | null {
        const lang: string | null = localStorage.getItem('language');
        return lang;
    }
}
