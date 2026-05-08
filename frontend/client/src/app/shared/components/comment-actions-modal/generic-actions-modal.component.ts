import { Component, Inject, Output, EventEmitter } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { TranslateModule } from "@ngx-translate/core";

export interface CommentAction {
    id: string;
    label: string;
    type?: 'default' | 'danger';
}

@Component({
    selector: 'app-generic-actions-modal',
    templateUrl: 'generic-actions-modal.component.html',
    styleUrl: './generic-actions-modal.component.scss',
    imports: [TranslateModule]
})
export class GenericActionsModal {
    @Output() actionClick = new EventEmitter<CommentAction>();

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { actions: CommentAction[] },
        private readonly dialogRef: MatDialogRef<GenericActionsModal>
    ) { }

    handleClick(action: CommentAction) {
        this.actionClick.emit(action);
        this.dialogRef.close(action);
    }

    cancel() {
        this.dialogRef.close();
    }
}