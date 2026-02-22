import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentMethod, PaymentDetail } from '../../../core/models/inventory.models';

@Component({
  selector: 'app-payment-method-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="payment-methods">
      <label class="section-label">Payment Methods</label>

      <div *ngFor="let detail of details(); let i = index" class="payment-row">
        <div class="payment-fields">
          <div class="field">
            <label>Method</label>
            <select
              [(ngModel)]="detail.method"
              [name]="'paymentMethod_' + i"
              class="select-input"
              (ngModelChange)="onDetailChange()"
            >
              <option [value]="PaymentMethod.Cash">Cash</option>
              <option [value]="PaymentMethod.Card">Card</option>
              <option [value]="PaymentMethod.Check">Check</option>
              <option [value]="PaymentMethod.AcimaShortTermCredit">Acima</option>
              <option [value]="PaymentMethod.AccountsReceivable">AR</option>
            </select>
          </div>

          <div class="field amount-field">
            <label>Amount</label>
            <input
              type="number"
              [(ngModel)]="detail.amount"
              [name]="'paymentAmount_' + i"
              class="amount-input"
              placeholder="0.00"
              step="0.01"
              min="0"
              (ngModelChange)="onDetailChange()"
            />
          </div>

          <div class="field" *ngIf="detail.method === PaymentMethod.Check">
            <label>Check #</label>
            <input
              type="text"
              [(ngModel)]="detail.checkNumber"
              [name]="'checkNumber_' + i"
              class="check-input"
              placeholder="Check number"
              (ngModelChange)="onDetailChange()"
            />
          </div>

          <button
            type="button"
            class="remove-btn"
            (click)="removeDetail(i)"
            *ngIf="details().length > 1"
            title="Remove"
          >
            &times;
          </button>
        </div>
      </div>

      <button type="button" class="add-btn" (click)="addDetail()">
        + Add Payment Method
      </button>
    </div>
  `,
  styles: [`
    .payment-methods {
      margin-bottom: 1rem;
    }

    .section-label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #404040;
    }

    .payment-row {
      margin-bottom: 0.75rem;
    }

    .payment-fields {
      display: flex;
      gap: 0.75rem;
      align-items: flex-end;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .field label {
      font-size: 0.75rem;
      color: #737373;
    }

    .select-input,
    .amount-input,
    .check-input {
      padding: 0.5rem 0.625rem;
      font-size: 0.875rem;
      border: 1px solid #d4d4d4;
      border-radius: 0.375rem;
      background: #fff;
      color: #404040;
    }

    .select-input:focus,
    .amount-input:focus,
    .check-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .select-input {
      min-width: 130px;
    }

    .amount-field {
      min-width: 120px;
    }

    .amount-input {
      width: 120px;
    }

    .check-input {
      width: 140px;
    }

    .remove-btn {
      padding: 0.5rem 0.75rem;
      font-size: 1.25rem;
      line-height: 1;
      border: 1px solid #fca5a5;
      border-radius: 0.375rem;
      background: #fff;
      color: #dc2626;
      cursor: pointer;
      transition: background 0.15s;
    }

    .remove-btn:hover {
      background: #fef2f2;
    }

    .add-btn {
      padding: 0.375rem 0.75rem;
      font-size: 0.8125rem;
      border: 1px dashed #d4d4d4;
      border-radius: 0.375rem;
      background: #fafafa;
      color: #525252;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
    }

    .add-btn:hover {
      background: #f3f4f6;
      border-color: #a3a3a3;
    }
  `]
})
export class PaymentMethodSelectorComponent {
  @Input() set paymentDetails(value: PaymentDetail[]) {
    if (value && value.length > 0) {
      this.details.set([...value]);
    }
  }
  @Output() paymentDetailsChange = new EventEmitter<PaymentDetail[]>();

  PaymentMethod = PaymentMethod;
  details = signal<PaymentDetail[]>([
    { method: PaymentMethod.Cash, amount: 0 }
  ]);

  addDetail(): void {
    this.details.update(d => [...d, { method: PaymentMethod.Cash, amount: 0 }]);
    this.onDetailChange();
  }

  removeDetail(index: number): void {
    this.details.update(d => d.filter((_, i) => i !== index));
    this.onDetailChange();
  }

  onDetailChange(): void {
    this.paymentDetailsChange.emit([...this.details()]);
  }
}
