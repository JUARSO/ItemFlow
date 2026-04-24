import { Injectable } from '@angular/core';
import {
  Product, StockItem, Warehouse, KardexEntry, ABCItem,
  SaleRecord, ModelComparison, DemandPrediction, PredictionVsActual,
  Alert, DashboardKPIs, StockProjection, PredictionExplanation, ModelType,
  PurchaseOrder
} from '../models';

@Injectable({ providedIn: 'root' })
export class DataService {

  // ===== PRODUCTS =====
  products: Product[] = [
    { id: 'p01', sku: 'LAC-001', name: 'Leche Entera 1L', category: 'Lácteos', unit: 'Litro',
      buyPrice: 450, sellPrice: 580, reorderPoint: 50, leadTime: 3, active: true, supplier: 'Distribuidora Beta',
      description: 'Leche entera pasteurizada, presentación tetra-pack 1 litro' },
    { id: 'p02', sku: 'LAC-002', name: 'Queso Mozzarella 500g', category: 'Lácteos', unit: 'Unidad',
      buyPrice: 1200, sellPrice: 1650, reorderPoint: 20, leadTime: 3, active: true, supplier: 'Distribuidora Beta',
      description: 'Queso mozzarella fresco en bloque, 500 gramos' },
    { id: 'p03', sku: 'LAC-003', name: 'Yogur Natural 250g', category: 'Lácteos', unit: 'Unidad',
      buyPrice: 380, sellPrice: 490, reorderPoint: 30, leadTime: 3, active: true, supplier: 'Distribuidora Beta' },
    { id: 'p04', sku: 'LAC-004', name: 'Crema de Leche 200ml', category: 'Lácteos', unit: 'Unidad',
      buyPrice: 520, sellPrice: 680, reorderPoint: 25, leadTime: 3, active: true, supplier: 'Distribuidora Beta' },
    { id: 'p05', sku: 'GRA-001', name: 'Arroz Grano Largo 1kg', category: 'Granos y Cereales', unit: 'Kilogramo',
      buyPrice: 580, sellPrice: 750, reorderPoint: 100, leadTime: 5, active: true, supplier: 'Importadora Gamma',
      description: 'Arroz grano largo, bolsa 1 kilogramo' },
    { id: 'p06', sku: 'GRA-002', name: 'Frijoles Negros 1kg', category: 'Granos y Cereales', unit: 'Kilogramo',
      buyPrice: 720, sellPrice: 950, reorderPoint: 80, leadTime: 5, active: true, supplier: 'Importadora Gamma' },
    { id: 'p07', sku: 'GRA-003', name: 'Harina de Trigo 1kg', category: 'Granos y Cereales', unit: 'Kilogramo',
      buyPrice: 420, sellPrice: 560, reorderPoint: 60, leadTime: 5, active: true, supplier: 'Importadora Gamma' },
    { id: 'p08', sku: 'GRA-004', name: 'Avena Integral 500g', category: 'Granos y Cereales', unit: 'Unidad',
      buyPrice: 680, sellPrice: 890, reorderPoint: 40, leadTime: 5, active: true, supplier: 'Importadora Gamma' },
    { id: 'p09', sku: 'ACE-001', name: 'Aceite Vegetal 1L', category: 'Aceites y Grasas', unit: 'Litro',
      buyPrice: 1100, sellPrice: 1450, reorderPoint: 50, leadTime: 7, active: true, supplier: 'Proveedor Alpha',
      description: 'Aceite vegetal de soya, botella 1 litro' },
    { id: 'p10', sku: 'ACE-002', name: 'Aceite de Oliva 500ml', category: 'Aceites y Grasas', unit: 'Unidad',
      buyPrice: 3200, sellPrice: 4100, reorderPoint: 15, leadTime: 7, active: true, supplier: 'Proveedor Alpha' },
    { id: 'p11', sku: 'ACE-003', name: 'Margarina 500g', category: 'Aceites y Grasas', unit: 'Unidad',
      buyPrice: 890, sellPrice: 1150, reorderPoint: 35, leadTime: 5, active: true, supplier: 'Proveedor Alpha' },
    { id: 'p12', sku: 'ACE-004', name: 'Mantequilla 250g', category: 'Aceites y Grasas', unit: 'Unidad',
      buyPrice: 1350, sellPrice: 1750, reorderPoint: 20, leadTime: 5, active: true, supplier: 'Proveedor Alpha' }
  ];

  // ===== WAREHOUSES =====
  warehouses: Warehouse[] = [
    { id: 'w1', name: 'Bodega Central', location: 'San José Centro', active: true },
    { id: 'w2', name: 'Sucursal Norte', location: 'Heredia, La Aurora', active: true },
    { id: 'w3', name: 'Sucursal Sur', location: 'Cartago, El Tejar', active: true }
  ];

