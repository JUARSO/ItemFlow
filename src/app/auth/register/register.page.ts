import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-register', templateUrl: './register.page.html', styleUrls: ['./register.page.scss'] })
export class RegisterPage {
  form: FormGroup;
  step = 1;
  showPassword = false;

  sectors = ['Distribución de Alimentos', 'Comercio al Por Menor', 'Manufactura', 'Servicios', 'Tecnología', 'Agropecuario', 'Construcción', 'Otro'];

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router,
    private loadingCtrl: LoadingController, private toastCtrl: ToastController) {
    this.form = this.fb.group({
      razonSocial: ['', [Validators.minLength(3)]],
      cedulaJuridica: ['', [Validators.pattern(/^\d{1}-\d{3}-\d{6}$/)]],
      sector: [''],
      adminName: ['', [Validators.minLength(3)]],
      email: ['', [Validators.email]],
      password: ['', [Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]],
      confirmPassword: ['']
    }, { validators: this.passwordMatch });
  }

  get f() { return this.form.controls; }

  passwordMatch(g: FormGroup) {
    return g.get('password')!.value === g.get('confirmPassword')!.value ? null : { mismatch: true };
  }

  nextStep() {
    const step1Fields = ['razonSocial', 'cedulaJuridica', 'sector'];
    step1Fields.forEach(f => this.form.get(f)!.markAsTouched());
    if (step1Fields.every(f => this.form.get(f)!.valid)) this.step = 2;
  }

  async onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const loading = await this.loadingCtrl.create({ message: 'Registrando empresa...', spinner: 'crescent' });
    await loading.present();

    this.auth.register(this.form.value).subscribe({
      next: async () => {
        await loading.dismiss();
        const toast = await this.toastCtrl.create({
          message: '¡Cuenta creada exitosamente! Por favor inicia sesión.',
          duration: 3000, color: 'success', position: 'top'
        });
        await toast.present();
        this.router.navigateByUrl('/auth/login', { replaceUrl: true });
      },
      error: async () => {
        await loading.dismiss();
        const toast = await this.toastCtrl.create({ message: 'Error al registrar. Intenta de nuevo.', duration: 3000, color: 'danger', position: 'top' });
        await toast.present();
      }
    });
  }
}
