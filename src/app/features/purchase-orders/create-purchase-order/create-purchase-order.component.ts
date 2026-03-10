import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PurchaseOrdersService } from '../../../core/services/purchase-orders.service';
import { ItemsService } from '../../../core/services/items.service';
import { BranchesService } from '../../../core/services/branches.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ItemCondition, Currency, CreatePurchaseOrderLineRequest, Branch, Item } from '../../../core/models/inventory.models';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { SelectComponent, SelectOption } from '../../../shared/components/select/select.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { localToUtcIso } from '../../../core/utils/timezone.utils';

@Component({
  selector: 'app-create-purchase-order',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    AlertComponent
  ],
  template: `
    <div class="create-po">
      <div class="header">
        <h1>Create Purchase Order</h1>
      </div>

      <app-card title="Purchase Order Details">
        <div class="form-grid">
          <div class="form-group" *ngIf="authService.isAdmin()">
            <app-select
              label="Branch"
              [options]="branchOptions()"
              [(ngModel)]="branchCode"
              placeholder="Select a branch"
            ></app-select>
          </div>

          <div class="form-group" *ngIf="authService.isAdmin()">
            <app-input
              label="Order Date"
              type="datetime-local"
              [(ngModel)]="orderDate"
            ></app-input>
          </div>

          <div class="form-group">
            <app-input
              label="Supplier Name"
              [(ngModel)]="supplierName"
              placeholder="Enter supplier name"
            ></app-input>
          </div>

          <div class="form-group full-width">
            <app-input
              label="Notes"
              [(ngModel)]="notes"
              placeholder="Optional notes"
            ></app-input>
          </div>
        </div>
      </app-card>

      <app-card title="Line Items">
        <app-alert *ngIf="lines().length === 0" variant="info">
          Add at least one line item to create the purchase order.
        </app-alert>

        <div *ngFor="let line of lines(); let i = index" class="line-item">
          <div class="line-header">
            <span class="line-number">Line {{ i + 1 }}</span>
            <app-button variant="danger" size="sm" (click)="removeLine(i)">Remove</app-button>
          </div>
          <div class="line-fields">
            <div class="form-group">
              <app-select
                [(ngModel)]="line.itemReference"
                [name]="'item_' + i"
                label="Item"
                placeholder="Search by code or description"
                [options]="itemOptions()"
                [required]="true"
                (selectionChange)="onItemSelected(i)"
              ></app-select>
            </div>

            <div class="form-group">
              <app-select
                label="Condition"
                [options]="conditionOptions"
                [(ngModel)]="line.condition"
              ></app-select>
            </div>

            <div class="form-group">
              <app-input
                label="Quantity"
                type="number"
                [(ngModel)]="line.quantity"
              ></app-input>
            </div>

            <div class="form-group">
              <app-input
                label="Unit Price"
                type="number"
                [(ngModel)]="line.unitPrice"
                placeholder="Optional"
              ></app-input>
            </div>

            <div class="form-group">
              <app-select
                label="Currency"
                [options]="currencyOptions"
                [(ngModel)]="line.currency"
              ></app-select>
            </div>
          </div>
        </div>

        <div class="add-line">
          <app-button variant="secondary" (click)="addLine()">+ Add Line Item</app-button>
        </div>
      </app-card>

      <div class="actions">
        <app-button variant="secondary" (click)="onCancel()">Cancel</app-button>
        <app-button variant="primary" (click)="onSubmit()" [disabled]="!isFormValid() || loading()">
          {{ loading() ? 'Creating...' : 'Create Purchase Order' }}
        </app-button>
      </div>
    </div>
  `,
  styles: [`
    @use 'assets/styles/variables' as *;

    .create-po { max-width: 1200px; }
    .header { margin-bottom: $spacing-6; h1 { margin: 0; font-size: $font-size-2xl; } }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: $spacing-4; }
    .form-group { display: flex; flex-direction: column; }
    .form-group.full-width { grid-column: 1 / -1; }
    .line-item { border: 1px solid $border-color-light; border-radius: $border-radius-base; padding: $spacing-4; margin-bottom: $spacing-4; }
    .line-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: $spacing-3; }
    .line-number { font-weight: $font-weight-medium; font-size: $font-size-sm; color: $color-gray-700; }
    .line-fields { display: grid; grid-template-columns: repeat(5, 1fr); gap: $spacing-3; }
    .add-line { margin-top: $spacing-3; }
    .actions { display: flex; justify-content: flex-end; gap: $spacing-3; margin-top: $spacing-6; }
  `]
})
export class CreatePurchaseOrderComponent implements OnInit {
  private purchaseOrdersService = inject(PurchaseOrdersService);
  private branchesService = inject(BranchesService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  authService = inject(AuthService);

  private itemsService = inject(ItemsService);

  branchCode = '';
  orderDate = '';
  supplierName = '';
  notes = '';
  lines = signal<CreatePurchaseOrderLineRequest[]>([]);
  loading = signal(false);

  branches = signal<Branch[]>([]);
  items = signal<Item[]>([]);

  branchOptions = computed<SelectOption[]>(() =>
    this.branches().map(branch => ({
      value: branch.code,
      label: branch.name,
      subtitle: branch.code
    }))
  );

  itemOptions = computed<SelectOption[]>(() =>
    this.items()
      .filter(item => item.classification === 'Good')
      .map(item => ({
        value: item.id,
        label: item.itemCode,
        subtitle: item.description
      }))
  );

  conditionOptions: SelectOption[] = [
    { value: ItemCondition.New, label: 'New' },
    { value: ItemCondition.Used, label: 'Used' }
  ];

  currencyOptions: SelectOption[] = [
    { value: Currency.USD, label: 'USD' },
    { value: Currency.DOP, label: 'DOP' }
  ];

  ngOnInit(): void {
    this.loadBranches();
    this.loadItems();
    this.addLine();
  }

  loadBranches(): void {
    this.branchesService.getAllBranches().subscribe({
      next: (branches) => this.branches.set(branches),
      error: (err) => console.error('Failed to load branches:', err)
    });
  }

  loadItems(): void {
    this.itemsService.getItems({ page: 1, pageSize: 1000 }).subscribe({
      next: (response) => this.items.set(response.items),
      error: (err) => console.error('Failed to load items:', err)
    });
  }

  addLine(): void {
    this.lines.update(lines => [
      ...lines,
      {
        itemReference: '',
        itemCode: '',
        condition: ItemCondition.New,
        quantity: 1,
        unitPrice: undefined,
        currency: undefined
      }
    ]);
  }

  removeLine(index: number): void {
    this.lines.update(lines => lines.filter((_, i) => i !== index));
  }

  onItemSelected(index: number): void {
    const line = this.lines()[index];
    const item = this.items().find(i => i.id === line.itemReference);

    if (item) {
      this.lines.update(lines => {
        const updated = [...lines];
        updated[index] = {
          ...updated[index],
          itemCode: item.itemCode,
        };
        return updated;
      });
    }
  }

  isFormValid(): boolean {
    if (this.lines().length === 0) return false;

    return this.lines().every(line =>
      line.itemReference.trim() !== '' &&
      line.quantity > 0
    );
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.toastService.warning('Please fill in all required fields');
      return;
    }

    this.loading.set(true);

    const request = {
      branchCode: this.branchCode || undefined,
      orderDateUtc: this.orderDate ? localToUtcIso(this.orderDate) : undefined,
      lines: this.lines().map(line => ({
        itemReference: line.itemReference,
        itemCode: line.itemCode.trim().toUpperCase(),
        condition: line.condition,
        quantity: line.quantity,
        unitPrice: line.unitPrice || undefined,
        currency: line.currency || undefined
      })),
      supplierName: this.supplierName || undefined,
      notes: this.notes || undefined
    };

    this.purchaseOrdersService.createPurchaseOrder(request).subscribe({
      next: (po) => {
        this.toastService.success('Purchase order created successfully');
        this.loading.set(false);
        this.router.navigate(['/purchase-order-details'], { queryParams: { id: po.id } });
      },
      error: (err) => {
        console.error('Failed to create purchase order:', err);
        const errorMessage = err.error?.errorMessage || err.error?.message || 'Failed to create purchase order. Please try again.';
        this.toastService.danger(errorMessage);
        this.loading.set(false);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/purchase-orders']);
  }
}