  // ===== STOCK =====
  stockItems: StockItem[] = [
    // Bodega Central
    { productId: 'p01', warehouseId: 'w1', quantity: 85, status: 'available', minStock: 50, maxStock: 300, lastUpdated: '2026-04-22T08:00:00' },
    { productId: 'p02', warehouseId: 'w1', quantity: 32, status: 'available', minStock: 20, maxStock: 100, lastUpdated: '2026-04-22T08:00:00' },
    { productId: 'p03', warehouseId: 'w1', quantity: 14, status: 'critical', minStock: 30, maxStock: 150, lastUpdated: '2026-04-22T08:00:00' },
    { productId: 'p04', warehouseId: 'w1', quantity: 28, status: 'available', minStock: 25, maxStock: 120, lastUpdated: '2026-04-22T08:00:00' },
    { productId: 'p05', warehouseId: 'w1', quantity: 0, status: 'out', minStock: 100, maxStock: 500, lastUpdated: '2026-04-22T08:00:00' },
    { productId: 'p06', warehouseId: 'w1', quantity: 62, status: 'available', minStock: 80, maxStock: 400, lastUpdated: '2026-04-22T08:00:00' },
    { productId: 'p07', warehouseId: 'w1', quantity: 45, status: 'low', minStock: 60, maxStock: 300, lastUpdated: '2026-04-22T08:00:00' },
    { productId: 'p08', warehouseId: 'w1', quantity: 88, status: 'available', minStock: 40, maxStock: 200, lastUpdated: '2026-04-22T08:00:00' },
    { productId: 'p09', warehouseId: 'w1', quantity: 18, status: 'critical', minStock: 50, maxStock: 250, lastUpdated: '2026-04-22T08:00:00' },
    { productId: 'p10', warehouseId: 'w1', quantity: 41, status: 'available', minStock: 15, maxStock: 80, lastUpdated: '2026-04-22T08:00:00' },
    { productId: 'p11', warehouseId: 'w1', quantity: 55, status: 'available', minStock: 35, maxStock: 180, lastUpdated: '2026-04-22T08:00:00' },
    { productId: 'p12', warehouseId: 'w1', quantity: 9, status: 'critical', minStock: 20, maxStock: 100, lastUpdated: '2026-04-22T08:00:00' },
    // Sucursal Norte
    { productId: 'p01', warehouseId: 'w2', quantity: 38, status: 'low', minStock: 50, maxStock: 200, lastUpdated: '2026-04-21T14:30:00' },
    { productId: 'p02', warehouseId: 'w2', quantity: 22, status: 'available', minStock: 20, maxStock: 80, lastUpdated: '2026-04-21T14:30:00' },
    { productId: 'p03', warehouseId: 'w2', quantity: 0, status: 'out', minStock: 30, maxStock: 100, lastUpdated: '2026-04-21T14:30:00' },
    { productId: 'p04', warehouseId: 'w2', quantity: 31, status: 'available', minStock: 25, maxStock: 100, lastUpdated: '2026-04-21T14:30:00' },
    { productId: 'p05', warehouseId: 'w2', quantity: 120, status: 'available', minStock: 100, maxStock: 350, lastUpdated: '2026-04-21T14:30:00' },
    { productId: 'p06', warehouseId: 'w2', quantity: 55, status: 'low', minStock: 80, maxStock: 300, lastUpdated: '2026-04-21T14:30:00' },
    { productId: 'p07', warehouseId: 'w2', quantity: 78, status: 'available', minStock: 60, maxStock: 250, lastUpdated: '2026-04-21T14:30:00' },
    { productId: 'p08', warehouseId: 'w2', quantity: 42, status: 'available', minStock: 40, maxStock: 150, lastUpdated: '2026-04-21T14:30:00' },
    { productId: 'p09', warehouseId: 'w2', quantity: 65, status: 'available', minStock: 50, maxStock: 200, lastUpdated: '2026-04-21T14:30:00' },
    { productId: 'p10', warehouseId: 'w2', quantity: 12, status: 'low', minStock: 15, maxStock: 60, lastUpdated: '2026-04-21T14:30:00' },
    { productId: 'p11', warehouseId: 'w2', quantity: 38, status: 'available', minStock: 35, maxStock: 150, lastUpdated: '2026-04-21T14:30:00' },
    { productId: 'p12', warehouseId: 'w2', quantity: 25, status: 'available', minStock: 20, maxStock: 80, lastUpdated: '2026-04-21T14:30:00' },
    // Sucursal Sur
    { productId: 'p01', warehouseId: 'w3', quantity: 62, status: 'available', minStock: 50, maxStock: 200, lastUpdated: '2026-04-22T09:15:00' },
    { productId: 'p02', warehouseId: 'w3', quantity: 8, status: 'critical', minStock: 20, maxStock: 80, lastUpdated: '2026-04-22T09:15:00' },
    { productId: 'p03', warehouseId: 'w3', quantity: 45, status: 'available', minStock: 30, maxStock: 100, lastUpdated: '2026-04-22T09:15:00' },
    { productId: 'p04', warehouseId: 'w3', quantity: 0, status: 'out', minStock: 25, maxStock: 100, lastUpdated: '2026-04-22T09:15:00' },
    { productId: 'p05', warehouseId: 'w3', quantity: 95, status: 'low', minStock: 100, maxStock: 350, lastUpdated: '2026-04-22T09:15:00' },
    { productId: 'p06', warehouseId: 'w3', quantity: 110, status: 'available', minStock: 80, maxStock: 300, lastUpdated: '2026-04-22T09:15:00' },
    { productId: 'p07', warehouseId: 'w3', quantity: 70, status: 'available', minStock: 60, maxStock: 250, lastUpdated: '2026-04-22T09:15:00' },
    { productId: 'p08', warehouseId: 'w3', quantity: 15, status: 'critical', minStock: 40, maxStock: 150, lastUpdated: '2026-04-22T09:15:00' },
    { productId: 'p09', warehouseId: 'w3', quantity: 44, status: 'low', minStock: 50, maxStock: 200, lastUpdated: '2026-04-22T09:15:00' },
    { productId: 'p10', warehouseId: 'w3', quantity: 28, status: 'available', minStock: 15, maxStock: 60, lastUpdated: '2026-04-22T09:15:00' },
    { productId: 'p11', warehouseId: 'w3', quantity: 52, status: 'available', minStock: 35, maxStock: 150, lastUpdated: '2026-04-22T09:15:00' },
    { productId: 'p12', warehouseId: 'w3', quantity: 18, status: 'low', minStock: 20, maxStock: 80, lastUpdated: '2026-04-22T09:15:00' }
  ];

