import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TransactionsService } from '../../../core/services/transactions.service';
import { Transaction } from '../../../core/models/inventory.models';
import { TableComponent } from '../../../shared/components/table/table.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { formatEasternTimeShort } from '../../../core/utils/timezone.utils';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TableComponent, CardComponent, InputComponent, ButtonComponent],
  template: `
    <div class="transaction-list">
      <div class="page-header">
        <app-input
          [(ngModel)]="searchQuery"
          placeholder="Search transactions..."
          (ngModelChange)="onSearch()"
        ></app-input>
      </div>

      <app-card>
        <app-table
          [columns]="columns"
          [data]="transactions()"
          [clickable]="true"
          (rowClick)="viewTransaction($event)"
          emptyMessage="No transactions found"
        ></app-table>

        <div *ngIf="totalCount() > 0" class="pagination">
          <p class="pagination-info">Showing {{ ((currentPage() - 1) * pageSize()) + 1 }} to {{ Math.min(currentPage() * pageSize(), totalCount()) }} of {{ totalCount() }} transactions</p>
          <div class="pagination-controls">
            <app-button size="sm" variant="secondary" [disabled]="currentPage() === 1" (click)="previousPage()">Previous</app-button>
            <span class="page-number">Page {{ currentPage() }}</span>
            <app-button size="sm" variant="secondary" [disabled]="currentPage() * pageSize() >= totalCount()" (click)="nextPage()">Next</app-button>
          </div>
        </div>
      </app-card>
    </div>
  `,
  styles: [`
    @use 'assets/styles/variables' as *;
    .transaction-list { display: flex; flex-direction: column; gap: $spacing-6; }
    .page-header { display: flex; gap: $spacing-4; }
    .pagination { display: flex; justify-content: space-between; align-items: center; padding-top: $spacing-4; margin-top: $spacing-4; border-top: 1px solid #e5e5e5; }
    .pagination-info { margin: 0; font-size: 0.875rem; color: #737373; }
    .pagination-controls { display: flex; gap: 0.75rem; align-items: center; }
    .page-number { font-size: 0.875rem; font-weight: 500; color: #404040; }
  `]
})
export class TransactionListComponent implements OnInit {
  private transactionsService = inject(TransactionsService);
  Math = Math;
  searchQuery = '';
  currentPage = signal(1);
  pageSize = signal(20);
  totalCount = signal(0);
  transactions = signal<Transaction[]>([]);
  columns = [
    { key: 'transactionNumber', label: 'Transaction #', sortable: true },
    { key: 'branchCode', label: 'Branch', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'transactionDateUtc', label: 'Date', sortable: true },
    { key: 'createdBy', label: 'Created By', sortable: true }
  ];

  ngOnInit(): void { this.loadTransactions(); }

  loadTransactions(): void {
    this.transactionsService.getTransactions({
      page: this.currentPage(),
      pageSize: this.pageSize(),
      search: this.searchQuery || undefined
    }).subscribe({
      next: (response) => {
        // Transform dates to Eastern Time for display
        const transformedItems = response.items.map(item => ({
          ...item,
          transactionDateUtc: formatEasternTimeShort(item.transactionDateUtc),
          createdAtUtc: formatEasternTimeShort(item.createdAtUtc)
        }));
        this.transactions.set(transformedItems as any);
        this.totalCount.set(response.totalCount);
      },
      error: (err) => console.error('Failed to load transactions:', err)
    });
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadTransactions();
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadTransactions();
    }
  }

  nextPage(): void {
    if (this.currentPage() * this.pageSize() < this.totalCount()) {
      this.currentPage.update(p => p + 1);
      this.loadTransactions();
    }
  }

  viewTransaction(transaction: Transaction): void {
    window.location.href = `/transactions/${transaction.id}`;
  }
}
