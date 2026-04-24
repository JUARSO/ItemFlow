import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { DataService } from '../../core/services/data.service';
import { Product } from '../../core/models';

interface ProjectionDay {
  dayIndex: number;
  date: Date;
  demand: number;
  incoming: number;
  stock: number;
  status: 'safe' | 'low' | 'critical' | 'stockout';
}

@Component({
  standalone: false,
  selector: 'app-projection',
  templateUrl: './projection.page.html',
  styleUrls: ['./projection.page.scss']
})
export class ProjectionPage implements OnInit {
  readonly today = new Date(2026, 3, 23);
  readonly MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                     'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  // ── SVG constants ────────────────────────────────────────────────────────────
  readonly SW = 320;
  readonly SH = 162;
  readonly SX = 38;
  readonly SY1 = 8;
  readonly SY2 = 138;
  get CW(): number { return this.SW - this.SX - 8; }
  get CH(): number { return this.SY2 - this.SY1; }

  // ── State ────────────────────────────────────────────────────────────────────
  selectedProductId = 'p01';
  selectedModel: 'decision_tree' | 'linear_regression' = 'decision_tree';
  horizon = 30;

  projection: ProjectionDay[] = [];
  initialStock = 0;

  // ── Chart data ───────────────────────────────────────────────────────────────
  chartMax = 200;
  stockLinePath = '';
  stockAreaPath = '';
  reorderLineY = 100;
  yLabels: Array<{ value: number; y: number }> = [];
  xLabels: Array<{ label: string; x: number }> = [];
  breachPoint: { cx: number; cy: number } | null = null;
  stockoutPoint: { cx: number; cy: number } | null = null;
  incomingLines: Array<{ x: number; label: string }> = [];

  constructor(public data: DataService, private menu: MenuController) {}

  openMenu() { this.menu.open(); }

  ngOnInit() {
    this.autoSelectModel();
    this.rebuild();
  }

  onProductChange() {
    this.autoSelectModel();
    this.rebuild();
  }

  setModel(m: 'decision_tree' | 'linear_regression') {
    this.selectedModel = m;
    this.rebuild();
  }

  setHorizon(h: number) {
    this.horizon = h;
    this.rebuild();
  }

  private autoSelectModel() {
    const comp = this.data.modelComparisons.find(m => m.productId === this.selectedProductId);
    this.selectedModel = comp?.selectedModel ?? 'decision_tree';
  }

  private rebuild() {
    this.buildProjection();
    this.buildChart();
  }

  // ── Projection algorithm ─────────────────────────────────────────────────────

  private buildProjection() {
    const pid = this.selectedProductId;

    this.initialStock = this.data.stockItems
      .filter(s => s.productId === pid)
      .reduce((sum, s) => sum + s.quantity, 0);

    this.projection = [];
    let stock = this.initialStock;
    const product = this.selectedProduct;

    for (let i = 1; i <= this.horizon; i++) {
      const date = new Date(this.today);
      date.setDate(date.getDate() + i);

      const dateStr = date.toISOString().split('T')[0];
      const incoming = this.data.purchaseOrders
        .filter(po => po.productId === pid && po.status === 'pending' && po.expectedDate === dateStr)
        .reduce((sum, po) => sum + po.quantity, 0);

      stock += incoming;

      const demand = this.getDailyForecast(date);
      stock = Math.max(0, stock - demand);

      const reorder = product?.reorderPoint ?? 0;
      const safetyStock = reorder * 0.5;

      const status: ProjectionDay['status'] =
        stock === 0         ? 'stockout' :
        stock < safetyStock ? 'critical' :
        stock < reorder     ? 'low'      : 'safe';

      this.projection.push({ dayIndex: i, date, demand, incoming, stock, status });
    }
  }

  // Simulates the model's daily demand forecast using day-of-week + seasonal factors
  private getDailyForecast(date: Date): number {
    const base = this.data.getDailyDemand(this.selectedProductId);
    const dow = date.getDay();
    const month = date.getMonth();

    const weekMult = (dow === 0 || dow === 6) ? 0.65 : (dow === 1 || dow === 2) ? 1.25 : 1.0;
    const seasMult = (month === 11 || month === 0) ? 1.25 : (month === 3 || month === 4) ? 1.1 : 1.0;

    if (this.selectedModel === 'linear_regression') {
      const weekSmooth = 0.85 + (weekMult - 0.85) * 0.55;
      const trend = 1 + date.getDate() * 0.001;
      return Math.max(0, Math.round(base * weekSmooth * seasMult * trend));
    } else {
      return Math.max(0, Math.round(base * weekMult * seasMult));
    }
  }

