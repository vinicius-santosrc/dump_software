import { CommonModule } from "@angular/common";
import { Component, Inject, Optional } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { CreatePostGeneralComponent } from "./create-post-general/create-post-general.component";
import { GenericButtonComponent } from "../../shared/components/generic-button-component/generic-button.component";
import { TranslateModule } from "@ngx-translate/core";

@Component({
    selector: "app-create-post-component",
    templateUrl: "./create-post.component.html",
    styleUrl: "./create-post.component.scss",
    imports: [MatIcon, CommonModule, CreatePostGeneralComponent, GenericButtonComponent, TranslateModule]
})
export class CreatePostComponent {
    @Optional() @Inject(MAT_DIALOG_DATA) data: any;
    step = 1;

    files: File[] = [];
    isDragging: boolean = false;

    constructor(private readonly dialog: MatDialog) { }

    get isMobile(): boolean {
        return window.innerWidth <= 768;
    }
    
    close() {
        this.dialog.closeAll();
    }

    onDragOver(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = true;
    }

    onDragLeave(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = false;
    }

    onDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = false;

        const droppedFiles = event.dataTransfer?.files;
        if (!droppedFiles) return;

        this.handleFiles(droppedFiles);
    }

    onFileSelected(event: any) {
        const selectedFiles = event.target.files;
        if (!selectedFiles) return;

        this.handleFiles(selectedFiles);
    }

    handleFiles(fileList: FileList) {
        const allowedTypes = ['image/', 'video/'];

        const newFiles = Array.from(fileList).filter(file =>
            allowedTypes.some(type => file.type.startsWith(type))
        );

        this.files = [...this.files, ...newFiles];
    }
}