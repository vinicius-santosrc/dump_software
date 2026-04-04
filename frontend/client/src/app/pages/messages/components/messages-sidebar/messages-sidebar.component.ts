import { Component, Input, Output, EventEmitter } from "@angular/core";
import { MatIcon } from "@angular/material/icon";

@Component({
    selector: "app-messages-sidebar",
    templateUrl: "./messages-sidebar.component.html",
    styleUrls: ["./messages-sidebar.component.scss"],
    imports: [MatIcon]
})

export class MessagesSidebarComponent {
    @Input() relatedUsers: any[] = [];
    
    @Output() selectUser = new EventEmitter<any>();

    onSelect(user: any) {
      this.selectUser.emit(user);
    }

}