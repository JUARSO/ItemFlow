import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { DataService } from '../core/services/data.service';

interface InventoryRow {
  productId: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  totalStock: number;
  reorderPoint: number;
  inTransit: number;
  purchaseStatus: 'ok' | 'in_transit' | 'needed';
  quantityToOrder: number;
  expectedDate: string;
}

@Component({
  standalone: false,
  selector: 'app-inventory',
  templateUrl: './inventory.page.html',
  styleUrls: ['./inventory.page.scss']
})
export class InventoryPage implements OnInit {
  rows: InventoryRow[] = [];
  filtered: InventoryRow[] = [];
  searchTerm = '';
  statusFilter = 'all';

  get totalProducts()     { return this.rows.length; }
  get needsPurchaseCount(){ return this.rows.filter(r => r.purchaseStatus === 'needed').length; }
  get unitsToOrder()      { return this.rows.reduce((s, r) => s + r.quantityToOrder, 0); }
  get inTransitCount()    { return this.rows.filter(r => r.inTransit > 0).length; }
  get inTransitUnits()    { return this.rows.reduce((s, r) => s + r.inTransit, 0); }

  constructor(
    private data: DataService,
    private router: Router,
    private menuCtrl: MenuController
  ) {}

  ngOnInit() { this.buildRows(); }

  buildRows() {
    this.rows = this.data.products.filter(p => p.active).map(p => {
      const totalStock = this.data.stockItems
        .filter(s => s.productId === p.id)
        .reduce((sum, s) => sum + s.quantity, 0);

      const pendingOrders = this.data.purchaseOrders.filter(
        po => po.productId === p.id && po.status === 'pending'
      );
      const inTransit = pendingOrders.reduce((sum, po) => sum + po.quantity, 0);
      const expectedDate = pendingOrders.length ? pendingOrders[0].expectedDate : '';

      const isLow = totalStock < p.reorderPoint;
      let purchaseStatus: InventoryRow['purchaseStatus'] = 'ok';
      let quantityToOrder = 0;

      if (inTransit > 0) {
        purchaseStatus = 'in_transit';
      } else if (isLow) {
        purchaseStatus = 'needed';
        quantityToOrder = p.reorderPoint - totalStock;
      }

      return { productId: p.id, sku: p.sku, name: p.name, category: p.category, unit: p.unit, totalStock, reorderPoint: p.reorderPoint, inTransit, purchaseStatus, quantityToOrder, expectedDate };
    });
    this.applyFilter();
  }

  applyFilter() {
    let items = [...this.rows];
    if (this.searchTerm) {
      const q = this.searchTerm.toLowerCase();
      items = items.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.sku.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
      );
    }
    if (this.statusFilter === 'needed')     items = items.filter(r => r.purchaseStatus === 'needed');
    else if (this.statusFilter === 'transit') items = items.filter(r => r.purchaseStatus === 'in_transit');
    else if (this.statusFilter === 'ok')    items = items.filter(r => r.purchaseStatus === 'ok');
    this.filtered = items;
  }

  openMenu() { this.menuCtrl.open('main-menu'); }
  goToKardex() { this.router.navigate(['/tabs/inventory/kardex']); }
  goToABC()    { this.router.navigate(['/tabs/inventory/abc']); }

  formatDate(d: string) {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('es-CR', { day: '2-digit', month: 'short' });
  }

  getCategoryClass(cat: string): string {
    const map: Record<string, string> = {
      'Lácteos':           'cat-teal',
      'Granos y Cereales': 'cat-amber',
      'Aceites y Grasas':  'cat-emerald',
      'Bebidas':           'cat-violet',
      'Carnes':            'cat-rose',
      'Verduras':          'cat-green',
    };
    return map[cat] || 'cat-default';
  }
}
