import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../core/services/data.service';
import { AlertService } from '../core/services/alert.service';
import { PredictionService } from '../core/services/prediction.service';
import { InventoryService } from '../core/services/inventory.service';
import { AuthService } from '../core/services/auth.service';
import { DashboardKPIs, Alert } from '../core/models';

@Component({
  standalone: false,
  selector: 'app-dashboard', templateUrl: './dashboard.page.html', styleUrls: ['./dashboard.page.scss'] })
export class DashboardPage implements OnInit {
  kpis!: DashboardKPIs;
  topAlerts: Alert[] = [];
  user$ = this.auth.currentUser$;
  company: any;
  stockSummary = { available: 0, low: 0, critical: 0, out: 0 };
  modelAccuracy: any;
  predictionPoints: { label: string; predicted: number; actual: number }[] = [];
  chartPath = '';
  actualPath = '';
  chartWidth = 280;
  chartHeight = 70;

  constructor(
    private data: DataService,
    private alertService: AlertService,
    private predictionService: PredictionService,
    private inventoryService: InventoryService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.kpis = this.data.dashboardKPIs;
    this.company = this.auth.getCompany();
    this.stockSummary = this.inventoryService.getStockSummary();
    this.modelAccuracy = this.predictionService.getOverallAccuracy();

    this.alertService.getActiveAlerts().subscribe(alerts => {
      this.topAlerts = alerts.slice(0, 3);
    });

    const pvs = this.data.predictionVsActual;
    this.predictionPoints = pvs.map(p => ({ label: p.label, predicted: p.predicted, actual: p.actual }));
    const preds = pvs.map(p => p.predicted);
    const actuals = pvs.map(p => p.actual);
    this.chartPath = this.predictionService.generateSvgLinePath(preds, this.chartWidth, this.chartHeight);
    this.actualPath = this.predictionService.generateSvgLinePath(actuals, this.chartWidth, this.chartHeight);
  }

  formatCurrency(val: number | undefined): string {
    const v = val ?? 0;
    if (v >= 1000000) return '₡' + (v / 1000000).toFixed(1) + 'M';
    if (v >= 1000) return '₡' + (v / 1000).toFixed(0) + 'K';
    return '₡' + v.toFixed(0);
  }

  getAlertIcon(type: string): string {
    const map: Record<string, string> = { restock: 'alert-circle', excess: 'trending-up', stockout_risk: 'warning' };
    return map[type] || 'notifications';
  }

  getAlertColor(priority: string): string {
    const map: Record<string, string> = { high: '#DC2626', medium: '#D97706', low: '#2563EB' };
    return map[priority] || '#94A3B8';
  }

  navigateTo(path: string) { this.router.navigateByUrl(path); }
}
