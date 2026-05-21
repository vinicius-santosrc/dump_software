import { Component, Input } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";

@Component({
    selector: "app-generic-card-component",
    templateUrl: "./card-component.html",
    styleUrl: "./card-component.scss",
    imports: [TranslateModule]
})
export class CardComponent {
    @Input() width: string = ""
    @Input() mainText: string = ""
}