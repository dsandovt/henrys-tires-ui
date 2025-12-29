import { Component, inject, signal, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PricesService } from '../../../../core/services/prices.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { ConsumableItemPrice } from '../../../../core/models/inventory.models';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { PriceFormModalComponent } from '../price-form-modal/price-form-modal.component';

@Component({
  selector: 'app-prices-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, InputComponent, ButtonComponent, PriceFormModalComponent],
  template: `
    <div class="prices-list">
      <div class="page-header">
        <app-input [(ngModel)]="searchQuery" placeholder="Search prices..." (ngModelChange)="onSearch()"></app-input>
      </div>

      <app-card>
        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Current Price</th>
                <th>Currency</th>
                <th>Last Updated</th>
                <th class="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let price of prices()">
                <td class="font-medium">{{ price.itemCode }}</td>
                <td>{{ price.latestPrice.toFixed(2) }}</td>
                <td>{{ price.currency }}</td>
                <td>{{ formatDate(price.latestPriceDateUtc) }}</td>
                <td class="actions-column">
                  <app-button size="sm" variant="secondary" (click)="editPrice(price)">Edit Price</app-button>
                </td>
              </tr>
              <tr *ngIf="prices().length === 0">
                <td colspan="5" class="empty-state">No prices found</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div *ngIf="totalCount() > 0" class="pagination">
          <p class="pagination-info">Showing {{ ((currentPage() - 1) * pageSize()) + 1 }} to {{ Math.min(currentPage() * pageSize(), totalCount()) }} of {{ totalCount() }} prices</p>
          <div class="pagination-controls">
            <app-button size="sm" variant="secondary" [disabled]="currentPage() === 1" (click)="previousPage()">Previous</app-button>
            <span class="page-number">Page {{ currentPage() }}</span>
            <app-button size="sm" variant="secondary" [disabled]="currentPage() * pageSize() >= totalCount()" (click)="nextPage()">Next</app-button>
          </div>
        </div>
      </app-card>

      <app-price-form-modal (priceSaved)="onPriceSaved()"></app-price-form-modal>
    </div>
  `,
  styles: [`
    @use 'assets/styles/variables' as *;
    .prices-list { display: flex; flex-direction: column; gap: $spacing-6; }
    .page-header { display: flex; gap: $spacing-4; }
    .table-container { overflow-x: auto; }
    .custom-table { width: 100%; border-collapse: collapse; }
    .custom-table th { text-align: left; padding: 0.75rem 1rem; font-size: 0.875rem; font-weight: 600; color: #404040; background-color: #f9fafb; border-bottom: 2px solid #e5e7eb; }
    .custom-table td { padding: 0.875rem 1rem; border-bottom: 1px solid #e5e7eb; font-size: 0.9375rem; color: #525252; }
    .custom-table tbody tr:hover { background-color: #f9fafb; }
    .font-medium { font-weight: 500; color: #404040; }
    .actions-column { text-align: right; width: 120px; }
    .empty-state { text-align: center; padding: 2rem; color: #737373; font-style: italic; }
    .pagination { display: flex; justify-content: space-between; align-items: center; padding-top: $spacing-4; margin-top: $spacing-4; border-top: 1px solid #e5e5e5; }
    .pagination-info { margin: 0; font-size: 0.875rem; color: #737373; }
    .pagination-controls { display: flex; gap: 0.75rem; align-items: center; }
    .page-number { font-size: 0.875rem; font-weight: 500; color: #404040; }
  `]
})
export class PricesListComponent implements OnInit {
  @ViewChild(PriceFormModalComponent) priceFormModal!: PriceFormModalComponent;

  private pricesService = inject(PricesService);
  private toastService = inject(ToastService);
  Math = Math;
  searchQuery = '';
  currentPage = signal(1);
  pageSize = signal(20);
  totalCount = signal(0);
  prices = signal<ConsumableItemPrice[]>([]);

  ngOnInit(): void { this.loadPrices(); }

  loadPrices(): void {
    this.pricesService.getPrices({ page: this.currentPage(), pageSize: this.pageSize(), search: this.searchQuery || undefined }).subscribe({
      next: (response) => { this.prices.set(response.items); this.totalCount.set(response.totalCount); },
      error: (err) => console.error('Failed to load prices:', err)
    });
  }

  onSearch(): void { this.currentPage.set(1); this.loadPrices(); }
  previousPage(): void { if (this.currentPage() > 1) { this.currentPage.update(p => p - 1); this.loadPrices(); } }
  nextPage(): void { if (this.currentPage() * this.pageSize() < this.totalCount()) { this.currentPage.update(p => p + 1); this.loadPrices(); } }

  editPrice(price: ConsumableItemPrice): void {
    this.priceFormModal.open(price);
  }

  onPriceSaved(): void {
    this.loadPrices();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
