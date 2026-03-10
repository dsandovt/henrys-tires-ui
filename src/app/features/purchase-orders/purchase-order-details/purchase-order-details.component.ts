import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PurchaseOrdersService } from '../../../core/services/purchase-orders.service';
import { PurchaseOrder } from '../../../core/models/inventory.models';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { EasternTimePipe } from '../../../shared/pipes/eastern-time.pipe';
import { SensitivePipe } from '../../../shared/pipes/sensitive.pipe';
import { CreatePurchaseOrderComponent } from '../create-purchase-order/create-purchase-order.component';

@Component({
  selector: 'app-purchase-order-details',
  standalone: true,
  imports: [CommonModule, CardComponent, BadgeComponent, ButtonComponent, EasternTimePipe, SensitivePipe, CreatePurchaseOrderComponent],
  template: `
    <app-create-purchase-order *ngIf="isNewMode" />

    <div class="po-details" *ngIf="!isNewMode && purchaseOrder()">
      <div class="header">
        <div>
          <h1>{{ purchaseOrder()!.number }}</h1>
          <p class="subtitle">Purchase Order</p>
        </div>
        <app-badge [variant]="getStatusVariant()">{{ purchaseOrder()!.status }}</app-badge>
      </div>

      <app-card title="Purchase Order Information">
        <div class="info-grid">
          <div class="info-item"><label>Branch:</label><span>{{ purchaseOrder()!.branchCode }}</span></div>
          <div class="info-item"><label>Order Date:</label><span>{{ purchaseOrder()!.orderDateUtc | easternTime:'withZone' }}</span></div>
          <div class="info-item" *ngIf="purchaseOrder()!.supplierName"><label>Supplier:</label><span>{{ purchaseOrder()!.supplierName }}</span></div>
          <div class="info-item"><label>Created By:</label><span>{{ purchaseOrder()!.createdBy }}</span></div>
          <div class="info-item"><label>Created At:</label><span>{{ purchaseOrder()!.createdAtUtc | easternTime:'withZone' }}</span></div>
          <div class="info-item full-width" *ngIf="purchaseOrder()!.notes"><label>Notes:</label><span>{{ purchaseOrder()!.notes }}</span></div>
        </div>
      </app-card>

      <app-card title="Status History" *ngIf="purchaseOrder()!.statusHistory?.length">
        <div class="status-history">
          <div *ngFor="let entry of purchaseOrder()!.statusHistory" class="status-entry">
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
              <th>Unit Price</th>
              <th>Currency</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let line of purchaseOrder()!.lines">
              <td><strong>{{ line.itemCode }}</strong></td>
              <td>{{ line.condition }}</td>
              <td>{{ line.quantity }}</td>
              <td>{{ line.unitPrice | number:'1.2-2' | sensitive }}</td>
              <td>{{ line.currency }}</td>
            </tr>
          </tbody>
        </table>
      </app-card>

      <div class="actions">
        <app-button variant="secondary" (click)="goBack()">Back to Purchase Orders</app-button>
        <app-button *ngIf="purchaseOrder()!.status === 'Draft'" variant="primary" (click)="receive()" [disabled]="actionLoading()">Receive</app-button>
        <app-button *ngIf="purchaseOrder()!.status === 'Draft'" variant="danger" (click)="cancel()" [disabled]="actionLoading()">Cancel</app-button>
      </div>
    </div>

    <div class="loading-state" *ngIf="!isNewMode && !purchaseOrder() && loading()">
      <p>Loading purchase order...</p>
    </div>
  `,
  styles: [`
    @use 'assets/styles/variables' as *;

    .po-details { max-width: 1200px; }
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
export class PurchaseOrderDetailsComponent implements OnInit {
  private purchaseOrdersService = inject(PurchaseOrdersService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  purchaseOrder = signal<PurchaseOrder | null>(null);
  loading = signal(false);
  actionLoading = signal(false);
  isNewMode = false;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['new'] !== undefined) {
        this.isNewMode = true;
        this.purchaseOrder.set(null);
        return;
      }

      this.isNewMode = false;
      const id = params['id'];
      if (id) {
        this.loading.set(true);
        this.purchaseOrdersService.getPurchaseOrderById(id).subscribe({
          next: (po) => {
            this.purchaseOrder.set(po);
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
    const s = status ?? this.purchaseOrder()?.status;
    if (s === 'Received') return 'success';
    if (s === 'Cancelled') return 'danger';
    return 'warning';
  }

  goBack(): void {
    this.router.navigate(['/purchase-orders']);
  }

  receive(): void {
    const id = this.purchaseOrder()?.id;
    if (!id) return;

    this.actionLoading.set(true);
    this.purchaseOrdersService.receivePurchaseOrder(id).subscribe({
      next: (po) => {
        this.purchaseOrder.set(po);
        this.actionLoading.set(false);
      },
      error: () => {
        this.actionLoading.set(false);
      }
    });
  }

  cancel(): void {
    const id = this.purchaseOrder()?.id;
    if (!id) return;

    this.actionLoading.set(true);
    this.purchaseOrdersService.cancelPurchaseOrder(id).subscribe({
      next: () => {
        this.purchaseOrder.update(po => po ? { ...po, status: 'Cancelled' } : null);
        this.actionLoading.set(false);
      },
      error: () => {
        this.actionLoading.set(false);
      }
    });
  }
}
