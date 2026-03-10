import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportsService } from '../../../core/services/reports.service';
import { BranchesService } from '../../../core/services/branches.service';
import { AuthService } from '../../../core/auth/auth.service';
import { SalesReport } from '../../../core/models/report.models';
import { Branch } from '../../../core/models/inventory.models';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { SelectComponent } from '../../../shared/components/select/select.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { EasternTimePipe } from '../../../shared/pipes/eastern-time.pipe';
import { SensitivePipe } from '../../../shared/pipes/sensitive.pipe';
import { LucideAngularModule, Download, LucideIconProvider, LUCIDE_ICONS } from 'lucide-angular';

@Component({
  selector: 'app-sales-report',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent, SelectComponent, InputComponent, LucideAngularModule, EasternTimePipe, SensitivePipe],
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ Download })
    }
  ],
  template: `
    <div class="sales-report">
      <div class="header">
        <h1>Sales Report</h1>
        <app-button variant="primary" (click)="downloadExcel()" [disabled]="loading() || !report()">
          <lucide-icon name="download" [size]="16"></lucide-icon>
          Export to Excel
        </app-button>
      </div>

      <app-card>
        <div class="filters">
          <div class="filter-row">
            <app-select
              [options]="branchOptions()"
              [(ngModel)]="selectedBranchId"
              placeholder="Select Branch">
            </app-select>

            <app-input
              [(ngModel)]="fromDate"
              name="fromDate"
              label="From"
              type="date"
            ></app-input>

            <app-input
              [(ngModel)]="toDate"
              name="toDate"
              label="To"
              type="date"
            ></app-input>

            <div class="sort-toggle">
              <label>Sort</label>
              <select [(ngModel)]="sortOrder" class="select-input">
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>

            <app-button variant="primary" (click)="loadReport()" [disabled]="loading()">
              Search
            </app-button>
          </div>
        </div>

        <div *ngIf="loading()" class="loading">Loading...</div>

        <div *ngIf="!loading() && report()">
          <div class="report-info">
            <p><strong>Branch:</strong> {{ report()?.branchName || 'All Branches' }}</p>
            <p><strong>Period:</strong> {{ fromDate }} to {{ toDate }}</p>
            <p><strong>Total Sales:</strong> {{ report()?.totalCount }}</p>
            <p><strong>Generated:</strong> {{ report()?.generatedAtUtc | easternTime:'short' }}</p>
          </div>

          <div class="table-container">
            <table class="sales-table">
              <thead>
                <tr>
                  <th>Sale #</th>
                  <th>Branch</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Payment</th>
                  <th class="number">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let row of report()?.rows">
                  <td><strong>{{ row.saleNumber }}</strong></td>
                  <td>{{ row.branchName }}</td>
                  <td>{{ row.saleDateUtc | easternTime:'short' }}</td>
                  <td>{{ row.customerName || '-' }}</td>
                  <td>{{ row.lineCount }} item(s)</td>
                  <td>{{ row.paymentMethod }}</td>
                  <td class="number">{{ row.total | number:'1.2-2' | sensitive }} {{ row.currency }}</td>
                </tr>
                <tr *ngIf="report()?.rows?.length === 0">
                  <td colspan="7" class="empty-message">No sales found for the selected criteria</td>
                </tr>
              </tbody>
              <tfoot *ngIf="report()?.totals as totals">
                <tr class="grand-total">
                  <td colspan="5"><strong>TOTALS</strong></td>
                  <td><strong>{{ totals.totalSales }} sales</strong></td>
                  <td class="number"><strong>{{ totals.grandTotal | number:'1.2-2' | sensitive }}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div *ngIf="!loading() && !report()" class="empty-state">
          Select filters and click Search to generate the report
        </div>
      </app-card>
    </div>
  `,
  styles: [`
    .sales-report {
      padding: 1.5rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .header h1 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 600;
    }

    .filters {
      margin-bottom: 1.5rem;
    }

    .filter-row {
      display: flex;
      gap: 1rem;
      align-items: flex-end;
      flex-wrap: wrap;
    }

    .sort-toggle {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .sort-toggle label {
      font-size: 0.75rem;
      color: #737373;
    }

    .select-input {
      padding: 0.5rem 0.625rem;
      font-size: 0.875rem;
      border: 1px solid #d4d4d4;
      border-radius: 0.375rem;
      background: #fff;
      color: #404040;
    }

    .report-info {
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .report-info p {
      margin: 0.25rem 0;
    }

    .table-container {
      overflow-x: auto;
    }

    .sales-table {
      width: 100%;
      border-collapse: collapse;
    }

    .sales-table th,
    .sales-table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #dee2e6;
    }

    .sales-table th {
      background: #f8f9fa;
      font-weight: 600;
    }

    .sales-table .number {
      text-align: right;
    }

    .sales-table tfoot .grand-total td {
      background: #e9ecef;
      padding: 0.75rem;
      font-size: 1.1rem;
    }

    .loading,
    .empty-state,
    .empty-message {
      padding: 3rem;
      text-align: center;
      color: #6c757d;
    }
  `]
})
export class SalesReportComponent implements OnInit {
  private reportsService = inject(ReportsService);
  private branchesService = inject(BranchesService);
  authService = inject(AuthService);

  report = signal<SalesReport | null>(null);
  loading = signal(false);
  selectedBranchId = '';
  fromDate = new Date().toISOString().slice(0, 10);
  toDate = new Date().toISOString().slice(0, 10);
  sortOrder = 'desc';
  branches = signal<Branch[]>([]);

  branchOptions = computed(() => {
    const options: Array<{value: string; label: string}> = [];
    if (this.authService.isAdmin()) {
      options.push({ value: 'ALL', label: 'All Branches' });
    }
    for (const b of this.branches()) {
      options.push({ value: b.id, label: `${b.code} - ${b.name}` });
    }
    return options;
  });

  ngOnInit() {
    this.loadBranches();
  }

  private loadBranches() {
    this.branchesService.getAllBranches().subscribe({
      next: (branches: Branch[]) => this.branches.set(branches),
      error: (err: any) => console.error('Failed to load branches', err)
    });
  }

  loadReport() {
    this.loading.set(true);

    this.reportsService.getSalesReport({
      branchReference: this.selectedBranchId || undefined,
      from: this.fromDate,
      to: this.toDate,
      sortOrder: this.sortOrder
    }).subscribe({
      next: (data) => {
        this.report.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load sales report', err);
        this.loading.set(false);
      }
    });
  }

  downloadExcel() {
    this.reportsService.downloadSalesReportExcel({
      branchReference: this.selectedBranchId || undefined,
      from: this.fromDate,
      to: this.toDate,
      sortOrder: this.sortOrder
    }).subscribe({
      next: (blob) => {
        const filename = `Sales_Report_${this.fromDate}_${this.toDate}.xlsx`;
        this.reportsService.downloadFile(blob, filename);
      },
      error: (err) => console.error('Failed to download report', err)
    });
  }
}
