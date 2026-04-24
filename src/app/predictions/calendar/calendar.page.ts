import { Component, OnInit } from '@angular/core';
import { DataService } from '../../core/services/data.service';

interface PurchaseRecommendation {
  productId: string;
  sku: string;
  name: string;
  category: string;
  supplier: string;
  purchaseDate: Date;
  daysUntilReorder: number;
  currentStock: number;
  reorderPoint: number;
  inTransit: number;
  optimalQty: number;
  estimatedCost: number;
  urgency: 'critical' | 'warning' | 'ok';
}

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  recommendations: PurchaseRecommendation[];
  urgency: 'none' | 'ok' | 'warning' | 'critical';
}

@Component({
  standalone: false,
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss']
})
export class CalendarPage implements OnInit {
  readonly today = new Date(2026, 3, 23);
  readonly MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  readonly WEEKDAYS = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

  currentMonth!: Date;
  weeks: CalendarDay[][] = [];
  recommendations: PurchaseRecommendation[] = [];
  selectedDay: CalendarDay | null = null;

  constructor(public data: DataService) {}

  ngOnInit() {
    this.currentMonth = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
    this.buildRecommendations();
    this.buildCalendar();
  }

  private buildRecommendations() {
    this.recommendations = [];
    for (const product of this.data.products.filter(p => p.active)) {
      const totalStock = this.data.stockItems
        .filter(s => s.productId === product.id)
        .reduce((sum, s) => sum + s.quantity, 0);

      const inTransit = this.data.purchaseOrders
        .filter(po => po.productId === product.id && po.status === 'pending')
        .reduce((sum, po) => sum + po.quantity, 0);

      const dailyDemand = this.data.getDailyDemand(product.id);
      const daysUntilReorder = totalStock <= product.reorderPoint
        ? 0
        : Math.floor((totalStock - product.reorderPoint) / dailyDemand);

      const w1Stock = this.data.stockItems.find(s => s.productId === product.id && s.warehouseId === 'w1');
      const maxStock = w1Stock?.maxStock ?? product.reorderPoint * 5;
      const optimalQty = Math.max(1, maxStock - product.reorderPoint);

      const purchaseDate = new Date(this.today);
      purchaseDate.setDate(purchaseDate.getDate() + daysUntilReorder);

      const urgency: 'critical' | 'warning' | 'ok' =
        daysUntilReorder <= 3 ? 'critical' :
        daysUntilReorder <= 8 ? 'warning' : 'ok';

      this.recommendations.push({
        productId: product.id, sku: product.sku, name: product.name,
        category: product.category, supplier: product.supplier || '',
        purchaseDate, daysUntilReorder, currentStock: totalStock,
        reorderPoint: product.reorderPoint, inTransit, optimalQty,
        estimatedCost: optimalQty * product.buyPrice, urgency
      });
    }
    this.recommendations.sort((a, b) => a.daysUntilReorder - b.daysUntilReorder);
  }

  buildCalendar() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDow = (firstDay.getDay() + 6) % 7;

    const current = new Date(firstDay);
    current.setDate(current.getDate() - startDow);

    this.weeks = [];
    for (let w = 0; w < 6; w++) {
      const week: CalendarDay[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(current);
        const isCurrentMonth = date.getMonth() === month;
        const isToday = this.isSameDay(date, this.today);
        const isPast = date < this.today && !isToday;
        const dayRecs = this.recommendations.filter(r => this.isSameDay(r.purchaseDate, date));

        let urgency: 'none' | 'ok' | 'warning' | 'critical' = 'none';
        if (dayRecs.length > 0) {
          if (dayRecs.some(r => r.urgency === 'critical')) urgency = 'critical';
          else if (dayRecs.some(r => r.urgency === 'warning')) urgency = 'warning';
          else urgency = 'ok';
        }

        week.push({ date, dayNumber: date.getDate(), isCurrentMonth, isToday, isPast, recommendations: dayRecs, urgency });
        current.setDate(current.getDate() + 1);
      }
      this.weeks.push(week);
    }
  }

  isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
  }

  prevMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.buildCalendar();
    this.selectedDay = null;
  }

  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.buildCalendar();
    this.selectedDay = null;
  }

  selectDay(day: CalendarDay) {
    if (day.recommendations.length === 0) { this.selectedDay = null; return; }
    this.selectedDay = (this.selectedDay && this.isSameDay(this.selectedDay.date, day.date)) ? null : day;
  }

  navigateToDay(rec: PurchaseRecommendation) {
    const targetMonth = new Date(rec.purchaseDate.getFullYear(), rec.purchaseDate.getMonth(), 1);
    if (targetMonth.getTime() !== this.currentMonth.getTime()) {
      this.currentMonth = targetMonth;
      this.buildCalendar();
    }
    let target: CalendarDay | undefined;
    for (const week of this.weeks) {
      const found = week.find(d => this.isSameDay(d.date, rec.purchaseDate));
      if (found) { target = found; break; }
    }
    this.selectedDay = target ?? null;
  }

  get monthLabel(): string { return `${this.MONTHS[this.currentMonth.getMonth()]} ${this.currentMonth.getFullYear()}`; }
  get criticalCount(): number { return this.recommendations.filter(r => r.urgency === 'critical').length; }
  get warningCount(): number { return this.recommendations.filter(r => r.urgency === 'warning').length; }
  get okCount(): number { return this.recommendations.filter(r => r.urgency === 'ok').length; }
  get totalCost(): number { return this.recommendations.reduce((s, r) => s + r.estimatedCost, 0); }

  getUrgencyLabel(u: string): string {
    return ({ critical: 'Crítico', warning: 'Urgente', ok: 'Planificado' } as Record<string, string>)[u] ?? u;
  }

  formatDate(date: Date): string {
    return `${date.getDate()} de ${this.MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  }
}
