import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SalesService } from '../../../core/services/sales.service';
import { Sale } from '../../../core/models/inventory.models';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { EasternTimePipe } from '../../../shared/pipes/eastern-time.pipe';

@Component({
  selector: 'app-sales-list',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent, BadgeComponent, EasternTimePipe],
  template: `
    <div class="sales-list">
      <div class="header">
        <h1>Sales</h1>
        <app-button variant="primary" (click)="createSale()">+ New Sale</app-button>
      </div>

      <app-card>
        <div class="table-container" *ngIf="sales().length > 0">
          <table class="sales-table">
            <thead>
              <tr>
                <th>Sale Number</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let sale of sales()" (click)="viewSale(sale.id)" class="clickable-row">
                <td><strong>{{ sale.saleNumber }}</strong></td>
                <td>{{ sale.saleDateUtc | easternTime:'short' }}</td>
                <td>{{ sale.customerName || '-' }}</td>
                <td>
                  <span class="item-count">{{ sale.lines.length }} item(s)</span>
                  <div class="classification-tags">
                    <span *ngIf="hasGoods(sale)" class="tag good">Goods</span>
                    <span *ngIf="hasServices(sale)" class="tag service">Services</span>
                  </div>
                </td>
                <td>
                  <app-badge [variant]="getStatusVariant(sale.status)">{{ sale.status }}</app-badge>
                </td>
                <td>{{ sale.createdBy }}</td>
                <td>
                  <app-button variant="secondary" size="sm" (click)="viewSale(sale.id); $event.stopPropagation()">
                    View
                  </app-button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="empty-state" *ngIf="sales().length === 0 && !loading()">
          <p>No sales found.</p>
          <app-button variant="primary" (click)="createSale()">Create your first sale</app-button>
        </div>

        <div class="loading-state" *ngIf="loading()">
          <p>Loading sales...</p>
        </div>
      </app-card>
    </div>
  `,
  styles: [`
    @import 'assets/styles/variables';

    .sales-list {
      max-width: 1400px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: $spacing-6;

      h1 {
        margin: 0;
        font-size: $font-size-2xl;
      }
    }

    .table-container {
      overflow-x: auto;
    }

    .sales-table {
      width: 100%;
      border-collapse: collapse;
      font-size: $font-size-sm;

      th {
        padding: $spacing-3 $spacing-4;
        text-align: left;
        background-color: $color-gray-50;
        font-weight: $font-weight-medium;
        border-bottom: 2px solid $border-color-base;
      }

      td {
        padding: $spacing-3 $spacing-4;
        border-bottom: 1px solid $border-color-light;
      }
    }

    .clickable-row {
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: $color-gray-50;
      }
    }

    .item-count {
      display: block;
      margin-bottom: $spacing-1;
    }

    .classification-tags {
      display: flex;
      gap: $spacing-1;
    }

    .tag {
      padding: 2px 6px;
      border-radius: $border-radius-sm;
      font-size: $font-size-xs;
      font-weight: $font-weight-medium;
      text-transform: uppercase;

      &.good {
        background-color: #e0f2fe;
        color: #0369a1;
      }

      &.service {
        background-color: #fef3c7;
        color: #92400e;
      }
    }

    .empty-state,
    .loading-state {
      text-align: center;
      padding: $spacing-12 $spacing-4;
      color: $color-gray-600;

      p {
        margin-bottom: $spacing-4;
      }
    }
  `]
})
export class SalesListComponent implements OnInit {
  private salesService = inject(SalesService);
  private router = inject(Router);

  sales = signal<Sale[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.loadSales();
  }

  loadSales(): void {
    this.loading.set(true);
    this.salesService.getSales({ page: 1, pageSize: 100 }).subscribe({
      next: (response) => {
        this.sales.set(response.items);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load sales:', err);
        this.loading.set(false);
      }
    });
  }

  createSale(): void {
    this.router.navigate(['/sales/new']);
  }

  viewSale(id: string): void {
    this.router.navigate(['/sales', id]);
  }

  hasGoods(sale: Sale): boolean {
    return sale.lines.some(line => line.classification === 'Good');
  }

  hasServices(sale: Sale): boolean {
    return sale.lines.some(line => line.classification === 'Service');
  }

  getStatusVariant(status: string): any {
    if (status === 'Committed') return 'success';
    if (status === 'Cancelled') return 'danger';
    return 'warning';
  }
}
