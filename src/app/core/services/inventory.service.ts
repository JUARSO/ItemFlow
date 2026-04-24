import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DataService } from './data.service';
import { StockItem, KardexEntry, ABCItem, Warehouse, StockStatus, Product } from '../models';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  constructor(private data: DataService) {}

  getStockItems(warehouseId?: string): Observable<(StockItem & { product: Product })[]> {
    let items = this.data.stockItems;
    if (warehouseId) items = items.filter(s => s.warehouseId === warehouseId);

    const enriched = items.map(s => ({
      ...s,
      product: this.data.products.find(p => p.id === s.productId)!
    })).filter(s => s.product);

    return of(enriched).pipe(delay(300));
  }

  getStockByStatus(status: StockStatus): Observable<(StockItem & { product: Product })[]> {
    const enriched = this.data.stockItems
      .filter(s => s.status === status)
      .map(s => ({ ...s, product: this.data.products.find(p => p.id === s.productId)! }))
      .filter(s => s.product);
    return of(enriched).pipe(delay(200));
  }

  getKardex(productId?: string, warehouseId?: string): Observable<KardexEntry[]> {
    let entries = [...this.data.kardexEntries].sort((a, b) => b.date.localeCompare(a.date));
    if (productId) entries = entries.filter(e => e.productId === productId);
    if (warehouseId) entries = entries.filter(e => e.warehouseId === warehouseId);
    return of(entries).pipe(delay(300));
  }

  getABCClassification(): Observable<ABCItem[]> {
    return of(this.data.abcItems).pipe(delay(400));
  }

  getWarehouses(): Observable<Warehouse[]> {
    return of(this.data.warehouses.filter(w => w.active)).pipe(delay(200));
  }

  getWarehouseStock(warehouseId: string): Observable<(StockItem & { product: Product })[]> {
    return this.getStockItems(warehouseId);
  }

  addStockEntry(entry: Partial<KardexEntry>): Observable<KardexEntry> {
    const newEntry: KardexEntry = {
      id: `k${String(this.data.kardexEntries.length + 1).padStart(3, '0')}`,
      productId: entry.productId!,
      warehouseId: entry.warehouseId!,
      type: entry.type!,
      quantity: entry.quantity!,
      balance: entry.balance || 0,
      userId: entry.userId || 'u1',
      userName: entry.userName || 'Sistema',
      reason: entry.reason || '',
      date: new Date().toISOString(),
      cost: entry.cost
    };
    this.data.kardexEntries.unshift(newEntry);

    // Update stock
    const stock = this.data.stockItems.find(
      s => s.productId === entry.productId && s.warehouseId === entry.warehouseId
    );
    if (stock) {
      if (entry.type === 'in') stock.quantity += entry.quantity!;
      else if (entry.type === 'out' || entry.type === 'adjustment') stock.quantity = Math.max(0, stock.quantity - entry.quantity!);
      stock.status = this.computeStatus(stock);
      stock.lastUpdated = new Date().toISOString();
      newEntry.balance = stock.quantity;
    }

    return of(newEntry).pipe(delay(600));
  }

  transferStock(fromWarehouseId: string, toWarehouseId: string, productId: string, quantity: number): Observable<boolean> {
    const from = this.data.stockItems.find(s => s.productId === productId && s.warehouseId === fromWarehouseId);
    const to = this.data.stockItems.find(s => s.productId === productId && s.warehouseId === toWarehouseId);

    if (!from || from.quantity < quantity) return of(false).pipe(delay(400));

    from.quantity -= quantity;
    from.status = this.computeStatus(from);
    from.lastUpdated = new Date().toISOString();

    if (to) {
      to.quantity += quantity;
      to.status = this.computeStatus(to);
      to.lastUpdated = new Date().toISOString();
    }
    return of(true).pipe(delay(700));
  }

  private computeStatus(stock: StockItem): StockStatus {
    if (stock.quantity === 0) return 'out';
    if (stock.quantity < stock.minStock * 0.5) return 'critical';
    if (stock.quantity < stock.minStock) return 'low';
    return 'available';
  }

  getStockSummary(): { available: number; low: number; critical: number; out: number } {
    const unique = new Map<string, StockStatus>();
    for (const s of this.data.stockItems) {
      const key = s.productId;
      const current = unique.get(key);
      const severity = { out: 0, critical: 1, low: 2, available: 3 } as Record<StockStatus, number>;
      if (!current || severity[s.status] < severity[current]) unique.set(key, s.status);
    }
    const vals = Array.from(unique.values());
    return {
      available: vals.filter(v => v === 'available').length,
      low: vals.filter(v => v === 'low').length,
      critical: vals.filter(v => v === 'critical').length,
      out: vals.filter(v => v === 'out').length
    };
  }
}
