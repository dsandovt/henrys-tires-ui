import { Component, EventEmitter, Input, Output, ViewChild, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../modal/modal.component';
import { ButtonComponent } from '../button/button.component';
import { AlertComponent } from '../alert/alert.component';
import { PaymentMethod, PaymentDetail } from '../../../core/models/inventory.models';

@Component({
  selector: 'app-mixed-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, ButtonComponent, AlertComponent],
  template: `
    <app-modal #modal title="Mixed Payment" subtitle="Allocate payment across multiple methods" size="md" (closeModal)="onCancel()">
      <div class="mixed-payment-form">
        <div class="total-banner">
          <span class="total-label">Sale Total</span>
          <span class="total-amount">{{ saleTotal | number:'1.2-2' }} {{ currency }}</span>
        </div>

        <app-alert *ngIf="error()" variant="danger" [dismissible]="true" (close)="error.set('')">
          {{ error() }}
        </app-alert>

        <div *ngFor="let detail of details(); let i = index" class="payment-row">
          <div class="payment-fields">
            <div class="field">
              <label>Method</label>
              <select
                [(ngModel)]="detail.method"
                [name]="'method_' + i"
                class="select-input"
                (ngModelChange)="onDetailChange()"
              >
                <option [value]="PaymentMethod.Cash">Cash</option>
                <option [value]="PaymentMethod.Card">Card</option>
                <option [value]="PaymentMethod.Check">Check</option>
                <option [value]="PaymentMethod.Transfer">Transfer</option>
              </select>
            </div>

            <div class="field amount-field">
              <label>Amount</label>
              <input
                type="number"
                [(ngModel)]="detail.amount"
                [name]="'amount_' + i"
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
                [name]="'check_' + i"
                class="check-input"
                placeholder="Check number"
                (ngModelChange)="onDetailChange()"
              />
            </div>

            <button
              type="button"
              class="remove-btn"
              (click)="removeDetail(i)"
              *ngIf="details().length > 2"
              title="Remove"
            >&times;</button>
          </div>
        </div>

        <button type="button" class="add-btn" (click)="addDetail()">+ Add Payment Method</button>

        <div class="allocation-summary" [class.balanced]="isBalanced()" [class.unbalanced]="!isBalanced()">
          <div class="summary-row">
            <span>Allocated</span>
            <span>{{ allocatedTotal() | number:'1.2-2' }} {{ currency }}</span>
          </div>
          <div class="summary-row">
            <span>Remaining</span>
            <span>{{ remaining() | number:'1.2-2' }} {{ currency }}</span>
          </div>
        </div>

        <div class="form-actions">
          <app-button type="button" variant="secondary" (click)="onCancel()">Cancel</app-button>
          <app-button type="button" variant="primary" [disabled]="!isValid()" (click)="onConfirm()">Confirm Allocation</app-button>
        </div>
      </div>
    </app-modal>
  `,
  styles: [`
    .mixed-payment-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .total-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 0.5rem;
    }

    .total-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #0369a1;
    }

    .total-amount {
      font-size: 1.125rem;
      font-weight: 600;
      color: #0c4a6e;
    }

    .payment-row {
      margin-bottom: 0.5rem;
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

    .select-input { min-width: 130px; }
    .amount-field { min-width: 120px; }
    .amount-input { width: 120px; }
    .check-input { width: 140px; }

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

    .remove-btn:hover { background: #fef2f2; }

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

    .allocation-summary {
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
    }

    .allocation-summary.balanced {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
    }

    .allocation-summary.unbalanced {
      background: #fef2f2;
      border: 1px solid #fecaca;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 0.25rem 0;
    }

    .summary-row span:first-child {
      color: #525252;
    }

    .summary-row span:last-child {
      font-weight: 600;
    }

    .form-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      margin-top: 0.5rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }
  `]
})
export class MixedPaymentModalComponent {
  @ViewChild('modal') modal!: ModalComponent;
  @Input() saleTotal = 0;
  @Input() currency = 'USD';
  @Output() confirmed = new EventEmitter<PaymentDetail[]>();
  @Output() cancelled = new EventEmitter<void>();

  PaymentMethod = PaymentMethod;
  details = signal<PaymentDetail[]>([
    { method: PaymentMethod.Cash, amount: 0 },
    { method: PaymentMethod.Card, amount: 0 }
  ]);
  error = signal('');

  allocatedTotal = computed(() => this.details().reduce((sum, d) => sum + (d.amount || 0), 0));
  remaining = computed(() => this.saleTotal - this.allocatedTotal());
  isBalanced = computed(() => Math.abs(this.remaining()) < 0.01);

  isValid = computed(() => {
    const dets = this.details();
    if (dets.length < 2) return false;
    if (!this.isBalanced()) return false;
    for (const d of dets) {
      if (!d.amount || d.amount <= 0) return false;
      if (d.method === PaymentMethod.Check && !d.checkNumber?.trim()) return false;
    }
    return true;
  });

  open(existingDetails?: PaymentDetail[]): void {
    if (existingDetails && existingDetails.length >= 2) {
      this.details.set(existingDetails.map(d => ({ ...d })));
    } else {
      this.details.set([
        { method: PaymentMethod.Cash, amount: 0 },
        { method: PaymentMethod.Card, amount: 0 }
      ]);
    }
    this.error.set('');
    this.modal.open();
  }

  close(): void {
    this.modal.close();
  }

  addDetail(): void {
    this.details.update(d => [...d, { method: PaymentMethod.Cash, amount: 0 }]);
    this.onDetailChange();
  }

  removeDetail(index: number): void {
    this.details.update(d => d.filter((_, i) => i !== index));
    this.onDetailChange();
  }

  onDetailChange(): void {
    this.error.set('');
  }

  onConfirm(): void {
    if (!this.isValid()) {
      this.error.set('Please ensure all amounts are filled and the total matches the sale total.');
      return;
    }
    this.confirmed.emit([...this.details()]);
    this.close();
  }

  onCancel(): void {
    this.cancelled.emit();
    this.close();
  }
}
