import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  form: FormGroup;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get email() { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }

  async onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const loading = await this.loadingCtrl.create({ message: 'Iniciando sesión...', spinner: 'crescent', cssClass: 'if-loading' });
    await loading.present();

    this.auth.login(this.email.value, this.password.value).subscribe({
      next: async () => {
        await loading.dismiss();
        this.router.navigateByUrl('/tabs', { replaceUrl: true });
      },
      error: async (err) => {
        await loading.dismiss();
        const toast = await this.toastCtrl.create({
          message: err.message, duration: 3000, color: 'danger', position: 'top',
          buttons: [{ icon: 'close', role: 'cancel' }]
        });
        await toast.present();
      }
    });
  }

  fillDemo(role: 'admin' | 'operator') {
    if (role === 'admin') {
      this.form.patchValue({ email: 'admin@esperanza.com', password: 'Admin123!' });
    } else {
      this.form.patchValue({ email: 'operador@esperanza.com', password: 'Oper123!' });
    }
  }
}
