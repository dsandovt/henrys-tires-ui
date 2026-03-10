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
      <label class="section-label">Payment Method</label>

      <div class="primary-method">
        <select
          [(ngModel)]="primaryMethod"
          name="primaryMethod"
          class="select-input"
          (ngModelChange)="onPrimaryMethodChange()"
        >
          <option [value]="PaymentMethod.Cash">Cash</option>
          <option [value]="PaymentMethod.Card">Card</option>
          <option [value]="PaymentMethod.Check">Check</option>
          <option [value]="PaymentMethod.Transfer">Transfer</option>
          <option [value]="PaymentMethod.Mixed">Mixed</option>
        </select>
      </div>

      <!-- Check number for single Check payment -->
      <div class="check-field" *ngIf="primaryMethod === PaymentMethod.Check">
        <label>Check Number *</label>
        <input
          type="text"
          [(ngModel)]="checkNumber"
          name="checkNumber"
          class="check-input"
          placeholder="Enter check number"
          (ngModelChange)="onCheckNumberChange()"
        />
      </div>

      <!-- Mixed summary -->
      <div class="mixed-summary" *ngIf="primaryMethod === PaymentMethod.Mixed && mixedDetails().length > 0">
        <div class="mixed-detail" *ngFor="let d of mixedDetails()">
          <span>{{ d.method }}</span>
          <span>{{ d.amount | number:'1.2-2' }}</span>
        </div>
        <button type="button" class="edit-btn" (click)="requestMixedEdit()">Edit Allocation</button>
      </div>

      <div class="mixed-prompt" *ngIf="primaryMethod === PaymentMethod.Mixed && mixedDetails().length === 0">
        <span class="prompt-text">Click to allocate payment across methods</span>
        <button type="button" class="edit-btn" (click)="requestMixedEdit()">Set Up Mixed Payment</button>
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

    .primary-method {
      margin-bottom: 0.75rem;
    }

    .select-input {
      padding: 0.5rem 0.625rem;
      font-size: 0.875rem;
      border: 1px solid #d4d4d4;
      border-radius: 0.375rem;
      background: #fff;
      color: #404040;
      min-width: 200px;
    }

    .select-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .check-field {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-bottom: 0.75rem;
    }

    .check-field label {
      font-size: 0.75rem;
      color: #737373;
    }

    .check-input {
      padding: 0.5rem 0.625rem;
      font-size: 0.875rem;
      border: 1px solid #d4d4d4;
      border-radius: 0.375rem;
      background: #fff;
      color: #404040;
      max-width: 250px;
    }

    .check-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .mixed-summary {
      padding: 0.75rem;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 0.375rem;
    }

    .mixed-detail {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
      padding: 0.25rem 0;
      color: #525252;
    }

    .mixed-prompt {
      padding: 0.75rem;
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 0.375rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .prompt-text {
      font-size: 0.8125rem;
      color: #92400e;
    }

    .edit-btn {
      align-self: flex-start;
      padding: 0.375rem 0.75rem;
      font-size: 0.8125rem;
      border: 1px solid #d4d4d4;
      border-radius: 0.375rem;
      background: #fff;
      color: #404040;
      cursor: pointer;
      transition: background 0.15s;
    }

    .edit-btn:hover {
      background: #f3f4f6;
    }
  `]
})
export class PaymentMethodSelectorComponent {
  @Input() set paymentDetails(value: PaymentDetail[]) {
    if (value && value.length > 0) {
      // Detect if this is a mixed setup (2+ details)
      if (value.length >= 2) {
        this.primaryMethod = PaymentMethod.Mixed;
        this.mixedDetails.set([...value]);
      } else {
        this.primaryMethod = value[0].method;
        this.checkNumber = value[0].checkNumber || '';
        this.mixedDetails.set([]);
      }
    }
  }
  @Output() paymentDetailsChange = new EventEmitter<PaymentDetail[]>();
  @Output() mixedEditRequested = new EventEmitter<PaymentDetail[]>();

  PaymentMethod = PaymentMethod;
  primaryMethod: PaymentMethod = PaymentMethod.Cash;
  checkNumber = '';
  mixedDetails = signal<PaymentDetail[]>([]);

  onPrimaryMethodChange(): void {
    if (this.primaryMethod === PaymentMethod.Mixed) {
      this.requestMixedEdit();
    } else {
      this.mixedDetails.set([]);
      this.checkNumber = '';
      this.emitDetails();
    }
  }

  onCheckNumberChange(): void {
    this.emitDetails();
  }

  requestMixedEdit(): void {
    this.mixedEditRequested.emit([...this.mixedDetails()]);
  }

  setMixedDetails(details: PaymentDetail[]): void {
    this.mixedDetails.set([...details]);
    this.primaryMethod = PaymentMethod.Mixed;
    this.paymentDetailsChange.emit([...details]);
  }

  private emitDetails(): void {
    const detail: PaymentDetail = {
      method: this.primaryMethod,
      amount: 0,
      checkNumber: this.primaryMethod === PaymentMethod.Check ? this.checkNumber : undefined
    };
    this.paymentDetailsChange.emit([detail]);
  }
}
