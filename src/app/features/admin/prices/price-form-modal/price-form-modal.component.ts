import { Component, EventEmitter, Output, ViewChild, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';
import { PricesService } from '../../../../core/services/prices.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { ConsumableItemPrice } from '../../../../core/models/inventory.models';

@Component({
  selector: 'app-price-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent,
    InputComponent,
    ButtonComponent,
    AlertComponent
  ],
  template: `
    <app-modal #modal title="Update Item Price" subtitle="Modify the selling price for this product" (closeModal)="onCancel()">
      <form (ngSubmit)="onSubmit()">
        <app-alert
          *ngIf="error()"
          variant="danger"
          [dismissible]="true"
          (close)="error.set('')"
        >
          {{ error() }}
        </app-alert>

        <div class="form-group">
          <app-input
            [(ngModel)]="itemCode"
            name="itemCode"
            label="Item Code"
            type="text"
            [disabled]="true"
          ></app-input>
        </div>

        <div class="form-group">
          <app-input
            [(ngModel)]="currentPrice"
            name="currentPrice"
            label="Current Price"
            type="text"
            [disabled]="true"
            hint="Current price for reference"
          ></app-input>
        </div>

        <div class="form-group">
          <app-input
            [(ngModel)]="newPrice"
            name="newPrice"
            label="New Price"
            type="number"
            step="0.01"
            min="0"
            placeholder="Enter new price"
            [required]="true"
            [error]="priceError()"
          ></app-input>
        </div>

        <div class="form-group">
          <app-input
            [(ngModel)]="currency"
            name="currency"
            label="Currency"
            type="text"
            placeholder="USD"
            [required]="true"
            [error]="currencyError()"
            hint="ISO currency code (e.g., USD, EUR)"
          ></app-input>
        </div>

        <div *ngIf="priceHistory().length > 0" class="price-history">
          <h4 class="history-title">Price History</h4>
          <div class="history-list">
            <div *ngFor="let entry of priceHistory()" class="history-entry">
              <span class="history-price">{{ entry.currency }} {{ entry.price.toFixed(2) }}</span>
              <span class="history-date">{{ formatDate(entry.changedAtUtc) }}</span>
              <span class="history-user">{{ entry.changedBy }}</span>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <app-button
            type="button"
            variant="secondary"
            (click)="onCancel()"
            [disabled]="loading()"
          >
            Cancel
          </app-button>
          <app-button
            type="submit"
            variant="primary"
            [loading]="loading()"
            [disabled]="!isFormValid()"
          >
            Update Price
          </app-button>
        </div>
      </form>
    </app-modal>
  `,
  styles: [`
    .form-group {
      margin-bottom: var(--space-4);
    }

    .price-history {
      margin: var(--space-6) 0;
      padding: var(--space-4);
      background-color: #f9fafb;
      border-radius: 0.375rem;
      border: 1px solid #e5e7eb;
    }

    .history-title {
      margin: 0 0 var(--space-3);
      font-size: 0.875rem;
      font-weight: 600;
      color: #404040;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      max-height: 12rem;
      overflow-y: auto;
    }

    .history-entry {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: var(--space-3);
      padding: var(--space-2) var(--space-3);
      background-color: #ffffff;
      border-radius: 0.25rem;
      font-size: 0.8125rem;
    }

    .history-price {
      font-weight: 600;
      color: #404040;
    }

    .history-date {
      color: #737373;
    }

    .history-user {
      color: #737373;
      font-style: italic;
    }

    .form-actions {
      display: flex;
      gap: var(--space-3);
      justify-content: flex-end;
      margin-top: var(--space-6);
      padding-top: var(--space-6);
      border-top: 1px solid var(--color-border);
    }
  `]
})
export class PriceFormModalComponent {
  @ViewChild('modal') modal!: ModalComponent;
  @Output() priceSaved = new EventEmitter<ConsumableItemPrice>();

  private pricesService = inject(PricesService);
  private toastService = inject(ToastService);

  // Form fields
  itemCode = '';
  currentPrice = '';
  newPrice: number | null = null;
  currency = 'USD';

  // State
  loading = signal(false);
  error = signal('');
  priceError = signal('');
  currencyError = signal('');
  priceHistory = signal<Array<{
    price: number;
    currency: string;
    changedAtUtc: string;
    changedBy: string;
  }>>([]);

  open(price: ConsumableItemPrice): void {
    this.itemCode = price.itemCode;
    this.currentPrice = `${price.currency} ${price.latestPrice.toFixed(2)}`;
    this.newPrice = null;
    this.currency = price.currency;
    this.priceHistory.set(price.priceHistory || []);

    this.clearErrors();
    this.modal.open();
  }

  close(): void {
    this.modal.close();
    this.resetForm();
  }

  isFormValid(): boolean {
    return this.newPrice !== null && this.newPrice > 0 && this.currency.trim().length > 0;
  }

  validateForm(): boolean {
    this.clearErrors();

    if (this.newPrice === null || this.newPrice <= 0) {
      this.priceError.set('Price must be greater than 0');
      return false;
    }

    if (!this.currency.trim()) {
      this.currencyError.set('Currency is required');
      return false;
    }

    if (this.currency.trim().length !== 3) {
      this.currencyError.set('Currency must be a 3-letter ISO code');
      return false;
    }

    return true;
  }

  clearErrors(): void {
    this.error.set('');
    this.priceError.set('');
    this.currencyError.set('');
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.pricesService.updatePrice(this.itemCode, {
      itemCode: this.itemCode,
      newPrice: this.newPrice!,
      currency: this.currency.trim().toUpperCase()
    }).subscribe({
      next: (updatedPrice) => {
        this.loading.set(false);
        this.toastService.success('Price updated successfully');
        this.priceSaved.emit(updatedPrice);
        this.close();
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Update price error:', err);
        this.error.set(err.error?.errorMessage || 'Failed to update price. Please try again.');
      }
    });
  }

  onCancel(): void {
    this.close();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private resetForm(): void {
    this.itemCode = '';
    this.currentPrice = '';
    this.newPrice = null;
    this.currency = 'USD';
    this.priceHistory.set([]);
    this.clearErrors();
    this.loading.set(false);
  }
}
