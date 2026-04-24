// ===== Auth & Users =====
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operator';
  companyId: string;
  active: boolean;
  createdAt: string;
  lastLogin: string;
}

export interface Company {
  id: string;
  razonSocial: string;
  cedulaJuridica: string;
  sector: string;
  adminEmail: string;
  createdAt: string;
}

// ===== Products =====
export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  buyPrice: number;
  sellPrice: number;
  reorderPoint: number;
  leadTime: number;
  description?: string;
  active: boolean;
  supplierId?: string;
  supplier?: string;
}

// ===== Inventory =====
export type StockStatus = 'available' | 'low' | 'critical' | 'out';

export interface StockItem {
  productId: string;
  warehouseId: string;
  quantity: number;
  status: StockStatus;
  minStock: number;
  maxStock: number;
  lastUpdated: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  active: boolean;
}

export interface KardexEntry {
  id: string;
  productId: string;
  warehouseId: string;
  type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  balance: number;
  userId: string;
  userName: string;
  reason: string;
  date: string;
  cost?: number;
}

export interface ABCItem {
  productId: string;
  productName: string;
  sku: string;
  class: 'A' | 'B' | 'C';
  annualConsumptionValue: number;
  percentOfTotal: number;
  accumulatedPercent: number;
}

// ===== Dataset =====
export interface SaleRecord {
  id: string;
  productId: string;
  date: string;
  quantity: number;
  price: number;
  total: number;
  dayOfWeek: number;
  month: number;
  isOutlier?: boolean;
  zScore?: number;
}

export interface OutlierResult {
  productId: string;
  productName: string;
  totalRecords: number;
  outliersFound: number;
  method: 'IQR' | 'Z-Score';
  records: SaleRecord[];
}

// ===== Predictions =====
export type ModelType = 'linear_regression' | 'decision_tree';

export interface ModelMetrics {
  mse: number;
  r2: number;
  mae: number;
  trainingDate: string;
  dataPointsUsed: number;
}

export interface ModelComparison {
  productId: string;
  productName: string;
  sku: string;
  linearRegression: ModelMetrics;
  decisionTree: ModelMetrics;
  selectedModel: ModelType;
  lastRetraining: string;
  nextRetraining: string;
}

export interface DemandPrediction {
  productId: string;
  productName: string;
  date: string;
  predictedValue: number;
  lowerBound: number;
  upperBound: number;
  modelUsed: ModelType;
}

export interface PredictionExplanation {
  feature: string;
  importance: number;
  description: string;
  icon: string;
}

export interface PredictionVsActual {
  date: string;
  predicted: number;
  actual: number;
  label: string;
}

// ===== Alerts =====
export type AlertType = 'restock' | 'excess' | 'stockout_risk';
export type AlertPriority = 'high' | 'medium' | 'low';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export interface Alert {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  warehouseId: string;
  warehouseName: string;
  type: AlertType;
  priority: AlertPriority;
  status: AlertStatus;
  title: string;
  message: string;
  currentStock: number;
  threshold: number;
  safetyStock?: number;
  projectedStockoutDate?: string;
  projectedDaysUntilStockout?: number;
  excessValue?: number;
  createdAt: string;
  updatedAt: string;
}

// ===== Inventory Projection =====
export interface StockProjection {
  productId: string;
  date: string;
  projectedStock: number;
  safetyStock: number;
  isBelowThreshold: boolean;
}

// ===== Transfer =====
export interface Transfer {
  id: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  productId: string;
  quantity: number;
  userId: string;
  status: 'pending' | 'completed' | 'cancelled';
  date: string;
}

// ===== Purchase Orders =====
export interface PurchaseOrder {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  status: 'pending' | 'received' | 'cancelled';
  expectedDate: string;
  unitCost?: number;
  notes?: string;
}