  // ===== PURCHASE ORDERS (in transit) =====
  purchaseOrders: PurchaseOrder[] = [
    { id: 'po1', productId: 'p05', warehouseId: 'w1', quantity: 100, status: 'pending', expectedDate: '2026-04-26', unitCost: 580, notes: 'Reposición urgente Bodega Central — agotado' },
    { id: 'po2', productId: 'p09', warehouseId: 'w1', quantity: 60,  status: 'pending', expectedDate: '2026-04-28', unitCost: 1100, notes: 'Pedido #PO-2026-045 a Proveedor Alpha' },
    { id: 'po3', productId: 'p12', warehouseId: 'w1', quantity: 35,  status: 'pending', expectedDate: '2026-04-27', unitCost: 1350, notes: 'Reposición stock mínimo Mantequilla' },
  ];

  // ===== KARDEX =====
  kardexEntries: KardexEntry[] = [
    { id: 'k001', productId: 'p01', warehouseId: 'w1', type: 'in', quantity: 200, balance: 285, userId: 'u1', userName: 'Carlos Rodríguez', reason: 'Compra a proveedor #PO-2026-041', date: '2026-04-20T08:30:00', cost: 450 },
    { id: 'k002', productId: 'p01', warehouseId: 'w1', type: 'out', quantity: 50, balance: 235, userId: 'u2', userName: 'María Fernández', reason: 'Venta a cliente #VTA-0841', date: '2026-04-20T10:15:00' },
    { id: 'k003', productId: 'p05', warehouseId: 'w1', type: 'out', quantity: 80, balance: 80, userId: 'u2', userName: 'María Fernández', reason: 'Venta a cliente #VTA-0842', date: '2026-04-20T11:00:00' },
    { id: 'k004', productId: 'p03', warehouseId: 'w1', type: 'adjustment', quantity: -6, balance: 14, userId: 'u1', userName: 'Carlos Rodríguez', reason: 'Ajuste por producto vencido', date: '2026-04-21T09:00:00' },
    { id: 'k005', productId: 'p05', warehouseId: 'w1', type: 'out', quantity: 80, balance: 0, userId: 'u2', userName: 'María Fernández', reason: 'Venta a cliente #VTA-0843', date: '2026-04-21T10:30:00' },
    { id: 'k006', productId: 'p09', warehouseId: 'w1', type: 'in', quantity: 50, balance: 68, userId: 'u1', userName: 'Carlos Rodríguez', reason: 'Compra a proveedor #PO-2026-042', date: '2026-04-21T14:00:00', cost: 1100 },
    { id: 'k007', productId: 'p09', warehouseId: 'w1', type: 'out', quantity: 50, balance: 18, userId: 'u3', userName: 'Roberto Vargas', reason: 'Venta a cliente #VTA-0844', date: '2026-04-22T08:00:00' },
    { id: 'k008', productId: 'p01', warehouseId: 'w1', type: 'transfer', quantity: 100, balance: 85, userId: 'u1', userName: 'Carlos Rodríguez', reason: 'Transferencia a Sucursal Norte', date: '2026-04-22T09:00:00' },
    { id: 'k009', productId: 'p06', warehouseId: 'w1', type: 'in', quantity: 150, balance: 212, userId: 'u2', userName: 'María Fernández', reason: 'Compra a proveedor #PO-2026-043', date: '2026-04-22T10:00:00', cost: 720 },
    { id: 'k010', productId: 'p06', warehouseId: 'w1', type: 'out', quantity: 150, balance: 62, userId: 'u3', userName: 'Roberto Vargas', reason: 'Venta a clientes varios', date: '2026-04-22T14:00:00' },
    { id: 'k011', productId: 'p12', warehouseId: 'w1', type: 'out', quantity: 11, balance: 9, userId: 'u2', userName: 'María Fernández', reason: 'Venta a cliente #VTA-0848', date: '2026-04-22T15:00:00' },
    { id: 'k012', productId: 'p02', warehouseId: 'w3', type: 'out', quantity: 12, balance: 8, userId: 'u3', userName: 'Roberto Vargas', reason: 'Venta a restaurante El Fogón', date: '2026-04-22T11:30:00' },
    { id: 'k013', productId: 'p07', warehouseId: 'w1', type: 'in', quantity: 100, balance: 145, userId: 'u1', userName: 'Carlos Rodríguez', reason: 'Compra a proveedor #PO-2026-044', date: '2026-04-19T08:00:00', cost: 420 },
    { id: 'k014', productId: 'p07', warehouseId: 'w1', type: 'out', quantity: 100, balance: 45, userId: 'u2', userName: 'María Fernández', reason: 'Venta canal distribución', date: '2026-04-19T16:00:00' },
    { id: 'k015', productId: 'p10', warehouseId: 'w1', type: 'in', quantity: 60, balance: 101, userId: 'u1', userName: 'Carlos Rodríguez', reason: 'Compra a proveedor importador', date: '2026-04-18T08:00:00', cost: 3200 },
    { id: 'k016', productId: 'p10', warehouseId: 'w1', type: 'out', quantity: 60, balance: 41, userId: 'u3', userName: 'Roberto Vargas', reason: 'Venta a supermercado regional', date: '2026-04-18T15:30:00' },
    { id: 'k017', productId: 'p04', warehouseId: 'w3', type: 'out', quantity: 28, balance: 0, userId: 'u3', userName: 'Roberto Vargas', reason: 'Venta a cliente mayorista', date: '2026-04-17T10:00:00' },
    { id: 'k018', productId: 'p08', warehouseId: 'w3', type: 'out', quantity: 25, balance: 15, userId: 'u3', userName: 'Roberto Vargas', reason: 'Venta canal tiendas pequeñas', date: '2026-04-22T08:30:00' },
    { id: 'k019', productId: 'p11', warehouseId: 'w2', type: 'in', quantity: 80, balance: 118, userId: 'u2', userName: 'María Fernández', reason: 'Compra a proveedor #PO-2026-039', date: '2026-04-15T09:00:00', cost: 890 },
    { id: 'k020', productId: 'p11', warehouseId: 'w2', type: 'out', quantity: 80, balance: 38, userId: 'u2', userName: 'María Fernández', reason: 'Ventas semana 16', date: '2026-04-15T17:00:00' }
  ];

