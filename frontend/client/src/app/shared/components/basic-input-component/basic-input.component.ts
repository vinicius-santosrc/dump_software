import { CommonModule } from "@angular/common";
import { Component, Input, OnInit, AfterViewInit, Output, EventEmitter, forwardRef, ChangeDetectorRef } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: "app-basic-input",
    standalone: true,
    templateUrl: "./basic-input.component.html",
    imports: [
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        TranslateModule,
    ],
    styleUrls: ["./basic-input.component.scss"],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => BasicInputComponent),
        multi: true
    }]
})
export class BasicInputComponent implements OnInit, AfterViewInit, ControlValueAccessor {
    @Input() type: 'text' | 'email' | 'password' | 'date' | 'tel' | 'textarea' = 'text';
    @Input() label: string = 'COMPONENTS.BASIC_INPUT.DEFAULT_SEARCH';
    @Input() maxLength?: number;
    @Input() minLength?: number;
    @Input() required: boolean = false;
    @Input() resizableX: boolean = false;
    @Input() resizableY: boolean = false;
    @Input() iconName: string = '';
    @Output() valueChange = new EventEmitter<string>();
    @Output() typing = new EventEmitter<void>();
    @Output() blur = new EventEmitter<void>();


    focused: boolean = false;
    @Input() value: string = '';
    touched: boolean = false;
    currentType: string = this.type;

    private onChange: (value: string) => void = () => { };
    private onTouched: () => void = () => { };

    constructor(private readonly cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.currentType = this.type;

        if (this.type === 'date') {
            this.focused = true;
        }
    }

    ngAfterViewInit(): void {
        if (this.value || this.type === 'date') {
            this.focused = true;
            this.cdr.detectChanges();
        }
    }

    togglePassword(): void {
        if (this.currentType === 'password') {
            this.currentType = 'text';
        } else {
            this.currentType = 'password';
        }
    }

    writeValue(value: string): void {
        this.value = value || '';

        if (this.value || this.type === 'date') {
            this.focused = true;
            this.cdr.detectChanges();
        }
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    onInput(event: Event): void {
        const input = event.target as HTMLInputElement | HTMLTextAreaElement;
        this.value = input.value;
        if (this.type === 'textarea') {
            const textarea = input as HTMLTextAreaElement;
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }
        this.valueChange.emit(this.value);
        this.typing.emit();
        this.onChange(this.value);
    }

    onBlur(): void {
        this.touched = true;
        this.blur.emit();
        this.onTouched();
    }

    get hasMaxLengthError(): boolean {
        return !!this.maxLength && this.value.length > this.maxLength;
    }

    get hasMinLengthError(): boolean {
        return !!this.minLength && this.value.length < this.minLength && this.value.length > 0;
    }

    get hasRequiredError(): boolean {
        return this.required && !this.value;
    }

    get hasError(): boolean {
        return this.hasMaxLengthError || this.hasMinLengthError || this.hasRequiredError;
    }

    get showError(): boolean {
        return this.touched && this.hasError;
    }
}