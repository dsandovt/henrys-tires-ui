import { Component, inject, signal, OnInit, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TransactionsService } from '../../../core/services/transactions.service';
import { ItemsService } from '../../../core/services/items.service';
import { BranchesService } from '../../../core/services/branches.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ItemCondition, InTransactionLineRequest, Item, Branch, PaymentMethod } from '../../../core/models/inventory.models';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { SelectComponent, SelectOption } from '../../../shared/components/select/select.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { ConfirmationModalComponent, ConfirmationData, ConfirmationItem } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { convertEasternToUtc } from '../../../core/utils/timezone.utils';

interface TransactionLine {
  itemCode: string;
  condition: ItemCondition;
  quantity: number;
  unitPrice?: number;
  currency: string;
  priceNotes?: string;
}

@Component({
  selector: 'app-create-in',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    AlertComponent,
    ConfirmationModalComponent
  ],
  template: `
    <div class="create-transaction">
      <app-card title="Create Transfer IN Transaction">
        <form (ngSubmit)="onSubmit()" class="transaction-form">
          <app-alert variant="info">
            Transfer IN adds stock to inventory. You can optionally provide purchase prices for accounting purposes.
          </app-alert>

          <div class="form-section">
            <h3>Transaction Details</h3>

            <div class="form-row">
              <app-select
                *ngIf="authService.isAdmin()"
                [(ngModel)]="branchCode"
                name="branchCode"
                label="Branch"
                placeholder="Select branch or leave empty for default"
                [options]="branchOptions()"
                hint="Leave empty to use your assigned branch"
              ></app-select>

              <app-input
                [(ngModel)]="transactionDate"
                name="transactionDate"
                label="Transaction Date"
                type="datetime-local"
                [required]="true"
              ></app-input>
            </div>

            <app-input
              [(ngModel)]="notes"
              name="notes"
              label="Notes (Optional)"
              placeholder="Add notes about this transaction"
            ></app-input>

            <app-select
              [(ngModel)]="paymentMethod"
              name="paymentMethod"
              label="Payment Method"
              [options]="paymentMethodOptions"
              [required]="true"
            ></app-select>
          </div>

          <div class="form-section">
            <div class="section-header">
              <h3>Line Items</h3>
              <app-button
                type="button"
                variant="secondary"
                size="sm"
                (click)="addLine()"
              >
                + Add Item
              </app-button>
            </div>

            <div *ngIf="lines().length === 0" class="empty-lines">
              <p>No items added yet. Click "Add Item" to begin.</p>
            </div>

            <div *ngFor="let line of lines(); let i = index" class="line-item">
              <div class="line-header">
                <span class="line-number">Item #{{ i + 1 }}</span>
                <button
                  type="button"
                  class="remove-btn"
                  (click)="removeLine(i)"
                  aria-label="Remove item"
                >
                  ×
                </button>
              </div>

              <div class="line-fields">
                <div class="form-row">
                  <app-select
                    [(ngModel)]="line.itemCode"
                    [name]="'itemCode_' + i"
                    label="Item"
                    placeholder="Search by code or description"
                    [options]="itemOptions()"
                    [required]="true"
                  ></app-select>

                  <div class="form-group">
                    <label [for]="'condition_' + i">Condition *</label>
                    <select
                      [(ngModel)]="line.condition"
                      [name]="'condition_' + i"
                      [id]="'condition_' + i"
                      class="select-input"
                      required
                    >
                      <option value="New">New</option>
                      <option value="Used">Used</option>
                    </select>
                  </div>

                  <app-input
                    [(ngModel)]="line.quantity"
                    [name]="'quantity_' + i"
                    label="Quantity"
                    type="number"
                    placeholder="1"
                    [required]="true"
                  ></app-input>
                </div>

                <div class="form-row">
                  <app-input
                    [(ngModel)]="line.unitPrice"
                    [name]="'unitPrice_' + i"
                    label="Unit Price (Optional)"
                    type="number"
                    placeholder="0.00"
                    hint="Leave empty to use default pricing"
                  ></app-input>

                  <app-input
                    [(ngModel)]="line.currency"
                    [name]="'currency_' + i"
                    label="Currency"
                    placeholder="USD"
                  ></app-input>
                </div>

                <app-input
                  [(ngModel)]="line.priceNotes"
                  [name]="'priceNotes_' + i"
                  label="Price Notes (Optional)"
                  placeholder="e.g., Bulk discount, Supplier promotion"
                ></app-input>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <app-button
              type="button"
              variant="secondary"
              (click)="onCancel()"
            >
              Cancel
            </app-button>
            <app-button
              type="submit"
              variant="primary"
              [loading]="loading()"
              [disabled]="!isFormValid()"
            >
              Create Transaction
            </app-button>
          </div>
        </form>
      </app-card>

      <!-- Confirmation Modal -->
      <app-confirmation-modal
        [open]="isModalOpen()"
        [confirmationData]="confirmationData()"
        (confirm)="onConfirmModal()"
        (cancel)="onCancelModal()"
      ></app-confirmation-modal>
    </div>
  `,
  styleUrls: ['./create-in.component.scss']
})
export class CreateInComponent implements OnInit {
  private transactionsService = inject(TransactionsService);
  private itemsService = inject(ItemsService);
  private branchesService = inject(BranchesService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  authService = inject(AuthService);

  branchCode = '';
  transactionDate = new Date().toISOString().slice(0, 16);
  notes = '';
  paymentMethod: PaymentMethod = PaymentMethod.Cash;
  lines = signal<TransactionLine[]>([]);
  loading = signal(false);

  // Data for dropdowns
  branches = signal<Branch[]>([]);
  items = signal<Item[]>([]);

  // Confirmation modal state
  @ViewChild(ConfirmationModalComponent) confirmationModal?: ConfirmationModalComponent;
  isModalOpen = signal(false);
  confirmationData = signal<ConfirmationData | null>(null);

  // Computed options for selects
  branchOptions = computed<SelectOption[]>(() =>
    this.branches().map(branch => ({
      value: branch.code,
      label: branch.name,
      subtitle: branch.code
    }))
  );

  itemOptions = computed<SelectOption[]>(() =>
    this.items().map(item => ({
      value: item.itemCode,
      label: item.itemCode,
      subtitle: item.description
    }))
  );

  paymentMethodOptions: SelectOption[] = [
    { value: PaymentMethod.Cash, label: 'Cash' },
    { value: PaymentMethod.Card, label: 'Card' },
    { value: PaymentMethod.AcimaShortTermCredit, label: 'Acima Short-Term Credit' },
    { value: PaymentMethod.AccountsReceivable, label: 'Accounts Receivable' }
  ];

  ngOnInit(): void {
    // Load branches and items
    this.loadBranches();
    this.loadItems();

    // Add one empty line by default
    this.addLine();
  }

  loadBranches(): void {
    this.branchesService.getAllBranches().subscribe({
      next: (branches) => {
        this.branches.set(branches);
      },
      error: (err) => {
        console.error('Failed to load branches:', err);
      }
    });
  }

  loadItems(): void {
    // Load only Goods (not Services) for inventory transactions
    this.itemsService.getItems({ page: 1, pageSize: 1000, classification: 'Good' }).subscribe({
      next: (response) => {
        this.items.set(response.items);
      },
      error: (err) => {
        console.error('Failed to load items:', err);
      }
    });
  }

  addLine(): void {
    this.lines.update(lines => [
      ...lines,
      {
        itemCode: '',
        condition: ItemCondition.New,
        quantity: 1,
        unitPrice: undefined,
        currency: 'USD',
        priceNotes: ''
      }
    ]);
  }

  removeLine(index: number): void {
    this.lines.update(lines => lines.filter((_, i) => i !== index));
  }

  isFormValid(): boolean {
    if (this.lines().length === 0) return false;

    return this.lines().every(line =>
      line.itemCode.trim() !== '' &&
      line.quantity > 0
    );
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.toastService.warning('Please fill in all required fields');
      return;
    }

    // Prepare confirmation data
    const branch = this.branches().find(b => b.code === this.branchCode);
    const branchName = branch?.name || this.authService.branchCode() || 'Default';

    const confirmationItems: ConfirmationItem[] = this.lines().map(line => {
      const item = this.items().find(i => i.itemCode === line.itemCode);
      return {
        sku: line.itemCode,
        description: item?.description || line.itemCode,
        quantity: line.quantity,
        price: line.unitPrice,
        currency: line.currency,
        condition: line.condition === ItemCondition.New ? 'New' : 'Used'
      };
    });

    const totalAmount = this.lines().reduce((sum, line) => sum + (line.unitPrice || 0) * line.quantity, 0);
    const hasPrices = this.lines().some(line => line.unitPrice !== undefined && line.unitPrice > 0);

    this.confirmationData.set({
      type: 'Transfer In',
      branch: branchName,
      items: confirmationItems,
      totalItems: this.lines().length,
      totalQuantity: this.lines().reduce((sum, line) => sum + line.quantity, 0),
      totalAmount: hasPrices ? totalAmount : undefined,
      currency: this.lines()[0]?.currency || 'USD',
      paymentMethod: this.getPaymentMethodLabel(this.paymentMethod),
      notes: this.notes || undefined
    });

    this.isModalOpen.set(true);
  }

