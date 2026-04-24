import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User, Company } from '../models';

interface StoredUser extends User { password: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly JWT_KEY = 'itemflow_token';
  private readonly USER_KEY = 'itemflow_user';
  private readonly TIMEOUT_MS = 90 * 60 * 1000;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private timeoutHandle: any;

  private readonly USERS: StoredUser[] = [
    { id: 'u1', name: 'Carlos Rodríguez', email: 'admin@esperanza.com', password: 'Admin123!',
      role: 'admin', companyId: 'c1', active: true, createdAt: '2024-01-15', lastLogin: new Date().toISOString() },
    { id: 'u2', name: 'María Fernández', email: 'operador@esperanza.com', password: 'Oper123!',
      role: 'operator', companyId: 'c1', active: true, createdAt: '2024-03-01', lastLogin: new Date().toISOString() },
    { id: 'u3', name: 'Roberto Vargas', email: 'rvargas@esperanza.com', password: 'Oper123!',
      role: 'operator', companyId: 'c1', active: true, createdAt: '2024-04-10', lastLogin: new Date().toISOString() }
  ];

  private readonly COMPANY: Company = {
    id: 'c1', razonSocial: 'Distribuidora La Esperanza S.A.',
    cedulaJuridica: '3-101-789456', sector: 'Distribución de Alimentos',
    adminEmail: 'admin@esperanza.com', createdAt: '2024-01-15'
  };

  constructor(private router: Router) {
    this.restoreSession();
  }

  login(email: string, password: string): Observable<{ user: User; token: string }> {
    const match = this.USERS.find(u => u.email === email && u.password === password && u.active);
    if (!match) {
      return throwError(() => new Error('Correo o contraseña incorrectos'));
    }
    const { password: _pw, ...user } = match;
    const token = this.buildToken(user);
    localStorage.setItem(this.JWT_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.scheduleTimeout();
    return of({ user, token }).pipe(delay(900));
  }

  logout(): void {
    localStorage.removeItem(this.JWT_KEY);
    localStorage.removeItem(this.USER_KEY);
    clearTimeout(this.timeoutHandle);
    this.currentUserSubject.next(null);
    this.router.navigateByUrl('/auth/login', { replaceUrl: true });
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value && !!localStorage.getItem(this.JWT_KEY);
  }

  getCurrentUser(): User | null { return this.currentUserSubject.value; }
  getCompany(): Company { return this.COMPANY; }
  getAllUsers(): User[] { return this.USERS.map(({ password: _p, ...u }) => u); }

  register(data: { razonSocial: string; cedulaJuridica: string; sector: string;
    adminName: string; email: string; password: string }): Observable<{ success: boolean }> {
    return of({ success: true }).pipe(delay(1200));
  }

  sendPasswordReset(email: string): Observable<{ success: boolean }> {
    const exists = this.USERS.some(u => u.email === email);
    if (!exists) return throwError(() => new Error('No existe cuenta con ese correo electrónico'));
    return of({ success: true }).pipe(delay(1000));
  }

  resetActivity(): void { this.scheduleTimeout(); }

  updateUser(userId: string, updates: Partial<User>): Observable<User> {
    const idx = this.USERS.findIndex(u => u.id === userId);
    if (idx === -1) return throwError(() => new Error('Usuario no encontrado'));
    Object.assign(this.USERS[idx], updates);
    return of(this.USERS[idx]).pipe(delay(400));
  }

  private restoreSession(): void {
    const token = localStorage.getItem(this.JWT_KEY);
    const raw = localStorage.getItem(this.USER_KEY);
    if (token && raw) {
      try {
        const user = JSON.parse(raw) as User;
        this.currentUserSubject.next(user);
        this.scheduleTimeout();
      } catch { this.logout(); }
    }
  }

  private buildToken(user: User): string {
    const payload = btoa(JSON.stringify({
      sub: user.id, email: user.email, role: user.role,
      iat: Date.now(), exp: Date.now() + this.TIMEOUT_MS
    }));
    return `eyJhbGciOiJIUzI1NiJ9.${payload}.sig`;
  }

  private scheduleTimeout(): void {
    clearTimeout(this.timeoutHandle);
    this.timeoutHandle = setTimeout(() => this.logout(), this.TIMEOUT_MS);
  }
}
