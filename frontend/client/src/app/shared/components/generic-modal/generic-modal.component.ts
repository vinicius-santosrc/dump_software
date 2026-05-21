import { Component, Input, OnInit } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { GenericButtonComponent } from "../generic-button-component/generic-button.component";
import { CommonModule } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";
import { TranslateModule } from "@ngx-translate/core";

@Component({
    standalone: true,
    selector: "app-generic-modal-component",
    templateUrl: "./generic-modal.component.html",
    styleUrl: "./generic-modal.component.scss",
    imports: [MatIcon, CommonModule, GenericButtonComponent, TranslateModule]
})
export class GenericModalComponent implements OnInit {
    @Input() title: string = "";
    @Input() subtitle: any = "";
    @Input() height: string = "95vh"

    @Input() actionButtons = [
        {
            label: "Salvar",
            click: () => { }
        }
    ]
    constructor(private readonly dialog: MatDialog) { }
    ngOnInit(): void {
        
    }

    close() { 
        this.dialog.closeAll();
    }
}