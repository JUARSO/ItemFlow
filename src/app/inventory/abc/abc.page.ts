import { Component, OnInit } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import { ABCItem } from '../../core/models';

interface AbcRow extends ABCItem {
  periodValue: number;
  periodPercent: number;
  periodAccumulated: number;
}

@Component({
  standalone: false,
  selector: 'app-abc',
  templateUrl: './abc.page.html',
  styleUrls: ['./abc.page.scss']
})
export class AbcPage implements OnInit {
  allItems: ABCItem[] = [];
  rows: AbcRow[] = [];
  selectedClass = 'all';
  period = '365';

  readonly periods = [
    { value: '30',  label: '30 días' },
    { value: '90',  label: '90 días' },
    { value: '180', label: '6 meses' },
    { value: '365', label: '1 año'   }
  ];

  get filtered(): AbcRow[] {
    return this.selectedClass === 'all'
      ? this.rows
      : this.rows.filter(r => r.class === this.selectedClass);
  }

  get classA() { return this.rows.filter(r => r.class === 'A'); }
  get classB() { return this.rows.filter(r => r.class === 'B'); }
  get classC() { return this.rows.filter(r => r.class === 'C'); }

  get classAValuePct() { return this.classA.reduce((s, r) => s + r.periodPercent, 0); }
  get classBValuePct() { return this.classB.reduce((s, r) => s + r.periodPercent, 0); }
  get classCValuePct() { return this.classC.reduce((s, r) => s + r.periodPercent, 0); }

  get totalPeriodValue() { return this.rows.reduce((s, r) => s + r.periodValue, 0); }

  constructor(private data: DataService) {}

  ngOnInit() {
    this.allItems = [...this.data.abcItems].sort((a, b) => b.annualConsumptionValue - a.annualConsumptionValue);
    this.recalculate();
  }

  recalculate() {
    const factor = +this.period / 365;
    const total = this.allItems.reduce((s, i) => s + i.annualConsumptionValue, 0);
    let accumulated = 0;

    this.rows = this.allItems.map(item => {
      const periodValue = Math.round(item.annualConsumptionValue * factor);
      const periodPercent = total > 0 ? (item.annualConsumptionValue / total) * 100 : 0;
      accumulated += periodPercent;
      return { ...item, periodValue, periodPercent, periodAccumulated: accumulated };
    });
  }

  setPeriod(p: string) {
    this.period = p;
    this.recalculate();
  }

  getBarWidth(item: AbcRow): number {
    const max = this.rows[0]?.periodValue || 1;
    return Math.min(100, (item.periodValue / max) * 100);
  }

  formatCurrency(val: number): string {
    if (val >= 1_000_000) return '₡' + (val / 1_000_000).toFixed(2) + 'M';
    if (val >= 1_000)     return '₡' + (val / 1_000).toFixed(0) + 'K';
    return '₡' + val;
  }

  getPeriodLabel(): string {
    return this.periods.find(p => p.value === this.period)?.label || '1 año';
  }
}
