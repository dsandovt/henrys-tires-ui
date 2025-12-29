import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SalesService } from '../../../core/services/sales.service';
import { InventoryService } from '../../../core/services/inventory.service';
import { ItemsService } from '../../../core/services/items.service';
import { BranchesService } from '../../../core/services/branches.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ItemCondition, Item, Branch, CreateSaleLineRequest, Currency, PaymentMethod } from '../../../core/models/inventory.models';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { SelectComponent, SelectOption } from '../../../shared/components/select/select.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { convertEasternToUtc } from '../../../core/utils/timezone.utils';

interface SaleLineForm extends CreateSaleLineRequest {
  availableStock?: number;
}

@Component({
  selector: 'app-create-sale',
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
  templateUrl: './create-sale.component.html',
  styleUrls: ['./create-sale.component.scss']
})
export class CreateSaleComponent implements OnInit {
  private salesService = inject(SalesService);
  private inventoryService = inject(InventoryService);
  private itemsService = inject(ItemsService);
  private branchesService = inject(BranchesService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  authService = inject(AuthService);

  branchId = '';
  saleDate = new Date().toISOString().slice(0, 16);
  customerName = '';
  customerPhone = '';
  notes = '';
  paymentMethod: PaymentMethod = PaymentMethod.Cash;
  lines = signal<SaleLineForm[]>([]);
  loading = signal(false);

  branches = signal<Branch[]>([]);
  items = signal<Item[]>([]);

  branchOptions = computed<SelectOption[]>(() =>
    this.branches().map(branch => ({
      value: branch.id,
      label: branch.name,
      subtitle: branch.code
    }))
  );

  itemOptions = computed<SelectOption[]>(() =>
    this.items().map(item => ({
      value: item.id,
      label: item.itemCode,
      subtitle: `${item.description} [${item.classification}]`
    }))
  );

  paymentMethodOptions: SelectOption[] = [
    { value: PaymentMethod.Cash, label: 'Cash' },
    { value: PaymentMethod.Card, label: 'Card' },
    { value: PaymentMethod.AcimaShortTermCredit, label: 'Acima Short-Term Credit' },
    { value: PaymentMethod.AccountsReceivable, label: 'Accounts Receivable' }
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
        itemId: '',
        itemCode: '',
        description: '',
        classification: 'Good',
        condition: ItemCondition.New,
        quantity: 1,
        unitPrice: 0,
        currency: Currency.USD,
        availableStock: undefined
      }
    ]);
  }

  removeLine(index: number): void {
    this.lines.update(lines => lines.filter((_, i) => i !== index));
  }

  onItemSelected(index: number): void {
    const line = this.lines()[index];
    const item = this.items().find(i => i.id === line.itemId);

    if (item) {
      this.lines.update(lines => {
        const updated = [...lines];
        updated[index] = {
          ...updated[index],
          itemCode: item.itemCode,
          description: item.description,
          classification: item.classification as 'Good' | 'Service',
          condition: item.classification === 'Good' ? ItemCondition.New : undefined
        };
        return updated;
      });

      // Check stock if it's a Good
      if (item.classification === 'Good') {
        this.checkStock(index);
      }
    }
  }

  checkStock(index: number): void {
    const line = this.lines()[index];

    if (line.classification !== 'Good' || !line.itemCode.trim()) {
      return;
    }

    const branchCode = this.authService.branchCode();
    if (!branchCode) {
      return;
    }

    this.inventoryService.getInventorySummaryByBranchAndItem(
      branchCode,
      line.itemCode.trim().toUpperCase()
    ).subscribe({
      next: (summary) => {
        const entry = summary.entries.find(e => e.itemCondition === line.condition);
        const available = entry ? (entry.onHand - entry.reserved) : 0;

        this.lines.update(lines => {
          const updated = [...lines];
          updated[index] = { ...updated[index], availableStock: available };
          return updated;
        });
      },
      error: () => {
        this.lines.update(lines => {
          const updated = [...lines];
          updated[index] = { ...updated[index], availableStock: 0 };
          return updated;
        });
      }
    });
  }

  getStockError(line: SaleLineForm): string {
    if (line.classification !== 'Good') return '';
    if (line.availableStock === undefined) return '';
    if (line.quantity > line.availableStock) {
      return `Insufficient stock (available: ${line.availableStock})`;
    }
    return '';
  }

  isFormValid(): boolean {
    if (this.lines().length === 0) return false;

    return this.lines().every(line => {
      const hasValidFields =
        line.itemId.trim() !== '' &&
        line.quantity > 0 &&
        line.unitPrice >= 0;

      const hasValidCondition =
        line.classification === 'Service' ||
        (line.classification === 'Good' && line.condition !== undefined);

      const hasValidStock =
        line.classification === 'Service' ||
        line.availableStock === undefined ||
        line.quantity <= line.availableStock;

      return hasValidFields && hasValidCondition && hasValidStock;
    });
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.toastService.warning('Please fill in all required fields and check stock availability');
      return;
    }

    this.loading.set(true);

    const request = {
      branchId: this.branchId || undefined,
      saleDateUtc: convertEasternToUtc(this.saleDate),
      lines: this.lines().map(line => ({
        itemId: line.itemId,
        itemCode: line.itemCode,
        description: line.description,
        classification: line.classification,
        condition: line.condition,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        currency: line.currency
      })),
      customerName: this.customerName || undefined,
      customerPhone: this.customerPhone || undefined,
      notes: this.notes || undefined,
      paymentMethod: this.paymentMethod
    };

    this.salesService.createSale(request).subscribe({
      next: (sale) => {
        this.loading.set(false);
        this.toastService.success('Sale created successfully');
        this.postSale(sale.id);
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Failed to create sale:', err);
        this.toastService.danger(
          err.error?.message || 'Failed to create sale. Please try again.'
        );
      }
    });
  }

  postSale(saleId: string): void {
    this.salesService.postSale(saleId).subscribe({
      next: () => {
        this.toastService.success('Sale posted successfully');
        this.router.navigate(['/sales', saleId]);
      },
      error: (err) => {
        console.error('Failed to post sale:', err);
        this.toastService.warning('Sale created but failed to post. View in sales list.');
        this.router.navigate(['/sales']);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/sales']);
  }

  calculateLineTotal(line: SaleLineForm): number {
    return line.quantity * line.unitPrice;
  }
}
