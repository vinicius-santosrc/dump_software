import { Component, EventEmitter, Output, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-search-sidebar',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './search-sidebar.component.html',
    styleUrl: './search-sidebar.component.scss'
})
export class SearchSidebarComponent implements AfterViewInit {

    @Output() close = new EventEmitter<void>();

    @ViewChild('input') input!: ElementRef<HTMLInputElement>;

    query: string = '';

    ngAfterViewInit() {
        setTimeout(() => {
            this.input?.nativeElement.focus();
        }, 0);
    }

    handleClose() {
        this.close.emit();
    }

    onOverlayClick(event: MouseEvent) {
        if ((event.target as HTMLElement).classList.contains('overlay')) {
            this.handleClose();
        }
    }
}