import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryAdjustmentsService } from '../../../core/services/inventory-adjustments.service';
import { InventoryAdjustment } from '../../../core/models/inventory.models';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { EasternTimePipe } from '../../../shared/pipes/eastern-time.pipe';
import { CreateBranchTransferComponent } from '../create-branch-transfer/create-branch-transfer.component';
import { CreateStockCorrectionComponent } from '../create-stock-correction/create-stock-correction.component';

@Component({
  selector: 'app-adjustment-details',
  standalone: true,
  imports: [CommonModule, CardComponent, BadgeComponent, ButtonComponent, EasternTimePipe, CreateBranchTransferComponent, CreateStockCorrectionComponent],
  template: `
    <app-create-branch-transfer *ngIf="newMode === 'branch-transfer'" />
    <app-create-stock-correction *ngIf="newMode === 'stock-correction'" />

    <div class="adj-details" *ngIf="!newMode && adjustment()">
      <div class="header">
        <div>
          <h1>{{ adjustment()!.number }}</h1>
          <p class="subtitle">{{ adjustment()!.adjustmentType === 'BranchTransfer' ? 'Branch Transfer' : 'Stock Correction' }}</p>
        </div>
        <app-badge [variant]="getStatusVariant()">{{ adjustment()!.status }}</app-badge>
      </div>

      <app-card title="Adjustment Information">
        <div class="info-grid">
          <div class="info-item"><label>Type:</label><span>{{ adjustment()!.adjustmentType === 'BranchTransfer' ? 'Branch Transfer' : 'Stock Correction' }}</span></div>
          <div class="info-item"><label>Date:</label><span>{{ adjustment()!.adjustmentDateUtc | easternTime:'withZone' }}</span></div>

          <!-- BranchTransfer fields -->
          <div class="info-item" *ngIf="adjustment()!.adjustmentType === 'BranchTransfer'"><label>Origin Branch:</label><span>{{ adjustment()!.originBranchCode }}</span></div>
          <div class="info-item" *ngIf="adjustment()!.adjustmentType === 'BranchTransfer'"><label>Destination Branch:</label><span>{{ adjustment()!.destinationBranchCode }}</span></div>

          <!-- StockCorrection fields -->
          <div class="info-item" *ngIf="adjustment()!.adjustmentType === 'StockCorrection'"><label>Branch:</label><span>{{ adjustment()!.branchCode }}</span></div>
          <div class="info-item" *ngIf="adjustment()!.adjustmentType === 'StockCorrection'"><label>Direction:</label><span>{{ adjustment()!.direction }}</span></div>

          <div class="info-item"><label>Created By:</label><span>{{ adjustment()!.createdBy }}</span></div>
          <div class="info-item"><label>Created At:</label><span>{{ adjustment()!.createdAtUtc | easternTime:'withZone' }}</span></div>
          <div class="info-item full-width" *ngIf="adjustment()!.notes"><label>Notes:</label><span>{{ adjustment()!.notes }}</span></div>
        </div>
      </app-card>

      <app-card title="Status History" *ngIf="adjustment()!.statusHistory?.length">
        <div class="status-history">
          <div *ngFor="let entry of adjustment()!.statusHistory" class="status-entry">
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
              <th>Condition</th>
              <th>Quantity</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let line of adjustment()!.lines">
              <td><strong>{{ line.itemCode }}</strong></td>
              <td>{{ line.condition }}</td>
              <td>{{ line.quantity }}</td>
              <td>{{ line.notes || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </app-card>

      <div class="actions">
        <app-button variant="secondary" (click)="goBack()">Back to Adjustments</app-button>
        <app-button *ngIf="adjustment()!.status === 'Draft'" variant="primary" (click)="commit()" [disabled]="actionLoading()">Commit</app-button>
        <app-button *ngIf="adjustment()!.status === 'Draft'" variant="danger" (click)="cancel()" [disabled]="actionLoading()">Cancel</app-button>
      </div>
    </div>

    <div class="loading-state" *ngIf="!newMode && !adjustment() && loading()">
      <p>Loading adjustment...</p>
    </div>
  `,
  styles: [`
    @use 'assets/styles/variables' as *;

    .adj-details { max-width: 1200px; }
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
    .loading-state { text-align: center; padding: $spacing-12 $spacing-4; color: $color-gray-600; }
  `]
})
export class AdjustmentDetailsComponent implements OnInit {
  private adjustmentsService = inject(InventoryAdjustmentsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  adjustment = signal<InventoryAdjustment | null>(null);
  loading = signal(false);
  actionLoading = signal(false);
  newMode: string | null = null;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['new'] !== undefined) {
        this.newMode = params['new'];
        this.adjustment.set(null);
        return;
      }

      this.newMode = null;
      const id = params['id'];
      if (id) {
        this.loading.set(true);
        this.adjustmentsService.getAdjustmentById(id).subscribe({
          next: (adj) => {
            this.adjustment.set(adj);
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
          }
        });
      }
    });
  }

  getStatusVariant(status?: string): any {
    const s = status ?? this.adjustment()?.status;
    if (s === 'Committed') return 'success';
    if (s === 'Cancelled') return 'danger';
    return 'warning';
  }

  goBack(): void {
    this.router.navigate(['/inventory-adjustments']);
  }

  commit(): void {
    const id = this.adjustment()?.id;
    if (!id) return;

    this.actionLoading.set(true);
    this.adjustmentsService.commitAdjustment(id).subscribe({
      next: (adj) => {
        this.adjustment.set(adj);
        this.actionLoading.set(false);
      },
      error: () => {
        this.actionLoading.set(false);
      }
    });
  }

  cancel(): void {
    const id = this.adjustment()?.id;
    if (!id) return;

    this.actionLoading.set(true);
    this.adjustmentsService.cancelAdjustment(id).subscribe({
      next: (adj) => {
        this.adjustment.set(adj);
        this.actionLoading.set(false);
      },
      error: () => {
        this.actionLoading.set(false);
      }
    });
  }
}
