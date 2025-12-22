import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BranchBreakdown } from '../../models/dashboard.models';

@Component({
  selector: 'app-branch-breakdown-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-container">
      <div *ngIf="loading" class="loading-state">
        <div class="skeleton-row" *ngFor="let i of [1,2,3,4,5]"></div>
      </div>

      <div *ngIf="!loading && branches.length === 0" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
        </svg>
        <p class="empty-text">No branch data available for this date range</p>
      </div>

      <table *ngIf="!loading && branches.length > 0" class="breakdown-table">
        <thead>
          <tr>
            <th class="th-left">Branch</th>
            <th class="th-right">Sales</th>
            <th class="th-right">Purchases</th>
            <th class="th-right">Net</th>
            <th class="th-center">Sales Txn</th>
            <th class="th-center">Purchase Txn</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let branch of branches" class="table-row">
            <td class="td-branch">
              <div class="branch-info">
                <span class="branch-code">{{ branch.branchCode }}</span>
                <span class="branch-name">{{ branch.branchName }}</span>
              </div>
            </td>
            <td class="td-amount td-sale">
              <span class="amount-currency">{{ branch.currency }}</span>
              <span class="amount-value">{{ formatNumber(branch.salesTotal) }}</span>
            </td>
            <td class="td-amount td-purchase">
              <span class="amount-currency">{{ branch.currency }}</span>
              <span class="amount-value">{{ formatNumber(branch.purchasesTotal) }}</span>
            </td>
            <td class="td-amount" [class.td-positive]="branch.netTotal > 0" [class.td-negative]="branch.netTotal < 0">
              <span class="amount-currency">{{ branch.currency }}</span>
              <span class="amount-value">{{ formatNumber(branch.netTotal) }}</span>
            </td>
            <td class="td-count">
              <span class="count-badge count-badge--sale">{{ branch.salesTransactionCount }}</span>
            </td>
            <td class="td-count">
              <span class="count-badge count-badge--purchase">{{ branch.purchaseTransactionCount }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .table-container {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }

    .loading-state {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .skeleton-row {
      height: 3rem;
      background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
      gap: 1rem;
    }

    .empty-state svg {
      color: #d1d5db;
    }

    .empty-text {
      margin: 0;
      font-size: 0.9375rem;
      color: #9ca3af;
      text-align: center;
    }

    .breakdown-table {
      width: 100%;
      border-collapse: collapse;
      font-variant-numeric: tabular-nums;
    }

    thead {
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }

    th {
      padding: 0.875rem 1rem;
      font-size: 0.8125rem;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .th-left {
      text-align: left;
    }

    .th-right {
      text-align: right;
    }

    .th-center {
      text-align: center;
    }

    .table-row {
      border-bottom: 1px solid #f3f4f6;
      transition: background-color 0.15s ease;
    }

    .table-row:last-child {
      border-bottom: none;
    }

    .table-row:hover {
      background: #f9fafb;
    }

    td {
      padding: 1rem;
    }

    .td-branch {
      font-size: 0.9375rem;
    }

    .branch-info {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .branch-code {
      font-weight: 600;
      color: #111827;
    }

    .branch-name {
      font-size: 0.8125rem;
      color: #6b7280;
    }

    .td-amount {
      text-align: right;
      font-size: 0.9375rem;
      white-space: nowrap;
    }

    .amount-currency {
      font-size: 0.8125rem;
      color: #9ca3af;
      margin-right: 0.25rem;
    }

    .amount-value {
      font-weight: 600;
      color: #111827;
    }

    .td-sale .amount-value {
      color: #10b981;
    }

    .td-purchase .amount-value {
      color: #3b82f6;
    }

    .td-positive .amount-value {
      color: #10b981;
    }

    .td-negative .amount-value {
      color: #ef4444;
    }

    .td-count {
      text-align: center;
    }

    .count-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 2.5rem;
      padding: 0.25rem 0.625rem;
      font-size: 0.8125rem;
      font-weight: 600;
      border-radius: 6px;
      background: #f3f4f6;
      color: #6b7280;
    }

    .count-badge--sale {
      background: #d1fae5;
      color: #065f46;
    }

    .count-badge--purchase {
      background: #dbeafe;
      color: #1e40af;
    }

    @media (max-width: 1024px) {
      .breakdown-table {
        font-size: 0.875rem;
      }

      th, td {
        padding: 0.75rem 0.5rem;
      }

      .branch-name {
        display: none;
      }
    }
  `]
})
export class BranchBreakdownTableComponent {
  @Input() branches: BranchBreakdown[] = [];
  @Input() loading = false;

  formatNumber(value: number): string {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}
