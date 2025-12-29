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
  customerName?: string;
  customerNumber?: string;
  customerPhone?: string;
  poNumber?: string;
  serviceRep?: string;
  notes?: string;
  lines: InvoiceLine[];
  totals: InvoiceTotals;
  generatedAtUtc: string;
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
  transactionNumber: string;
  branchCode: string;
  type: string;
  status: string;
  transactionDateUtc: string;
  committedAtUtc?: string;
  notes?: string;
  lines: MovementLine[];
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
