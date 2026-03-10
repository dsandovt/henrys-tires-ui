import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportsService } from '../../../core/services/reports.service';
import { BranchesService } from '../../../core/services/branches.service';
import { AuthService } from '../../../core/auth/auth.service';
import { DailyCloseReport } from '../../../core/models/report.models';
import { Branch } from '../../../core/models/inventory.models';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { SelectComponent } from '../../../shared/components/select/select.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { EasternTimePipe } from '../../../shared/pipes/eastern-time.pipe';
import { SensitivePipe } from '../../../shared/pipes/sensitive.pipe';
import { LucideAngularModule, Download, LucideIconProvider, LUCIDE_ICONS } from 'lucide-angular';

@Component({
  selector: 'app-daily-close-report',
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
    <div class="daily-close-report">
      <div class="header">
        <h1>Daily Close Report</h1>
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
              [(ngModel)]="selectedDate"
              name="date"
              label="Date"
              type="date"
            ></app-input>

            <div class="group-toggle">
              <label>Group By</label>
              <select [(ngModel)]="groupBy" class="select-input">
                <option value="day">Day</option>
                <option value="hour">Hour</option>
              </select>
            </div>

            <app-button variant="primary" (click)="loadReport()" [disabled]="loading() || !selectedBranchId">
              Search
            </app-button>
          </div>
        </div>

        <div *ngIf="loading()" class="loading">Loading...</div>

        <div *ngIf="!loading() && report()">
          <!-- Summary -->
          <div class="report-info">
            <p><strong>Branch:</strong> {{ report()?.branchCode }} - {{ report()?.branchName }}</p>
            <p><strong>Date:</strong> {{ selectedDate }}</p>
            <p><strong>Total Sales:</strong> {{ report()?.summary?.totalSalesCount }}</p>
            <p><strong>Total Amount:</strong> {{ report()?.summary?.totalAmount | number:'1.2-2' | sensitive }} {{ report()?.summary?.currency }}</p>
            <p><strong>Generated:</strong> {{ report()?.generatedAtUtc | easternTime:'short' }}</p>
          </div>

          <!-- Payment Breakdown -->
          <div *ngIf="report()?.summary?.paymentBreakdown?.length" class="payment-breakdown">
            <h3>Payment Breakdown</h3>
            <table class="breakdown-table">
              <thead>
                <tr>
                  <th>Payment Method</th>
                  <th class="number">Count</th>
                  <th class="number">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let pb of report()?.summary?.paymentBreakdown">
                  <td>{{ pb.paymentMethod }}</td>
                  <td class="number">{{ pb.count }}</td>
                  <td class="number">{{ pb.amount | number:'1.2-2' | sensitive }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Hour Groups -->
          <div *ngIf="groupBy === 'hour' && report()?.hourGroups?.length">
            <div *ngFor="let hg of report()?.hourGroups" class="hour-group">
              <div class="hour-header">
                <strong>{{ hg.hourLabel }}</strong>
                <span class="hour-meta">{{ hg.hourCount }} sale(s) &mdash; {{ hg.hourTotal | number:'1.2-2' | sensitive }}</span>
              </div>
              <table class="sales-table">
                <thead>
                  <tr>
                    <th>Sale #</th>
                    <th>Time</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Payment</th>
                    <th class="number">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let sale of hg.sales">
                    <td><strong>{{ sale.saleNumber }}</strong></td>
                    <td>{{ sale.saleDateUtc | easternTime:'time' }}</td>
                    <td>{{ sale.customerName || '-' }}</td>
                    <td>{{ sale.lineCount }}</td>
                    <td>{{ sale.paymentMethod }}</td>
                    <td class="number">{{ sale.total | number:'1.2-2' | sensitive }} {{ sale.currency }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Day Group (flat list) -->
          <div *ngIf="groupBy === 'day'">
            <div class="table-container">
              <table class="sales-table">
                <thead>
                  <tr>
                    <th>Sale #</th>
                    <th>Time</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Payment</th>
                    <th class="number">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let sale of report()?.details">
                    <td><strong>{{ sale.saleNumber }}</strong></td>
                    <td>{{ sale.saleDateUtc | easternTime:'time' }}</td>
                    <td>{{ sale.customerName || '-' }}</td>
                    <td>{{ sale.lineCount }}</td>
                    <td>{{ sale.paymentMethod }}</td>
                    <td class="number">{{ sale.total | number:'1.2-2' | sensitive }} {{ sale.currency }}</td>
                  </tr>
                  <tr *ngIf="report()?.details?.length === 0">
                    <td colspan="6" class="empty-message">No sales found for this date</td>
                  </tr>
                </tbody>
                <tfoot *ngIf="report()?.summary as summary">
                  <tr class="grand-total">
                    <td colspan="4"><strong>TOTAL</strong></td>
                    <td><strong>{{ summary.totalSalesCount }} sales</strong></td>
                    <td class="number"><strong>{{ summary.totalAmount | number:'1.2-2' | sensitive }}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <div *ngIf="!loading() && !report()" class="empty-state">
          Select a branch and date, then click Search to generate the report
        </div>
      </app-card>
    </div>
  `,
  styles: [`
    .daily-close-report {
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

    .group-toggle {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .group-toggle label {
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

    .payment-breakdown {
      margin-bottom: 1.5rem;
    }

    .payment-breakdown h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1rem;
    }

    .breakdown-table {
      width: auto;
      border-collapse: collapse;
      margin-bottom: 1rem;
    }

    .breakdown-table th,
    .breakdown-table td {
      padding: 0.5rem 1rem;
      text-align: left;
      border-bottom: 1px solid #dee2e6;
    }

    .breakdown-table th {
      background: #f8f9fa;
      font-weight: 600;
    }

    .hour-group {
      margin-bottom: 1.5rem;
    }

    .hour-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0.75rem;
      background: #e3f2fd;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }

    .hour-meta {
      font-size: 0.875rem;
      color: #555;
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
export class DailyCloseReportComponent implements OnInit {
  private reportsService = inject(ReportsService);
  private branchesService = inject(BranchesService);
  authService = inject(AuthService);

  report = signal<DailyCloseReport | null>(null);
  loading = signal(false);
  selectedBranchId = '';
  selectedDate = new Date().toISOString().slice(0, 10);
  groupBy = 'day';
  branches = signal<Branch[]>([]);

  branchOptions = computed(() => {
    const options: Array<{value: string; label: string}> = [];
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
      next: (branches: Branch[]) => {
        this.branches.set(branches);
        if (branches.length === 1) {
          this.selectedBranchId = branches[0].id;
        }
      },
      error: (err: any) => console.error('Failed to load branches', err)
    });
  }

  loadReport() {
    if (!this.selectedBranchId) return;
    this.loading.set(true);

    this.reportsService.getDailyCloseReport({
      branchReference: this.selectedBranchId,
      date: this.selectedDate,
      groupBy: this.groupBy
    }).subscribe({
      next: (data) => {
        this.report.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load daily close report', err);
        this.loading.set(false);
      }
    });
  }

  downloadExcel() {
    this.reportsService.downloadDailyCloseExcel({
      branchReference: this.selectedBranchId,
      date: this.selectedDate,
      groupBy: this.groupBy
    }).subscribe({
      next: (blob) => {
        const filename = `Daily_Close_${this.selectedDate}.xlsx`;
        this.reportsService.downloadFile(blob, filename);
      },
      error: (err) => console.error('Failed to download report', err)
    });
  }
}
