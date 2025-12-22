import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SalesService } from '../../../core/services/sales.service';
import { Sale } from '../../../core/models/inventory.models';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { EasternTimePipe } from '../../../shared/pipes/eastern-time.pipe';

@Component({
  selector: 'app-sale-details',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent, BadgeComponent, ButtonComponent, EasternTimePipe],
  template: `
    <div class="sale-details" *ngIf="sale()">
      <div class="header">
        <div>
          <h1>{{ sale()!.saleNumber }}</h1>
          <p class="subtitle">Sale</p>
        </div>
        <app-badge [variant]="getStatusVariant()">{{ sale()!.status }}</app-badge>
      </div>

      <app-card title="Sale Information">
        <div class="info-grid">
          <div class="info-item"><label>Branch ID:</label><span>{{ sale()!.branchId }}</span></div>
          <div class="info-item"><label>Date:</label><span>{{ sale()!.saleDateUtc | easternTime:'withZone' }}</span></div>
          <div class="info-item" *ngIf="sale()!.customerName"><label>Customer:</label><span>{{ sale()!.customerName }}</span></div>
          <div class="info-item" *ngIf="sale()!.customerPhone"><label>Phone:</label><span>{{ sale()!.customerPhone }}</span></div>
          <div class="info-item"><label>Created By:</label><span>{{ sale()!.createdBy }}</span></div>
          <div class="info-item"><label>Created At:</label><span>{{ sale()!.createdAtUtc | easternTime:'withZone' }}</span></div>
          <div class="info-item" *ngIf="sale()!.postedBy"><label>Posted By:</label><span>{{ sale()!.postedBy }}</span></div>
          <div class="info-item" *ngIf="sale()!.postedAtUtc"><label>Posted At:</label><span>{{ sale()!.postedAtUtc | easternTime:'withZone' }}</span></div>
          <div class="info-item full-width" *ngIf="sale()!.notes"><label>Notes:</label><span>{{ sale()!.notes }}</span></div>
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
              <th>Inventory Link</th>
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
              <td>{{ line.unitPrice | number: '1.2-2' }}</td>
              <td>{{ line.currency }}</td>
              <td><strong>{{ line.lineTotal | number: '1.2-2' }}</strong></td>
              <td>
                <a *ngIf="line.inventoryTransactionId" [routerLink]="['/transactions', line.inventoryTransactionId]" class="link">
                  View Transaction
                </a>
                <span *ngIf="!line.inventoryTransactionId" class="no-link">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </app-card>

      <div class="actions">
        <app-button variant="secondary" (click)="goBack()">Back to Sales</app-button>
      </div>
    </div>
  `,
  styles: [`
    @import 'assets/styles/variables';
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
    .actions { display: flex; justify-content: flex-end; margin-top: $spacing-6; }
  `]
})
export class SaleDetailsComponent implements OnInit {
  private salesService = inject(SalesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  sale = signal<Sale | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.salesService.getSaleById(id).subscribe({
      next: (sale) => this.sale.set(sale),
      error: (err) => console.error('Failed to load sale:', err)
    });
  }

  getStatusVariant(): any {
    const status = this.sale()?.status;
    if (status === 'Committed') return 'success';
    if (status === 'Cancelled') return 'danger';
    return 'warning';
  }

  goBack(): void {
    this.router.navigate(['/sales']);
  }
}
