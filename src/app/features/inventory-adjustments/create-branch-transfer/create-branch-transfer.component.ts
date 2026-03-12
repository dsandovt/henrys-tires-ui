import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InventoryAdjustmentsService } from '../../../core/services/inventory-adjustments.service';
import { ItemsService } from '../../../core/services/items.service';
import { BranchesService } from '../../../core/services/branches.service';
import { InventoryService } from '../../../core/services/inventory.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ItemCondition, Branch, Item, CreateAdjustmentLineRequest } from '../../../core/models/inventory.models';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { SelectComponent, SelectOption } from '../../../shared/components/select/select.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';

interface AdjustmentLine extends CreateAdjustmentLineRequest {
  notes?: string;
  availableNew?: number;
  availableUsed?: number;
}

@Component({
  selector: 'app-create-branch-transfer',
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
    <div class="create-transfer">
      <div class="header">
        <h1>Create Branch Transfer</h1>
      </div>

      <app-card title="Transfer Details">
        <div class="form-grid">
          <div class="form-group">
            <app-select
              label="Origin Branch"
              [options]="branchOptions()"
              [(ngModel)]="originBranchCode"
              placeholder="Select origin branch"
              [required]="true"
              (selectionChange)="onOriginBranchChanged()"
            ></app-select>
          </div>

          <div class="form-group">
            <app-select
              label="Destination Branch"
              [options]="destinationBranchOptions()"
              [(ngModel)]="destinationBranchCode"
              placeholder="Select destination branch"
              [required]="true"
            ></app-select>
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
          Add at least one line item to create the transfer.
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
              <label [for]="'condition_' + i" class="field-label">Condition</label>
              <select
                [(ngModel)]="line.condition"
                [name]="'condition_' + i"
                [id]="'condition_' + i"
                class="native-select"
                (ngModelChange)="onConditionChanged(i)"
              >
                <option value="New">New</option>
                <option value="Used">Used</option>
              </select>
            </div>

            <div class="form-group">
              <app-input
                label="Quantity"
                type="number"
                [(ngModel)]="line.quantity"
              ></app-input>
              <span class="stock-info" *ngIf="line.itemCode && getAvailableStock(line) !== null"
                [class.stock-warning]="line.quantity > getAvailableStock(line)!"
                [class.stock-ok]="line.quantity <= getAvailableStock(line)!">
                Available: {{ getAvailableStock(line) }}
              </span>
            </div>

            <div class="form-group">
              <app-input
                label="Notes"
                [(ngModel)]="line.notes"
                placeholder="Optional"
              ></app-input>
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
          {{ loading() ? 'Creating...' : 'Create Branch Transfer' }}
        </app-button>
      </div>
    </div>
  `,
  styles: [`
    @use 'assets/styles/variables' as *;

    .create-transfer { max-width: 1200px; }
    .header { margin-bottom: $spacing-6; h1 { margin: 0; font-size: $font-size-2xl; } }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: $spacing-4; }
    .form-group { display: flex; flex-direction: column; }
    .form-group.full-width { grid-column: 1 / -1; }
    .line-item { border: 1px solid $border-color-light; border-radius: $border-radius-base; padding: $spacing-4; margin-bottom: $spacing-4; }
    .line-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: $spacing-3; }
    .line-number { font-weight: $font-weight-medium; font-size: $font-size-sm; color: $color-gray-700; }
    .line-fields { display: grid; grid-template-columns: repeat(4, 1fr); gap: $spacing-3; }
    .add-line { margin-top: $spacing-3; }
    .actions { display: flex; justify-content: flex-end; gap: $spacing-3; margin-top: $spacing-6; }
    .field-label { font-size: 0.875rem; font-weight: 500; color: #404040; margin-bottom: 0.375rem; }
    .native-select {
      width: 100%;
      padding: 0.625rem 0.75rem;
      font-size: 0.9375rem;
      line-height: 1.5;
      color: #404040;
      background-color: #fff;
      border: 1px solid #d4d4d4;
      border-radius: 0.375rem;
      &:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
    }
    .stock-info {
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }
    .stock-ok {
      color: #16a34a;
    }
    .stock-warning {
      color: #dc2626;
      font-weight: 500;
    }
  `]
})
export class CreateBranchTransferComponent implements OnInit {
  private adjustmentsService = inject(InventoryAdjustmentsService);
  private branchesService = inject(BranchesService);
  private itemsService = inject(ItemsService);
  private inventoryService = inject(InventoryService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  originBranchCode = '';
  destinationBranchCode = '';
  notes = '';
  lines = signal<AdjustmentLine[]>([]);
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

  destinationBranchOptions = computed<SelectOption[]>(() =>
    this.branches()
      .filter(b => b.code !== this.originBranchCode)
      .map(branch => ({
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
        notes: undefined,
        availableNew: undefined,
        availableUsed: undefined
      }
    ]);
  }

  removeLine(index: number): void {
    this.lines.update(lines => lines.filter((_, i) => i !== index));
  }

  onOriginBranchChanged(): void {
    this.lines().forEach((_, i) => {
      if (this.lines()[i].itemCode) {
        this.fetchStockForLine(i);
      }
    });
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
          availableNew: undefined,
          availableUsed: undefined
        };
        return updated;
      });
      this.fetchStockForLine(index);
    }
  }

  onConditionChanged(_index: number): void {
    // Stock is already fetched for both conditions — just triggers re-render
  }

  getAvailableStock(line: AdjustmentLine): number | null {
    if (line.condition === ItemCondition.New && line.availableNew !== undefined) return line.availableNew;
    if (line.condition === ItemCondition.Used && line.availableUsed !== undefined) return line.availableUsed;
    return null;
  }

  private fetchStockForLine(index: number): void {
    const line = this.lines()[index];
    if (!line.itemCode || !this.originBranchCode) return;

    const branch = this.branches().find(b => b.code === this.originBranchCode);
    if (!branch) return;

    this.inventoryService.getInventorySummaryByBranchAndItem(branch.id, line.itemCode).subscribe({
      next: (summary) => {
        const newEntry = summary.entries?.find(e => e.condition === ItemCondition.New);
        const usedEntry = summary.entries?.find(e => e.condition === ItemCondition.Used);
        this.lines.update(lines => {
          const updated = [...lines];
          updated[index] = {
            ...updated[index],
            availableNew: newEntry?.onHand ?? 0,
            availableUsed: usedEntry?.onHand ?? 0
          };
          return updated;
        });
      },
      error: () => {
        this.lines.update(lines => {
          const updated = [...lines];
          updated[index] = {
            ...updated[index],
            availableNew: 0,
            availableUsed: 0
          };
          return updated;
        });
      }
    });
  }

  isFormValid(): boolean {
    if (!this.originBranchCode || !this.destinationBranchCode) return false;
    if (this.originBranchCode === this.destinationBranchCode) return false;
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
      originBranchCode: this.originBranchCode,
      destinationBranchCode: this.destinationBranchCode,
      notes: this.notes || undefined,
      lines: this.lines().map(line => ({
        itemReference: line.itemReference,
        itemCode: line.itemCode.trim().toUpperCase(),
        condition: line.condition,
        quantity: line.quantity,
        notes: line.notes || undefined
      })),
    };

    this.adjustmentsService.createBranchTransfer(request).subscribe({
      next: (adj) => {
        this.toastService.success('Branch transfer created successfully');
        this.loading.set(false);
        this.router.navigate(['/adjustment-details'], { queryParams: { id: adj.id } });
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/inventory-adjustments']);
  }
}