  // ===== ABC CLASSIFICATION =====
  abcItems: ABCItem[] = [
    { productId: 'p01', productName: 'Leche Entera 1L', sku: 'LAC-001', class: 'A', annualConsumptionValue: 4350000, percentOfTotal: 18.2, accumulatedPercent: 18.2 },
    { productId: 'p05', productName: 'Arroz Grano Largo 1kg', sku: 'GRA-001', class: 'A', annualConsumptionValue: 3850000, percentOfTotal: 16.1, accumulatedPercent: 34.3 },
    { productId: 'p09', productName: 'Aceite Vegetal 1L', sku: 'ACE-001', class: 'A', annualConsumptionValue: 3620000, percentOfTotal: 15.1, accumulatedPercent: 49.4 },
    { productId: 'p06', productName: 'Frijoles Negros 1kg', sku: 'GRA-002', class: 'A', annualConsumptionValue: 2980000, percentOfTotal: 12.5, accumulatedPercent: 61.9 },
    { productId: 'p02', productName: 'Queso Mozzarella 500g', sku: 'LAC-002', class: 'B', annualConsumptionValue: 1850000, percentOfTotal: 7.7, accumulatedPercent: 69.6 },
    { productId: 'p10', productName: 'Aceite de Oliva 500ml', sku: 'ACE-002', class: 'B', annualConsumptionValue: 1720000, percentOfTotal: 7.2, accumulatedPercent: 76.8 },
    { productId: 'p07', productName: 'Harina de Trigo 1kg', sku: 'GRA-003', class: 'B', annualConsumptionValue: 1450000, percentOfTotal: 6.1, accumulatedPercent: 82.9 },
    { productId: 'p11', productName: 'Margarina 500g', sku: 'ACE-003', class: 'B', annualConsumptionValue: 1280000, percentOfTotal: 5.4, accumulatedPercent: 88.3 },
    { productId: 'p04', productName: 'Crema de Leche 200ml', sku: 'LAC-004', class: 'C', annualConsumptionValue: 680000, percentOfTotal: 2.8, accumulatedPercent: 91.1 },
    { productId: 'p12', productName: 'Mantequilla 250g', sku: 'ACE-004', class: 'C', annualConsumptionValue: 620000, percentOfTotal: 2.6, accumulatedPercent: 93.7 },
    { productId: 'p03', productName: 'Yogur Natural 250g', sku: 'LAC-003', class: 'C', annualConsumptionValue: 580000, percentOfTotal: 2.4, accumulatedPercent: 96.1 },
    { productId: 'p08', productName: 'Avena Integral 500g', sku: 'GRA-004', class: 'C', annualConsumptionValue: 430000, percentOfTotal: 1.8, accumulatedPercent: 97.9 }
  ];

