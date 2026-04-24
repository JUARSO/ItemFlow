import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MenuController, ToastController } from '@ionic/angular';
import { DataService } from '../core/services/data.service';
import { Product } from '../core/models';

interface CatalogRow {
  id: string;
  sku: string;
  name: string;
  category: string;
  supplier: string;
  totalStock: number;
  minStock: number;
  maxStock: number;
  cost: number;
  status: 'available' | 'low' | 'critical' | 'out';
}

interface BulkRow {
  sku: string;
  nombre: string;
  categoria: string;
  unidad: string;
  proveedor: string;
  stockActual: number;
  stockMin: number;
  stockMax: number;
  reorderPoint: number;
  safetyStock: number;
  leadTime: number;
  costo: number;
  valid: boolean;
  errors: string[];
}

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.page.html',
  styleUrls: ['./catalog.page.scss'],
  standalone: false
})
export class CatalogPage implements OnInit {
  rows: CatalogRow[] = [];
  filtered: CatalogRow[] = [];
  searchTerm = '';

  showModal = false;
  editMode = false;
  editingId: string | null = null;

  // ── Bulk upload ──
  showBulkModal = false;
  bulkStep: 1 | 2 = 1;
  bulkRows: BulkRow[] = [];
  isDragging = false;

  get validBulkRows()   { return this.bulkRows.filter(r => r.valid); }
  get invalidBulkRows() { return this.bulkRows.filter(r => !r.valid); }

  form: FormGroup;

  readonly categories = ['Lácteos', 'Granos y Cereales', 'Aceites y Grasas', 'Bebidas', 'Carnes', 'Verduras', 'Otro'];
  readonly units = ['Litro', 'Kilogramo', 'Unidad', 'Caja', 'Paquete', 'Docena'];
  readonly suppliers = ['Proveedor Alpha', 'Distribuidora Beta', 'Importadora Gamma', 'Suministros Delta', 'Comercial Epsilon'];

  currentPage = 1;
  readonly pageSize = 8;

