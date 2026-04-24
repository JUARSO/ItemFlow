import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController, AlertController } from '@ionic/angular';
import { DataService } from '../../core/services/data.service';
import { Product } from '../../core/models';

@Component({
  standalone: false,
  selector: 'app-products', templateUrl: './products.page.html', styleUrls: ['./products.page.scss'] })
export class ProductsPage implements OnInit {
  products: Product[] = [];
  filtered: Product[] = [];
  searchText = '';
  selectedCategory = 'all';
  showForm = false;
  editingProduct: Product | null = null;
  categories: string[] = [];

  formData: Partial<Product> = { active: true };

  constructor(private data: DataService, private toastCtrl: ToastController, private alertCtrl: AlertController) {}

  ngOnInit() {
    this.products = this.data.products;
    this.categories = [...new Set(this.products.map(p => p.category))];
    this.applyFilters();
  }

  applyFilters() {
    let list = [...this.products];
    if (this.selectedCategory !== 'all') list = list.filter(p => p.category === this.selectedCategory);
    if (this.searchText) {
      const q = this.searchText.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    this.filtered = list;
  }

  openCreate() {
    this.editingProduct = null;
    this.formData = { category: 'Lácteos', unit: 'Unidad', active: true, leadTime: 5 };
    this.showForm = true;
  }

  openEdit(product: Product) {
    this.editingProduct = product;
    this.formData = { ...product };
    this.showForm = true;
  }

  async saveProduct() {
    if (!this.formData.sku || !this.formData.name || !this.formData.sellPrice) {
      const t = await this.toastCtrl.create({ message: 'Completa SKU, nombre y precio de venta', duration: 2000, color: 'warning', position: 'top' });
      await t.present(); return;
    }
    if (this.editingProduct) {
      Object.assign(this.editingProduct, this.formData);
    } else {
      const newP: Product = {
        id: 'p' + (this.data.products.length + 1).toString().padStart(2, '0'),
        sku: this.formData.sku!, name: this.formData.name!, category: this.formData.category || 'General',
        unit: this.formData.unit || 'Unidad', buyPrice: this.formData.buyPrice || 0,
        sellPrice: this.formData.sellPrice!, reorderPoint: this.formData.reorderPoint || 10,
        leadTime: this.formData.leadTime || 5, description: this.formData.description, active: true
      };
      this.data.products.push(newP);
    }
    this.showForm = false;
    this.ngOnInit();
    const t = await this.toastCtrl.create({ message: 'Producto guardado exitosamente', duration: 2000, color: 'success', position: 'top' });
    await t.present();
  }

  async deleteProduct(product: Product) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar producto',
      message: `¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar', role: 'destructive',
          handler: async () => {
            const idx = this.data.products.findIndex(p => p.id === product.id);
            if (idx !== -1) { this.data.products[idx].active = false; this.ngOnInit(); }
            const t = await this.toastCtrl.create({ message: 'Producto desactivado', duration: 2000, color: 'success', position: 'top' });
            await t.present();
          }
        }
      ]
    });
    await alert.present();
  }

  getCategoryColor(cat: string): string {
    const map: Record<string, string> = { 'Lácteos': '#2563EB', 'Granos y Cereales': '#D97706', 'Aceites y Grasas': '#059669' };
    return map[cat] || '#94A3B8';
  }
}
