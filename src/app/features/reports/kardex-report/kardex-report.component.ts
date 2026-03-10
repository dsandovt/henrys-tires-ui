import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportsService } from '../../../core/services/reports.service';
import { BranchesService } from '../../../core/services/branches.service';
import { ItemsService } from '../../../core/services/items.service';
import { AuthService } from '../../../core/auth/auth.service';
import { KardexReport } from '../../../core/models/report.models';
import { Branch, Item } from '../../../core/models/inventory.models';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { SelectComponent } from '../../../shared/components/select/select.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { EasternTimePipe } from '../../../shared/pipes/eastern-time.pipe';
import { LucideAngularModule, Download, LucideIconProvider, LUCIDE_ICONS } from 'lucide-angular';

@Component({
  selector: 'app-kardex-report',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent, SelectComponent, InputComponent, LucideAngularModule, EasternTimePipe],
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ Download })
    }
  ],
  template: `
    <div class="kardex-report">
      <div class="header">
        <h1>Kardex by Product</h1>
        <app-button variant="primary" (click)="downloadExcel()" [disabled]="loading() || !report()">
          <lucide-icon name="download" [size]="16"></lucide-icon>
          Export to Excel
        </app-button>
      </div>

      <app-card>
        <div class="filters">
          <div class="filter-row">
            <app-select
              [options]="itemOptions()"
              [(ngModel)]="selectedItemCode"
              placeholder="Select Item">
            </app-select>

            <div class="condition-toggle">
              <label>Condition</label>
              <select [(ngModel)]="selectedCondition" class="select-input">
                <option value="">All</option>
                <option value="New">New</option>
                <option value="Used">Used</option>
              </select>
            </div>

            <app-select
              [options]="branchOptions()"
              [(ngModel)]="selectedBranchCode"
              placeholder="All Branches">
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

            <app-button variant="primary" (click)="loadReport()" [disabled]="loading() || !selectedItemCode">
              Search
            </app-button>
          </div>
        </div>

        <div *ngIf="loading()" class="loading">Loading...</div>

        <div *ngIf="!loading() && report()">
          <div class="report-info">
            <p><strong>Item:</strong> {{ report()?.itemCode }} - {{ report()?.itemDescription }}</p>
            <p *ngIf="report()?.condition"><strong>Condition:</strong> {{ report()?.condition }}</p>
            <p *ngIf="report()?.branchCode"><strong>Branch:</strong> {{ report()?.branchCode }} - {{ report()?.branchName }}</p>
            <p><strong>Total In:</strong> {{ report()?.totalIn }} &nbsp; <strong>Total Out:</strong> {{ report()?.totalOut }}</p>
            <p><strong>Generated:</strong> {{ report()?.generatedAtUtc | easternTime:'short' }}</p>
          </div>

          <div class="table-container">
            <table class="kardex-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Reference</th>
                  <th>Type</th>
                  <th>Branch</th>
                  <th class="number">In</th>
                  <th class="number">Out</th>
                  <th class="number">Balance</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let entry of report()?.entries">
                  <td>{{ entry.dateUtc | easternTime:'date' }}</td>
                  <td><strong>{{ entry.referenceNumber }}</strong></td>
                  <td>{{ entry.type }}</td>
                  <td>{{ entry.branchCode }}</td>
                  <td class="number in-cell">{{ entry.in || '' }}</td>
                  <td class="number out-cell">{{ entry.out || '' }}</td>
                  <td class="number"><strong>{{ entry.balance }}</strong></td>
                  <td>{{ entry.notes || '' }}</td>
                </tr>
                <tr *ngIf="report()?.entries?.length === 0">
                  <td colspan="8" class="empty-message">No movements found for the selected criteria</td>
                </tr>
              </tbody>
              <tfoot *ngIf="report()?.entries?.length">
                <tr class="grand-total">
                  <td colspan="4"><strong>TOTALS</strong></td>
                  <td class="number"><strong>{{ report()?.totalIn }}</strong></td>
                  <td class="number"><strong>{{ report()?.totalOut }}</strong></td>
                  <td colspan="2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div *ngIf="!loading() && !report()" class="empty-state">
          Select an item and click Search to generate the Kardex report
        </div>
      </app-card>
    </div>
  `,
  styles: [`
    .kardex-report {
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

    .condition-toggle {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .condition-toggle label {
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

    .kardex-table {
      width: 100%;
      border-collapse: collapse;
    }

    .kardex-table th,
    .kardex-table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #dee2e6;
    }

    .kardex-table th {
      background: #f8f9fa;
      font-weight: 600;
    }

    .kardex-table .number {
      text-align: right;
    }

    .in-cell:not(:empty) {
      color: #198754;
    }

    .out-cell:not(:empty) {
      color: #dc3545;
    }

    .kardex-table tfoot .grand-total td {
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
export class KardexReportComponent implements OnInit {
  private reportsService = inject(ReportsService);
  private branchesService = inject(BranchesService);
  private itemsService = inject(ItemsService);
  authService = inject(AuthService);

  report = signal<KardexReport | null>(null);
  loading = signal(false);
  selectedItemCode = '';
  selectedCondition = '';
  selectedBranchCode = '';
  fromDate = '';
  toDate = '';
  items = signal<Item[]>([]);
  branches = signal<Branch[]>([]);

  itemOptions = computed(() => {
    return this.items()
      .filter(i => i.classification === 'Good')
      .map(i => ({ value: i.itemCode, label: `${i.itemCode} - ${i.description}` }));
  });

  branchOptions = computed(() => {
    const options: Array<{value: string; label: string}> = [
      { value: '', label: 'All Branches' }
    ];
    for (const b of this.branches()) {
      options.push({ value: b.code, label: `${b.code} - ${b.name}` });
    }
    return options;
  });

  ngOnInit() {
    this.loadItems();
    this.loadBranches();
  }

  private loadItems() {
    this.itemsService.getAllItems().subscribe({
      next: (items: Item[]) => this.items.set(items),
      error: (err: any) => console.error('Failed to load items', err)
    });
  }

  private loadBranches() {
    this.branchesService.getAllBranches().subscribe({
      next: (branches: Branch[]) => this.branches.set(branches),
      error: (err: any) => console.error('Failed to load branches', err)
    });
  }

  loadReport() {
    if (!this.selectedItemCode) return;
    this.loading.set(true);

    this.reportsService.getKardexReport({
      itemCode: this.selectedItemCode,
      condition: this.selectedCondition || undefined,
      branchCode: this.selectedBranchCode || undefined,
      fromDate: this.fromDate || undefined,
      toDate: this.toDate || undefined
    }).subscribe({
      next: (data) => {
        this.report.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load kardex report', err);
        this.loading.set(false);
      }
    });
  }

  downloadExcel() {
    this.reportsService.downloadKardexExcel({
      itemCode: this.selectedItemCode,
      condition: this.selectedCondition || undefined,
      branchCode: this.selectedBranchCode || undefined,
      fromDate: this.fromDate || undefined,
      toDate: this.toDate || undefined
    }).subscribe({
      next: (blob) => {
        const filename = `Kardex_${this.selectedItemCode}_${new Date().toISOString().slice(0, 10)}.xlsx`;
        this.reportsService.downloadFile(blob, filename);
      },
      error: (err) => console.error('Failed to download report', err)
    });
  }
}
