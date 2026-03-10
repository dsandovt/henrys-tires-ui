import { StatusHistoryEntry } from './inventory.models';

// Stock Report Models
export interface StockReportRow {
  itemCode: string;
  description: string;
  condition: string;
  onHand: number;
  reserved: number;
  available: number;
}

export interface StockReportTotals {
  newOnHand: number;
  newReserved: number;
  newAvailable: number;
  usedOnHand: number;
  usedReserved: number;
  usedAvailable: number;
  totalOnHand: number;
  totalReserved: number;
  totalAvailable: number;
}

export interface StockReport {
  generatedAtUtc: string;
  branchCode?: string;
  branchName?: string;
  rows: StockReportRow[];
  totals: StockReportTotals;
}

// Invoice Models
export interface InvoiceCompanyInfo {
  legalName: string;
  tradeName?: string;
  addressLine1: string;
  cityStateZip: string;
  phone: string;
}

export interface InvoiceLine {
  itemCode: string;
  description: string;
  condition?: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  lineTotal: number;
  isTaxable: boolean;
  appliesShopFee: boolean;
}

export interface InvoiceTotals {
  subtotal: number;
  taxableBase: number;
  salesTaxRate: number;
  salesTaxAmount: number;
  shopFeeBase: number;
  shopFeeRate: number;
  shopFeeAmount: number;
  discount: number;
  grandTotal: number;
  amountPaid: number;
  amountDue: number;
}

export interface Invoice {
  companyInfo: InvoiceCompanyInfo;
  invoiceNumber: string;
  invoiceDateUtc: string;
  branchCode: string;
  branchName: string;
  paymentMethod: string;
  paymentDetails?: { method: string; amount: number; checkNumber?: string }[];
  customerName?: string;
  customerNumber?: string;
  customerPhone?: string;
  poNumber?: string;
  serviceRep?: string;
  notes?: string;
  lines: InvoiceLine[];
  totals: InvoiceTotals;
  generatedAtUtc: string;
  documentType?: string;
}

// Sales Report Models
export interface SalesReportRow {
  saleNumber: string;
  branchCode: string;
  branchName: string;
  saleDateUtc: string;
  customerName?: string;
  lineCount: number;
  linesSummary: string;
  paymentMethod: string;
  total: number;
  currency: string;
  status: string;
}

export interface SalesReportTotals {
  grandTotal: number;
  totalSales: number;
  totalItems: number;
}

export interface SalesReport {
  generatedAtUtc: string;
  fromDateUtc?: string;
  toDateUtc?: string;
  branchCode?: string;
  branchName?: string;
  rows: SalesReportRow[];
  totals: SalesReportTotals;
  totalCount: number;
}

// Inventory Movements Report Models
export interface MovementLine {
  itemCode: string;
  condition: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  lineTotal: number;
}

export interface MovementTransaction {
  number: string;
  branchCode: string;
  type: string;
  status: string;
  transactionDateUtc: string;
  statusHistory: StatusHistoryEntry[];
  notes?: string;
  lines: MovementLine[];
}

// Daily Close Report Models
export interface PaymentBreakdown {
  paymentMethod: string;
  count: number;
  amount: number;
}

export interface DailyCloseSummary {
  totalSalesCount: number;
  totalAmount: number;
  currency: string;
  paymentBreakdown: PaymentBreakdown[];
}

export interface DailyCloseDetail {
  saleNumber: string;
  saleDateUtc: string;
  customerName?: string;
  lineCount: number;
  paymentMethod: string;
  total: number;
  currency: string;
}

export interface DailyCloseHourGroup {
  hour: number;
  hourLabel: string;
  sales: DailyCloseDetail[];
  hourTotal: number;
  hourCount: number;
}

export interface DailyCloseReport {
  generatedAtUtc: string;
  dateUtc: string;
  branchCode?: string;
  branchName?: string;
  groupBy: string;
  summary: DailyCloseSummary;
  details: DailyCloseDetail[];
  hourGroups?: DailyCloseHourGroup[];
}

// Kardex Report Models
export interface KardexEntry {
  dateUtc: string;
  referenceNumber: string;
  type: string;
  branchCode: string;
  in: number;
  out: number;
  balance: number;
  notes?: string;
}

export interface KardexReport {
  generatedAtUtc: string;
  itemCode: string;
  itemDescription: string;
  condition?: string;
  branchCode?: string;
  branchName?: string;
  fromDateUtc?: string;
  toDateUtc?: string;
  entries: KardexEntry[];
  totalIn: number;
  totalOut: number;
}

// Sales by Volume Report Models
export interface SalesByVolumeRow {
  itemCode: string;
  description: string;
  condition: string;
  quantitySold: number;
  revenue: number;
  currency: string;
}

export interface SalesByVolumeReport {
  generatedAtUtc: string;
  fromDateUtc?: string;
  toDateUtc?: string;
  branchCode?: string;
  branchName?: string;
  rows: SalesByVolumeRow[];
  totalQuantitySold: number;
  totalRevenue: number;
}

export interface InventoryMovementsReport {
  generatedAtUtc: string;
  fromDateUtc?: string;
  toDateUtc?: string;
  branchCode?: string;
  branchName?: string;
  transactionType?: string;
  status?: string;
  transactions: MovementTransaction[];
  totalCount: number;
}