  // ── SVG chart construction ───────────────────────────────────────────────────

  private dayToX(dayIdx: number): number {
    return this.SX + (dayIdx / this.horizon) * this.CW;
  }

  private stockToY(stock: number): number {
    return this.SY2 - (Math.min(stock, this.chartMax) / this.chartMax) * this.CH;
  }

  private buildChart() {
    const allStocks = [this.initialStock, ...this.projection.map(d => d.stock)];
    const rawMax = Math.max(...allStocks, 1);
    this.chartMax = Math.ceil(rawMax / 50) * 50;
    if (this.chartMax < 50) this.chartMax = 50;

    const pts = [
      { x: this.dayToX(0), y: this.stockToY(this.initialStock) },
      ...this.projection.map(d => ({ x: this.dayToX(d.dayIndex), y: this.stockToY(d.stock) }))
    ];

    const ptsStr = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ');
    this.stockLinePath = 'M ' + ptsStr;

    const lastX = pts[pts.length - 1].x.toFixed(1);
    const firstX = pts[0].x.toFixed(1);
    this.stockAreaPath = `M ${firstX},${this.SY2} L ` + ptsStr + ` L ${lastX},${this.SY2} Z`;

    const reorder = this.selectedProduct?.reorderPoint ?? 0;
    this.reorderLineY = this.stockToY(reorder);

    this.yLabels = [0, 1, 2, 3, 4].map(i => {
      const value = Math.round((i / 4) * this.chartMax);
      return { value, y: this.stockToY(value) };
    });

    const interval = this.horizon <= 14 ? 7 : this.horizon <= 30 ? 10 : 15;
    this.xLabels = [];
    for (let i = 0; i <= this.horizon; i += interval) {
      this.xLabels.push({ label: i === 0 ? 'Hoy' : `+${i}d`, x: this.dayToX(i) });
    }

    const breachDay = this.projection.find(d => d.status !== 'safe');
    this.breachPoint = breachDay
      ? { cx: this.dayToX(breachDay.dayIndex), cy: this.stockToY(breachDay.stock) }
      : null;

    const stockoutDay = this.projection.find(d => d.status === 'stockout');
    this.stockoutPoint = stockoutDay
      ? { cx: this.dayToX(stockoutDay.dayIndex), cy: this.SY2 }
      : null;

    this.incomingLines = this.projection
      .filter(d => d.incoming > 0)
      .map(d => ({ x: this.dayToX(d.dayIndex), label: `+${d.incoming}` }));
  }

  // ── Getters ──────────────────────────────────────────────────────────────────

  get selectedProduct(): Product | undefined {
    return this.data.products.find(p => p.id === this.selectedProductId);
  }

  get daysUntilBreach(): number {
    const d = this.projection.find(day => day.status !== 'safe');
    return d ? d.dayIndex : -1;
  }

  get daysUntilStockout(): number {
    const d = this.projection.find(day => day.status === 'stockout');
    return d ? d.dayIndex : -1;
  }

  get totalProjectedDemand(): number {
    return this.projection.reduce((sum, d) => sum + d.demand, 0);
  }

  get finalStock(): number {
    return this.projection.length > 0 ? this.projection[this.projection.length - 1].stock : 0;
  }

  get recommendedModel(): 'decision_tree' | 'linear_regression' {
    const comp = this.data.modelComparisons.find(m => m.productId === this.selectedProductId);
    return comp?.selectedModel ?? 'decision_tree';
  }

  getModelLabel(m: string): string {
    return m === 'decision_tree' ? 'Árbol de Decisión' : 'Regresión Lineal';
  }

  getStatusClass(s: string): string {
    return ({ safe: 'sb-safe', low: 'sb-low', critical: 'sb-critical', stockout: 'sb-stockout' } as Record<string, string>)[s] ?? '';
  }

  getStatusLabel(s: string): string {
    return ({ safe: 'OK', low: 'Bajo', critical: 'Crítico', stockout: 'Agotado' } as Record<string, string>)[s] ?? s;
  }

  formatDayLabel(date: Date): string {
    const dow = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    return `${dow[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`;
  }
}
