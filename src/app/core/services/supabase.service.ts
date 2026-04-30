import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// ── Tipos que reflejan exactamente las tablas de la BD ────────────────────
export interface DbProduct {
  id: number;
  tenant_id: number;
  sku: string;
  name: string;
  category: string | null;
  unit: string | null;
  buy_price: number | null;
  sell_price: number | null;
  reorder_point: number;
  lead_time: number;
  description: string | null;
  supplier: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbWarehouse {
  id: number;
  tenant_id: number;
  name: string;
  location: string | null;
  active: boolean;
}

export interface DbStockItem {
  id: number;
  tenant_id: number;
  product_id: number;
  warehouse_id: number;
  quantity: number;
  min_stock: number;
  max_stock: number;
  status: 'available' | 'low' | 'critical' | 'out';
  last_updated: string;
  product?: Partial<DbProduct>;
  warehouse?: Partial<DbWarehouse>;
}

export interface DbKardexEntry {
  id: number;
  tenant_id: number;
  product_id: number;
  warehouse_id: number;
  account_id: number | null;
  purchase_order_id: number | null;
  type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  balance: number;
  reason: string | null;
  cost: number | null;
  date: string;
}

export interface DbPurchaseOrder {
  id: number;
  tenant_id: number;
  product_id: number;
  warehouse_id: number;
  quantity: number;
  status: 'pending' | 'received' | 'cancelled';
  expected_date: string | null;
  received_date: string | null;
  unit_cost: number | null;
  notes: string | null;
  created_at: string;
  product?: Partial<DbProduct>;
}

export interface DbAlert {
  id: number;
  tenant_id: number;
  product_id: number;
  warehouse_id: number;
  type: 'restock' | 'excess' | 'stockout_risk';
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'acknowledged' | 'resolved';
  title: string | null;
  message: string | null;
  current_stock: number | null;
  threshold: number | null;
  projected_stockout_date: string | null;
  projected_days_until_stockout: number | null;
  excess_value: number | null;
  created_at: string;
  updated_at: string;
  product?: Partial<DbProduct>;
  warehouse?: Partial<DbWarehouse>;
}

// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class SupabaseService {

  private sb: SupabaseClient;

