import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="input-wrapper">
      <label *ngIf="label" [for]="id" class="input-label">
        {{ label }}
        <span *ngIf="required" class="required-mark">*</span>
      </label>

      <div class="input-container">
        <input
          [id]="id"
          [type]="type"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [(ngModel)]="value"
          (blur)="onTouched()"
          [class]="inputClasses"
        />
        <span *ngIf="error" class="error-icon">!</span>
      </div>

      <p *ngIf="error" class="error-message">{{ error }}</p>
      <p *ngIf="hint && !error" class="hint-message">{{ hint }}</p>
    </div>
  `,
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements ControlValueAccessor {
  @Input() id = `input-${Math.random().toString(36).substr(2, 9)}`;
  @Input() label = '';
  @Input() type: 'text' | 'password' | 'email' | 'number' | 'date' | 'datetime-local' = 'text';
  @Input() placeholder = '';
  @Input() error = '';
  @Input() hint = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() readonly = false;

  private _value = '';

  get value(): string {
    return this._value;
  }

  set value(val: string) {
    this._value = val;
    this.onChange(val);
  }

  get inputClasses(): string {
    return [
      'input',
      this.error ? 'input-error' : '',
      this.disabled ? 'input-disabled' : ''
    ].filter(Boolean).join(' ');
  }

  // ControlValueAccessor implementation
  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    this._value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
