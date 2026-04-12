import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-dropdown',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './dropdown-item.component.html',
    styleUrl: './dropdown-item.component.scss'
})
export class AppDropdownComponent {
    @Input() items: any[] = [];
    @Input() displayKey: string = 'name';
    @Input() placeholder: string = 'Buscar...';

    @Input() multiple: boolean = false;
    @Input() selectedItems: any[] = [];

    @Output() select = new EventEmitter<any>();
    @Output() close = new EventEmitter<void>(); 
    

    search: string = '';

    get filteredItems() {
        if (!this.search) return this.items;

        return this.items.filter(item =>
            item[this.displayKey]
                ?.toLowerCase()
                .includes(this.search.toLowerCase())
        );
    }

    onSelect(item: any) {
        if (this.multiple) {
            const exists = this.selectedItems?.includes(item);

            if (exists) {
                this.selectedItems = this.selectedItems.filter(i => i !== item);
            } else {
                this.selectedItems = [...this.selectedItems, item];
            }

            this.select.emit(this.selectedItems);
        } else {
            this.select.emit(item);
            this.close.emit();
        }
    }

    // 🔥 fechar ao clicar fora
    @HostListener('document:click', ['$event'])
    onClickOutside(event: Event) {
        const target = event.target as HTMLElement;
        if (!target.closest('.dropdown-container')) {
            this.close.emit();
        }
    }
}