  constructor() {
    this.sb = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey
    );
  }

  // Expone el cliente crudo por si un servicio necesita queries avanzadas
  get client(): SupabaseClient { return this.sb; }

  // ── Convierte el builder de Supabase (PromiseLike) a Observable ──────────
  // Supabase retorna PostgrestBuilder que implementa PromiseLike, no Promise,
  // por eso se llama .then() primero para obtener una Promise real.
  private query<T>(q: PromiseLike<{ data: T | null; error: any }>): Observable<T> {
    return from(
      q.then(({ data, error }) => {
        if (error) throw new Error(error.message);
        return data as T;
      })
    );
  }

  // ════════════════════════════════════════════════════════════════
  // PRODUCTS
  // ════════════════════════════════════════════════════════════════

  getProducts(tenantId: number): Observable<DbProduct[]> {
    return this.query(
      this.sb
        .from('products')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('active', true)
        .order('name')
    );
  }

  addProduct(product: Omit<DbProduct, 'id' | 'created_at' | 'updated_at'>): Observable<DbProduct> {
    return this.query(
      this.sb.from('products').insert(product).select().single()
    );
  }

  updateProduct(id: number, changes: Partial<DbProduct>): Observable<DbProduct> {
    return this.query(
      this.sb
        .from('products')
        .update({ ...changes, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
    );
  }

  // ════════════════════════════════════════════════════════════════
  // WAREHOUSES
  // ════════════════════════════════════════════════════════════════

  getWarehouses(tenantId: number): Observable<DbWarehouse[]> {
    return this.query(
      this.sb
        .from('warehouses')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('active', true)
    );
  }

  // ════════════════════════════════════════════════════════════════
  // STOCK ITEMS  (tabla puente N:N products ↔ warehouses)
  // ════════════════════════════════════════════════════════════════

  getStockItems(tenantId: number, warehouseId?: number): Observable<DbStockItem[]> {
    let q = this.sb
      .from('stock_items')
      .select(`
        *,
        product:products(id, sku, name, category, unit, reorder_point, supplier),
        warehouse:warehouses(id, name)
      `)
      .eq('tenant_id', tenantId);

    if (warehouseId) q = q.eq('warehouse_id', warehouseId);

    return this.query(q);
  }

  updateStockQuantity(
    tenantId: number,
    productId: number,
    warehouseId: number,
    quantity: number,
    status: DbStockItem['status']
  ): Observable<DbStockItem> {
    return this.query(
      this.sb
        .from('stock_items')
        .update({ quantity, status, last_updated: new Date().toISOString() })
        .eq('tenant_id', tenantId)
        .eq('product_id', productId)
        .eq('warehouse_id', warehouseId)
        .select()
        .single()
    );
  }

  // ════════════════════════════════════════════════════════════════
  // KARDEX ENTRIES
  // ════════════════════════════════════════════════════════════════

  getKardex(tenantId: number, productId?: number, warehouseId?: number): Observable<DbKardexEntry[]> {
    let q = this.sb
      .from('kardex_entries')
      .select(`
        *,
        product:products(id, sku, name),
        warehouse:warehouses(id, name)
      `)
      .eq('tenant_id', tenantId)
      .neq('type', 'transfer')     // los transfers no se muestran en el kardex UI
      .order('date', { ascending: false })
      .limit(200);

    if (productId)   q = q.eq('product_id', productId);
    if (warehouseId) q = q.eq('warehouse_id', warehouseId);

    return this.query(q);
  }

  addKardexEntry(
    entry: Omit<DbKardexEntry, 'id'>
  ): Observable<DbKardexEntry> {
    return this.query(
      this.sb.from('kardex_entries').insert(entry).select().single()
    );
  }

  // ════════════════════════════════════════════════════════════════
  // PURCHASE ORDERS
  // ════════════════════════════════════════════════════════════════

  getPurchaseOrders(tenantId: number, status?: string): Observable<DbPurchaseOrder[]> {
    let q = this.sb
      .from('purchase_orders')
      .select(`*, product:products(id, sku, name, supplier)`)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (status) q = q.eq('status', status);

    return this.query(q);
  }

  // Historial: solo órdenes ya recibidas
  getPurchaseHistory(tenantId: number): Observable<DbPurchaseOrder[]> {
    return this.query(
      this.sb
        .from('purchase_orders')
        .select(`*, product:products(id, sku, name, category, supplier)`)
        .eq('tenant_id', tenantId)
        .eq('status', 'received')
        .order('received_date', { ascending: false })
    );
  }

  receivePurchaseOrder(orderId: number): Observable<DbPurchaseOrder> {
    return this.query(
      this.sb
        .from('purchase_orders')
        .update({
          status: 'received',
          received_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single()
    );
  }

  // ════════════════════════════════════════════════════════════════
  // ALERTS
  // ════════════════════════════════════════════════════════════════

  getAlerts(tenantId: number): Observable<DbAlert[]> {
    return this.query(
      this.sb
        .from('alerts')
        .select(`
          *,
          product:products(id, sku, name),
          warehouse:warehouses(id, name)
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
    );
  }

  updateAlertStatus(
    alertId: number,
    status: 'acknowledged' | 'resolved',
    accountId?: number
  ): Observable<boolean> {
    const now = new Date().toISOString();
    const patch: Record<string, any> = { status, updated_at: now };

    if (status === 'acknowledged') {
      patch['acknowledged_by'] = accountId ?? null;
      patch['acknowledged_at'] = now;
    }
    if (status === 'resolved') {
      patch['resolved_by'] = accountId ?? null;
      patch['resolved_at'] = now;
    }

    return from(
      this.sb.from('alerts').update(patch).eq('id', alertId)
    ).pipe(map(({ error }) => {
      if (error) throw new Error(error.message);
      return true;
    }));
  }

  // ════════════════════════════════════════════════════════════════
  // SALE RECORDS  (para predicciones)
  // ════════════════════════════════════════════════════════════════

  getSaleRecords(tenantId: number, productId?: number): Observable<any[]> {
    let q = this.sb
      .from('sale_records')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('sale_date', { ascending: false });

    if (productId) q = q.eq('product_id', productId);

    return this.query(q);
  }

  // ════════════════════════════════════════════════════════════════
  // ABC CLASSIFICATIONS
  // ════════════════════════════════════════════════════════════════

  getABCClassification(tenantId: number, periodDays: number): Observable<any[]> {
    return this.query(
      this.sb
        .from('abc_classifications')
        .select(`*, product:products(id, sku, name)`)
        .eq('tenant_id', tenantId)
        .eq('period_days', periodDays)
        .order('accumulated_percent')
    );
  }
}