  get paginated() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }
  get totalPages() { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get showingFrom() { return this.filtered.length ? (this.currentPage - 1) * this.pageSize + 1 : 0; }
  get showingTo() { return Math.min(this.currentPage * this.pageSize, this.filtered.length); }

  get totalProducts() { return this.rows.length; }
  get uniqueCategories() { return new Set(this.rows.map(r => r.category)).size; }
  get lowStockCount() { return this.rows.filter(r => r.status !== 'available').length; }
  get totalInventoryValue() {
    return this.data.stockItems.reduce((sum, s) => {
      const p = this.data.products.find(pr => pr.id === s.productId);
      return sum + (p ? s.quantity * p.buyPrice : 0);
    }, 0);
  }

  constructor(
    private data: DataService,
    private fb: FormBuilder,
    private menuCtrl: MenuController,
    private toastCtrl: ToastController
  ) {
    this.form = this.fb.group({
      sku: [''], name: [''], category: [''], unit: [''], supplier: [''],
      stockActual: [0], minStock: [0], maxStock: [0],
      reorderPoint: [0], safetyStock: [0], leadTime: [0], cost: [0]
    });
  }

  ngOnInit() { this.buildRows(); }

  buildRows() {
    this.rows = this.data.products
      .filter(p => p.active)
      .map(p => {
        const stocks = this.data.stockItems.filter(s => s.productId === p.id);
        const primary = stocks.find(s => s.warehouseId === 'w1') || stocks[0];
        const totalStock = stocks.reduce((sum, s) => sum + s.quantity, 0);
        const statuses = stocks.map(s => s.status);
        const status: CatalogRow['status'] =
          statuses.includes('out') ? 'out' :
          statuses.includes('critical') ? 'critical' :
          statuses.includes('low') ? 'low' : 'available';

        return {
          id: p.id, sku: p.sku, name: p.name, category: p.category,
          supplier: p.supplier || '—', totalStock,
          minStock: primary?.minStock || 0,
          maxStock: primary?.maxStock || 0,
          cost: p.buyPrice, status
        };
      });
    this.applyFilter();
  }

  applyFilter() {
    const term = this.searchTerm.toLowerCase().trim();
    this.filtered = term
      ? this.rows.filter(r =>
          r.name.toLowerCase().includes(term) ||
          r.sku.toLowerCase().includes(term) ||
          r.category.toLowerCase().includes(term) ||
          r.supplier.toLowerCase().includes(term)
        )
      : [...this.rows];
    this.currentPage = 1;
  }

  openMenu() { this.menuCtrl.open('main-menu'); }

  openAddModal() {
    this.editMode = false;
    this.editingId = null;
    this.form.reset({ stockActual: 0, minStock: 0, maxStock: 0, reorderPoint: 0, safetyStock: 0, leadTime: 0, cost: 0 });
    this.showModal = true;
  }

  openEditModal(row: CatalogRow) {
    this.editMode = true;
    this.editingId = row.id;
    const p = this.data.products.find(pr => pr.id === row.id)!;
    const stocks = this.data.stockItems.filter(s => s.productId === row.id);
    const primary = stocks.find(s => s.warehouseId === 'w1') || stocks[0];
    this.form.patchValue({
      sku: p.sku, name: p.name, category: p.category, unit: p.unit,
      supplier: p.supplier || '',
      stockActual: primary?.quantity || 0,
      minStock: primary?.minStock || 0, maxStock: primary?.maxStock || 0,
      reorderPoint: p.reorderPoint,
      safetyStock: Math.round(p.reorderPoint * 0.7),
      leadTime: p.leadTime, cost: p.buyPrice
    });
    this.showModal = true;
  }

  closeModal() { this.showModal = false; }

  async saveProduct() {
    const v = this.form.value;

    if (this.editMode && this.editingId) {
      const p = this.data.products.find(pr => pr.id === this.editingId)!;
      if (v.sku) p.sku = v.sku;
      if (v.name) p.name = v.name;
      if (v.category) p.category = v.category;
      if (v.unit) p.unit = v.unit;
      p.supplier = v.supplier;
      p.reorderPoint = +v.reorderPoint;
      p.leadTime = +v.leadTime;
      p.buyPrice = +v.cost;
      this.data.stockItems.filter(s => s.productId === this.editingId).forEach(s => {
        s.minStock = +v.minStock;
        s.maxStock = +v.maxStock;
      });
    } else {
      const newId = `p${String(this.data.products.length + 1).padStart(2, '0')}`;
      const newProduct: Product = {
        id: newId,
        sku: v.sku || `SKU-${newId}`,
        name: v.name || 'Nuevo Producto',
        category: v.category || 'Otro',
        unit: v.unit || 'Unidad',
        buyPrice: +v.cost || 0,
        sellPrice: Math.round(+v.cost * 1.3) || 0,
        reorderPoint: +v.reorderPoint || 0,
        leadTime: +v.leadTime || 0,
        active: true,
        supplier: v.supplier
      };
      this.data.products.push(newProduct);
      this.data.warehouses.forEach(w => {
        const qty = w.id === 'w1' ? +v.stockActual : 0;
        const min = +v.minStock || 0;
        this.data.stockItems.push({
          productId: newId, warehouseId: w.id, quantity: qty,
          status: qty === 0 ? 'out' : qty < min ? 'critical' : 'available',
          minStock: min, maxStock: +v.maxStock || 0,
          lastUpdated: new Date().toISOString()
        });
      });
    }

    this.buildRows();
    this.showModal = false;
    const toast = await this.toastCtrl.create({
      message: this.editMode ? 'Producto actualizado' : 'Producto creado exitosamente',
      duration: 2500, color: 'success', position: 'top'
    });
    await toast.present();
  }

  async deleteProduct(row: CatalogRow) {
    const p = this.data.products.find(pr => pr.id === row.id);
    if (p) {
      p.active = false;
      this.buildRows();
      const toast = await this.toastCtrl.create({
        message: 'Producto eliminado', duration: 2000, color: 'medium', position: 'top'
      });
      await toast.present();
    }
  }

  formatCurrency(value: number): string {
    return `₡${Math.round(value).toLocaleString('es-CR')}`;
  }

  // ── Bulk upload ──────────────────────────────────────────────────────────

  openBulkModal() {
    this.showBulkModal = true;
    this.bulkStep = 1;
    this.bulkRows = [];
  }

  closeBulkModal() {
    this.showBulkModal = false;
    this.bulkStep = 1;
    this.bulkRows = [];
    this.isDragging = false;
  }

  downloadTemplate() {
    const lines = [
      'sku,nombre,categoria,unidad,proveedor,stock_actual,stock_minimo,stock_maximo,reorder_point,safety_stock,lead_time,costo',
      'LAC-005,Leche Descremada 1L,Lácteos,Litro,Distribuidora Beta,100,50,300,50,35,3,380',
      'GRA-005,Quinoa 500g,Granos y Cereales,Kilogramo,Importadora Gamma,60,20,200,25,15,5,950',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_productos_itemflow.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) this.parseFile(input.files[0]);
    input.value = '';
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    const file = event.dataTransfer?.files[0];
    if (file) this.parseFile(file);
  }

  private parseFile(file: File) {
    if (!file.name.match(/\.(csv|txt)$/i)) {
      this.toastCtrl.create({ message: 'Solo se aceptan archivos .csv', duration: 2500, color: 'warning', position: 'top' }).then(t => t.present());
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      this.processCsvText(e.target?.result as string);
      this.bulkStep = 2;
    };
    reader.readAsText(file, 'UTF-8');
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim()); current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  }

  private processCsvText(text: string) {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) { this.bulkRows = []; return; }

    const headers = this.parseCsvLine(lines[0]).map(h =>
      h.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim().replace(/\s+/g, '_')
    );

    const col = (...names: string[]) => {
      for (const n of names) {
        const idx = headers.indexOf(n);
        if (idx >= 0) return idx;
      }
      return -1;
    };

    const iSku      = col('sku', 'codigo', 'code');
    const iNombre   = col('nombre', 'name', 'producto', 'product');
    const iCat      = col('categoria', 'category');
    const iUnidad   = col('unidad', 'unit', 'unidad_de_medida');
    const iProv     = col('proveedor', 'supplier', 'proveedor_principal');
    const iStkAct   = col('stock_actual', 'stock', 'cantidad', 'quantity');
    const iStkMin   = col('stock_minimo', 'stock_min', 'minimo', 'min_stock');
    const iStkMax   = col('stock_maximo', 'stock_max', 'maximo', 'max_stock');
    const iReorder  = col('reorder_point', 'reorder', 'punto_reorden');
    const iSafety   = col('safety_stock', 'safety', 'stock_seguridad');
    const iLead     = col('lead_time', 'lead', 'tiempo_entrega');
    const iCosto    = col('costo', 'cost', 'precio_compra', 'price');

    this.bulkRows = lines.slice(1)
      .map(line => {
        const c = this.parseCsvLine(line);
        const get    = (i: number) => i >= 0 && c[i] !== undefined ? c[i] : '';
        const getNum = (i: number) => { const v = parseFloat(get(i)); return isNaN(v) ? 0 : Math.max(0, v); };

        const sku          = get(iSku);
        const nombre       = get(iNombre);
        const categoria    = get(iCat);
        const unidad       = get(iUnidad);
        const proveedor    = get(iProv);
        const stockActual  = getNum(iStkAct);
        const stockMin     = getNum(iStkMin);
        const stockMax     = getNum(iStkMax);
        const reorderPoint = getNum(iReorder);
        const safetyStock  = getNum(iSafety);
        const leadTime     = getNum(iLead);
        const costo        = getNum(iCosto);

        const errors: string[] = [];
        if (!nombre)                              errors.push('Nombre requerido');
        if (stockMax > 0 && stockMin > stockMax)  errors.push('Stock mín > máx');

        return { sku, nombre, categoria, unidad, proveedor, stockActual, stockMin, stockMax, reorderPoint, safetyStock, leadTime, costo, valid: errors.length === 0, errors };
      })
      .filter(r => r.nombre || r.sku);
  }

  async importBulk() {
    const rows = this.validBulkRows;
    rows.forEach(row => {
      const newId = `p${String(this.data.products.length + 1).padStart(2, '0')}`;
      const newProduct: Product = {
        id: newId,
        sku: row.sku || `SKU-${newId}`,
        name: row.nombre,
        category: row.categoria || 'Otro',
        unit: row.unidad || 'Unidad',
        buyPrice: row.costo,
        sellPrice: Math.round(row.costo * 1.3),
        reorderPoint: row.reorderPoint,
        leadTime: row.leadTime,
        active: true,
        supplier: row.proveedor
      };
      this.data.products.push(newProduct);
      this.data.warehouses.forEach(w => {
        const qty = w.id === 'w1' ? row.stockActual : 0;
        this.data.stockItems.push({
          productId: newId, warehouseId: w.id, quantity: qty,
          status: qty === 0 ? 'out' : qty < row.stockMin ? 'critical' : 'available',
          minStock: row.stockMin, maxStock: row.stockMax,
          lastUpdated: new Date().toISOString()
        });
      });
    });

    this.buildRows();
    this.closeBulkModal();
    const toast = await this.toastCtrl.create({
      message: `✓ ${rows.length} producto${rows.length !== 1 ? 's' : ''} importado${rows.length !== 1 ? 's' : ''} exitosamente`,
      duration: 3000, color: 'success', position: 'top'
    });
    await toast.present();
  }

  getCategoryClass(category: string): string {
    const map: Record<string, string> = {
      'Lácteos':          'cat-teal',
      'Granos y Cereales':'cat-amber',
      'Aceites y Grasas': 'cat-emerald',
      'Bebidas':          'cat-violet',
      'Carnes':           'cat-rose',
      'Verduras':         'cat-green',
    };
    return map[category] || 'cat-default';
  }
}
