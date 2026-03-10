import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PurchaseOrdersService } from '../../../core/services/purchase-orders.service';
import { PurchaseOrder } from '../../../core/models/inventory.models';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { EasternTimePipe } from '../../../shared/pipes/eastern-time.pipe';

@Component({
  selector: 'app-purchase-order-list',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent, BadgeComponent, EasternTimePipe],
  template: `
    <div class="purchase-order-list">
      <div class="header">
        <h1>Purchase Orders</h1>
        <app-button variant="primary" (click)="createPurchaseOrder()">+ New Purchase Order</app-button>
      </div>

      <app-card>
        <div class="table-container" *ngIf="purchaseOrders().length > 0">
          <table class="po-table">
            <thead>
              <tr>
                <th>Number</th>
                <th>Branch</th>
                <th>Date</th>
                <th>Status</th>
                <th>Items</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let po of purchaseOrders()" (click)="viewPurchaseOrder(po.id)" class="clickable-row">
                <td><strong>{{ po.number }}</strong></td>
                <td>{{ po.branchCode }}</td>
                <td>{{ po.orderDateUtc | easternTime:'short' }}</td>
                <td>
                  <app-badge [variant]="getStatusVariant(po.status)">{{ po.status }}</app-badge>
                </td>
                <td>
                  <span class="item-count">{{ po.lines.length }} item(s)</span>
                </td>
                <td>{{ po.createdBy }}</td>
                <td>
                  <app-button variant="secondary" size="sm" (click)="viewPurchaseOrder(po.id); $event.stopPropagation()">
                    View
                  </app-button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination" *ngIf="totalCount() > pageSize">
          <app-button variant="secondary" size="sm" [disabled]="currentPage() <= 1" (click)="goToPage(currentPage() - 1)">Previous</app-button>
          <span class="page-info">Page {{ currentPage() }} of {{ totalPages() }}</span>
          <app-button variant="secondary" size="sm" [disabled]="currentPage() >= totalPages()" (click)="goToPage(currentPage() + 1)">Next</app-button>
        </div>

        <div class="empty-state" *ngIf="purchaseOrders().length === 0 && !loading()">
          <p>No purchase orders found.</p>
          <app-button variant="primary" (click)="createPurchaseOrder()">Create your first purchase order</app-button>
        </div>

        <div class="loading-state" *ngIf="loading()">
          <p>Loading purchase orders...</p>
        </div>
      </app-card>
    </div>
  `,
  styles: [`
    @use 'assets/styles/variables' as *;

    .purchase-order-list {
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

    .po-table {
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
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: $spacing-3;
      padding: $spacing-4;
    }

    .page-info {
      font-size: $font-size-sm;
      color: $color-gray-600;
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
export class PurchaseOrderListComponent implements OnInit {
  private purchaseOrdersService = inject(PurchaseOrdersService);
  private router = inject(Router);

  purchaseOrders = signal<PurchaseOrder[]>([]);
  loading = signal(false);
  currentPage = signal(1);
  totalCount = signal(0);
  pageSize = 20;

  totalPages = () => Math.ceil(this.totalCount() / this.pageSize);

  ngOnInit(): void {
    this.loadPurchaseOrders();
  }

  loadPurchaseOrders(): void {
    this.loading.set(true);
    this.purchaseOrdersService.getPurchaseOrders({ page: this.currentPage(), pageSize: this.pageSize }).subscribe({
      next: (response) => {
        this.purchaseOrders.set(response.items as unknown as PurchaseOrder[]);
        this.totalCount.set(response.totalCount);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load purchase orders:', err);
        this.loading.set(false);
      }
    });
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadPurchaseOrders();
  }

  createPurchaseOrder(): void {
    this.router.navigate(['/purchase-order-details'], { queryParams: { new: true } });
  }

  viewPurchaseOrder(id: string): void {
    this.router.navigate(['/purchase-order-details'], { queryParams: { id } });
  }

  getStatusVariant(status: string): any {
    if (status === 'Received') return 'success';
    if (status === 'Cancelled') return 'danger';
    return 'warning';
  }
}
