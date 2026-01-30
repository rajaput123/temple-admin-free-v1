// Inventory Types

export type ItemCategoryType = 'raw_materials' | 'pooja_items' | 'perishables' | 'packaging' | 'other';
export type GodownType = 'main_store' | 'kitchen_store' | 'counter_store' | 'other';
export type StockEntryType = 'receipt' | 'issue' | 'transfer' | 'adjustment' | 'return' | 'free_issue';
export type IssueDestination = 'kitchen' | 'counter' | 'rituals' | 'external_event' | 'other';
export type POStatus = 'draft' | 'pending_approval' | 'approved' | 'partially_received' | 'completed' | 'cancelled';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type AuditStatus = 'pending' | 'in_progress' | 'completed' | 'variance_reported';
export type ItemStatus = 'active' | 'inactive' | 'discontinued';

export interface ItemCategory {
  id: string;
  name: string;
  type: ItemCategoryType;
  subCategory?: string;
  description?: string;
  status: 'active' | 'inactive';
}

export interface UOM {
  id: string;
  name: string;
  code: string; // kg, ltr, pcs, etc.
  baseUOM?: string; // For conversions
  conversionFactor?: number; // e.g., 1 bag = 50kg, so conversionFactor = 50
  status: 'active' | 'inactive';
}

export interface Godown {
  id: string;
  name: string;
  type: GodownType;
  location?: string;
  description?: string;
  status: 'active' | 'inactive';
  capacity?: number;
  managerId?: string;
  managerName?: string;
}

export interface Supplier {
  id: string;
  name: string;
  code?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  panNumber?: string;
  paymentTerms?: string; // 30/60/90 days
  status: 'active' | 'inactive';
  preferred?: boolean;
  pricingHistory?: Array<{
    itemId: string;
    itemName: string;
    rate: number;
    uom: string;
    date: string;
    validFrom?: string;
    validTo?: string;
  }>;
}

export interface StockAllocation {
  godownId: string;
  godownName: string;
  quantity: number;
  reservedQuantity?: number; // For pending issues
}

export interface Item {
  id: string;
  name: string;
  code?: string;
  categoryId: string;
  categoryName: string;
  subCategory?: string;
  description?: string;
  baseUOM: string;
  alternateUOMs?: Array<{
    uomId: string;
    uomName: string;
    conversionFactor: number; // e.g., 1 bag = 50kg
  }>;
  minStockLevel: number;
  reorderPoint: number;
  totalStock: number;
  stockAllocations: StockAllocation[]; // Godown-wise allocation
  preferredSupplierId?: string;
  preferredSupplierName?: string;
  supplierPricing?: Array<{
    supplierId: string;
    supplierName: string;
    rate: number;
    uom: string;
    lastUpdated: string;
  }>;
  hsnCode?: string;
  gstSlab?: number; // Percentage
  taxCategory?: string;
  isPerishable: boolean;
  expiryTracking?: boolean;
  shelfLife?: number; // Days
  temperatureRange?: { min: number; max: number }; // For perishables
  image?: string;
  barcode?: string;
  qrCode?: string;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
  customFields?: Record<string, string>;
}

export interface StockEntryItem {
  itemId: string;
  itemName: string;
  quantity: number;
  uom: string;
  batchNumber?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  rate?: number; // For receipts
  remarks?: string;
}

