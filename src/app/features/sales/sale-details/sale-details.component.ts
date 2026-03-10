import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SalesService } from '../../../core/services/sales.service';
import { Sale } from '../../../core/models/inventory.models';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { EasternTimePipe } from '../../../shared/pipes/eastern-time.pipe';
import { SensitivePipe } from '../../../shared/pipes/sensitive.pipe';
import { CreateSaleComponent } from '../create-sale/create-sale.component';

@Component({
  selector: 'app-sale-details',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent, BadgeComponent, ButtonComponent, EasternTimePipe, SensitivePipe, CreateSaleComponent],
  template: `
    <app-create-sale *ngIf="isNewMode" />

    <div class="sale-details" *ngIf="!isNewMode && sale()">
      <div class="header">
        <div>
          <h1>{{ sale()!.number }}</h1>
          <p class="subtitle">Sale</p>
        </div>
        <app-badge [variant]="getStatusVariant()">{{ sale()!.status }}</app-badge>
      </div>

      <app-card title="Sale Information">
        <div class="info-grid">
          <div class="info-item"><label>Branch:</label><span>{{ sale()!.branchCode }}</span></div>
          <div class="info-item"><label>Date:</label><span>{{ sale()!.saleDateUtc | easternTime:'withZone' }}</span></div>
          <div class="info-item">
            <label>Payment Method:</label>
            <span *ngIf="!sale()!.paymentDetails || sale()!.paymentDetails!.length === 0">{{ formatPaymentMethod(sale()!.paymentMethod) }}</span>
            <div *ngIf="sale()!.paymentDetails && sale()!.paymentDetails!.length > 0">
              <div *ngFor="let pd of sale()!.paymentDetails">
                {{ formatPaymentMethod(pd.method) }}: {{ pd.amount | number:'1.2-2' | sensitive }}
                <span *ngIf="pd.checkNumber"> (Check #{{ pd.checkNumber }})</span>
              </div>
            </div>
          </div>
          <div class="info-item" *ngIf="sale()!.customerName"><label>Customer:</label><span>{{ sale()!.customerName }}</span></div>
          <div class="info-item" *ngIf="sale()!.customerPhone"><label>Phone:</label><span>{{ sale()!.customerPhone }}</span></div>
          <div class="info-item"><label>Created By:</label><span>{{ sale()!.createdBy }}</span></div>
          <div class="info-item"><label>Created At:</label><span>{{ sale()!.createdAtUtc | easternTime:'withZone' }}</span></div>
          <div class="info-item full-width" *ngIf="sale()!.notes"><label>Notes:</label><span>{{ sale()!.notes }}</span></div>
        </div>
      </app-card>

      <app-card title="Status History" *ngIf="sale()!.statusHistory?.length">
        <div class="status-history">
          <div *ngFor="let entry of sale()!.statusHistory" class="status-entry">
            <app-badge [variant]="getStatusVariant(entry.status)">{{ entry.status }}</app-badge>
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
              <th>Description</th>
              <th>Type</th>
              <th>Condition</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Currency</th>
              <th>Line Total</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let line of sale()!.lines">
              <td><strong>{{ line.itemCode }}</strong></td>
              <td>{{ line.description }}</td>
              <td>
                <span class="classification-badge" [class.good]="line.classification === 'Good'" [class.service]="line.classification === 'Service'">
                  {{ line.classification }}
                </span>
              </td>
              <td>{{ line.condition || '-' }}</td>
              <td>{{ line.quantity }}</td>
              <td>{{ line.unitPrice | number: '1.2-2' | sensitive }}</td>
              <td>{{ line.currency }}</td>
              <td><strong>{{ line.lineTotal | number: '1.2-2' | sensitive }}</strong></td>
            </tr>
          </tbody>
        </table>
      </app-card>

      <div class="actions">
        <app-button variant="secondary" (click)="goBack()">Back to Sales</app-button>
        <app-button variant="primary" [routerLink]="['/reports/invoice/sale', sale()!.id]">View Invoice</app-button>
      </div>
    </div>
  `,
  styles: [`
    @use 'assets/styles/variables' as *;
    .sale-details { max-width: 1200px; }
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
    .classification-badge { padding: $spacing-1 $spacing-2; border-radius: $border-radius-sm; font-size: $font-size-xs; font-weight: $font-weight-medium; text-transform: uppercase; display: inline-block; }
    .classification-badge.good { background-color: #e0f2fe; color: #0369a1; }
    .classification-badge.service { background-color: #fef3c7; color: #92400e; }
    .link { color: $color-primary-600; text-decoration: none; &:hover { text-decoration: underline; } }
    .no-link { color: $color-gray-400; }
    .status-history { display: flex; flex-direction: column; gap: $spacing-3; }
    .status-entry { display: flex; align-items: center; gap: $spacing-3; font-size: $font-size-sm; }
    .status-user { color: $color-gray-700; font-weight: $font-weight-medium; }
    .status-date { color: $color-gray-500; }
    .status-comment { color: $color-gray-600; font-style: italic; }
    .actions { display: flex; justify-content: flex-end; gap: $spacing-3; margin-top: $spacing-6; }
  `]
})
export class SaleDetailsComponent implements OnInit {
  private salesService = inject(SalesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  sale = signal<Sale | null>(null);
  isNewMode = false;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['new'] !== undefined) {
        this.isNewMode = true;
        this.sale.set(null);
        return;
      }

      this.isNewMode = false;
      const id = params['id'];
      if (id) {
        this.salesService.getSaleById(id).subscribe({
          next: (sale) => this.sale.set(sale),
          error: (err) => console.error('Failed to load sale:', err)
        });
      }
    });
  }

  getStatusVariant(status?: string): any {
    const s = status ?? this.sale()?.status;
    if (s === 'Committed') return 'success';
    if (s === 'Cancelled') return 'danger';
    return 'warning';
  }

  goBack(): void {
    this.router.navigate(['/sales']);
  }

  formatPaymentMethod(paymentMethod: string): string {
    const mapping: { [key: string]: string } = {
      'Cash': 'Cash',
      'Card': 'Card',
      'Check': 'Check',
      'Transfer': 'Transfer',
      'Mixed': 'Mixed'
    };
    return mapping[paymentMethod] || paymentMethod;
  }
}
