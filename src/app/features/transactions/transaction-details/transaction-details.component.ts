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
          <h1>Transaction</h1>
          <p class="subtitle" *ngIf="transaction()!.initiator">
            {{ transaction()!.initiator.entityDefinitionCode }} #{{ transaction()!.initiator.referenceNumber }}
          </p>
        </div>
        <app-badge [variant]="getStatusVariant()">{{ transaction()!.status }}</app-badge>
      </div>

      <app-card title="Transaction Information">
        <div class="info-grid">
          <div class="info-item"><label>Branch:</label><span>{{ transaction()!.branchCode }}</span></div>
          <div class="info-item"><label>Date:</label><span>{{ transaction()!.transactionDateUtc | easternTime:'withZone' }}</span></div>
          <div class="info-item" *ngIf="transaction()!.initiator">
            <label>Initiator:</label>
            <span>{{ transaction()!.initiator.entityDefinitionCode }} — {{ transaction()!.initiator.referenceNumber }}</span>
          </div>
          <div class="info-item"><label>Created By:</label><span>{{ transaction()!.createdBy }}</span></div>
          <div class="info-item"><label>Created At:</label><span>{{ transaction()!.createdAtUtc | easternTime:'withZone' }}</span></div>
          <div class="info-item full-width" *ngIf="transaction()!.notes"><label>Notes:</label><span>{{ transaction()!.notes }}</span></div>
        </div>
      </app-card>

      <app-card title="Status History" *ngIf="transaction()!.statusHistory?.length">
        <div class="status-history">
          <div *ngFor="let entry of transaction()!.statusHistory" class="status-entry">
            <app-badge [variant]="getStatusVariantByName(entry.status)">{{ entry.status }}</app-badge>
            <span class="status-user">{{ entry.user.firstName }} {{ entry.user.lastName }}</span>
            <span class="status-date">{{ entry.date | easternTime:'withZone' }}</span>
            <span *ngIf="entry.comment" class="status-comment">{{ entry.comment }}</span>
          </div>
        </div>
      </app-card>

      <app-card title="Line Items">
        <table class="lines-table">
          <thead>
            <tr>
              <th>Item Code</th>
              <th>Condition</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let line of transaction()!.lines">
              <td><strong>{{ line.itemCode }}</strong></td>
              <td>{{ line.condition }}</td>
              <td>{{ line.quantity }}</td>
            </tr>
          </tbody>
        </table>
      </app-card>

      <div class="actions">
        <app-button variant="secondary" (click)="goBack()">Back to Transactions</app-button>
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
    .status-history { display: flex; flex-direction: column; gap: $spacing-3; }
    .status-entry { display: flex; align-items: center; gap: $spacing-3; font-size: $font-size-sm; }
    .status-user { color: $color-gray-700; font-weight: $font-weight-medium; }
    .status-date { color: $color-gray-500; }
    .status-comment { color: $color-gray-600; font-style: italic; }
    .actions { display: flex; justify-content: flex-end; gap: $spacing-3; margin-top: $spacing-6; }
  `]
})
export class TransactionDetailsComponent implements OnInit {
  private transactionsService = inject(TransactionsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  transaction = signal<Transaction | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.queryParams['id'];
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

  getStatusVariantByName(status: string): any {
    if (status === 'Committed') return 'success';
    if (status === 'Cancelled') return 'danger';
    return 'warning';
  }

  goBack(): void {
    this.router.navigate(['/transactions']);
  }
}
