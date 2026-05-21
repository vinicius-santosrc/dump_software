import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { AppDropdownComponent } from "../dropdown-item/dropdown-item.component";
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-setting-item',
    standalone: true,
    imports: [CommonModule, MatIcon, AppDropdownComponent, TranslateModule],
    templateUrl: './app-setting-item.component.html',
    styleUrl: './app-setting-item.component.scss'
})
export class AppSettingItemComponent {

    @Input() label: string = "";
    @Input() icon: string = "";
    @Input() value?: string;
    @Input() disabled: boolean = false;
    @Input() action?: (data?: any) => void;
    @Input() type: 'normal' | 'toggle' = 'normal'
    @Input() displayKey?: string;
    @Input() multiple: boolean = false;

    @Input() dropdownItems: any[] = [];
    @Input() enableDropdown: boolean = false;

    selectedItems: any

    isOpen: boolean = false;

    handleClick() {
        if (this.disabled) return;

        if (this.type == 'toggle') this.toggle();


        if (this.enableDropdown) {
            this.isOpen = !this.isOpen;
            return;
        }

        if (this.action) {
            this.action();
        }
    }

    onSelect(item: any) {
        if (this.multiple) {
            this.selectedItems = item;
        }
        if (this.action) {
            this.action(item);
        }
        this.isOpen = false;
    }

    toggle() {
        if (this.disabled) return;

        const newValue = this.value === 'true' ? 'false' : 'true';
        this.value = newValue;

        if (this.action) {
            this.action();
        }
    }
}