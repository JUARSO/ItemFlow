import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { ThemeService, ThemeKey, Theme } from '../core/services/theme.service';
import { AlertController, MenuController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-more',
  templateUrl: './more.page.html',
  styleUrls: ['./more.page.scss']
})
export class MorePage {
  activeTheme: ThemeKey;
  themes: Theme[];

  menuItems = [
    { icon: 'notifications-outline',  label: 'Alertas',               desc: 'Ver y gestionar alertas de inventario',  route: '/tabs/alerts',       color: '#DC2626' },
    { icon: 'document-text-outline',  label: 'Reportes y Exportación', desc: 'PDF, Excel, historial de predicciones',  route: '/tabs/more/reports', color: '#059669' }
  ];

  constructor(
    private auth: AuthService,
    private router: Router,
    private alertCtrl: AlertController,
    private menuCtrl: MenuController,
    private themeService: ThemeService
  ) {
    this.themes = this.themeService.themes;
    this.activeTheme = this.themeService.getSavedTheme();
  }

  ionViewWillEnter() {
    this.activeTheme = this.themeService.getSavedTheme();
  }

  get activeThemeLabel(): string {
    return this.themes.find(t => t.key === this.activeTheme)?.label ?? '';
  }

  get activeThemeColor(): string {
    return this.themes.find(t => t.key === this.activeTheme)?.color ?? 'var(--ion-color-primary)';
  }

  openMenu() { this.menuCtrl.open('main-menu'); }

  navigateTo(route: string) { this.router.navigateByUrl(route); }

  async confirmLogout() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro de que deseas cerrar la sesión?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Cerrar sesión', role: 'destructive', handler: () => this.auth.logout() }
      ]
    });
    await alert.present();
  }
}
