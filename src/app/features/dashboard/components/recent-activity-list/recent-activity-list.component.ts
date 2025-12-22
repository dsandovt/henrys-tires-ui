import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecentActivityItem } from '../../models/dashboard.models';

@Component({
  selector: 'app-recent-activity-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="activity-list">
      <div *ngIf="loading" class="loading-state">
        <div class="skeleton-item" *ngFor="let i of [1,2,3,4,5]"></div>
      </div>

      <div *ngIf="!loading && activities.length === 0" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        <p class="empty-text">No recent transactions</p>
      </div>

      <div *ngIf="!loading && activities.length > 0" class="activity-items">
        <div
          *ngFor="let activity of activities"
          class="activity-item"
          (click)="onActivityClick(activity)"
        >
          <div class="activity-badge" [class.badge--sale]="activity.type === 'Sale'" [class.badge--purchase]="activity.type === 'Purchase'">
            <svg *ngIf="activity.type === 'Sale'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12l7-7 7 7"/>
            </svg>
            <svg *ngIf="activity.type === 'Purchase'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 19V5M5 12l7 7 7-7"/>
            </svg>
          </div>

          <div class="activity-content">
            <div class="activity-header">
              <div class="activity-title">
                <span class="activity-type">{{ activity.type }}</span>
                <span class="activity-separator">•</span>
                <span class="activity-code">{{ activity.transactionNumber }}</span>
                <span class="activity-status" [class.status--committed]="activity.status === 'Committed'" [class.status--draft]="activity.status === 'Draft'" [class.status--cancelled]="activity.status === 'Cancelled'">
                  {{ activity.status }}
                </span>
              </div>
              <div class="activity-amount" [class.amount--sale]="activity.type === 'Sale'" [class.amount--purchase]="activity.type === 'Purchase'">
                <span class="amount-currency">{{ activity.currency }}</span>
                <span class="amount-value">{{ formatNumber(activity.amount) }}</span>
              </div>
            </div>
            <div class="activity-meta">
              <span class="meta-branch">{{ activity.branchName }}</span>
              <span class="meta-separator">•</span>
              <span class="meta-time">{{ activity.relativeTime }}</span>
            </div>
          </div>

          <div class="activity-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .activity-list {
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

    .skeleton-item {
      height: 4.5rem;
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
    }

    .activity-items {
      display: flex;
      flex-direction: column;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #f3f4f6;
      cursor: pointer;
      transition: background-color 0.15s ease;
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-item:hover {
      background: #f9fafb;
    }

    .activity-badge {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 8px;
      background: #f3f4f6;
      color: #6b7280;
    }

    .badge--sale {
      background: #d1fae5;
      color: #10b981;
    }

    .badge--purchase {
      background: #dbeafe;
      color: #3b82f6;
    }

    .activity-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .activity-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 1rem;
    }

    .activity-title {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .activity-type {
      font-size: 0.9375rem;
      font-weight: 600;
      color: #111827;
    }

    .activity-separator {
      color: #d1d5db;
      font-size: 0.875rem;
    }

    .activity-code {
      font-size: 0.875rem;
      font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace;
      color: #6b7280;
    }

    .activity-status {
      display: inline-flex;
      align-items: center;
      padding: 0.125rem 0.5rem;
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.025em;
      border-radius: 9999px;
      background: #f3f4f6;
      color: #6b7280;
    }

    .status--committed {
      background: #d1fae5;
      color: #065f46;
    }

    .status--draft {
      background: #fef3c7;
      color: #92400e;
    }

    .status--cancelled {
      background: #fee2e2;
      color: #991b1b;
    }

    .activity-amount {
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .amount-currency {
      font-size: 0.8125rem;
      color: #9ca3af;
      margin-right: 0.25rem;
    }

    .amount-value {
      font-size: 0.9375rem;
      font-weight: 600;
      color: #111827;
    }

    .amount--sale .amount-value {
      color: #10b981;
    }

    .amount--purchase .amount-value {
      color: #3b82f6;
    }

    .activity-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: #9ca3af;
    }

    .meta-separator {
      color: #d1d5db;
    }

    .activity-arrow {
      flex-shrink: 0;
      color: #d1d5db;
      transition: transform 0.15s ease;
    }

    .activity-item:hover .activity-arrow {
      transform: translateX(2px);
      color: #9ca3af;
    }

    @media (max-width: 640px) {
      .activity-item {
        padding: 0.875rem 1rem;
      }

      .activity-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .activity-amount {
        align-self: flex-end;
      }
    }
  `]
})
export class RecentActivityListComponent {
  @Input() activities: RecentActivityItem[] = [];
  @Input() loading = false;
  @Output() activityClick = new EventEmitter<RecentActivityItem>();

  onActivityClick(activity: RecentActivityItem): void {
    this.activityClick.emit(activity);
  }

  formatNumber(value: number): string {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}
