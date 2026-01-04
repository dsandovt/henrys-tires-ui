// ============================================================================
// Inventory Domain Models
// ============================================================================

// ----------------------------------------------------------------------------
// Item Models
// ----------------------------------------------------------------------------

export interface Item {
  id: string;
  itemCode: string;
  description: string;
  classification: 'Good' | 'Service';
  category?: string;
  brand?: string;
  size?: string;
  notes?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAtUtc: string;
  createdBy: string;
  modifiedAtUtc?: string;
  modifiedBy?: string;
}

export interface CreateItemRequest {
  itemCode: string;
  description: string;
  classification: 'Good' | 'Service';
  category?: string;
  brand?: string;
  size?: string;
  notes?: string;
  initialPrice?: number;
  currency?: Currency;
}

export interface UpdateItemRequest {
  description: string;
}

// ----------------------------------------------------------------------------
// Price Models
// ----------------------------------------------------------------------------

export interface ConsumableItemPrice {
  id: string;
  itemCode: string;
  latestPrice: number;
  currency: Currency;
  latestPriceDateUtc: string;
  updatedBy: string;
  priceHistory?: PriceHistoryEntry[];
}

export interface PriceHistoryEntry {
  price: number;
  currency: Currency;
  changedAtUtc: string;
  changedBy: string;
}

export interface UpdatePriceRequest {
  itemCode: string;
  newPrice: number;
  currency?: Currency;
}

// ----------------------------------------------------------------------------
// Transaction Models
// ----------------------------------------------------------------------------

export enum Currency {
  USD = 'USD',
  DOP = 'DOP'
}

export enum TransactionType {
  In = 'In',
  Out = 'Out',
  Adjust = 'Adjust'
}

export enum TransactionStatus {
  Draft = 'Draft',
  Committed = 'Committed',
  Cancelled = 'Cancelled'
}

export enum ItemCondition {
  New = 'New',
  Used = 'Used'
}

export enum PriceSource {
  ConsumableItemPrice = 'ConsumableItemPrice',
  Manual = 'Manual',
  Sale = 'Sale',
  SystemDefault = 'SystemDefault',
  PurchaseOrder = 'PurchaseOrder',
  AverageCost = 'AverageCost'
}

export enum PaymentMethod {
  Cash = 'Cash',
  Card = 'Card',
  AcimaShortTermCredit = 'AcimaShortTermCredit',
  AccountsReceivable = 'AccountsReceivable'
}

export interface Transaction {
  id: string;
  transactionNumber: string;
  branchCode: string;
  type: TransactionType;
  status: TransactionStatus;
  transactionDateUtc: string;
  notes?: string;
  paymentMethod?: PaymentMethod;
  committedAtUtc?: string;
  committedBy?: string;
  lines: TransactionLine[];
  createdAtUtc: string;
  createdBy: string;
  modifiedAtUtc?: string;
  modifiedBy?: string;
}

export interface TransactionLine {
  lineId: string;
  itemCode: string;
  itemCondition: string; // Changed from 'condition' to match backend DTO 'ItemCondition'
  quantity: number;
  unitPrice: number;
  currency: Currency;
  priceSource: string;
  priceSetByRole: string;
  priceSetByUser: string;
  lineTotal: number;
  costOfGoodsSold?: number;
  priceNotes?: string;
  executedAtUtc: string;
}

export interface CreateInTransactionRequest {
  branchCode?: string;
  transactionDateUtc: string;
  notes?: string;
  paymentMethod?: PaymentMethod;
  lines: InTransactionLineRequest[];
}

export interface InTransactionLineRequest {
  itemCode: string;
  itemCondition: ItemCondition;
  quantity: number;
  unitPrice?: number;
  currency?: Currency;
  priceNotes?: string;
}

export interface CreateOutTransactionRequest {
  branchCode?: string;
  transactionDateUtc: string;
  notes?: string;
  paymentMethod?: PaymentMethod;
  lines: OutTransactionLineRequest[];
}

export interface OutTransactionLineRequest {
  itemCode: string;
  itemCondition: ItemCondition;
  quantity: number;
  unitPrice?: number;
  currency?: Currency;
  priceNotes?: string;
}

export interface CreateAdjustTransactionRequest {
  branchCode?: string;
  transactionDateUtc: string;
  notes?: string;
  lines: AdjustTransactionLineRequest[];
}

export interface AdjustTransactionLineRequest {
  itemCode: string;
  itemCondition: ItemCondition;
  newQuantity: number;
  unitPrice?: number;
  currency?: Currency;
  priceNotes?: string;
}

// ----------------------------------------------------------------------------
// Inventory Summary Models
// ----------------------------------------------------------------------------

export interface InventorySummary {
  id: string;
  branchCode: string;
  itemCode: string;
  entries: InventoryEntry[];
  onHandTotal: number;
  reservedTotal: number;
  version: number;
  updatedAtUtc: string;
}

export interface InventoryEntry {
  itemCondition: ItemCondition;
  onHand: number;
  reserved: number;
  latestEntryDateUtc: string;
}

export interface StockTotals {
  newStock: number;
  usedStock: number;
  totalStock: number;
}

// ----------------------------------------------------------------------------
// User Models
// ----------------------------------------------------------------------------

export interface User {
  id: string;
  username: string;
  role: string;
  branchId?: string;
  isActive: boolean;
  createdAtUtc: string;
  createdBy: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role: string;
  branchId?: string;
  isActive: boolean;
}

export interface UpdateUserRequest {
  username?: string;
  password?: string;
  role?: string;
  branchId?: string;
  isActive?: boolean;
}

// ----------------------------------------------------------------------------
// Branch Models
// ----------------------------------------------------------------------------

export interface Branch {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

// ----------------------------------------------------------------------------
// Sale Models
// ----------------------------------------------------------------------------

export interface Sale {
  id: string;
  saleNumber: string;
  branchId: string;
  saleDateUtc: string;
  lines: SaleLine[];
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  postedAtUtc?: string;
  postedBy?: string;
  createdAtUtc: string;
  createdBy: string;
  modifiedAtUtc?: string;
  modifiedBy?: string;
}

export interface SaleLine {
  lineId: string;
  itemId: string;
  itemCode: string;
  description: string;
  classification: 'Good' | 'Service';
  condition?: ItemCondition;
  quantity: number;
  unitPrice: number;
  currency: Currency;
  lineTotal: number;
  inventoryTransactionId?: string;
}

export interface CreateSaleRequest {
  branchCode?: string;
  saleDateUtc: string;
  lines: CreateSaleLineRequest[];
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  paymentMethod: PaymentMethod;
}

export interface CreateSaleLineRequest {
  itemId: string;
  itemCode: string;
  description: string;
  classification: 'Good' | 'Service';
  condition?: ItemCondition;
  quantity: number;
  unitPrice: number;
  currency: Currency;
}

export interface SaleListResponse {
  items: Sale[];
  totalCount: number;
  page: number;
  pageSize: number;
}
