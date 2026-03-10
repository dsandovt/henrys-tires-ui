import { Component, inject, signal, OnInit, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SalesService } from '../../../core/services/sales.service';
import { InventoryService } from '../../../core/services/inventory.service';
import { ItemsService } from '../../../core/services/items.service';
import { BranchesService } from '../../../core/services/branches.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ItemCondition, Item, Branch, CreateSaleLineRequest, Currency, PaymentMethod, PaymentDetail } from '../../../core/models/inventory.models';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { SelectComponent, SelectOption } from '../../../shared/components/select/select.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { ConfirmationModalComponent, ConfirmationData, ConfirmationItem } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { PaymentMethodSelectorComponent } from '../../../shared/components/payment-method-selector/payment-method-selector.component';
import { localToUtcIso } from '../../../core/utils/timezone.utils';
import { SensitivePipe } from '../../../shared/pipes/sensitive.pipe';

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
    AlertComponent,
    ConfirmationModalComponent,
    PaymentMethodSelectorComponent,
    SensitivePipe
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

  branchCode = '';
  saleDate = '';
  customerName = '';
  customerPhone = '';
  notes = '';
  paymentDetails = signal<PaymentDetail[]>([{ method: PaymentMethod.Cash, amount: 0 }]);
  paymentValid = signal(true);
  lines = signal<SaleLineForm[]>([]);
  loading = signal(false);

  branches = signal<Branch[]>([]);
  items = signal<Item[]>([]);

  // Confirmation modal state
  @ViewChild(ConfirmationModalComponent) confirmationModal?: ConfirmationModalComponent;
  isModalOpen = signal(false);
  confirmationData = signal<ConfirmationData | null>(null);

  readonly saleTotal = signal(0);

  branchOptions = computed<SelectOption[]>(() =>
    this.branches().map(branch => ({
      value: branch.code,
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
        description: '',
        classification: 'Good',
        condition: ItemCondition.New,
        quantity: 1,
        unitPrice: 0,
        currency: Currency.USD,
        availableStock: undefined
      }
    ]);
    this.recalcTotal();
  }

  removeLine(index: number): void {
    this.lines.update(lines => lines.filter((_, i) => i !== index));
    this.recalcTotal();
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

  onBranchChanged(): void {
    // Re-check stock for all lines when branch changes
    this.lines().forEach((_, index) => {
      this.checkStock(index);
    });
  }

  checkStock(index: number): void {
    const line = this.lines()[index];

    if (line.classification !== 'Good' || !line.itemCode.trim()) {
      return;
    }

    const branchCode = this.branchCode || this.authService.branchCode();
    if (!branchCode) {
      return;
    }

    this.inventoryService.getInventorySummaryByBranchAndItem(
      branchCode,
      line.itemCode.trim().toUpperCase()
    ).subscribe({
      next: (summary) => {
        const entry = summary.entries.find(e => e.condition === line.condition);
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
    if (line.condition === ItemCondition.New && line.allowWithoutStock) return '';
    if (line.availableStock === undefined) return '';
    if (line.quantity > line.availableStock) {
      return `Insufficient stock (available: ${line.availableStock})`;
    }
    return '';
  }

  isFormValid(): boolean {
    if (this.lines().length === 0) return false;

    const linesValid = this.lines().every(line => {
      const hasValidFields =
        line.itemReference.trim() !== '' &&
        line.quantity > 0 &&
        line.unitPrice >= 0;

      const hasValidCondition =
        line.classification === 'Service' ||
        (line.classification === 'Good' && line.condition !== undefined);

      const hasValidStock =
        line.classification === 'Service' ||
        (line.condition === ItemCondition.New && line.allowWithoutStock) ||
        line.availableStock === undefined ||
        line.quantity <= line.availableStock;

      return hasValidFields && hasValidCondition && hasValidStock;
    });

    return linesValid && this.paymentValid();
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.toastService.warning('Please fill in all required fields and check stock availability');
      return;
    }

    // Prepare confirmation data
    const branch = this.branches().find(b => b.code === this.branchCode);
    const branchName = branch?.name || this.authService.branchCode() || 'Default';

    const confirmationItems: ConfirmationItem[] = this.lines().map(line => ({
      sku: line.itemCode,
      description: line.description,
      quantity: line.quantity,
      price: line.unitPrice,
      currency: line.currency.toString(),
      condition: line.condition !== undefined ? (line.condition === ItemCondition.New ? 'New' : 'Used') : undefined
    }));

    const total = this.saleTotal();
    const details = this.paymentDetails();
    const isSplit = details.length >= 2;

    this.confirmationData.set({
      type: 'Sale',
      branch: branchName,
      items: confirmationItems,
      totalItems: this.lines().length,
      totalQuantity: this.lines().reduce((sum, line) => sum + line.quantity, 0),
      totalAmount: total,
      currency: this.lines()[0]?.currency.toString() || 'USD',
      paymentMethod: isSplit
        ? details.map(d => `${d.method} ($${d.amount.toFixed(2)})`).join(', ')
        : this.getPaymentMethodLabel(details[0]?.method || PaymentMethod.Cash),
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
    const details = this.paymentDetails();
    const total = this.saleTotal();
    const isSplit = details.length >= 2;

    const request = {
      branchCode: this.branchCode || undefined,
      saleDateUtc: this.saleDate ? localToUtcIso(this.saleDate) : undefined,
      lines: this.lines().map(line => ({
        itemReference: line.itemReference,
        itemCode: line.itemCode,
        description: line.description,
        classification: line.classification,
        condition: line.condition,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        currency: line.currency,
        allowWithoutStock: line.allowWithoutStock || false
      })),
      customerName: this.customerName || undefined,
      customerPhone: this.customerPhone || undefined,
      notes: this.notes || undefined,
      paymentMethod: isSplit ? PaymentMethod.Split : (details[0]?.method || PaymentMethod.Cash),
      paymentDetails: details.map(pd => ({
        method: pd.method,
        amount: isSplit ? pd.amount : total,
        checkNumber: pd.checkNumber
      }))
    };

    this.salesService.createSale(request).subscribe({
      next: (sale) => {
        this.toastService.success('Sale created successfully');
        this.confirmationModal?.close();
        this.postSale(sale.id);
      },
      error: (err) => {
        console.error('Failed to create sale:', err);
        const errorMessage = err.error?.errorMessage || err.error?.message || 'Failed to create sale. Please try again.';
        this.confirmationModal?.setError(errorMessage);
      }
    });
  }

  private getPaymentMethodLabel(method: PaymentMethod): string {
    const labels: Record<string, string> = {
      Cash: 'Cash', Card: 'Card', Check: 'Check',
      Transfer: 'Transfer', Split: 'Split Payment'
    };
    return labels[method] || method.toString();
  }

  postSale(saleId: string): void {
    this.salesService.postSale(saleId).subscribe({
      next: () => {
        this.toastService.success('Sale posted successfully');
        this.router.navigate(['/sale-details'], { queryParams: { id: saleId } });
      },
      error: (err) => {
        console.error('Failed to post sale:', err);
        const errorMessage = err.error?.errorMessage || err.error?.message || 'Sale created but failed to post.';
        this.toastService.warning(errorMessage);
        this.router.navigate(['/sale-details'], { queryParams: { id: saleId } });
      }
    });
  }

  onPaymentDetailsChange(details: PaymentDetail[]): void {
    this.paymentDetails.set(details);
  }

  onPaymentValidityChange(valid: boolean): void {
    this.paymentValid.set(valid);
  }

  onCancel(): void {
    this.router.navigate(['/sales']);
  }

  calculateLineTotal(line: SaleLineForm): number {
    return line.quantity * line.unitPrice;
  }

  recalcTotal(): void {
    this.saleTotal.set(
      this.lines().reduce((sum, l) => sum + l.quantity * l.unitPrice, 0)
    );
  }
}
