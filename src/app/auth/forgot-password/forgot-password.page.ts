import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-forgot-password', templateUrl: './forgot-password.page.html', styleUrls: ['./forgot-password.page.scss'] })
export class ForgotPasswordPage {
  form: FormGroup;
  sent = false;

  constructor(private fb: FormBuilder, private auth: AuthService,
    private loadingCtrl: LoadingController, private toastCtrl: ToastController) {
    this.form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  }

  get email() { return this.form.get('email')!; }

  async onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const loading = await this.loadingCtrl.create({ message: 'Enviando enlace...', spinner: 'crescent' });
    await loading.present();

    this.auth.sendPasswordReset(this.email.value).subscribe({
      next: async () => { await loading.dismiss(); this.sent = true; },
      error: async (err) => {
        await loading.dismiss();
        const toast = await this.toastCtrl.create({ message: err.message, duration: 3000, color: 'danger', position: 'top' });
        await toast.present();
      }
    });
  }
}
