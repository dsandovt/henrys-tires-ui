import { Component, Input, Output, EventEmitter, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentMethod, PaymentDetail } from '../../../core/models/inventory.models';

interface PaymentEntry {
  readonly id: string;
  method: PaymentMethod;
  amount: number;
  checkNumber?: string;
}

let entryIdCounter = 0;
function newEntryId(): string {
  return `pe_${++entryIdCounter}_${Date.now()}`;
}

@Component({
  selector: 'app-payment-method-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="payment-methods">
      <label class="section-label">Payment Method</label>

      <div *ngFor="let entry of entries(); let i = index; trackBy: trackById" class="payment-row">
        <div class="payment-fields">
          <div class="field method-field">
            <select
              [ngModel]="entry.method"
              [name]="'method_' + entry.id"
              class="select-input"
              (ngModelChange)="updateEntry(i, { method: $event })"
            >
              <option [value]="PaymentMethod.Cash">Cash</option>
              <option [value]="PaymentMethod.Card">Card</option>
              <option [value]="PaymentMethod.Check">Check</option>
              <option [value]="PaymentMethod.Transfer">Transfer</option>
            </select>
          </div>

          <div class="field amount-field" *ngIf="isMultiple()">
            <input
              type="number"
              [ngModel]="entry.amount"
              [name]="'amount_' + entry.id"
              class="amount-input"
              [class.input-error]="isMultiple() && entry.amount <= 0"
              placeholder="0.00"
              step="0.01"
              min="0"
              (ngModelChange)="updateEntry(i, { amount: $event })"
            />
            <span class="row-error" *ngIf="isMultiple() && entry.amount <= 0">
              Required
            </span>
          </div>

          <div class="field check-field" *ngIf="entry.method === PaymentMethod.Check">
            <input
              type="text"
              [ngModel]="entry.checkNumber"
              [name]="'check_' + entry.id"
              class="check-input"
              [class.input-error]="entry.method === PaymentMethod.Check && !entry.checkNumber?.trim()"
              placeholder="Check #"
              (ngModelChange)="updateEntry(i, { checkNumber: $event })"
            />
            <span class="row-error" *ngIf="entry.method === PaymentMethod.Check && !entry.checkNumber?.trim()">
              Check # required
            </span>
          </div>

          <button
            type="button"
            class="remove-btn"
            (click)="removeEntry(i)"
            *ngIf="entries().length > 1"
            title="Remove"
          >&times;</button>
        </div>
      </div>

      <button
        type="button"
        class="add-btn"
        (click)="addEntry()"
      >+ Add Payment Method</button>

      <!-- Allocation summary when multiple methods -->
      <div
        class="allocation-summary"
        *ngIf="isMultiple()"
        [class.balanced]="isBalanced()"
        [class.unbalanced]="!isBalanced()"
      >
        <div class="summary-row">
          <span>Allocated</span>
          <span>{{ allocatedTotal() | number:'1.2-2' }}</span>
        </div>
        <div class="summary-row">
          <span>Remaining</span>
          <span>{{ remaining() | number:'1.2-2' }}</span>
        </div>
      </div>
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
      margin-bottom: 0.5rem;
    }

    .payment-fields {
      display: flex;
      gap: 0.5rem;
      align-items: flex-start;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .method-field {
      min-width: 140px;
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

    .input-error {
      border-color: #fca5a5;
    }

    .input-error:focus {
      border-color: #dc2626;
      box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
    }

    .row-error {
      font-size: 0.6875rem;
      color: #dc2626;
    }

    .amount-input { width: 120px; }
    .check-input { width: 140px; }

    .remove-btn {
      padding: 0.375rem 0.625rem;
      margin-top: 0.125rem;
      font-size: 1.125rem;
      line-height: 1;
      border: 1px solid #e5e7eb;
      border-radius: 0.375rem;
      background: #fff;
      color: #a3a3a3;
      cursor: pointer;
      transition: color 0.15s, border-color 0.15s;
    }

    .remove-btn:hover {
      color: #dc2626;
      border-color: #fca5a5;
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
      margin-top: 0.25rem;
    }

    .add-btn:hover {
      background: #f3f4f6;
      border-color: #a3a3a3;
    }

    .allocation-summary {
      margin-top: 0.5rem;
      padding: 0.5rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.8125rem;
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
      padding: 0.125rem 0;
    }

    .summary-row span:first-child {
      color: #525252;
    }

    .summary-row span:last-child {
      font-weight: 600;
    }
  `]
})
export class PaymentMethodSelectorComponent {
  @Input() saleTotal = 0;
  @Output() paymentDetailsChange = new EventEmitter<PaymentDetail[]>();
  @Output() validityChange = new EventEmitter<boolean>();

  PaymentMethod = PaymentMethod;
  entries = signal<PaymentEntry[]>([{
    id: newEntryId(),
    method: PaymentMethod.Cash,
    amount: 0
  }]);

  isMultiple = computed(() => this.entries().length >= 2);
  allocatedTotal = computed(() => this.entries().reduce((sum, e) => sum + (e.amount || 0), 0));
  remaining = computed(() => this.saleTotal - this.allocatedTotal());
  isBalanced = computed(() => Math.abs(this.remaining()) < 0.01);

  isValid = computed(() => {
    const entries = this.entries();
    if (entries.length === 1) {
      // Single method — only check # validation for Check
      if (entries[0].method === PaymentMethod.Check && !entries[0].checkNumber?.trim()) return false;
      return true;
    }
    // Multiple methods — amounts must balance and be > 0, check # required for checks
    if (!this.isBalanced()) return false;
    for (const e of entries) {
      if (!e.amount || e.amount <= 0) return false;
      if (e.method === PaymentMethod.Check && !e.checkNumber?.trim()) return false;
    }
    return true;
  });

  constructor() {
    effect(() => {
      this.validityChange.emit(this.isValid());
    });
  }

  trackById(_index: number, entry: PaymentEntry): string {
    return entry.id;
  }

  // Proposal A: immutable update by index
  updateEntry(index: number, patch: Partial<Omit<PaymentEntry, 'id'>>): void {
    this.entries.update(entries =>
      entries.map((e, i) => i === index ? { ...e, ...patch } : e)
    );
    this.emitDetails();
  }

  // Proposal D: auto-fill first entry with total when adding second
  addEntry(): void {
    this.entries.update(entries => {
      const updated = entries.length === 1
        ? [{ ...entries[0], amount: this.saleTotal }]
        : [...entries];
      return [
        ...updated,
        { id: newEntryId(), method: PaymentMethod.Cash, amount: 0 }
      ];
    });
    this.emitDetails();
  }

  removeEntry(index: number): void {
    this.entries.update(entries => entries.filter((_, i) => i !== index));
    this.emitDetails();
  }

  private emitDetails(): void {
    this.paymentDetailsChange.emit(
      this.entries().map(e => ({
        method: e.method,
        amount: e.amount,
        checkNumber: e.checkNumber
      }))
    );
  }
}
