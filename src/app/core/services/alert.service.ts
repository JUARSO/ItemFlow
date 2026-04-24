import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DataService } from './data.service';
import { Alert, AlertStatus, AlertType, AlertPriority } from '../models';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private alertsSubject: BehaviorSubject<Alert[]>;
  alerts$: Observable<Alert[]>;

  constructor(private data: DataService) {
    this.alertsSubject = new BehaviorSubject<Alert[]>(this.data.alerts);
    this.alerts$ = this.alertsSubject.asObservable();
  }

  getAlerts(filters?: { type?: AlertType; priority?: AlertPriority; status?: AlertStatus }): Observable<Alert[]> {
    let alerts = this.alertsSubject.value;
    if (filters?.type) alerts = alerts.filter(a => a.type === filters.type);
    if (filters?.priority) alerts = alerts.filter(a => a.priority === filters.priority);
    if (filters?.status) alerts = alerts.filter(a => a.status === filters.status);
    alerts = alerts.sort((a, b) => {
      const p = { high: 0, medium: 1, low: 2 } as Record<AlertPriority, number>;
      return p[a.priority] - p[b.priority];
    });
    return of(alerts).pipe(delay(200));
  }

  getActiveAlerts(): Observable<Alert[]> {
    return this.getAlerts({ status: 'active' });
  }

  acknowledgeAlert(alertId: string): Observable<boolean> {
    const idx = this.data.alerts.findIndex(a => a.id === alertId);
    if (idx !== -1) {
      this.data.alerts[idx].status = 'acknowledged';
      this.data.alerts[idx].updatedAt = new Date().toISOString();
      this.alertsSubject.next([...this.data.alerts]);
    }
    return of(true).pipe(delay(300));
  }

  resolveAlert(alertId: string): Observable<boolean> {
    const idx = this.data.alerts.findIndex(a => a.id === alertId);
    if (idx !== -1) {
      this.data.alerts[idx].status = 'resolved';
      this.data.alerts[idx].updatedAt = new Date().toISOString();
      this.alertsSubject.next([...this.data.alerts]);
    }
    return of(true).pipe(delay(300));
  }

  getAlertCounts(): { total: number; high: number; medium: number; low: number; active: number } {
    const active = this.alertsSubject.value.filter(a => a.status === 'active' || a.status === 'acknowledged');
    return {
      total: active.length,
      high: active.filter(a => a.priority === 'high').length,
      medium: active.filter(a => a.priority === 'medium').length,
      low: active.filter(a => a.priority === 'low').length,
      active: active.filter(a => a.status === 'active').length
    };
  }

  getRestockAlerts(): Alert[] {
    return this.alertsSubject.value.filter(a => a.type === 'restock' || a.type === 'stockout_risk');
  }

  getExcessAlerts(): Alert[] {
    return this.alertsSubject.value.filter(a => a.type === 'excess');
  }
}
