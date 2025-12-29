import { Component, inject, signal, OnInit, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { InventoryService } from '../../../core/services/inventory.service';
import { AuthService } from '../../../core/auth/auth.service';
import { BranchesService } from '../../../core/services/branches.service';
import { InventorySummary, ItemCondition, Branch } from '../../../core/models/inventory.models';
import { Role } from '../../../core/models/auth.models';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CardComponent,
    ButtonComponent,
    InputComponent,
    SkeletonComponent
  ],
  template: `
    <div class="stock-list">
      <div class="page-header">
        <div class="header-actions">
          <app-input
            [(ngModel)]="searchQuery"
            placeholder="Search items..."
            (ngModelChange)="onSearch()"
          ></app-input>

          <div class="filter-group" *ngIf="isAdmin()">
            <label for="branchFilter" class="filter-label">Filter by Store:</label>
            <select
              id="branchFilter"
              [(ngModel)]="selectedBranchCode"
              (ngModelChange)="onBranchFilterChange()"
              class="branch-filter"
            >
              <option value="">All Stores</option>
              <option *ngFor="let branch of branches()" [value]="branch.code">
                {{ branch.name }}
              </option>
            </select>
          </div>

          <div class="action-buttons" *ngIf="canCreateTransactions()">
            <app-button
              variant="primary"
              routerLink="/transactions/in/new"
            >
              + Transfer IN
            </app-button>
            <app-button
              variant="secondary"
              routerLink="/transactions/out/new"
            >
              Transfer OUT
            </app-button>
          </div>
        </div>
      </div>

      <app-card>
        <div *ngIf="!loading() && generalStock()" class="general-stock-summary">
          <h3>Stock Summary</h3>
          <div class="stock-totals">
            <div class="stock-item">
              <span class="label">New:</span>
              <span class="value new-badge">{{ generalStock()!.newStock }}</span>
            </div>
            <div class="stock-item">
              <span class="label">Used:</span>
              <span class="value used-badge">{{ generalStock()!.usedStock }}</span>
            </div>
            <div class="stock-item total">
              <span class="label">Total:</span>
              <span class="value">{{ generalStock()!.totalStock }}</span>
            </div>
          </div>
        </div>

        <div *ngIf="loading()" class="loading-state">
          <app-skeleton *ngFor="let i of [1,2,3,4,5]" width="100%" height="60px"></app-skeleton>
        </div>

        <div *ngIf="!loading()" class="table-container">
          <table class="stock-table">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Branch</th>
                <th>On Hand</th>
                <th>Reserved</th>
                <th>Available</th>
                <th>Condition Breakdown</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of inventoryData()">
                <td class="font-medium">{{ item.itemCode }}</td>
                <td>{{ item.branchCode }}</td>
                <td class="text-right">{{ item.onHandTotal }}</td>
                <td class="text-right">{{ item.reservedTotal }}</td>
                <td class="text-right font-semibold">{{ item.onHandTotal - item.reservedTotal }}</td>
                <td>
                  <div class="condition-breakdown">
                    <span *ngFor="let entry of item.entries" class="condition-badge" [class.new]="isNewCondition(entry.itemCondition)" [class.used]="isUsedCondition(entry.itemCondition)">
                      {{ getConditionName(entry.itemCondition) }}: {{ entry.onHand }}
                      <span *ngIf="entry.reserved > 0" class="reserved-count">({{ entry.reserved }} reserved)</span>
                    </span>
                  </div>
                </td>
              </tr>
              <tr *ngIf="inventoryData().length === 0">
                <td colspan="6" class="empty-state">{{ emptyMessage() }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div *ngIf="!loading() && totalCount() > 0" class="pagination">
          <p class="pagination-info">
            Showing {{ ((currentPage() - 1) * pageSize()) + 1 }} to {{ Math.min(currentPage() * pageSize(), totalCount()) }} of {{ totalCount() }} items
          </p>

          <div class="pagination-controls">
            <app-button
              size="sm"
              variant="secondary"
              [disabled]="currentPage() === 1"
              (click)="previousPage()"
            >
              Previous
            </app-button>
            <span class="page-number">Page {{ currentPage() }}</span>
            <app-button
              size="sm"
              variant="secondary"
              [disabled]="currentPage() * pageSize() >= totalCount()"
              (click)="nextPage()"
            >
              Next
            </app-button>
          </div>
        </div>
      </app-card>
    </div>
  `,
  styleUrls: ['./stock-list.component.scss']
})
export class StockListComponent implements OnInit, OnDestroy {
  private inventoryService = inject(InventoryService);
  private authService = inject(AuthService);
  private branchesService = inject(BranchesService);

