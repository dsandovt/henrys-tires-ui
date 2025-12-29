import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TransactionsService } from '../../../core/services/transactions.service';
import { Transaction } from '../../../core/models/inventory.models';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { EasternTimePipe } from '../../../shared/pipes/eastern-time.pipe';

@Component({
  selector: 'app-transaction-details',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent, BadgeComponent, ButtonComponent, EasternTimePipe],
  template: `
    <div class="transaction-details" *ngIf="transaction()">
      <div class="header">
        <div>
          <h1>{{ transaction()!.transactionNumber }}</h1>
          <p class="subtitle">{{ transaction()!.type }} Transaction</p>
        </div>
        <app-badge [variant]="getStatusVariant()">{{ transaction()!.status }}</app-badge>
      </div>

      <app-card title="Transaction Information">
        <div class="info-grid">
          <div class="info-item"><label>Branch:</label><span>{{ transaction()!.branchCode }}</span></div>
          <div class="info-item"><label>Date:</label><span>{{ transaction()!.transactionDateUtc | easternTime:'withZone' }}</span></div>
          <div class="info-item"><label>Payment Method:</label><span>{{ formatPaymentMethod(transaction()!.paymentMethod) || '-' }}</span></div>
          <div class="info-item"><label>Created By:</label><span>{{ transaction()!.createdBy }}</span></div>
          <div class="info-item"><label>Created At:</label><span>{{ transaction()!.createdAtUtc | easternTime:'withZone' }}</span></div>
          <div class="info-item" *ngIf="transaction()!.committedBy"><label>Committed By:</label><span>{{ transaction()!.committedBy }}</span></div>
          <div class="info-item" *ngIf="transaction()!.committedAtUtc"><label>Committed At:</label><span>{{ transaction()!.committedAtUtc | easternTime:'withZone' }}</span></div>
          <div class="info-item full-width" *ngIf="transaction()!.notes"><label>Notes:</label><span>{{ transaction()!.notes }}</span></div>
        </div>
      </app-card>

      <app-card title="Line Items">
        <table class="lines-table">
          <thead>
            <tr>
              <th>Item Code</th>
              <th>Condition</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Currency</th>
              <th>Line Total</th>
              <th>Price Source</th>
              <th>Set By</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let line of transaction()!.lines">
              <td><strong>{{ line.itemCode }}</strong></td>
              <td>{{ line.itemCondition }}</td>
              <td>{{ line.quantity }}</td>
              <td>{{ line.unitPrice | number: '1.2-2' }}</td>
              <td>{{ line.currency }}</td>
              <td><strong>{{ line.lineTotal | number: '1.2-2' }}</strong></td>
              <td>{{ line.priceSource }}</td>
              <td>{{ line.priceSetByUser }} ({{ line.priceSetByRole }})</td>
            </tr>
          </tbody>
        </table>
      </app-card>

      <div class="actions">
        <app-button variant="secondary" (click)="goBack()">Back to Transactions</app-button>
        <app-button variant="primary" [routerLink]="['/reports/invoice/transaction', transaction()!.id]">View Invoice</app-button>
      </div>
    </div>
  `,
  styles: [`
    @use 'assets/styles/variables' as *;
    .transaction-details { max-width: 1200px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: $spacing-6; }
    h1 { margin: 0; font-size: $font-size-2xl; }
    .subtitle { margin: $spacing-1 0 0; color: $color-gray-600; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: $spacing-4; }
    .info-item { display: flex; flex-direction: column; gap: $spacing-1; }
    .info-item.full-width { grid-column: 1 / -1; }
    .info-item label { font-size: $font-size-xs; font-weight: $font-weight-medium; color: $color-gray-600; text-transform: uppercase; }
    .info-item span { font-size: $font-size-sm; color: $color-gray-900; }
    .lines-table { width: 100%; border-collapse: collapse; font-size: $font-size-sm; }
    .lines-table th { padding: $spacing-3 $spacing-4; text-align: left; background-color: $color-gray-50; font-weight: $font-weight-medium; border-bottom: 1px solid $border-color-light; }
    .lines-table td { padding: $spacing-3 $spacing-4; border-bottom: 1px solid $border-color-light; }
    .actions { display: flex; justify-content: flex-end; gap: $spacing-3; margin-top: $spacing-6; }
  `]
})
export class TransactionDetailsComponent implements OnInit {
  private transactionsService = inject(TransactionsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  transaction = signal<Transaction | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.transactionsService.getTransactionById(id).subscribe({
      next: (transaction) => this.transaction.set(transaction),
      error: (err) => console.error('Failed to load transaction:', err)
    });
  }

  getStatusVariant(): any {
    const status = this.transaction()?.status;
    if (status === 'Committed') return 'success';
    if (status === 'Cancelled') return 'danger';
    return 'warning';
  }

  goBack(): void {
    this.router.navigate(['/transactions']);
  }

  formatPaymentMethod(paymentMethod: string | undefined): string {
    if (!paymentMethod) return '';
    const mapping: { [key: string]: string } = {
      'Cash': 'Cash',
      'Card': 'Card',
      'AcimaShortTermCredit': 'Acima Short-Term Credit',
      'AccountsReceivable': 'Accounts Receivable'
    };
    return mapping[paymentMethod] || paymentMethod;
  }
}