  // ===== SALES RECORDS (90 days, simplified to key products) =====
  saleRecords: SaleRecord[] = this.generateSalesHistory();

  // ===== MODEL COMPARISONS =====
  modelComparisons: ModelComparison[] = [
    { productId: 'p01', productName: 'Leche Entera 1L', sku: 'LAC-001',
      linearRegression: { mse: 185.4, r2: 0.741, mae: 10.2, trainingDate: '2026-04-17', dataPointsUsed: 270 },
      decisionTree: { mse: 142.8, r2: 0.812, mae: 8.6, trainingDate: '2026-04-17', dataPointsUsed: 270 },
      selectedModel: 'decision_tree', lastRetraining: '2026-04-17', nextRetraining: '2026-04-24' },
    { productId: 'p05', productName: 'Arroz Grano Largo 1kg', sku: 'GRA-001',
      linearRegression: { mse: 210.6, r2: 0.768, mae: 11.8, trainingDate: '2026-04-17', dataPointsUsed: 270 },
      decisionTree: { mse: 168.2, r2: 0.831, mae: 9.4, trainingDate: '2026-04-17', dataPointsUsed: 270 },
      selectedModel: 'decision_tree', lastRetraining: '2026-04-17', nextRetraining: '2026-04-24' },
    { productId: 'p09', productName: 'Aceite Vegetal 1L', sku: 'ACE-001',
      linearRegression: { mse: 320.1, r2: 0.689, mae: 14.5, trainingDate: '2026-04-17', dataPointsUsed: 270 },
      decisionTree: { mse: 198.5, r2: 0.792, mae: 11.2, trainingDate: '2026-04-17', dataPointsUsed: 270 },
      selectedModel: 'decision_tree', lastRetraining: '2026-04-17', nextRetraining: '2026-04-24' },
    { productId: 'p06', productName: 'Frijoles Negros 1kg', sku: 'GRA-002',
      linearRegression: { mse: 145.8, r2: 0.802, mae: 9.1, trainingDate: '2026-04-17', dataPointsUsed: 270 },
      decisionTree: { mse: 112.3, r2: 0.851, mae: 7.8, trainingDate: '2026-04-17', dataPointsUsed: 270 },
      selectedModel: 'decision_tree', lastRetraining: '2026-04-17', nextRetraining: '2026-04-24' },
    { productId: 'p02', productName: 'Queso Mozzarella 500g', sku: 'LAC-002',
      linearRegression: { mse: 89.4, r2: 0.821, mae: 7.2, trainingDate: '2026-04-17', dataPointsUsed: 270 },
      decisionTree: { mse: 95.1, r2: 0.808, mae: 7.8, trainingDate: '2026-04-17', dataPointsUsed: 270 },
      selectedModel: 'linear_regression', lastRetraining: '2026-04-17', nextRetraining: '2026-04-24' }
  ];