  Math = Math;
  ItemCondition = ItemCondition;

  searchQuery = '';
  selectedBranchCode = '';
  private searchSubject = new Subject<string>();
  currentPage = signal(1);
  pageSize = signal(20);
  totalCount = signal(0);
  loading = signal(false);
  inventoryData = signal<InventorySummary[]>([]);
  branches = signal<Branch[]>([]);
  generalStock = signal<{ newStock: number; usedStock: number; totalStock: number } | null>(null);

  isAdmin = this.authService.isAdmin;

  emptyMessage = computed(() =>
    this.searchQuery ? `No items found matching "${this.searchQuery}"` : 'No stock items available'
  );

  canCreateTransactions = computed(() => {
    const userRole = this.authService.userRole();
    return userRole !== Role.StoreSeller;
  });

  ngOnInit(): void {
    // Set up debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage.set(1);
      this.loadInventory();
    });

    // Load branches for admin users
    if (this.authService.isAdmin()) {
      this.branchesService.getAllBranches().subscribe({
        next: (branches: Branch[]) => {
          this.branches.set(branches);
        },
        error: (err: any) => {
          console.error('Failed to load branches:', err);
        }
      });
    }

    this.loadInventory();
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  loadInventory(): void {
    this.loading.set(true);

    // Determine which branch to filter by:
    // - Admins: Use selectedBranchCode (empty = all branches)
    // - Non-admins: Use their assigned branch
    let branchCode: string | undefined;
    if (this.authService.isAdmin()) {
      branchCode = this.selectedBranchCode || undefined;
    } else {
      branchCode = this.authService.branchCode() || undefined;
    }

    this.inventoryService.getInventorySummaries({
      page: this.currentPage(),
      pageSize: this.pageSize(),
      search: this.searchQuery || undefined,
      branchCode: branchCode
    }).subscribe({
      next: (response) => {
        console.log('Inventory loaded:', response);
        this.inventoryData.set(response.items);
        this.totalCount.set(response.totalCount);
        this.generalStock.set(response.generalStock || null);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load inventory:', err);
        this.loading.set(false);
        this.inventoryData.set([]);

        // Show error to user
        if (err.status === 401) {
          alert('Authorization error: ' + (err.error?.message || 'You do not have permission to access inventory. Please contact your administrator.'));
        }
      }
    });
  }

  onBranchFilterChange(): void {
    this.currentPage.set(1);
    this.loadInventory();
  }

  onSearch(): void {
    this.searchSubject.next(this.searchQuery);
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadInventory();
    }
  }

  nextPage(): void {
    if (this.currentPage() * this.pageSize() < this.totalCount()) {
      this.currentPage.update(p => p + 1);
      this.loadInventory();
    }
  }

  getConditionName(condition: any): string {
    // Handle both enum values and potential numeric values from API
    if (condition === ItemCondition.New || condition === 'New' || condition === 0) {
      return 'New';
    } else if (condition === ItemCondition.Used || condition === 'Used' || condition === 1) {
      return 'Used';
    }
    return String(condition);
  }

  isNewCondition(condition: any): boolean {
    return condition === ItemCondition.New || condition === 'New' || condition === 0;
  }

  isUsedCondition(condition: any): boolean {
    return condition === ItemCondition.Used || condition === 'Used' || condition === 1;
  }
}
