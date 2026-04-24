import { Component, OnInit } from '@angular/core';
import { ToastController, ActionSheetController } from '@ionic/angular';
import { AlertService } from '../core/services/alert.service';
import { Alert, AlertType, AlertPriority } from '../core/models';

@Component({
  standalone: false,
  selector: 'app-alerts', templateUrl: './alerts.page.html', styleUrls: ['./alerts.page.scss'] })
export class AlertsPage implements OnInit {
  alerts: Alert[] = [];
  counts: any = {};
  segment: 'active' | 'restock' | 'excess' | 'resolved' = 'active';
  loading = true;

  constructor(private alertService: AlertService, private toastCtrl: ToastController, private actionSheetCtrl: ActionSheetController) {}

  ngOnInit() {
    this.alertService.alerts$.subscribe(all => {
      this.counts = this.alertService.getAlertCounts();
      this.filterAlerts();
      this.loading = false;
    });
  }

  filterAlerts() {
    if (this.segment === 'active') {
      this.alertService.getAlerts({ status: 'active' }).subscribe(a => this.alerts = a);
    } else if (this.segment === 'restock') {
      this.alertService.getAlerts().subscribe(a => {
        this.alerts = a.filter(x => x.type === 'restock' || x.type === 'stockout_risk');
      });
    } else if (this.segment === 'excess') {
      this.alertService.getAlerts().subscribe(a => { this.alerts = a.filter(x => x.type === 'excess'); });
    } else {
      this.alertService.getAlerts({ status: 'resolved' }).subscribe(a => this.alerts = a);
    }
  }

  async onAlertAction(alert: Alert) {
    const buttons: any[] = [];
    if (alert.status === 'active') {
      buttons.push({
        text: 'Marcar como revisada', icon: 'eye-outline',
        handler: () => {
          this.alertService.acknowledgeAlert(alert.id).subscribe(async () => {
            const t = await this.toastCtrl.create({ message: 'Alerta marcada como revisada', duration: 2000, color: 'success', position: 'top' });
            await t.present();
          });
        }
      });
    }
    if (alert.status !== 'resolved') {
      buttons.push({
        text: 'Resolver alerta', icon: 'checkmark-circle-outline',
        handler: () => {
          this.alertService.resolveAlert(alert.id).subscribe(async () => {
            const t = await this.toastCtrl.create({ message: 'Alerta resuelta', duration: 2000, color: 'success', position: 'top' });
            await t.present();
          });
        }
      });
    }
    buttons.push({ text: 'Cancelar', role: 'cancel', icon: 'close' });

    const sheet = await this.actionSheetCtrl.create({
      header: alert.title, buttons
    });
    await sheet.present();
  }

  getAlertTypeIcon(type: AlertType): string {
    return { restock: 'alert-circle-outline', excess: 'trending-up-outline', stockout_risk: 'warning-outline' }[type];
  }

  getAlertTypeLabel(type: AlertType): string {
    return { restock: 'Reabastecimiento', excess: 'Exceso', stockout_risk: 'Quiebre de stock' }[type];
  }

  getAlertTypeColor(type: AlertType): string {
    return { restock: '#D97706', excess: '#7C3AED', stockout_risk: '#DC2626' }[type];
  }

  getPriorityLabel(p: AlertPriority): string {
    return { high: 'Alta', medium: 'Media', low: 'Baja' }[p];
  }

  getPriorityColor(p: AlertPriority): string {
    return { high: 'danger', medium: 'warning', low: 'primary' }[p];
  }

  getStatusIcon(status: string): string {
    return { active: 'radio-button-on', acknowledged: 'eye', resolved: 'checkmark-circle' }[status] || 'ellipse';
  }

  getDaysLabel(days?: number): string {
    if (days === undefined) return '';
    if (days === 0) return 'Agotado ahora';
    if (days === 1) return 'Se agota mañana';
    return `Se agota en ${days} días`;
  }
}
