import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss']
})
export class RegisterPage {
  form: FormGroup;
  step = 1;
  showPassword = false;

  sectors = [
    'Distribución de Alimentos', 'Comercio al Por Menor', 'Manufactura',
    'Servicios', 'Tecnología', 'Agropecuario', 'Construcción', 'Otro'
  ];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    this.form = this.fb.group({
      razonSocial:     ['', [Validators.required, Validators.minLength(3)]],
      cedulaJuridica:  ['', [Validators.required, Validators.pattern(/^\d{1}-\d{3}-\d{6}$/)]],
      sector:          ['', Validators.required],
      adminName:       ['', [Validators.required, Validators.minLength(3)]],
      email:           ['', [Validators.required, Validators.email]],
      password:        ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatch });
  }

  get f() { return this.form.controls; }

  passwordMatch(g: FormGroup) {
    return g.get('password')!.value === g.get('confirmPassword')!.value ? null : { mismatch: true };
  }

  nextStep() {
    const fields = ['razonSocial', 'cedulaJuridica', 'sector'];
    fields.forEach(f => this.form.get(f)!.markAsTouched());
    if (fields.every(f => this.form.get(f)!.valid)) this.step = 2;
  }

  async onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const loading = await this.loadingCtrl.create({ message: 'Registrando empresa...', spinner: 'crescent' });
    await loading.present();

    this.auth.register(this.form.value).subscribe({
      next: async () => {
        await loading.dismiss();
        const toast = await this.toastCtrl.create({
          message: '¡Cuenta creada! Inicia sesión para continuar.',
          duration: 3500, color: 'success', position: 'top'
        });
        await toast.present();
        this.router.navigateByUrl('/auth/login', { replaceUrl: true });
      },
      error: async (err: Error) => {
        await loading.dismiss();
        const toast = await this.toastCtrl.create({
          message: err.message,
          duration: 3500, color: 'danger', position: 'top',
          buttons: [{ icon: 'close', role: 'cancel' }]
        });
        await toast.present();
      }
    });
  }
}
