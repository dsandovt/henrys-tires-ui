// ============================================================================
// Dashboard Domain Models
// ============================================================================

import { Currency } from '../../../core/models/inventory.models';

export interface DashboardData {
  summary: DashboardSummary;
  branchBreakdown: BranchBreakdown[];
  recentActivity: RecentActivityItem[];
}

export interface DashboardSummary {
  // Range totals
  salesTotal: number;
  purchasesTotal: number;
  netTotal: number;

  // Today totals
  salesToday: number;
  purchasesToday: number;

  // Transaction counts
  totalTransactions: number;
  salesTransactions: number;
  purchaseTransactions: number;

  // Metadata
  currency: Currency;
  startDate: string;
  endDate: string;
}

export interface BranchBreakdown {
  branchCode: string;
  branchName: string;
  salesTotal: number;
  purchasesTotal: number;
  netTotal: number;
  salesTransactionCount: number;
  purchaseTransactionCount: number;
  currency: Currency;
}

export interface RecentActivityItem {
  id: string;
  transactionNumber: string;
  type: 'Sale' | 'Purchase';
  status: 'Draft' | 'Committed' | 'Cancelled';
  amount: number;
  currency: Currency;
  branchCode: string;
  branchName: string;
  transactionDateUtc: string;
  relativeTime: string;
}

export interface DashboardFilters {
  branchCode: string | null; // null = "All branches"
  startDate: Date;
  endDate: Date;
}

export interface DashboardQueryParams {
  branchCode?: string; // omit for "all"
  startDateUtc: string;
  endDateUtc: string;
}
