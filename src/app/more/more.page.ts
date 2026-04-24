import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-more', templateUrl: './more.page.html', styleUrls: ['./more.page.scss'] })
export class MorePage {
  user$ = this.auth.currentUser$;
  company: any;

  menuItems = [
    { icon: 'cube-outline', label: 'Catálogo de Productos', desc: 'Crear, editar y gestionar SKUs', route: '/tabs/more/products', color: '#2563EB' },
    { icon: 'cloud-upload-outline', label: 'Gestión de Dataset', desc: 'Importar datos, detectar outliers', route: '/tabs/more/dataset', color: '#7C3AED' },
    { icon: 'people-outline', label: 'Usuarios y Roles', desc: 'Administrar usuarios y permisos', route: '/tabs/more/users', color: '#0891b2' },
    { icon: 'document-text-outline', label: 'Reportes y Exportación', desc: 'PDF, Excel, historial de predicciones', route: '/tabs/more/reports', color: '#059669' }
  ];

  constructor(private auth: AuthService, private router: Router, private alertCtrl: AlertController, private toastCtrl: ToastController) {
    this.company = this.auth.getCompany();
  }

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
