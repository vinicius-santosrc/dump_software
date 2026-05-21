import { CommonModule } from "@angular/common";
import { Component, Input, Output, EventEmitter, forwardRef, OnInit, AfterViewInit, ChangeDetectorRef, HostListener } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from "@angular/forms";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { MatIconModule } from "@angular/material/icon";

@Component({
    selector: "app-select-input",
    standalone: true,
    templateUrl: "./select-input.component.html",
    styleUrls: ["./select-input-component.scss"],
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        MatIconModule
    ],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => SelectInputComponent),
        multi: true
    }]
})
export class SelectInputComponent implements OnInit, AfterViewInit, ControlValueAccessor {

    @Input() label: string = '';
    @Input() options: { label: string, value: any }[] = [];
    @Input() required: boolean = false;
    @Input() searchable: boolean = false;
    @Input() multiple: boolean = false;
    @Input() placeholder: string = 'Select';
    @Input() disabled: boolean = false;
    @Input() selected: any = this.multiple ? [] : null;

    @Output() valueChange = new EventEmitter<any>();

    value: any = '';
    focused: boolean = false;
    touched: boolean = false;
    isOpen: boolean = false;

    searchTerm: string = '';
    filteredOptions: { label: string, value: any }[] = [];
    selectedValues: any[] = [];

    activeIndex: number = -1;

    private onChange: (value: any) => void = () => {};
    private onTouched: () => void = () => {};

    constructor(
        private readonly cdr: ChangeDetectorRef,
        private readonly translateService: TranslateService
    ) {}

    ngOnInit(): void {
        this.filteredOptions = [...this.options];
        if (this.selected) {
            this.value = this.selected;
        }
    }

    ngAfterViewInit(): void {
        if (this.value) {
            this.focused = true;
            this.cdr.detectChanges();
        }
    }

    toggle() {
        this.isOpen = !this.isOpen;
        this.focused = true;
    }

    select(option: any) {
        if (this.multiple) {
            const exists = this.selectedValues.includes(option.value);

            if (exists) {
                this.selectedValues = this.selectedValues.filter(v => v !== option.value);
            } else {
                this.selectedValues.push(option.value);
            }

            this.value = [...this.selectedValues];
        } else {
            this.value = option.value;
            this.isOpen = false;
        }

        this.valueChange.emit(this.value);
        this.onChange(this.value);
    }

    writeValue(value: any): void {
        this.value = value;

        if (this.multiple && Array.isArray(value)) {
            this.selectedValues = value;
        }

        if (this.value) {
            this.focused = true;
            this.cdr.detectChanges();
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    onBlur(): void {
        this.touched = true;
        this.onTouched();
        this.isOpen = false;
    }

    get hasRequiredError(): boolean {
        return this.required && !this.value;
    }

    get showError(): boolean {
        return this.touched && this.hasRequiredError;
    }

    get selectedLabel(): string {
        if (this.multiple && Array.isArray(this.value)) {
            return this.options
                .filter(o => this.value.includes(o.value))
                .map(o => this.translateService.instant(o.label))
                .join(', ');
        }

        const option = this.options.find(o => o.value === this.value);

        return option ? this.translateService.instant(option.label) : '';
    }

    onSearch(value: string) {
        this.searchTerm = value;

        this.filteredOptions = this.options.filter(o =>
            o.label.toLowerCase().includes(value.toLowerCase())
        );
    }

    onKeyDown(event: KeyboardEvent) {
        if (!this.isOpen) return;

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            this.activeIndex = Math.min(this.activeIndex + 1, this.filteredOptions.length - 1);
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();
            this.activeIndex = Math.max(this.activeIndex - 1, 0);
        }

        if (event.key === 'Enter' && this.activeIndex >= 0) {
            this.select(this.filteredOptions[this.activeIndex]);
        }

        if (event.key === 'Escape') {
            this.isOpen = false;
        }
    }

    @HostListener('document:click', ['$event'])
    handleOutsideClick(event: Event) {
        const target = event.target as HTMLElement;
        if (!target.closest('.select-input-component')) {
            this.isOpen = false;
        }
    }

    highlight(text: string): string {
        const translated = this.translateService.instant(text);

        if (!this.searchTerm) return translated;

        const regex = new RegExp(`(${this.searchTerm})`, 'gi');
        return translated.replace(regex, '<strong>$1</strong>');
    }

    getLabelByValue(value: any): string {
        const option = this.options.find(o => o.value === value);
        return option ? this.translateService.instant(option.label) : '';
    }
}
