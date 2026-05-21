import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";

@Component({
    selector: 'app-not-found',
    imports: [CommonModule, TranslateModule],
    templateUrl: './404.component.html',
    styleUrl: './404.component.scss'
})
export class NotFoundComponent {

}