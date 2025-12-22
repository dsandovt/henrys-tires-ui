import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type KpiVariant = 'sale' | 'purchase' | 'neutral';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kpi-card" [class.kpi-card--sale]="variant === 'sale'" [class.kpi-card--purchase]="variant === 'purchase'">
      <div class="kpi-card__header">
        <span class="kpi-card__label">{{ label }}</span>
        <span *ngIf="badge" class="kpi-card__badge" [class.badge--sale]="variant === 'sale'" [class.badge--purchase]="variant === 'purchase'">
          {{ badge }}
        </span>
      </div>
      <div class="kpi-card__body">
        <div class="kpi-card__value" [class.kpi-card__value--loading]="loading">
          <ng-container *ngIf="!loading">
            <span class="value-currency" *ngIf="currency">{{ currency }}</span>
            <span class="value-amount">{{ formattedValue }}</span>
          </ng-container>
          <div *ngIf="loading" class="skeleton-box"></div>
        </div>
        <p *ngIf="subtitle && !loading" class="kpi-card__subtitle">{{ subtitle }}</p>
      </div>
    </div>
  `,
  styles: [`
    .kpi-card {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 1.5rem;
      transition: border-color 0.2s ease;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      height: 100%;
    }

    .kpi-card:hover {
      border-color: #d1d5db;
    }

    .kpi-card--sale {
      border-left: 3px solid #10b981;
    }

    .kpi-card--purchase {
      border-left: 3px solid #3b82f6;
    }

    .kpi-card__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .kpi-card__label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .kpi-card__badge {
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

    .badge--sale {
      background: #d1fae5;
      color: #065f46;
    }

    .badge--purchase {
      background: #dbeafe;
      color: #1e40af;
    }

    .kpi-card__body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .kpi-card__value {
      display: flex;
      align-items: baseline;
      gap: 0.375rem;
      min-height: 2.5rem;
    }

    .kpi-card__value--loading {
      display: block;
    }

    .value-currency {
      font-size: 1.25rem;
      font-weight: 600;
      color: #6b7280;
      font-variant-numeric: tabular-nums;
    }

    .value-amount {
      font-size: 2rem;
      font-weight: 600;
      color: #111827;
      line-height: 1.2;
      letter-spacing: -0.02em;
      font-variant-numeric: tabular-nums;
    }

    .kpi-card__subtitle {
      margin: 0;
      font-size: 0.8125rem;
      color: #9ca3af;
      line-height: 1.4;
    }

    .skeleton-box {
      height: 2.5rem;
      background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }

    @keyframes shimmer {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  `]
})
export class KpiCardComponent {
  @Input() label = '';
  @Input() value: number | null = null;
  @Input() currency?: string;
  @Input() subtitle?: string;
  @Input() variant: KpiVariant = 'neutral';
  @Input() badge?: string;
  @Input() loading = false;

  get formattedValue(): string {
    if (this.value === null || this.value === undefined) {
      return '—';
    }
    return this.value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}
