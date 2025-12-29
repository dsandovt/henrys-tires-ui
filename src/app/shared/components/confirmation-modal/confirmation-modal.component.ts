import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

export interface ConfirmationItem {
  sku: string;
  description: string;
  quantity: number;
  price?: number;
  currency?: string;
  condition?: string;
}

export interface ConfirmationData {
  type: 'Sale' | 'Transfer In' | 'Transfer Out';
  branch: string;
  items: ConfirmationItem[];
  totalItems: number;
  totalQuantity: number;
  totalAmount?: number;
  currency?: string;
  paymentMethod?: string;
  notes?: string;
}

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="modal-overlay" *ngIf="isOpen()" (click)="onOverlayClick($event)">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Confirm {{ data()?.type }}</h2>
          <button class="close-btn" (click)="onCancel()" [disabled]="loading()">×</button>
        </div>

        <div class="modal-body" *ngIf="data() as confirmData">
          <div class="warning-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>Please review the details before confirming. This action will be recorded.</span>
          </div>

          <div class="summary-section">
            <div class="summary-row">
              <span class="label">Type:</span>
              <span class="value">{{ confirmData.type }}</span>
            </div>
            <div class="summary-row">
              <span class="label">Branch:</span>
              <span class="value">{{ confirmData.branch }}</span>
            </div>
            <div class="summary-row" *ngIf="confirmData.paymentMethod">
              <span class="label">Payment Method:</span>
              <span class="value">{{ confirmData.paymentMethod }}</span>
            </div>
          </div>

          <div class="items-section">
            <h3>Items ({{ confirmData.totalItems }})</h3>
            <div class="items-table">
              <div class="items-header">
                <div class="col-sku">SKU</div>
                <div class="col-description">Description</div>
                <div class="col-condition" *ngIf="hasCondition()">Condition</div>
                <div class="col-qty">Qty</div>
                <div class="col-price" *ngIf="hasPrice()">Price</div>
              </div>
              <div class="items-body">
                <div class="item-row" *ngFor="let item of confirmData.items">
                  <div class="col-sku">{{ item.sku }}</div>
                  <div class="col-description">{{ item.description }}</div>
                  <div class="col-condition" *ngIf="hasCondition()">{{ item.condition || '-' }}</div>
                  <div class="col-qty">{{ item.quantity }}</div>
                  <div class="col-price" *ngIf="hasPrice()">
                    {{ item.currency }} {{ item.price | number:'1.2-2' }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="totals-section">
            <div class="total-row">
              <span class="label">Total Items:</span>
              <span class="value">{{ confirmData.totalItems }}</span>
            </div>
            <div class="total-row">
              <span class="label">Total Quantity:</span>
              <span class="value">{{ confirmData.totalQuantity }}</span>
            </div>
            <div class="total-row grand-total" *ngIf="confirmData.totalAmount !== undefined">
              <span class="label">Total Amount:</span>
              <span class="value">{{ confirmData.currency }} {{ confirmData.totalAmount | number:'1.2-2' }}</span>
            </div>
          </div>

          <div class="notes-section" *ngIf="confirmData.notes">
            <p class="label">Notes:</p>
            <p class="notes-text">{{ confirmData.notes }}</p>
          </div>

          <div class="error-message" *ngIf="error()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{{ error() }}</span>
          </div>
        </div>

        <div class="modal-footer">
          <app-button
            variant="secondary"
            (click)="onCancel()"
            [disabled]="loading()"
          >
            Cancel
          </app-button>
          <app-button
            variant="primary"
            (click)="onConfirm()"
            [loading]="loading()"
            [disabled]="loading()"
          >
            Confirm
          </app-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .modal-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      max-width: 700px;
      width: 90%;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      animation: slideUp 0.2s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #6b7280;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.15s;
    }

    .close-btn:hover:not(:disabled) {
      background: #f3f4f6;
      color: #111827;
    }

    .close-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .modal-body {
      padding: 1.5rem;
      overflow-y: auto;
      flex: 1;
    }

    .warning-message {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-radius: 6px;
      margin-bottom: 1.5rem;
      color: #92400e;
      font-size: 0.875rem;
    }

    .warning-message svg {
      flex-shrink: 0;
      margin-top: 2px;
      color: #f59e0b;
    }

    .summary-section {
      margin-bottom: 1.5rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #f3f4f6;
    }

    .summary-row:last-child {
      border-bottom: none;
    }

    .label {
      font-weight: 500;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .value {
      color: #111827;
      font-weight: 500;
    }

    .items-section {
      margin-bottom: 1.5rem;
    }

    .items-section h3 {
      font-size: 0.875rem;
      font-weight: 600;
      color: #111827;
      margin: 0 0 0.75rem 0;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .items-table {
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      overflow: hidden;
    }

    .items-header {
      display: grid;
      grid-template-columns: 1.5fr 3fr 1fr 1fr;
      background: #f9fafb;
      padding: 0.75rem 1rem;
      font-weight: 600;
      font-size: 0.75rem;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .items-header.with-condition {
      grid-template-columns: 1.5fr 2.5fr 1fr 1fr;
    }

    .items-header.with-price {
      grid-template-columns: 1.5fr 2fr 1fr 1fr 1fr;
    }

    .items-header.with-condition.with-price {
      grid-template-columns: 1.2fr 2fr 1fr 0.8fr 1fr;
    }

    .items-body {
      max-height: 300px;
      overflow-y: auto;
    }

    .item-row {
      display: grid;
      grid-template-columns: 1.5fr 3fr 1fr 1fr;
      padding: 0.75rem 1rem;
      border-top: 1px solid #f3f4f6;
      font-size: 0.875rem;
    }

    .item-row.with-condition {
      grid-template-columns: 1.5fr 2.5fr 1fr 1fr;
    }

    .item-row.with-price {
      grid-template-columns: 1.5fr 2fr 1fr 1fr 1fr;
    }

    .item-row.with-condition.with-price {
      grid-template-columns: 1.2fr 2fr 1fr 0.8fr 1fr;
    }

    .col-description {
      color: #6b7280;
    }

    .col-qty, .col-price {
      text-align: right;
    }

    .totals-section {
      background: #f9fafb;
      border-radius: 6px;
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
    }

    .total-row.grand-total {
      border-top: 2px solid #e5e7eb;
      padding-top: 0.75rem;
      margin-top: 0.5rem;
      font-weight: 600;
      font-size: 1rem;
    }

    .notes-section {
      background: #f9fafb;
      border-radius: 6px;
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .notes-section .label {
      margin: 0 0 0.5rem 0;
    }

    .notes-text {
      margin: 0;
      color: #111827;
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .error-message {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 6px;
      margin-top: 1rem;
      color: #991b1b;
      font-size: 0.875rem;
    }

    .error-message svg {
      flex-shrink: 0;
      margin-top: 2px;
      color: #ef4444;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }
  `]
})
export class ConfirmationModalComponent {
  @Input() set open(value: boolean) {
    this.isOpen.set(value);
    if (value) {
      this.error.set('');
      this.loading.set(false);
      this.setupEscapeListener();
    } else {
      this.removeEscapeListener();
    }
  }

  @Input() set confirmationData(value: ConfirmationData | null) {
    this.data.set(value);
  }

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  isOpen = signal(false);
  data = signal<ConfirmationData | null>(null);
  loading = signal(false);
  error = signal('');

  private escapeHandler = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && !this.loading()) {
      this.onCancel();
    }
  };

  hasPrice(): boolean {
    const items = this.data()?.items || [];
    return items.some(item => item.price !== undefined);
  }

  hasCondition(): boolean {
    const items = this.data()?.items || [];
    return items.some(item => item.condition !== undefined);
  }

  onOverlayClick(event: MouseEvent) {
    if (!this.loading()) {
      this.onCancel();
    }
  }

  onConfirm() {
    if (!this.loading()) {
      this.loading.set(true);
      this.error.set('');
      this.confirm.emit();
    }
  }

  onCancel() {
    if (!this.loading()) {
      this.cancel.emit();
    }
  }

  setError(message: string) {
    this.error.set(message);
    this.loading.set(false);
  }

  close() {
    this.isOpen.set(false);
    this.removeEscapeListener();
  }

  private setupEscapeListener() {
    document.addEventListener('keydown', this.escapeHandler);
  }

  private removeEscapeListener() {
    document.removeEventListener('keydown', this.escapeHandler);
  }
}