  onConfirmModal(): void {
    this.executeSubmit();
  }

  onCancelModal(): void {
    this.isModalOpen.set(false);
  }

  private executeSubmit(): void {
    const request: any = {
      branchCode: this.branchCode || undefined,
      transactionDateUtc: convertEasternToUtc(this.transactionDate),
      notes: this.notes || undefined,
      paymentMethod: this.paymentMethod,
      lines: this.lines().map(line => ({
        itemCode: line.itemCode.trim().toUpperCase(),
        itemCondition: line.condition,
        quantity: line.quantity,
        unitPrice: line.unitPrice || undefined,
        currency: line.currency || 'USD',
        priceNotes: line.priceNotes || undefined
      }))
    };

    this.transactionsService.createInTransaction(request).subscribe({
      next: (transaction) => {
        this.toastService.success('Transfer IN transaction created successfully');
        this.confirmationModal?.close();
        this.commitTransaction(transaction.id);
      },
      error: (err) => {
        console.error('Failed to create transaction:', err);
        const errorMessage = err.error?.message || 'Failed to create transaction. Please try again.';
        this.confirmationModal?.setError(errorMessage);
      }
    });
  }

  private getPaymentMethodLabel(method: PaymentMethod): string {
    const option = this.paymentMethodOptions.find(opt => opt.value === method);
    return option?.label || method.toString();
  }

  commitTransaction(transactionId: string): void {
    this.transactionsService.commitTransaction(transactionId).subscribe({
      next: () => {
        this.toastService.success('Transaction committed successfully');
        this.router.navigate(['/transactions', transactionId]);
      },
      error: (err) => {
        console.error('Failed to commit transaction:', err);
        this.toastService.warning('Transaction created but failed to commit');
        this.router.navigate(['/transactions']);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/transactions']);
  }
}
