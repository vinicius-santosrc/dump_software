import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LoaderComponent } from "../loader-component/loader.component";
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
@Component({
    selector: 'app-generic-button',
    standalone: true,
    templateUrl: './generic-button.component.html',
    styleUrl: './generic-button.component.scss',
    imports: [CommonModule, LoaderComponent, MatIconModule, TranslateModule]
})
export class GenericButtonComponent {

    @Input() label: string = '';
    @Input() backgroundColor: string = '#1881E2';
    @Input() textColor: string = '#ffffff';
    @Input() width: string = 'auto';
    @Input() padding: string = '8px 16px';
    @Input() disabled: boolean = false;
    @Input() loading: boolean = false;
    @Input() borderRadius: string = '8px';
    @Input() fontSize: string = '14px';
    @Input() type: 'button' | 'submit' | 'reset' = 'button';
    @Input() marginY: string = '0px';

    @Input() logoIcon?: string;
    @Input() iconName?: string;
    @Input() variant: 'default' | 'secondary' | 'ghost' = 'default';

    @Input() isFile: boolean = false;
    @Input() accept: string = 'image/*';

    @Output() onClick = new EventEmitter<void>();
    @Output() fileSelected = new EventEmitter<File>();

    handleClick() {
        if (this.disabled || this.loading) return;
        this.onClick.emit();
    }

    onFileChange(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;

        this.fileSelected.emit(input.files[0]);
    }
}
