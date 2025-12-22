import { Component, EventEmitter, Output, ViewChild, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';
import { ItemsService } from '../../../../core/services/items.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { Item } from '../../../../core/models/inventory.models';

@Component({
  selector: 'app-item-form-modal',
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
    <app-modal #modal [title]="modalTitle()" [subtitle]="modalSubtitle()" (closeModal)="onCancel()">
      <form (ngSubmit)="onSubmit()" class="modal-form">
        <app-alert
          *ngIf="error()"
          variant="danger"
          [dismissible]="true"
          (close)="error.set('')"
        >
          {{ error() }}
        </app-alert>

        <div class="form-section">
          <div class="form-group">
            <app-input
              [(ngModel)]="itemCode"
              name="itemCode"
              label="Item Code"
              type="text"
              placeholder="e.g., TIRE-001"
              [required]="true"
              [disabled]="isEditMode()"
              [error]="itemCodeError()"
            ></app-input>
            <p class="field-hint" *ngIf="!isEditMode()">Unique identifier for this item</p>
          </div>

          <div class="form-group">
            <app-input
              [(ngModel)]="description"
              name="description"
              label="Description"
              type="text"
              placeholder="e.g., Michelin Performance Tire 205/55 R16"
              [required]="true"
              [error]="descriptionError()"
            ></app-input>
          </div>

          <div class="form-group">
            <label for="classification" class="form-label">Type *</label>
            <select
              id="classification"
              [(ngModel)]="classification"
              name="classification"
              class="form-select"
              [disabled]="isEditMode()"
              required
            >
              <option value="">Select type...</option>
              <option value="Good">Good (Physical Product)</option>
              <option value="Service">Service</option>
            </select>
            <p class="field-hint">Goods affect inventory, Services do not</p>
          </div>
        </div>

        <div *ngIf="!isEditMode()" class="form-section pricing-section">
          <div class="section-header">
            <h4 class="section-title">Pricing</h4>
            <span class="section-badge">Optional</span>
          </div>
          <p class="section-description">Set the initial selling price. You can update this later in the Prices page.</p>

          <div class="form-row">
            <div class="form-group form-group-flex-2">
              <app-input
                [(ngModel)]="initialPrice"
                name="initialPrice"
                label="Price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                [error]="priceError()"
              ></app-input>
            </div>

            <div class="form-group form-group-flex-1">
              <app-input
                [(ngModel)]="currency"
                name="currency"
                label="Currency"
                type="text"
                placeholder="USD"
              ></app-input>
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
            {{ submitButtonText() }}
          </app-button>
        </div>
      </form>
    </app-modal>
  `,
  styles: [`
    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      margin-bottom: 2rem;
    }

    .form-section:last-of-type {
      margin-bottom: 0;
    }

    .form-group {
      position: relative;
    }

    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    .form-select {
      width: 100%;
      padding: 0.625rem 0.75rem;
      font-size: 0.875rem;
      line-height: 1.5;
      color: #111827;
      background-color: #ffffff;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }

    .form-select:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .form-select:disabled {
      background-color: #f3f4f6;
      color: #6b7280;
      cursor: not-allowed;
    }

    .field-hint {
      margin: 0.375rem 0 0;
      font-size: 0.8125rem;
      color: #6b7280;
      line-height: 1.4;
    }

    .pricing-section {
      padding: 1.5rem;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .section-title {
      margin: 0;
      font-size: 0.9375rem;
      font-weight: 600;
      color: #111827;
      letter-spacing: -0.01em;
    }

    .section-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.125rem 0.5rem;
      font-size: 0.6875rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.025em;
      background: #dbeafe;
      color: #1e40af;
      border-radius: 9999px;
    }

    .section-description {
      margin: 0 0 1.25rem;
      font-size: 0.8125rem;
      color: #6b7280;
      line-height: 1.5;
    }

    .form-row {
      display: grid;
      gap: 1rem;
      grid-template-columns: 2fr 1fr;
    }

    .form-group-flex-1 {
      flex: 1;
    }

    .form-group-flex-2 {
      flex: 2;
    }

    .form-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #f3f4f6;
    }

    @media (max-width: 640px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column-reverse;
      }

      .form-actions app-button {
        width: 100%;
      }
    }
  `]
})
export class ItemFormModalComponent {
  @ViewChild('modal') modal!: ModalComponent;
  @Output() itemSaved = new EventEmitter<Item>();

  private itemsService = inject(ItemsService);
  private toastService = inject(ToastService);

  // Form fields
  itemCode = '';
  description = '';
  classification: 'Good' | 'Service' | '' = '';
  initialPrice: number | null = null;
  currency = 'USD';

  // State
  loading = signal(false);
  error = signal('');
  itemCodeError = signal('');
  descriptionError = signal('');
  priceError = signal('');
  isEditMode = signal(false);
  currentItem = signal<Item | null>(null);

  // Computed
  modalTitle = signal('Create New Item');
  modalSubtitle = signal('Add a new product to your inventory');
  submitButtonText = signal('Create Item');

  open(item?: Item): void {
    if (item) {
      // Edit mode
      this.isEditMode.set(true);
      this.currentItem.set(item);
      this.itemCode = item.itemCode;
      this.description = item.description;
      this.classification = item.classification;
      this.modalTitle.set('Edit Item');
      this.modalSubtitle.set('Update product information');
      this.submitButtonText.set('Save Changes');
    } else {
      // Create mode
      this.isEditMode.set(false);
      this.currentItem.set(null);
      this.itemCode = '';
      this.description = '';
      this.classification = '';
      this.initialPrice = null;
      this.currency = 'USD';
      this.modalTitle.set('Create New Item');
      this.modalSubtitle.set('Add a new product to your inventory');
      this.submitButtonText.set('Create Item');
    }

    this.clearErrors();
    this.modal.open();
  }

  close(): void {
    this.modal.close();
    this.resetForm();
  }

  isFormValid(): boolean {
    return this.itemCode.trim().length > 0 &&
           this.description.trim().length > 0 &&
           this.classification !== '';
  }

  validateForm(): boolean {
    this.clearErrors();

    if (!this.itemCode.trim()) {
      this.itemCodeError.set('Item code is required');
      return false;
    }

    if (!this.description.trim()) {
      this.descriptionError.set('Description is required');
      return false;
    }

    if (!this.classification) {
      this.error.set('Classification is required');
      return false;
    }

    return true;
  }

  clearErrors(): void {
    this.error.set('');
    this.itemCodeError.set('');
    this.descriptionError.set('');
    this.priceError.set('');
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.loading.set(true);
    this.error.set('');

    if (this.isEditMode()) {
      this.updateItem();
    } else {
      this.createItem();
    }
  }

  private createItem(): void {
    const createRequest: any = {
      itemCode: this.itemCode.trim().toUpperCase(),
      description: this.description.trim(),
      classification: this.classification
    };

    // Add price fields if provided
    if (this.initialPrice !== null && this.initialPrice > 0) {
      createRequest.initialPrice = this.initialPrice;
      createRequest.currency = this.currency.trim().toUpperCase() || 'USD';
    }

    this.itemsService.createItem(createRequest).subscribe({
      next: (item) => {
        this.loading.set(false);
        this.toastService.success('Item created successfully');
        this.itemSaved.emit(item);
        this.close();
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Create item error:', err);

        if (err.status === 400) {
          this.error.set(err.error?.errorMessage || 'Invalid item data');
        } else if (err.status === 409) {
          this.error.set('An item with this code already exists');
        } else {
          this.error.set(err.error?.errorMessage || 'Failed to create item. Please try again.');
        }
      }
    });
  }

  private updateItem(): void {
    const itemCode = this.currentItem()?.itemCode;
    if (!itemCode) return;

    this.itemsService.updateItem(itemCode, {
      description: this.description.trim()
    }).subscribe({
      next: (item) => {
        this.loading.set(false);
        this.toastService.success('Item updated successfully');
        this.itemSaved.emit(item);
        this.close();
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Update item error:', err);
        this.error.set(err.error?.errorMessage || 'Failed to update item. Please try again.');
      }
    });
  }

  onCancel(): void {
    this.close();
  }

  private resetForm(): void {
    this.itemCode = '';
    this.description = '';
    this.classification = '';
    this.initialPrice = null;
    this.currency = 'USD';
    this.clearErrors();
    this.loading.set(false);
    this.isEditMode.set(false);
    this.currentItem.set(null);
  }
}