  // ===== DEMAND PREDICTIONS (next 30 days for p01) =====
  demandPredictions: DemandPrediction[] = this.generatePredictions();

  // ===== PREDICTION VS ACTUAL (last 90 days for p01) =====
  predictionVsActual: PredictionVsActual[] = this.generatePredVsActual();

  // ===== PREDICTION EXPLANATIONS =====
  predictionExplanations: PredictionExplanation[] = [
    { feature: 'Estacionalidad mensual', importance: 0.35, description: 'El mes de abril muestra mayor demanda (+12% vs media anual)', icon: 'calendar' },
    { feature: 'Día de la semana', importance: 0.28, description: 'Lunes y martes concentran el 38% de ventas semanales', icon: 'time' },
    { feature: 'Historial reciente (7d)', importance: 0.22, description: 'Promedio móvil últimos 7 días: 78 unidades/día', icon: 'trending-up' },
    { feature: 'Precio de venta', importance: 0.10, description: 'Precio estable, sin cambio en últimas 4 semanas', icon: 'pricetag' },
    { feature: 'Promociones activas', importance: 0.05, description: 'Sin promoción activa en período actual', icon: 'gift' }
  ];

  // ===== ALERTS =====
  alerts: Alert[] = [
    { id: 'a001', productId: 'p05', productName: 'Arroz Grano Largo 1kg', sku: 'GRA-001',
      warehouseId: 'w1', warehouseName: 'Bodega Central', type: 'stockout_risk', priority: 'high', status: 'active',
      title: 'Riesgo de quiebre de stock', message: 'Con la demanda proyectada, el stock se agotará en aproximadamente 2 días. Se recomienda reabastecimiento urgente.',
      currentStock: 0, threshold: 100, safetyStock: 80, projectedStockoutDate: '2026-04-23', projectedDaysUntilStockout: 0,
      createdAt: '2026-04-22T07:00:00', updatedAt: '2026-04-22T07:00:00' },
    { id: 'a002', productId: 'p03', productName: 'Yogur Natural 250g', sku: 'LAC-003',
      warehouseId: 'w1', warehouseName: 'Bodega Central', type: 'restock', priority: 'high', status: 'active',
      title: 'Reabastecimiento urgente requerido', message: 'Stock actual (14 unidades) está por debajo del punto de reorden (30). Con demanda diaria de 8 und, el stock alcanza para ~1.7 días.',
      currentStock: 14, threshold: 30, safetyStock: 20, projectedStockoutDate: '2026-04-24', projectedDaysUntilStockout: 1,
      createdAt: '2026-04-22T07:15:00', updatedAt: '2026-04-22T07:15:00' },
    { id: 'a003', productId: 'p09', productName: 'Aceite Vegetal 1L', sku: 'ACE-001',
      warehouseId: 'w1', warehouseName: 'Bodega Central', type: 'restock', priority: 'high', status: 'active',
      title: 'Stock crítico — Aceite Vegetal', message: 'Stock en Bodega Central ha caído a nivel crítico (18 und). Punto de reorden es 50 unidades. Tiempo de reposición del proveedor: 7 días.',
      currentStock: 18, threshold: 50, safetyStock: 35, projectedStockoutDate: '2026-04-27', projectedDaysUntilStockout: 4,
      createdAt: '2026-04-22T08:00:00', updatedAt: '2026-04-22T08:00:00' },
    { id: 'a004', productId: 'p12', productName: 'Mantequilla 250g', sku: 'ACE-004',
      warehouseId: 'w1', warehouseName: 'Bodega Central', type: 'restock', priority: 'medium', status: 'active',
      title: 'Stock bajo — Mantequilla 250g', message: 'Nivel de stock por debajo del punto de reorden. Proyección indica posible agotamiento en 5 días si no se realiza pedido.',
      currentStock: 9, threshold: 20, safetyStock: 15, projectedStockoutDate: '2026-04-27', projectedDaysUntilStockout: 5,
      createdAt: '2026-04-22T08:30:00', updatedAt: '2026-04-22T08:30:00' },
    { id: 'a005', productId: 'p07', productName: 'Harina de Trigo 1kg', sku: 'GRA-003',
      warehouseId: 'w1', warehouseName: 'Bodega Central', type: 'restock', priority: 'medium', status: 'acknowledged',
      title: 'Reabastecimiento sugerido — Harina', message: 'Stock (45 und) aproximándose al punto de reorden (60). Se recomienda hacer pedido esta semana para evitar ruptura.',
      currentStock: 45, threshold: 60, safetyStock: 40, projectedStockoutDate: '2026-04-30', projectedDaysUntilStockout: 7,
      createdAt: '2026-04-21T10:00:00', updatedAt: '2026-04-22T09:00:00' },
    { id: 'a006', productId: 'p02', productName: 'Queso Mozzarella 500g', sku: 'LAC-002',
      warehouseId: 'w3', warehouseName: 'Sucursal Sur', type: 'restock', priority: 'high', status: 'active',
      title: 'Stock crítico en Sucursal Sur', message: 'Sucursal Sur tiene solo 8 unidades de Queso Mozzarella. Alta demanda en este punto de venta.',
      currentStock: 8, threshold: 20, safetyStock: 15, projectedStockoutDate: '2026-04-25', projectedDaysUntilStockout: 2,
      createdAt: '2026-04-22T09:30:00', updatedAt: '2026-04-22T09:30:00' },
    { id: 'a007', productId: 'p01', productName: 'Leche Entera 1L', sku: 'LAC-001',
      warehouseId: 'w2', warehouseName: 'Sucursal Norte', type: 'restock', priority: 'medium', status: 'active',
      title: 'Stock bajo en Sucursal Norte', message: 'Sucursal Norte tiene 38 unidades (punto de reorden: 50). Se sugiere transferencia desde Bodega Central o nuevo pedido.',
      currentStock: 38, threshold: 50, safetyStock: 35, projectedStockoutDate: '2026-04-28', projectedDaysUntilStockout: 6,
      createdAt: '2026-04-22T10:00:00', updatedAt: '2026-04-22T10:00:00' },
    { id: 'a008', productId: 'p08', productName: 'Avena Integral 500g', sku: 'GRA-004',
      warehouseId: 'w1', warehouseName: 'Bodega Central', type: 'excess', priority: 'low', status: 'active',
      title: 'Exceso de inventario — Avena Integral', message: 'Stock de Avena (88 und) supera 220% del punto de reorden. Rotación baja en las últimas 4 semanas. Capital inmovilizado: ₡78,320.',
      currentStock: 88, threshold: 40, excessValue: 78320,
      createdAt: '2026-04-20T12:00:00', updatedAt: '2026-04-20T12:00:00' },
    { id: 'a009', productId: 'p10', productName: 'Aceite de Oliva 500ml', sku: 'ACE-002',
      warehouseId: 'w1', warehouseName: 'Bodega Central', type: 'excess', priority: 'medium', status: 'active',
      title: 'Inventario excedente — Aceite de Oliva', message: 'Stock (41 und) equivale a ~90 días de inventario. Rotación por debajo del objetivo. Capital inmovilizado estimado: ₡131,200.',
      currentStock: 41, threshold: 15, excessValue: 131200,
      createdAt: '2026-04-19T08:00:00', updatedAt: '2026-04-19T08:00:00' },
    { id: 'a010', productId: 'p03', productName: 'Yogur Natural 250g', sku: 'LAC-003',
      warehouseId: 'w2', warehouseName: 'Sucursal Norte', type: 'stockout_risk', priority: 'high', status: 'active',
      title: 'Producto agotado en Sucursal Norte', message: 'Yogur Natural completamente agotado en Sucursal Norte (0 und). Se necesita reposición inmediata.',
      currentStock: 0, threshold: 30, projectedDaysUntilStockout: 0,
      createdAt: '2026-04-22T06:00:00', updatedAt: '2026-04-22T06:00:00' }
  ];

