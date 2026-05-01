import { Injectable, inject, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import {
  Auth, authState, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendPasswordResetEmail, signOut, User as FirebaseUser
} from '@angular/fire/auth';
import {
  Firestore, doc, setDoc, getDoc, collection, addDoc, serverTimestamp
} from '@angular/fire/firestore';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable, from, throwError, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { User, Company } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // inject() en lugar de constructor injection → garantiza contexto de inyección
  private afAuth     = inject(Auth);
  private firestore  = inject(Firestore);
  private router     = inject(Router);
  private destroyRef = inject(DestroyRef);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private tenantId: string | null = null;
  private company:  Company | null = null;

  constructor() {
    // authState() es el observable zone-aware de AngularFire
    authState(this.afAuth)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(async (firebaseUser) => {
        if (firebaseUser) {
          await this.hydrateUser(firebaseUser);
        } else {
          this.currentUserSubject.next(null);
          this.tenantId = null;
          this.company  = null;
        }
      });
  }

  // ── Sesión ─────────────────────────────────────────────────────────────────

  login(email: string, password: string): Observable<{ user: User; token: string }> {
    return from(signInWithEmailAndPassword(this.afAuth, email, password)).pipe(
      switchMap(async (credential) => {
        await this.hydrateUser(credential.user);
        if (!this.currentUserSubject.value) {
          throw new Error('No se encontró el perfil de usuario.');
        }
        const token = await credential.user.getIdToken();
        return { user: this.currentUserSubject.value, token };
      }),
      catchError((err) => {
        console.error('[AuthService] login error:', err);
        return throwError(() => new Error(this.mapError(err.code ?? err.message)));
      })
    );
  }

  logout(): void {
    signOut(this.afAuth).then(() => {
      this.currentUserSubject.next(null);
      this.tenantId = null;
      this.company  = null;
      this.router.navigateByUrl('/auth/login', { replaceUrl: true });
    });
  }

  isAuthenticated(): boolean { return !!this.currentUserSubject.value; }
  getCurrentUser(): User | null   { return this.currentUserSubject.value; }
  getCompany():    Company | null { return this.company; }
  getTenantId():   string | null  { return this.tenantId; }

  // ── Registro ───────────────────────────────────────────────────────────────

  register(data: {
    razonSocial: string; cedulaJuridica: string; sector: string;
    adminName: string; email: string; password: string;
  }): Observable<{ success: boolean }> {
    return from(createUserWithEmailAndPassword(this.afAuth, data.email, data.password)).pipe(
      switchMap(async (credential) => {
        const uid = credential.user.uid;
        const now = serverTimestamp();
        const PLAN = { name: 'Standard', priceMonthly: 0, active: true, maxAccounts: 1 };

        // Crea el plan solo si no existe (bootstrap único de la plataforma)
        const planRef  = doc(this.firestore, 'plans/standard');
        const planSnap = await getDoc(planRef);
        if (!planSnap.exists()) await setDoc(planRef, PLAN);

        await setDoc(doc(this.firestore, `tenants/${uid}`), {
          razónSocial:    data.razonSocial,
          cedulaJurídica: data.cedulaJuridica,
          sector:         data.sector,
          adminEmail:     data.email,
          status:         'active',
          createdAt:      now,
        });

        await setDoc(doc(this.firestore, `tenants/${uid}/accounts/${uid}`), {
          uid, name: data.adminName, email: data.email,
          role: 'admin', active: true, createdAt: now,
        });

        await addDoc(collection(this.firestore, `tenants/${uid}/subscriptions`), {
          planId:        'standard',
          planName:       PLAN.name,
          priceMonthly:   PLAN.priceMonthly,
          active:         PLAN.active,
          maxAccounts:    PLAN.maxAccounts,
          status:        'active',
          billingCycle:  'monthly',
          endsAt:         null,
          createdAt:      now,
        });

        await signOut(this.afAuth);
        return { success: true };
      }),
      catchError((err) => {
        console.error('[AuthService] register error:', err);
        return throwError(() => new Error(this.mapError(err.code ?? err.message)));
      })
    );
  }

  // ── Recuperar contraseña ───────────────────────────────────────────────────

  sendPasswordReset(email: string): Observable<{ success: boolean }> {
    return from(sendPasswordResetEmail(this.afAuth, email)).pipe(
      map(() => ({ success: true })),
      catchError((err) => {
        console.error('[AuthService] sendPasswordReset error:', err);
        // No revelar si el correo existe (previene enumeración de usuarios)
        if (err.code === 'auth/user-not-found') return of({ success: true });
        return throwError(() => new Error(this.mapError(err.code ?? err.message)));
      })
    );
  }

  // ── Internos ───────────────────────────────────────────────────────────────

  private async hydrateUser(firebaseUser: FirebaseUser): Promise<void> {
    const tokenResult = await firebaseUser.getIdTokenResult();
    const tId = (tokenResult.claims['tenantId'] as string) ?? firebaseUser.uid;
    this.tenantId = tId;

    const [accountSnap, tenantSnap] = await Promise.all([
      getDoc(doc(this.firestore, `tenants/${tId}/accounts/${firebaseUser.uid}`)),
      getDoc(doc(this.firestore, `tenants/${tId}`)),
    ]);

    if (!accountSnap.exists()) return;

    const a = accountSnap.data();
    this.currentUserSubject.next({
      id:        firebaseUser.uid,
      name:      a['name'],
      email:     firebaseUser.email!,
      role:      a['role'],
      companyId: tId,
      active:    a['active'],
      createdAt: a['createdAt']?.toDate?.()?.toISOString() ?? '',
      lastLogin: new Date().toISOString(),
    });

    if (tenantSnap.exists()) {
      const t = tenantSnap.data();
      this.company = {
        id:             tId,
        razonSocial:    t['razónSocial'],
        cedulaJuridica: t['cedulaJurídica'],
        sector:         t['sector'],
        adminEmail:     t['adminEmail'],
        createdAt:      t['createdAt']?.toDate?.()?.toISOString() ?? '',
      };
    }
  }

  private mapError(code: string): string {
    const errors: Record<string, string> = {
      'auth/user-not-found':         'No existe cuenta con ese correo',
      'auth/wrong-password':         'Contraseña incorrecta',
      'auth/invalid-credential':     'Correo o contraseña incorrectos',
      'auth/email-already-in-use':   'Ya existe una cuenta con ese correo',
      'auth/weak-password':          'La contraseña debe tener al menos 6 caracteres',
      'auth/invalid-email':          'Correo electrónico inválido',
      'auth/too-many-requests':      'Demasiados intentos. Intenta más tarde',
      'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
      'permission-denied':           'Sin permisos en Firestore. Verifica las reglas',
      'unavailable':                 'Servicio no disponible. Verifica tu conexión',
    };
    return errors[code] ?? `Error inesperado (${code})`;
  }
}
