import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InventoryAdjustmentsService } from '../../../core/services/inventory-adjustments.service';
import { InventoryAdjustment } from '../../../core/models/inventory.models';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { EasternTimePipe } from '../../../shared/pipes/eastern-time.pipe';

@Component({
  selector: 'app-adjustment-list',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent, BadgeComponent, EasternTimePipe],
  template: `
    <div class="adjustment-list">
      <div class="header">
        <h1>Inventory Adjustments</h1>
        <div class="header-actions">
          <app-button variant="primary" (click)="createBranchTransfer()">+ Branch Transfer</app-button>
          <app-button variant="primary" (click)="createStockCorrection()">+ Stock Correction</app-button>
        </div>
      </div>

      <app-card>
        <div class="table-container" *ngIf="adjustments().length > 0">
          <table class="adj-table">
            <thead>
              <tr>
                <th>Number</th>
                <th>Type</th>
                <th>Branch(es)</th>
                <th>Date</th>
                <th>Status</th>
                <th>Items</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let adj of adjustments()" (click)="viewAdjustment(adj.id)" class="clickable-row">
                <td><strong>{{ adj.number }}</strong></td>
                <td>{{ adj.adjustmentType === 'BranchTransfer' ? 'Branch Transfer' : 'Stock Correction' }}</td>
                <td>
                  <span *ngIf="adj.adjustmentType === 'BranchTransfer'">{{ adj.originBranchCode }} → {{ adj.destinationBranchCode }}</span>
                  <span *ngIf="adj.adjustmentType === 'StockCorrection'">{{ adj.branchCode }} ({{ adj.direction }})</span>
                </td>
                <td>{{ adj.adjustmentDateUtc | easternTime:'short' }}</td>
                <td>
                  <app-badge [variant]="getStatusVariant(adj.status)">{{ adj.status }}</app-badge>
                </td>
                <td>
                  <span class="item-count">{{ adj.lines.length }} item(s)</span>
                </td>
                <td>{{ adj.createdBy }}</td>
                <td>
                  <app-button variant="secondary" size="sm" (click)="viewAdjustment(adj.id); $event.stopPropagation()">
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

        <div class="empty-state" *ngIf="adjustments().length === 0 && !loading()">
          <p>No inventory adjustments found.</p>
        </div>

        <div class="loading-state" *ngIf="loading()">
          <p>Loading inventory adjustments...</p>
        </div>
      </app-card>
    </div>
  `,
  styles: [`
    @use 'assets/styles/variables' as *;

    .adjustment-list {
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

    .header-actions {
      display: flex;
      gap: $spacing-3;
    }

    .table-container {
      overflow-x: auto;
    }

    .adj-table {
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
export class AdjustmentListComponent implements OnInit {
  private adjustmentsService = inject(InventoryAdjustmentsService);
  private router = inject(Router);

  adjustments = signal<InventoryAdjustment[]>([]);
  loading = signal(false);
  currentPage = signal(1);
  totalCount = signal(0);
  pageSize = 20;

  totalPages = () => Math.ceil(this.totalCount() / this.pageSize);

  ngOnInit(): void {
    this.loadAdjustments();
  }

  loadAdjustments(): void {
    this.loading.set(true);
    this.adjustmentsService.getAdjustments({ page: this.currentPage(), pageSize: this.pageSize }).subscribe({
      next: (response) => {
        this.adjustments.set(response.items as unknown as InventoryAdjustment[]);
        this.totalCount.set(response.totalCount);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load adjustments:', err);
        this.loading.set(false);
      }
    });
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadAdjustments();
  }

  createBranchTransfer(): void {
    this.router.navigate(['/adjustment-details'], { queryParams: { new: 'branch-transfer' } });
  }

  createStockCorrection(): void {
    this.router.navigate(['/adjustment-details'], { queryParams: { new: 'stock-correction' } });
  }

  viewAdjustment(id: string): void {
    this.router.navigate(['/adjustment-details'], { queryParams: { id } });
  }

  getStatusVariant(status: string): any {
    if (status === 'Committed') return 'success';
    if (status === 'Cancelled') return 'danger';
    return 'warning';
  }
}
