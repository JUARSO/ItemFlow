import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { InventoryService } from '../../core/services/inventory.service';
import { DataService } from '../../core/services/data.service';
import { KardexEntry, Product } from '../../core/models';

@Component({
  standalone: false,
  selector: 'app-kardex',
  templateUrl: './kardex.page.html',
  styleUrls: ['./kardex.page.scss']
})
export class KardexPage implements OnInit {
  entries: KardexEntry[] = [];
  products: Product[] = [];
  selectedProduct = 'all';
  selectedType = 'all';
  loading = true;

  showModal = false;
  saving = false;
  form: FormGroup;

  constructor(
    private inventoryService: InventoryService,
    private data: DataService,
    private toastCtrl: ToastController,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      productId: ['', Validators.required],
      type:      ['in', Validators.required],
      quantity:  [1, [Validators.required, Validators.min(1)]],
      cost:      [null],
      reason:    ['', Validators.required]
    });
  }

  ngOnInit() {
    this.products = this.data.products.filter(p => p.active);
    this.loadKardex();
  }

  loadKardex() {
    this.loading = true;
    const pid = this.selectedProduct !== 'all' ? this.selectedProduct : undefined;
    this.inventoryService.getKardex(pid).subscribe(entries => {
      const noTransfers = entries.filter(e => e.type !== 'transfer');
      this.entries = this.selectedType !== 'all'
        ? noTransfers.filter(e => e.type === this.selectedType)
        : noTransfers;
      this.loading = false;
    });
  }

  openAddModal() {
    this.form.reset({ type: 'in', quantity: 1, cost: null, reason: '' });
    this.showModal = true;
  }

  closeModal() { this.showModal = false; }

  async saveMovement() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const v = this.form.value;

    this.inventoryService.addStockEntry({
      productId:   v.productId,
      warehouseId: 'w1',
      type:        v.type,
      quantity:    +v.quantity,
      cost:        v.cost ? +v.cost : undefined,
      reason:      v.reason,
      userId:      'u1',
      userName:    'Carlos Rodríguez'
    }).subscribe(async () => {
      this.saving = false;
      this.showModal = false;
      this.loadKardex();
      const toast = await this.toastCtrl.create({
        message: 'Movimiento registrado correctamente',
        duration: 2500, color: 'success', position: 'top'
      });
      await toast.present();
    });
  }

  getTypeLabel(type: string) {
    return { in: 'Entrada', out: 'Salida', adjustment: 'Ajuste' }[type] || type;
  }
  getTypeIcon(type: string) {
    return { in: 'arrow-down-circle-outline', out: 'arrow-up-circle-outline', adjustment: 'create-outline' }[type] || 'ellipse-outline';
  }
  getProductName(id: string) { return this.products.find(p => p.id === id)?.name || id; }
  getProductSku(id: string)  { return this.products.find(p => p.id === id)?.sku || id; }

  get showCost() { return this.form.get('type')?.value === 'in'; }
}
