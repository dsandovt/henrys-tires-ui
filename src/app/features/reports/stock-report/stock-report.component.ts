import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportsService } from '../../../core/services/reports.service';
import { BranchesService } from '../../../core/services/branches.service';
import { StockReport } from '../../../core/models/report.models';
import { Branch } from '../../../core/models/inventory.models';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { SelectComponent } from '../../../shared/components/select/select.component';
import { LucideAngularModule, Download, LucideIconProvider, LUCIDE_ICONS } from 'lucide-angular';

@Component({
  selector: 'app-stock-report',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent, SelectComponent, LucideAngularModule],
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ Download })
    }
  ],
  template: `
    <div class="stock-report">
      <div class="header">
        <h1>Stock Report by Location</h1>
        <app-button variant="primary" (click)="downloadExcel()" [disabled]="loading()">
          <lucide-icon name="download" [size]="16"></lucide-icon>
          Export to Excel
        </app-button>
      </div>

      <app-card>
        <div class="filters">
          <app-select
            [options]="branchOptions()"
            [(ngModel)]="selectedBranchId"
            (ngModelChange)="loadReport()"
            placeholder="All Branches">
          </app-select>
        </div>

        <div *ngIf="loading()" class="loading">Loading...</div>

        <div *ngIf="!loading() && report()">
          <div class="report-info">
            <p><strong>Branch:</strong> {{ report()?.branchName || 'All Branches' }}</p>
            <p><strong>Generated:</strong> {{ report()?.generatedAtUtc | date:'MM/dd/yyyy' }}</p>
          </div>

          <div class="table-container">
            <table class="stock-table">
              <thead>
                <tr>
                  <th>Item Code</th>
                  <th>Description</th>
                  <th>Condition</th>
                  <th class="number">On Hand</th>
                  <th class="number">Reserved</th>
                  <th class="number">Available</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let row of report()?.rows">
                  <td><strong>{{ row.itemCode }}</strong></td>
                  <td>{{ row.description }}</td>
                  <td>
                    <span class="condition-badge" [class.new]="row.condition === 'New'" [class.used]="row.condition === 'Used'">
                      {{ row.condition }}
                    </span>
                  </td>
                  <td class="number">{{ row.onHand }}</td>
                  <td class="number">{{ row.reserved }}</td>
                  <td class="number">{{ row.available }}</td>
                </tr>
              </tbody>
              <tfoot *ngIf="report()?.totals as totals">
                <tr class="section-totals">
                  <td colspan="3"><strong>New Tires Totals</strong></td>
                  <td class="number"><strong>{{ totals.newOnHand }}</strong></td>
                  <td class="number"><strong>{{ totals.newReserved }}</strong></td>
                  <td class="number"><strong>{{ totals.newAvailable }}</strong></td>
                </tr>
                <tr class="section-totals">
                  <td colspan="3"><strong>Used Tires Totals</strong></td>
                  <td class="number"><strong>{{ totals.usedOnHand }}</strong></td>
                  <td class="number"><strong>{{ totals.usedReserved }}</strong></td>
                  <td class="number"><strong>{{ totals.usedAvailable }}</strong></td>
                </tr>
                <tr class="grand-total">
                  <td colspan="3"><strong>GRAND TOTAL</strong></td>
                  <td class="number"><strong>{{ totals.totalOnHand }}</strong></td>
                  <td class="number"><strong>{{ totals.totalReserved }}</strong></td>
                  <td class="number"><strong>{{ totals.totalAvailable }}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div *ngIf="!loading() && !report()" class="empty-state">
          No data available
        </div>
      </app-card>
    </div>
  `,
  styles: [`
    .stock-report {
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
      max-width: 300px;
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

    .stock-table {
      width: 100%;
      border-collapse: collapse;
    }

    .stock-table th,
    .stock-table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #dee2e6;
    }

    .stock-table th {
      background: #f8f9fa;
      font-weight: 600;
    }

    .stock-table .number {
      text-align: right;
    }

    .condition-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .condition-badge.new {
      background: #d1f2eb;
      color: #0f5132;
    }

    .condition-badge.used {
      background: #f8d7da;
      color: #842029;
    }

    .stock-table tfoot tr {
      font-weight: 600;
    }

    .stock-table tfoot .section-totals td {
      background: #f8f9fa;
      padding: 0.5rem 0.75rem;
    }

    .stock-table tfoot .grand-total td {
      background: #e9ecef;
      padding: 0.75rem;
      font-size: 1.1rem;
    }

    .loading,
    .empty-state {
      padding: 3rem;
      text-align: center;
      color: #6c757d;
    }
  `]
})
export class StockReportComponent implements OnInit {
  private reportsService = inject(ReportsService);
  private branchesService = inject(BranchesService);

  report = signal<StockReport | null>(null);
  loading = signal(false);
  selectedBranchId = '';
  branches = signal<Branch[]>([]);

  branchOptions = signal<Array<{value: string; label: string}>>([
    { value: '', label: 'All Branches' }
  ]);

  ngOnInit() {
    this.loadBranches();
    this.loadReport();
  }

  private loadBranches() {
    this.branchesService.getAllBranches().subscribe({
      next: (branches: Branch[]) => {
        this.branches.set(branches);
        this.branchOptions.set([
          { value: '', label: 'All Branches' },
          ...branches.map(b => ({ value: b.id, label: `${b.code} - ${b.name}` }))
        ]);
      },
      error: (err: any) => console.error('Failed to load branches', err)
    });
  }

  loadReport() {
    this.loading.set(true);
    const branchId = this.selectedBranchId || undefined;

    this.reportsService.getStockReport(branchId).subscribe({
      next: (data) => {
        this.report.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load stock report', err);
        this.loading.set(false);
      }
    });
  }

  downloadExcel() {
    const branchId = this.selectedBranchId || undefined;

    this.reportsService.downloadStockReportExcel(branchId).subscribe({
      next: (blob) => {
        const branchCode = this.report()?.branchCode || 'All';
        const filename = `Stock_Report_${branchCode}_${new Date().toISOString().split('T')[0]}.xlsx`;
        this.reportsService.downloadFile(blob, filename);
      },
      error: (err) => console.error('Failed to download report', err)
    });
  }
}
