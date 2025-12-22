import { Component, Input, Output, EventEmitter, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

export interface SelectOption {
  value: string;
  label: string;
  subtitle?: string;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="select-wrapper">
      <label *ngIf="label" [for]="name" class="select-label">
        {{ label }}
        <span *ngIf="required" class="required">*</span>
      </label>

      <div class="select-container" [class.select-container--error]="error" [class.select-container--disabled]="disabled">
        <input
          type="text"
          [id]="name"
          [name]="name"
          class="select-input"
          [placeholder]="placeholder"
          [(ngModel)]="searchTerm"
          (focus)="onFocus()"
          (blur)="onBlur()"
          (input)="onSearch()"
          [disabled]="disabled"
          [attr.aria-required]="required"
          [attr.aria-invalid]="error ? 'true' : null"
          autocomplete="off"
        />

        <div class="select-dropdown" *ngIf="isOpen() && filteredOptions().length > 0">
          <div
            *ngFor="let option of filteredOptions()"
            class="select-option"
            (mousedown)="selectOption(option)"
          >
            <div class="option-label">{{ option.label }}</div>
            <div *ngIf="option.subtitle" class="option-subtitle">{{ option.subtitle }}</div>
          </div>
        </div>

        <div class="select-dropdown empty" *ngIf="isOpen() && filteredOptions().length === 0 && searchTerm">
          <div class="select-option disabled">No results found</div>
        </div>
      </div>

      <span *ngIf="hint && !error" class="select-hint">{{ hint }}</span>
      <span *ngIf="error" class="select-error">{{ error }}</span>
    </div>
  `,
  styles: [`
    .select-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .select-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #404040;
    }

    .required {
      color: #dc2626;
      margin-left: 0.125rem;
    }

    .select-container {
      position: relative;
    }

    .select-input {
      width: 100%;
      padding: 0.625rem 0.75rem;
      font-size: 0.9375rem;
      line-height: 1.5;
      color: #404040;
      background-color: #ffffff;
      border: 1px solid #d4d4d4;
      border-radius: 0.375rem;
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }

    .select-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .select-input:disabled {
      background-color: #f9fafb;
      color: #9ca3af;
      cursor: not-allowed;
    }

    .select-container--error .select-input {
      border-color: #dc2626;
    }

    .select-container--error .select-input:focus {
      box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
    }

    .select-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin-top: 0.25rem;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 0.375rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      max-height: 16rem;
      overflow-y: auto;
      z-index: 50;
    }

    .select-dropdown.empty {
      max-height: 4rem;
    }

    .select-option {
      padding: 0.75rem 1rem;
      cursor: pointer;
      transition: background-color 0.15s ease;
    }

    .select-option:hover {
      background-color: #f9fafb;
    }

    .select-option.disabled {
      color: #9ca3af;
      cursor: not-allowed;
    }

    .select-option.disabled:hover {
      background-color: transparent;
    }

    .option-label {
      font-size: 0.9375rem;
      font-weight: 500;
      color: #111827;
    }

    .option-subtitle {
      font-size: 0.8125rem;
      color: #6b7280;
      margin-top: 0.125rem;
    }

    .select-hint {
      font-size: 0.8125rem;
      color: #737373;
    }

    .select-error {
      font-size: 0.8125rem;
      color: #dc2626;
    }

    /* Custom scrollbar */
    .select-dropdown::-webkit-scrollbar {
      width: 8px;
    }

    .select-dropdown::-webkit-scrollbar-track {
      background: #f9fafb;
      border-radius: 4px;
    }

    .select-dropdown::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 4px;
    }

    .select-dropdown::-webkit-scrollbar-thumb:hover {
      background: #9ca3af;
    }
  `]
})
export class SelectComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() name = '';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() options: SelectOption[] = [];

  @Output() selectionChange = new EventEmitter<string>();

  searchTerm = '';
  isOpen = signal(false);
  filteredOptions = signal<SelectOption[]>([]);

  private value: string = '';
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit() {
    this.filteredOptions.set(this.options);
  }

  ngOnChanges() {
    this.filterOptions();
  }

  writeValue(value: string): void {
    this.value = value || '';
    // Find the option and set the search term to its label
    const option = this.options.find(o => o.value === value);
    this.searchTerm = option ? option.label : '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onFocus(): void {
    this.isOpen.set(true);
    this.filterOptions();
  }

  onBlur(): void {
    setTimeout(() => {
      this.isOpen.set(false);
      this.onTouched();

      // If search term doesn't match the current value's label, reset it
      const currentOption = this.options.find(o => o.value === this.value);
      if (!currentOption || this.searchTerm !== currentOption.label) {
        this.searchTerm = currentOption ? currentOption.label : '';
      }
    }, 200);
  }

  onSearch(): void {
    this.filterOptions();
  }

  selectOption(option: SelectOption): void {
    this.value = option.value;
    this.searchTerm = option.label;
    this.onChange(this.value);
    this.selectionChange.emit(this.value);
    this.isOpen.set(false);
  }

  private filterOptions(): void {
    if (!this.searchTerm.trim()) {
      this.filteredOptions.set(this.options);
      return;
    }

    const search = this.searchTerm.toLowerCase();
    const filtered = this.options.filter(option =>
      option.label.toLowerCase().includes(search) ||
      (option.subtitle && option.subtitle.toLowerCase().includes(search)) ||
      option.value.toLowerCase().includes(search)
    );
    this.filteredOptions.set(filtered);
  }
}
