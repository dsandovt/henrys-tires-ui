import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportsService } from '../../../core/services/reports.service';
import { BranchesService } from '../../../core/services/branches.service';
import { InventoryMovementsReport } from '../../../core/models/report.models';
import { Branch } from '../../../core/models/inventory.models';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { SelectComponent } from '../../../shared/components/select/select.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { LucideAngularModule, Download, LucideIconProvider, LUCIDE_ICONS } from 'lucide-angular';

@Component({
  selector: 'app-inventory-movements',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent, SelectComponent, InputComponent, LucideAngularModule],
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ Download })
    }
  ],
  template: `
    <div class="inventory-movements">
      <div class="header">
        <h1>Inventory Movements Report</h1>
        <app-button variant="primary" (click)="downloadExcel()" [disabled]="loading()">
          <lucide-icon name="download" [size]="16"></lucide-icon>
          Export to Excel
        </app-button>
      </div>

      <app-card>
        <div class="filters">
          <div class="filter-row">
            <app-input type="date" [(ngModel)]="fromDate" placeholder="From Date"></app-input>
            <app-input type="date" [(ngModel)]="toDate" placeholder="To Date"></app-input>
            <app-select
              [options]="branchOptions()"
              [(ngModel)]="branchCode"
              placeholder="All Branches">
            </app-select>
          </div>
          <div class="filter-row">
            <app-select
              [options]="typeOptions"
              [(ngModel)]="transactionType"
              placeholder="All Types">
            </app-select>
            <app-select
              [options]="statusOptions"
              [(ngModel)]="status"
              placeholder="All Statuses">
            </app-select>
            <app-button variant="primary" (click)="loadReport()">Apply Filters</app-button>
          </div>
        </div>

        <div *ngIf="loading()" class="loading">Loading...</div>

        <div *ngIf="!loading() && report()">
          <div class="report-info">
            <p><strong>Period:</strong> {{ formatDate(report()?.fromDateUtc) }} - {{ formatDate(report()?.toDateUtc) }}</p>
            <p><strong>Total Transactions:</strong> {{ report()?.totalCount }}</p>
          </div>

          <div class="transactions-list">
            <div *ngFor="let transaction of report()?.transactions" class="transaction-card">
              <div class="transaction-header">
                <h3>{{ transaction.transactionNumber }}</h3>
                <span class="status-badge" [class]="transaction.status.toLowerCase()">{{ transaction.status }}</span>
              </div>
              <div class="transaction-details">
                <p><strong>Type:</strong> {{ transaction.type }}</p>
                <p><strong>Branch:</strong> {{ transaction.branchCode }}</p>
                <p><strong>Date:</strong> {{ transaction.transactionDateUtc | date:'short' }}</p>
                <p *ngIf="transaction.committedAtUtc"><strong>Committed:</strong> {{ transaction.committedAtUtc | date:'short' }}</p>
              </div>
              <div class="transaction-lines">
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Condition</th>
                      <th class="number">Qty</th>
                      <th class="number">Price</th>
                      <th class="number">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let line of transaction.lines">
                      <td>{{ line.itemCode }}</td>
                      <td>{{ line.condition }}</td>
                      <td class="number">{{ line.quantity }}</td>
                      <td class="number">{{ line.currency }} {{ line.unitPrice | number:'1.2-2' }}</td>
                      <td class="number">{{ line.currency }} {{ line.lineTotal | number:'1.2-2' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p *ngIf="transaction.notes" class="notes">Notes: {{ transaction.notes }}</p>
            </div>
          </div>
        </div>

        <div *ngIf="!loading() && !report()" class="empty-state">
          No movements found
        </div>
      </app-card>
    </div>
  `,
  styles: [`
    .inventory-movements {
      padding: 1.5rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .filters {
      margin-bottom: 1.5rem;
    }

    .filter-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .report-info {
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .transactions-list {
      display: grid;
      gap: 1.5rem;
    }

    .transaction-card {
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 1rem;
      background: white;
    }

    .transaction-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .transaction-header h3 {
      margin: 0;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .status-badge.committed {
      background: #d1f2eb;
      color: #0f5132;
    }

    .status-badge.pending {
      background: #fff3cd;
      color: #856404;
    }

    .transaction-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .transaction-details p {
      margin: 0;
    }

    .transaction-lines table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
    }

    .transaction-lines th,
    .transaction-lines td {
      padding: 0.5rem;
      text-align: left;
      border-bottom: 1px solid #dee2e6;
    }

    .transaction-lines th {
      background: #f8f9fa;
      font-weight: 600;
    }

    .transaction-lines .number {
      text-align: right;
    }

    .notes {
      font-style: italic;
      color: #6c757d;
      margin-top: 0.5rem;
    }

    .loading,
    .empty-state {
      padding: 3rem;
      text-align: center;
      color: #6c757d;
    }
  `]
})
export class InventoryMovementsComponent implements OnInit {
  private reportsService = inject(ReportsService);
  private branchesService = inject(BranchesService);

  report = signal<InventoryMovementsReport | null>(null);
  loading = signal(false);

  fromDate = '';
  toDate = '';
  branchCode = '';
  transactionType = '';
  status = '';

  branchOptions = signal<Array<{value: string; label: string}>>([
    { value: '', label: 'All Branches' }
  ]);

  typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'TransferIn', label: 'Transfer In' },
    { value: 'TransferOut', label: 'Transfer Out' },
    { value: 'Adjustment', label: 'Adjustment' }
  ];

  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Committed', label: 'Committed' }
  ];

  ngOnInit() {
    this.loadBranches();
    this.loadReport();
  }

  private loadBranches() {
    this.branchesService.getAllBranches().subscribe({
      next: (branches: Branch[]) => {
        this.branchOptions.set([
          { value: '', label: 'All Branches' },
          ...branches.map(b => ({ value: b.code, label: `${b.code} - ${b.name}` }))
        ]);
      }
    });
  }

  loadReport() {
    this.loading.set(true);

    const params = {
      fromDate: this.fromDate || undefined,
      toDate: this.toDate || undefined,
      branchCode: this.branchCode || undefined,
      transactionType: this.transactionType || undefined,
      status: this.status || undefined
    };

    this.reportsService.getInventoryMovements(params).subscribe({
      next: (data) => {
        this.report.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load movements', err);
        this.loading.set(false);
      }
    });
  }

  downloadExcel() {
    const params = {
      fromDate: this.fromDate || undefined,
      toDate: this.toDate || undefined,
      branchCode: this.branchCode || undefined,
      transactionType: this.transactionType || undefined,
      status: this.status || undefined
    };

    this.reportsService.downloadInventoryMovementsExcel(params).subscribe({
      next: (blob) => {
        const filename = `Inventory_Movements_${new Date().toISOString().split('T')[0]}.xlsx`;
        this.reportsService.downloadFile(blob, filename);
      },
      error: (err) => console.error('Failed to download', err)
    });
  }

  formatDate(date?: string): string {
    return date ? new Date(date).toLocaleDateString() : 'N/A';
  }
}
