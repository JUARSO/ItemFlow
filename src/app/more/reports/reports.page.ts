import { Component } from '@angular/core';
import { ToastController, LoadingController } from '@ionic/angular';
import { DataService } from '../../core/services/data.service';

@Component({
  standalone: false,
  selector: 'app-reports', templateUrl: './reports.page.html', styleUrls: ['./reports.page.scss'] })
export class ReportsPage {
  generating = '';
  period = '30d';

  reportTypes = [
    { id: 'inventory', icon: 'cube-outline', color: '#2563EB', title: 'Inventario general', desc: 'Stock actual, valorización y estado de productos' },
    { id: 'kardex', icon: 'list-outline', color: '#7C3AED', title: 'Kardex completo', desc: 'Historial de movimientos con trazabilidad de usuarios' },
    { id: 'abc', icon: 'bar-chart-outline', color: '#D97706', title: 'Clasificación ABC', desc: 'Análisis de Pareto por valor de consumo' },
    { id: 'predictions', icon: 'analytics-outline', color: '#059669', title: 'Predicciones vs Real', desc: 'Comparativa de pronósticos con ventas reales (R², MSE)' },
    { id: 'alerts', icon: 'notifications-outline', color: '#DC2626', title: 'Historial de alertas', desc: 'Log completo de alertas generadas y resoluciones' },
    { id: 'dashboard', icon: 'grid-outline', color: '#0891b2', title: 'Reporte gerencial', desc: 'KPIs ejecutivos consolidados del período' }
  ];

  get totalSkus() { return this.data.products.length; }
  get totalEntries() { return this.data.kardexEntries.filter(k => k.type === 'in').length; }
  get totalExits() { return this.data.kardexEntries.filter(k => k.type === 'out').length; }
  get totalAlerts() { return this.data.alerts.length; }

  constructor(private toastCtrl: ToastController, private loadingCtrl: LoadingController, private data: DataService) {}

  async generateReport(reportId: string, format: 'pdf' | 'excel') {
    const type = this.reportTypes.find(r => r.id === reportId);
    this.generating = reportId + format;
    const loading = await this.loadingCtrl.create({ message: `Generando ${format.toUpperCase()}...`, spinner: 'crescent' });
    await loading.present();

    setTimeout(async () => {
      await loading.dismiss();
      this.generating = '';
      const toast = await this.toastCtrl.create({
        message: `Reporte "${type?.title}" generado en ${format.toUpperCase()} (simulado). En producción se descargará automáticamente.`,
        duration: 4000, color: 'success', position: 'top',
        buttons: [{ text: 'OK', role: 'cancel' }]
      });
      await toast.present();
    }, 1500 + Math.random() * 1000);
  }
}