  // ===== DASHBOARD KPIs =====
  dashboardKPIs: DashboardKPIs = {
    totalInventoryValue: 24850000,
    turnoverRate: 4.2,
    inventoryDays: 21,
    stockoutRate: 8.3,
    predictionAccuracy: 0.819,
    avgMSE: 181.2,
    totalActiveAlerts: 9,
    criticalAlerts: 4,
    productsTotal: 12,
    lowStockProducts: 6,
    outOfStockProducts: 3,
    availableProducts: 9
  };

  // ===== STOCK PROJECTIONS =====
  getStockProjections(productId: string, warehouseId: string): StockProjection[] {
    const stock = this.stockItems.find(s => s.productId === productId && s.warehouseId === warehouseId);
    const product = this.products.find(p => p.id === productId);
    if (!stock || !product) return [];

    const projections: StockProjection[] = [];
    const dailyDemand = this.getDailyDemand(productId);
    const safetyStock = product.reorderPoint * 0.7;
    let current = stock.quantity;

    for (let i = 0; i < 14; i++) {
      const date = new Date('2026-04-23');
      date.setDate(date.getDate() + i);
      current = Math.max(0, current - dailyDemand + (Math.random() > 0.85 ? dailyDemand * 0.1 : 0));
      projections.push({
        productId, date: date.toISOString().split('T')[0],
        projectedStock: Math.round(current),
        safetyStock: Math.round(safetyStock),
        isBelowThreshold: current < safetyStock
      });
    }
    return projections;
  }

