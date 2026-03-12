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
// Shared / Common Models
// ----------------------------------------------------------------------------

export enum Currency {
  USD = 'USD',
  DOP = 'DOP'
}

export enum ItemCondition {
  New = 'New',
  Used = 'Used'
}

export enum PaymentMethod {
  Cash = 'Cash',
  Card = 'Card',
  Check = 'Check',
  Transfer = 'Transfer',
  Split = 'Split'
}

export interface PaymentDetail {
  method: PaymentMethod;
  amount: number;
  checkNumber?: string;
}

// ----------------------------------------------------------------------------
// StatusHistory Models
// ----------------------------------------------------------------------------

export interface UserLite {
  firstName: string;
  middleName?: string;
  lastName: string;
  secondLastName?: string;
  username: string;
  email?: string;
}

export interface StatusHistoryEntry {
  date: string;
  status: string;
  user: UserLite;
  comment?: string;
}

// ----------------------------------------------------------------------------
// Transaction Models (read-only in UI)
// ----------------------------------------------------------------------------

export enum InitiatorType {
  PurchaseOrder = 'PurchaseOrder',
  Sale = 'Sale',
  StockAdjustment = 'StockAdjustment',
  StockLoss = 'StockLoss',
  BranchTransfer = 'BranchTransfer'
}

export interface EntityKey {
  reference: string;
  referenceNumber: string;
  entityDefinitionCode: InitiatorType;
}

export enum TransactionStatus {
  Draft = 'Draft',
  Committed = 'Committed',
  Cancelled = 'Cancelled'
}

export interface Transaction {
  id: string;
  branchCode: string;
  initiator: EntityKey;
  status: TransactionStatus;
  transactionDateUtc: string;
  notes?: string;
  statusHistory: StatusHistoryEntry[];
  lines: TransactionLine[];
  createdAtUtc: string;
  createdBy: string;
  modifiedAtUtc?: string;
  modifiedBy?: string;
}

export interface TransactionLine {
  lineId: string;
  itemCode: string;
  condition: string;
  quantity: number;
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
  condition: ItemCondition;
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
  firstName: string;
  middleName?: string;
  lastName: string;
  secondLastName?: string;
  email?: string;
  groupReferences: string[];
  branchReferences: string[];
  isActive: boolean;
  createdAtUtc: string;
  createdBy: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  secondLastName?: string;
  email?: string;
  groupReferences: string[];
  branchReferences: string[];
  isActive: boolean;
}

export interface UpdateUserRequest {
  username?: string;
  password?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  secondLastName?: string;
  email?: string;
  groupReferences?: string[];
  branchReferences?: string[];
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
// Role & Group Models
// ----------------------------------------------------------------------------

export interface Role {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAtUtc: string;
  createdBy: string;
}

export interface CreateRoleRequest {
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface Group {
  id: string;
  code: string;
  name: string;
  description?: string;
  roleReferences: string[];
  isActive: boolean;
  createdAtUtc: string;
  createdBy: string;
}

export interface CreateGroupRequest {
  code: string;
  name: string;
  description?: string;
  roleReferences: string[];
  isActive: boolean;
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
  roleReferences?: string[];
  isActive?: boolean;
}

// ----------------------------------------------------------------------------
// Sale Models
// ----------------------------------------------------------------------------

export interface Sale {
  id: string;
  number: string;
  branchReference: string;
  branchCode: string;
  saleDateUtc: string;
  lines: SaleLine[];
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  paymentDetails?: PaymentDetail[];
  status: string;
  statusHistory: StatusHistoryEntry[];
  createdAtUtc: string;
  createdBy: string;
  modifiedAtUtc?: string;
  modifiedBy?: string;
}

export interface SaleLine {
  lineId: string;
  itemReference: string;
  itemCode: string;
  description: string;
  classification: 'Good' | 'Service';
  condition?: ItemCondition;
  quantity: number;
  unitPrice: number;
  currency: Currency;
  lineTotal: number;
  isTaxable: boolean;
  appliesShopFee: boolean;
}

export interface CreateSaleRequest {
  branchCode?: string;
  saleDateUtc?: string;
  lines: CreateSaleLineRequest[];
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  paymentDetails?: PaymentDetail[];
}

export interface CreateSaleLineRequest {
  itemReference: string;
  itemCode: string;
  description: string;
  classification: 'Good' | 'Service';
  condition?: ItemCondition;
  quantity: number;
  unitPrice: number;
  currency: Currency;
  allowWithoutStock?: boolean;
}

export interface SaleListResponse {
  items: Sale[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// ----------------------------------------------------------------------------
// Purchase Order Models
// ----------------------------------------------------------------------------

export interface PurchaseOrder {
  id: string;
  number: string;
  branchReference: string;
  branchCode: string;
  orderDateUtc: string;
  lines: PurchaseOrderLine[];
  supplierName?: string;
  notes?: string;
  status: string;
  statusHistory: StatusHistoryEntry[];
  createdAtUtc: string;
  createdBy: string;
  modifiedAtUtc?: string;
  modifiedBy?: string;
}

export interface PurchaseOrderLine {
  lineId: string;
  itemReference: string;
  itemCode: string;
  condition: ItemCondition;
  quantity: number;
  unitPrice: number;
  currency: Currency;
}

export interface CreatePurchaseOrderRequest {
  branchCode?: string;
  orderDateUtc?: string;
  lines: CreatePurchaseOrderLineRequest[];
  supplierName?: string;
  notes?: string;
}

export interface CreatePurchaseOrderLineRequest {
  itemReference: string;
  itemCode: string;
  condition: ItemCondition;
  quantity: number;
  unitPrice?: number;
  currency?: Currency;
}

export interface PurchaseOrderListResponse {
  items: PurchaseOrder[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// ----------------------------------------------------------------------------
// Inventory Adjustment Models
// ----------------------------------------------------------------------------

export enum AdjustmentType {
  BranchTransfer = 'BranchTransfer',
  StockCorrection = 'StockCorrection'
}

export enum CorrectionDirection {
  Increase = 'Increase',
  Decrease = 'Decrease'
}

export enum InventoryAdjustmentStatus {
  Draft = 'Draft',
  Committed = 'Committed',
  Cancelled = 'Cancelled'
}

export interface InventoryAdjustment {
  id: string;
  number: string;
  adjustmentType: string;
  status: string;
  statusHistory: StatusHistoryEntry[];
  adjustmentDateUtc: string;
  notes?: string;
  originBranchReference?: string;
  originBranchCode?: string;
  destinationBranchReference?: string;
  destinationBranchCode?: string;
  branchReference?: string;
  branchCode?: string;
  direction?: string;
  lines: InventoryAdjustmentLine[];
  createdAtUtc: string;
  createdBy: string;
  modifiedAtUtc?: string;
  modifiedBy?: string;
}

export interface InventoryAdjustmentLine {
  lineId: string;
  itemReference: string;
  itemCode: string;
  condition: string;
  quantity: number;
  notes?: string;
}

export interface CreateBranchTransferRequest {
  originBranchCode: string;
  destinationBranchCode: string;
  notes?: string;
  lines: CreateAdjustmentLineRequest[];
}

export interface CreateStockCorrectionRequest {
  branchCode?: string;
  direction: CorrectionDirection;
  notes?: string;
  lines: CreateAdjustmentLineRequest[];
}

export interface CreateAdjustmentLineRequest {
  itemReference: string;
  itemCode: string;
  condition: ItemCondition;
  quantity: number;
  notes?: string;
}
