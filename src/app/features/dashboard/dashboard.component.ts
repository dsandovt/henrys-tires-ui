import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { KpiCardComponent } from './components/kpi-card/kpi-card.component';
import { DateRangeFilterComponent, DateRange } from './components/date-range-filter/date-range-filter.component';
import { BranchBreakdownTableComponent } from './components/branch-breakdown-table/branch-breakdown-table.component';
import { RecentActivityListComponent } from './components/recent-activity-list/recent-activity-list.component';
import { DashboardService } from '../../core/services/dashboard.service';
import { BranchesService } from '../../core/services/branches.service';
import { AuthService } from '../../core/auth/auth.service';
import { DashboardData, DashboardFilters, RecentActivityItem } from './models/dashboard.models';
import { Branch } from '../../core/models/inventory.models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    KpiCardComponent,
    DateRangeFilterComponent,
    BranchBreakdownTableComponent,
    RecentActivityListComponent
  ],
  template: `
    <div class="dashboard">
      <!-- Top Bar -->
      <div class="dashboard-header">
        <h1 class="dashboard-title">Dashboard</h1>
        <div class="dashboard-controls">
          <app-date-range-filter
            (rangeChange)="onDateRangeChange($event)"
          ></app-date-range-filter>

          <select
            *ngIf="isAdmin()"
            class="branch-selector"
            [(ngModel)]="selectedBranchCode"
            (change)="onBranchChange()"
          >
            <option [value]="null">All Branches</option>
            <option *ngFor="let branch of branches()" [value]="branch.code">
              {{ branch.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="error-banner">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4M12 16h.01"/>
        </svg>
        <span>{{ error() }}</span>
      </div>

      <!-- KPI Cards Row -->
      <div class="kpi-grid">
        <app-kpi-card
          label="Sales"
          [value]="dashboardData()?.summary?.salesTotal ?? null"
          [currency]="dashboardData()?.summary?.currency"
          [subtitle]="dateRangeLabel()"
          variant="sale"
          badge="Revenue"
          [loading]="loading()"
        ></app-kpi-card>

        <app-kpi-card
          label="Purchases"
          [value]="dashboardData()?.summary?.purchasesTotal ?? null"
          [currency]="dashboardData()?.summary?.currency"
          [subtitle]="dateRangeLabel()"
          variant="purchase"
          badge="Cost"
          [loading]="loading()"
        ></app-kpi-card>

        <app-kpi-card
          label="Net"
          [value]="dashboardData()?.summary?.netTotal ?? null"
          [currency]="dashboardData()?.summary?.currency"
          [subtitle]="dateRangeLabel()"
          variant="neutral"
          [loading]="loading()"
        ></app-kpi-card>

        <app-kpi-card
          label="Sales Today"
          [value]="dashboardData()?.summary?.salesToday ?? null"
          [currency]="dashboardData()?.summary?.currency"
          subtitle="Today's revenue"
          variant="sale"
          [loading]="loading()"
        ></app-kpi-card>

        <app-kpi-card
          label="Purchases Today"
          [value]="dashboardData()?.summary?.purchasesToday ?? null"
          [currency]="dashboardData()?.summary?.currency"
          subtitle="Today's costs"
          variant="purchase"
          [loading]="loading()"
        ></app-kpi-card>
      </div>

      <!-- Branch Breakdown Section -->
      <div class="dashboard-section">
        <h2 class="section-title">Branch Performance</h2>
        <app-branch-breakdown-table
          [branches]="dashboardData()?.branchBreakdown ?? []"
          [loading]="loading()"
        ></app-branch-breakdown-table>
      </div>

      <!-- Recent Activity Section -->
      <div class="dashboard-section">
        <h2 class="section-title">Recent Activity</h2>
        <app-recent-activity-list
          [activities]="dashboardData()?.recentActivity ?? []"
          [loading]="loading()"
          (activityClick)="onActivityClick($event)"
        ></app-recent-activity-list>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .dashboard-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 2rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .dashboard-title {
      margin: 0;
      font-size: 2rem;
      font-weight: 600;
      color: #111827;
      letter-spacing: -0.02em;
    }

    .dashboard-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .branch-selector {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      cursor: pointer;
      transition: border-color 0.2s ease;
      min-width: 180px;
    }

    .branch-selector:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      margin-bottom: 2rem;
      background: #fee2e2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      color: #991b1b;
      font-size: 0.9375rem;
    }

    .error-banner svg {
      flex-shrink: 0;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .dashboard-section {
      margin-bottom: 3rem;
    }

    .section-title {
      margin: 0 0 1.25rem;
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
      letter-spacing: -0.01em;
    }

    @media (max-width: 768px) {
      .dashboard {
        padding: 1rem;
      }

      .dashboard-header {
        flex-direction: column;
        align-items: stretch;
      }

      .dashboard-controls {
        flex-direction: column;
        align-items: stretch;
      }

      .branch-selector {
        width: 100%;
      }

      .kpi-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .dashboard-title {
        font-size: 1.5rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private branchesService = inject(BranchesService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals
  loading = signal(true);
  error = signal('');
  dashboardData = signal<DashboardData | null>(null);
  branches = signal<Branch[]>([]);

  // Filters
  selectedBranchCode: string | null = null;
  currentDateRange: DateRange | null = null;

  // Computed
  isAdmin = this.authService.isAdmin;
  dateRangeLabel = computed(() => {
    if (!this.currentDateRange) return '';
    return this.currentDateRange.label;
  });

  ngOnInit(): void {
    // Load branches if admin
    if (this.isAdmin()) {
      this.loadBranches();
    } else {
      // Non-admin users see only their branch (use branchId as the backend expects the MongoDB ID)
      this.selectedBranchCode = this.authService.branchId() || null;
    }
  }

  loadBranches(): void {
    this.branchesService.getAllBranches().subscribe({
      next: (branches) => {
        this.branches.set(branches);
      },
      error: (err) => {
        console.error('Failed to load branches:', err);
      }
    });
  }

  onDateRangeChange(range: DateRange): void {
    this.currentDateRange = range;
    this.loadDashboardData();
  }

  onBranchChange(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    if (!this.currentDateRange) return;

    this.loading.set(true);
    this.error.set('');

    const queryParams = {
      startDateUtc: this.currentDateRange.startDate.toISOString(),
      endDateUtc: this.currentDateRange.endDate.toISOString(),
      ...(this.selectedBranchCode && { branchCode: this.selectedBranchCode })
    };

    this.dashboardService.getDashboardData(queryParams).subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load dashboard data:', err);
        this.error.set(
          err.error?.errorMessage ||
          'Failed to load dashboard data. Please try again.'
        );
        this.loading.set(false);
      }
    });
  }

  onActivityClick(activity: RecentActivityItem): void {
    // Navigate to transaction details
    this.router.navigate(['/admin/transactions', activity.id]);
  }
}
