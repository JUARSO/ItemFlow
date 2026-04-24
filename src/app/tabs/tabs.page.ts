import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { AlertService } from '../core/services/alert.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class TabsPage implements OnInit {
  alertCount = 0;

  constructor(private alertService: AlertService, private menuCtrl: MenuController) {}

  ngOnInit() {
    this.alertService.alerts$.subscribe(alerts => {
      this.alertCount = alerts.filter(a => a.status === 'active').length;
    });
  }

  closeMenu() { this.menuCtrl.close('main-menu'); }
}
