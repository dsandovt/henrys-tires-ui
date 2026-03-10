import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportsService } from '../../../core/services/reports.service';
import { BranchesService } from '../../../core/services/branches.service';
import { AuthService } from '../../../core/auth/auth.service';
import { SalesByVolumeReport } from '../../../core/models/report.models';
import { Branch } from '../../../core/models/inventory.models';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { SelectComponent } from '../../../shared/components/select/select.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { EasternTimePipe } from '../../../shared/pipes/eastern-time.pipe';
import { SensitivePipe } from '../../../shared/pipes/sensitive.pipe';
import { LucideAngularModule, Download, LucideIconProvider, LUCIDE_ICONS } from 'lucide-angular';

@Component({
  selector: 'app-sales-by-volume-report',
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
    <div class="volume-report">
      <div class="header">
        <h1>Sales by Volume</h1>
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
            <p><strong>Total Quantity Sold:</strong> {{ report()?.totalQuantitySold }}</p>
            <p><strong>Total Revenue:</strong> {{ report()?.totalRevenue | number:'1.2-2' | sensitive }}</p>
            <p><strong>Generated:</strong> {{ report()?.generatedAtUtc | easternTime:'short' }}</p>
          </div>

          <div class="table-container">
            <table class="volume-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item Code</th>
                  <th>Description</th>
                  <th>Condition</th>
                  <th class="number">Qty Sold</th>
                  <th class="number">Revenue</th>
                  <th>Currency</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let row of report()?.rows; let i = index">
                  <td>{{ i + 1 }}</td>
                  <td><strong>{{ row.itemCode }}</strong></td>
                  <td>{{ row.description }}</td>
                  <td>{{ row.condition }}</td>
                  <td class="number">{{ row.quantitySold }}</td>
                  <td class="number">{{ row.revenue | number:'1.2-2' | sensitive }}</td>
                  <td>{{ row.currency }}</td>
                </tr>
                <tr *ngIf="report()?.rows?.length === 0">
                  <td colspan="7" class="empty-message">No sales found for the selected criteria</td>
                </tr>
              </tbody>
              <tfoot *ngIf="report()?.rows?.length">
                <tr class="grand-total">
                  <td colspan="4"><strong>TOTALS</strong></td>
                  <td class="number"><strong>{{ report()?.totalQuantitySold }}</strong></td>
                  <td class="number"><strong>{{ report()?.totalRevenue | number:'1.2-2' | sensitive }}</strong></td>
                  <td></td>
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
    .volume-report {
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

    .volume-table {
      width: 100%;
      border-collapse: collapse;
    }

    .volume-table th,
    .volume-table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #dee2e6;
    }

    .volume-table th {
      background: #f8f9fa;
      font-weight: 600;
    }

    .volume-table .number {
      text-align: right;
    }

    .volume-table tfoot .grand-total td {
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
export class SalesByVolumeReportComponent implements OnInit {
  private reportsService = inject(ReportsService);
  private branchesService = inject(BranchesService);
  authService = inject(AuthService);

  report = signal<SalesByVolumeReport | null>(null);
  loading = signal(false);
  selectedBranchId = '';
  fromDate = new Date().toISOString().slice(0, 10);
  toDate = new Date().toISOString().slice(0, 10);
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

    this.reportsService.getSalesByVolumeReport({
      branchReference: this.selectedBranchId || undefined,
      from: this.fromDate,
      to: this.toDate
    }).subscribe({
      next: (data) => {
        this.report.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load sales by volume report', err);
        this.loading.set(false);
      }
    });
  }

  downloadExcel() {
    this.reportsService.downloadSalesByVolumeExcel({
      branchReference: this.selectedBranchId || undefined,
      from: this.fromDate,
      to: this.toDate
    }).subscribe({
      next: (blob) => {
        const filename = `Sales_By_Volume_${this.fromDate}_${this.toDate}.xlsx`;
        this.reportsService.downloadFile(blob, filename);
      },
      error: (err) => console.error('Failed to download report', err)
    });
  }
}