  getDailyDemand(productId: string): number {
    const map: Record<string, number> = {
      p01: 12, p02: 4, p03: 8, p04: 5, p05: 18, p06: 15,
      p07: 10, p08: 3, p09: 9, p10: 2, p11: 6, p12: 2
    };
    return map[productId] || 5;
  }

  private generateSalesHistory(): SaleRecord[] {
    const records: SaleRecord[] = [];
    const baseQty: Record<string, number> = {
      p01: 80, p02: 25, p03: 50, p04: 30, p05: 120, p06: 95,
      p07: 70, p08: 20, p09: 55, p10: 12, p11: 40, p12: 15
    };
    const prices: Record<string, number> = {
      p01: 580, p02: 1650, p03: 490, p04: 680, p05: 750, p06: 950,
      p07: 560, p08: 890, p09: 1450, p10: 4100, p11: 1150, p12: 1750
    };

    let id = 1;
    const productIds = ['p01', 'p05', 'p06', 'p09'];

    for (const pid of productIds) {
      for (let d = 89; d >= 0; d--) {
        const date = new Date('2026-04-22');
        date.setDate(date.getDate() - d);
        const dow = date.getDay();
        const month = date.getMonth();
        const weekMult = dow === 0 || dow === 6 ? 0.7 : (dow === 1 || dow === 2 ? 1.2 : 1.0);
        const seasMult = month === 11 || month === 0 ? 1.25 : (month === 3 || month === 4 ? 1.1 : 1.0);
        const noise = 0.8 + Math.random() * 0.4;
        const qty = Math.round(baseQty[pid] * weekMult * seasMult * noise / 7);
        const isOutlier = Math.random() < 0.05;
        const finalQty = isOutlier ? qty * (Math.random() > 0.5 ? 3.5 : 0.1) : qty;
        const zScore = isOutlier ? (Math.random() > 0.5 ? 3.2 : -3.4) : (Math.random() * 1.5 - 0.75);

        records.push({
          id: `s${String(id++).padStart(4, '0')}`, productId: pid,
          date: date.toISOString().split('T')[0],
          quantity: Math.round(Math.max(0, finalQty)),
          price: prices[pid], total: Math.round(Math.max(0, finalQty)) * prices[pid],
          dayOfWeek: dow, month,
          isOutlier, zScore: Math.round(zScore * 100) / 100
        });
      }
    }
    return records;
  }

  private generatePredictions(): DemandPrediction[] {
    const predictions: DemandPrediction[] = [];
    const base = 85;

    for (let i = 1; i <= 30; i++) {
      const date = new Date('2026-04-22');
      date.setDate(date.getDate() + i);
      const dow = date.getDay();
      const weekMult = dow === 0 || dow === 6 ? 0.7 : (dow === 1 || dow === 2 ? 1.2 : 1.0);
      const trend = 1 + i * 0.003;
      const pred = Math.round(base * weekMult * trend);
      const margin = Math.round(pred * 0.18);

      predictions.push({
        productId: 'p01', productName: 'Leche Entera 1L',
        date: date.toISOString().split('T')[0],
        predictedValue: pred, lowerBound: pred - margin, upperBound: pred + margin,
        modelUsed: 'decision_tree'
      });
    }
    return predictions;
  }

  private generatePredVsActual(): PredictionVsActual[] {
    const points: PredictionVsActual[] = [];
    const weeks = ['Feb W1', 'Feb W2', 'Feb W3', 'Feb W4', 'Mar W1', 'Mar W2', 'Mar W3', 'Mar W4', 'Abr W1', 'Abr W2', 'Abr W3', 'Abr W4'];
    const basePred = [520, 535, 548, 560, 530, 545, 558, 572, 545, 558, 570, 582];
    const noise = [12, -8, 15, -5, 20, -12, 8, -18, 10, -6, 14, -9];

    for (let i = 0; i < 12; i++) {
      const date = new Date('2026-02-03');
      date.setDate(date.getDate() + i * 7);
      points.push({
        date: date.toISOString().split('T')[0],
        predicted: basePred[i], actual: basePred[i] + noise[i], label: weeks[i]
      });
    }
    return points;
  }
}
