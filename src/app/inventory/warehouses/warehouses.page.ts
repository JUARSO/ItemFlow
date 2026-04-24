import { Component, OnInit } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';
import { InventoryService } from '../../core/services/inventory.service';
import { DataService } from '../../core/services/data.service';
import { Warehouse, StockItem, Product } from '../../core/models';

@Component({
  standalone: false,
  selector: 'app-warehouses', templateUrl: './warehouses.page.html', styleUrls: ['./warehouses.page.scss'] })
export class WarehousesPage implements OnInit {
  warehouses: Warehouse[] = [];
  stockByWarehouse: Record<string, (StockItem & { product: Product })[]> = {};
  selectedWarehouse: string | null = null;
  loading = true;
  showTransferForm = false;
  transfer = { fromWarehouseId: '', toWarehouseId: '', productId: '', quantity: 0 };
  products: Product[] = [];

  constructor(private inventoryService: InventoryService, private data: DataService,
    private toastCtrl: ToastController, private alertCtrl: AlertController) {}

  ngOnInit() {
    this.products = this.data.products;
    this.inventoryService.getWarehouses().subscribe(ws => {
      this.warehouses = ws;
      ws.forEach(w => {
        this.inventoryService.getWarehouseStock(w.id).subscribe(items => {
          this.stockByWarehouse[w.id] = items;
        });
      });
      this.loading = false;
    });
  }

  selectWarehouse(id: string) { this.selectedWarehouse = this.selectedWarehouse === id ? null : id; }
  getWarehouseItems(id: string) { return this.stockByWarehouse[id] || []; }

  getTotalValue(id: string): number {
    return (this.stockByWarehouse[id] || []).reduce((sum, i) => sum + i.quantity * i.product.buyPrice, 0);
  }

  getStatusCount(id: string, status: string): number {
    return (this.stockByWarehouse[id] || []).filter(i => i.status === status).length;
  }

  async doTransfer() {
    const { fromWarehouseId, toWarehouseId, productId, quantity } = this.transfer;
    if (!fromWarehouseId || !toWarehouseId || !productId || !quantity) {
      const toast = await this.toastCtrl.create({ message: 'Completa todos los campos', duration: 2000, color: 'warning', position: 'top' });
      await toast.present(); return;
    }
    if (fromWarehouseId === toWarehouseId) {
      const toast = await this.toastCtrl.create({ message: 'Las bodegas deben ser diferentes', duration: 2000, color: 'danger', position: 'top' });
      await toast.present(); return;
    }
    this.inventoryService.transferStock(fromWarehouseId, toWarehouseId, productId, quantity).subscribe(async ok => {
      const toast = await this.toastCtrl.create({
        message: ok ? 'Transferencia realizada exitosamente' : 'Stock insuficiente para la transferencia',
        duration: 2500, color: ok ? 'success' : 'danger', position: 'top'
      });
      await toast.present();
      if (ok) { this.showTransferForm = false; this.ngOnInit(); }
    });
  }

  formatCurrency(val: number): string {
    if (val >= 1000000) return '₡' + (val / 1000000).toFixed(1) + 'M';
    return '₡' + (val / 1000).toFixed(0) + 'K';
  }
}