export interface StockEntry {
  id: string;
  entryNumber: string;
  type: StockEntryType;
  date: string;
  items: StockEntryItem[];
  sourceGodownId?: string;
  sourceGodownName?: string;
  destinationGodownId?: string;
  destinationGodownName?: string;
  destination?: IssueDestination; // For issues
  destinationDetails?: string; // Kitchen, Counter name, Ritual name, etc.
  referenceNumber?: string; // PO number, Requisition number, etc.
  supplierId?: string;
  supplierName?: string;
  createdBy: string;
  createdByName: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedOn?: string;
  approvalStatus?: ApprovalStatus;
  approvalRemarks?: string;
  remarks?: string;
  attachments?: string[];
  status: 'draft' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface PurchaseRequisition {
  id: string;
  requisitionNumber: string;
  type: 'auto' | 'manual';
  date: string;
  items: Array<{
    itemId: string;
    itemName: string;
    currentStock: number;
    minStockLevel: number;
    reorderPoint: number;
    requestedQuantity: number;
    uom: string;
    justification?: string; // For manual requisitions
  }>;
  createdBy: string;
  createdByName: string;
  status: 'pending' | 'approved' | 'rejected' | 'converted_to_po';
  remarks?: string;
  convertedToPOId?: string;
  createdAt: string;
}

export interface PurchaseOrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  uom: string;
  rate: number;
  taxRate?: number;
  taxAmount?: number;
  totalAmount: number;
  receivedQuantity?: number;
  pendingQuantity?: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  requisitionId?: string;
  requisitionNumber?: string;
  date: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paymentTerms: string; // 30/60/90 days
  dueDate?: string;
  deliveryDate?: string;
  createdBy: string;
  createdByName: string;
  status: POStatus;
  approvalWorkflow?: Array<{
    level: number;
    approverRole: string;
    approverId?: string;
    approverName?: string;
    status: ApprovalStatus;
    approvedOn?: string;
    remarks?: string;
  }>;
  currentApprovalLevel?: number;
  comparativePricing?: Array<{
    supplierId: string;
    supplierName: string;
    totalAmount: number;
  }>;
  advancePayment?: {
    amount: number;
    paidOn?: string;
    paymentMethod?: string;
  };
  amendments?: Array<{
    date: string;
    type: 'cancellation' | 'amendment' | 'extension';
    details: string;
    changedBy: string;
  }>;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoodsReceiptNote {
  id: string;
  grnNumber: string;
  poId: string;
  poNumber: string;
  date: string;
  supplierId: string;
  supplierName: string;
  items: Array<{
    itemId: string;
    itemName: string;
    orderedQuantity: number;
    receivedQuantity: number;
    acceptedQuantity: number;
    rejectedQuantity: number;
    uom: string;
    orderedRate: number;
    receivedRate: number;
    batchNumber?: string;
    manufacturingDate?: string;
    expiryDate?: string;
    qualityCheck?: 'passed' | 'failed' | 'partial';
    qualityRemarks?: string;
  }>;
  receivedBy: string;
  receivedByName: string;
  verifiedBy?: string;
  verifiedByName?: string;
  verifiedOn?: string;
  status: 'draft' | 'completed' | 'rejected';
  remarks?: string;
  createdAt: string;
}

export interface VendorInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  poId: string;
  poNumber: string;
  grnId?: string;
  grnNumber?: string;
  supplierId: string;
  supplierName: string;
  items: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    rate: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
  }>;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paymentTerms: string;
  dueDate: string;
  verifiedBy?: string;
  verifiedByName?: string;
  verifiedOn?: string;
  verificationStatus: 'pending' | 'verified' | 'discrepancy';
  discrepancies?: Array<{
    type: 'quantity' | 'rate' | 'tax' | 'total';
    poValue: number;
    invoiceValue: number;
    difference: number;
  }>;
  status: 'pending' | 'verified' | 'paid' | 'rejected';
  remarks?: string;
  createdAt: string;
}

export interface PhysicalAudit {
  id: string;
  auditNumber: string;
  date: string;
  godownId: string;
  godownName: string;
  items: Array<{
    itemId: string;
    itemName: string;
    systemQuantity: number;
    physicalQuantity: number;
    variance: number;
    variancePercentage: number;
    remarks?: string;
  }>;
  conductedBy: string;
  conductedByName: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedOn?: string;
  financeApprovedBy?: string;
  financeApprovedByName?: string;
  financeApprovedOn?: string;
  status: AuditStatus;
  totalVariance: number;
  totalVariancePercentage: number;
  remarks?: string;
  createdAt: string;
}
