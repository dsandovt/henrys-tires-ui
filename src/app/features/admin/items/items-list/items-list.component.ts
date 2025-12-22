import { Component, inject, signal, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemsService } from '../../../../core/services/items.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { Item } from '../../../../core/models/inventory.models';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ItemFormModalComponent } from '../item-form-modal/item-form-modal.component';

@Component({
  selector: 'app-items-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, InputComponent, ButtonComponent, ItemFormModalComponent],
  template: `
    <div class="items-list">
      <div class="page-header">
        <app-input [(ngModel)]="searchQuery" placeholder="Search items..." (ngModelChange)="onSearch()"></app-input>
        <app-button variant="primary" (click)="createItem()">+ Create Item</app-button>
      </div>

      <app-card>
        <div class="table-container">
          <table class="items-table">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Description</th>
                <th>Type</th>
                <th>Created By</th>
                <th>Created At</th>
                <th class="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of items()" [class.deleted]="item.isDeleted">
                <td><strong>{{ item.itemCode }}</strong></td>
                <td>{{ item.description }}</td>
                <td>
                  <span class="badge" [class.badge-good]="item.classification === 'Good'" [class.badge-service]="item.classification === 'Service'">
                    {{ item.classification }}
                  </span>
                </td>
                <td>{{ item.createdBy }}</td>
                <td>{{ formatDate(item.createdAtUtc) }}</td>
                <td class="actions-column">
                  <div class="action-buttons">
                    <app-button size="sm" variant="secondary" (click)="editItem(item)">Edit</app-button>
                    <app-button
                      size="sm"
                      variant="danger"
                      (click)="deleteItem(item)"
                      [disabled]="item.isDeleted"
                    >
                      {{ item.isDeleted ? 'Deleted' : 'Delete' }}
                    </app-button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="items().length === 0">
                <td colspan="6" class="empty-message">No items found</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div *ngIf="totalCount() > 0" class="pagination">
          <p class="pagination-info">
            Showing {{ ((currentPage() - 1) * pageSize()) + 1 }} to {{ Math.min(currentPage() * pageSize(), totalCount()) }} of {{ totalCount() }} items
          </p>
          <div class="pagination-controls">
            <app-button size="sm" variant="secondary" [disabled]="currentPage() === 1" (click)="previousPage()">Previous</app-button>
            <span class="page-number">Page {{ currentPage() }}</span>
            <app-button size="sm" variant="secondary" [disabled]="currentPage() * pageSize() >= totalCount()" (click)="nextPage()">Next</app-button>
          </div>
        </div>
      </app-card>

      <app-item-form-modal #itemModal (itemSaved)="onItemSaved()"></app-item-form-modal>
    </div>
  `,
  styles: [`
    .items-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .page-header {
      display: flex;
      gap: var(--space-4);
      align-items: center;
    }

    .table-container {
      overflow-x: auto;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
    }

    .items-table thead {
      background: var(--color-background-secondary);
      border-bottom: 2px solid var(--color-border);
    }

    .items-table th {
      padding: var(--space-3) var(--space-4);
      text-align: left;
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .items-table td {
      padding: var(--space-4);
      border-bottom: 1px solid var(--color-border);
      font-size: var(--text-sm);
      color: var(--color-text-primary);
    }

    .items-table tbody tr:hover {
      background: var(--color-background-hover);
    }

    .items-table tbody tr.deleted {
      opacity: 0.5;
      background: var(--color-background-secondary);
    }

    .actions-column {
      width: 200px;
    }

    .action-buttons {
      display: flex;
      gap: var(--space-2);
    }

    .empty-message {
      text-align: center;
      padding: var(--space-8) var(--space-4);
      color: var(--color-text-secondary);
      font-style: italic;
    }

    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: var(--space-4);
      margin-top: var(--space-4);
      border-top: 1px solid var(--color-border);
    }

    .pagination-info {
      margin: 0;
      font-size: var(--text-sm);
      color: var(--color-text-secondary);
    }

    .pagination-controls {
      display: flex;
      gap: var(--space-3);
      align-items: center;
    }

    .page-number {
      font-size: var(--text-sm);
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .badge-good {
      background: #dcfce7;
      color: #166534;
    }

    .badge-service {
      background: #dbeafe;
      color: #1e40af;
    }
  `]
})
export class ItemsListComponent implements OnInit {
  @ViewChild('itemModal') itemModal!: ItemFormModalComponent;

  private itemsService = inject(ItemsService);
  private toastService = inject(ToastService);

  Math = Math;
  searchQuery = '';
  currentPage = signal(1);
  pageSize = signal(20);
  totalCount = signal(0);
  items = signal<Item[]>([]);

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.itemsService.getItems({
      page: this.currentPage(),
      pageSize: this.pageSize(),
      search: this.searchQuery || undefined
    }).subscribe({
      next: (response) => {
        this.items.set(response.items);
        this.totalCount.set(response.totalCount);
      },
      error: (err) => {
        console.error('Failed to load items:', err);
        this.toastService.danger('Failed to load items');
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  createItem(): void {
    this.itemModal.open();
  }

  editItem(item: Item): void {
    this.itemModal.open(item);
  }

  deleteItem(item: Item): void {
    if (!confirm(`Are you sure you want to delete "${item.itemCode}"?`)) {
      return;
    }

    this.itemsService.deleteItem(item.itemCode).subscribe({
      next: () => {
        this.toastService.success('Item deleted successfully');
        this.loadItems();
      },
      error: (err) => {
        console.error('Failed to delete item:', err);
        this.toastService.danger(err.error?.errorMessage || 'Failed to delete item');
      }
    });
  }

  onItemSaved(): void {
    this.loadItems();
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadItems();
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadItems();
    }
  }

  nextPage(): void {
    if (this.currentPage() * this.pageSize() < this.totalCount()) {
      this.currentPage.update(p => p + 1);
      this.loadItems();
    }
  }
}
