import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models';

@Component({
  standalone: false,
  selector: 'app-users', templateUrl: './users.page.html', styleUrls: ['./users.page.scss'] })
export class UsersPage implements OnInit {
  users: User[] = [];
  currentUser: User | null = null;
  showForm = false;
  editingUser: User | null = null;
  formData: Partial<User & { password: string }> = {};

  permissions = {
    admin: ['Ver inventario', 'Registrar operaciones', 'Importar datos', 'Gestionar productos', 'Gestionar usuarios', 'Ver predicciones', 'Exportar reportes', 'Configurar alertas'],
    operator: ['Ver inventario', 'Registrar operaciones', 'Ver predicciones']
  };

  constructor(private auth: AuthService, private alertCtrl: AlertController, private toastCtrl: ToastController) {}

  ngOnInit() {
    this.users = this.auth.getAllUsers();
    this.currentUser = this.auth.getCurrentUser();
  }

  openCreate() {
    this.editingUser = null;
    this.formData = { role: 'operator', active: true };
    this.showForm = true;
  }

  openEdit(user: User) {
    if (user.id !== this.currentUser?.id && this.currentUser?.role !== 'admin') return;
    this.editingUser = user;
    this.formData = { ...user };
    this.showForm = true;
  }

  async saveUser() {
    if (!this.formData.name || !this.formData.email) {
      const t = await this.toastCtrl.create({ message: 'Nombre y correo son requeridos', duration: 2000, color: 'warning', position: 'top' });
      await t.present(); return;
    }
    if (this.editingUser) {
      this.auth.updateUser(this.editingUser.id, this.formData as Partial<User>).subscribe();
    }
    this.showForm = false;
    this.ngOnInit();
    const t = await this.toastCtrl.create({ message: 'Usuario actualizado', duration: 2000, color: 'success', position: 'top' });
    await t.present();
  }

  async toggleStatus(user: User) {
    if (user.id === this.currentUser?.id) {
      const t = await this.toastCtrl.create({ message: 'No puedes desactivar tu propia cuenta', duration: 2000, color: 'warning', position: 'top' });
      await t.present(); return;
    }
    const alert = await this.alertCtrl.create({
      header: user.active ? 'Desactivar usuario' : 'Activar usuario',
      message: `¿${user.active ? 'Desactivar' : 'Activar'} a ${user.name}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Confirmar', handler: async () => {
          this.auth.updateUser(user.id, { active: !user.active }).subscribe();
          this.ngOnInit();
          const t = await this.toastCtrl.create({ message: 'Estado actualizado', duration: 2000, color: 'success', position: 'top' });
          await t.present();
        }}
      ]
    });
    await alert.present();
  }

  getPermissions(role: 'admin' | 'operator') { return this.permissions[role]; }
  isCurrentUser(user: User) { return user.id === this.currentUser?.id; }
  get adminCount() { return this.users.filter(u => u.role === 'admin').length; }
  get operatorCount() { return this.users.filter(u => u.role === 'operator').length; }
}
