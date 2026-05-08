import { Component, Input } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { TranslationService } from "../../../core/services/translate.service";

@Component({
    selector: "app-footer-auth",
    templateUrl: "./footer-auth-component.html",
    imports: [TranslateModule],
    styleUrl: "./footer-auth-component.scss"
})

export class FooterAuthComponent {
    @Input() showBorder = true;
    constructor(
        public translateService: TranslationService
    ) { }
    public actionButtons: any = [
        { label: "FOOTER.BUTTONS.ABOUT", function: () => { } },
        { label: "FOOTER.BUTTONS.BLOG", function: () => { } },
        { label: "FOOTER.BUTTONS.API", function: () => { } },
        { label: "FOOTER.BUTTONS.HELP", function: () => { } },
        { label: "FOOTER.BUTTONS.PRIVACY", function: () => { } },
        { label: "FOOTER.BUTTONS.TERMS", function: () => { } },
        { label: "FOOTER.BUTTONS.LOCALIZATIONS", function: () => { } }
    ]

    changeLanguage(event: Event): void {
        const select = event.target as HTMLSelectElement;
        if (select) {
            this.translateService.setLanguage(select.value);
        }
    }
    getSelectedLanguage(): any {
        return this.translateService.getSelectedLanguage()
    }
}