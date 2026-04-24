import { Injectable } from '@angular/core';

export type ThemeKey = 'purple' | 'red' | 'blue' | 'green' | 'yellow' | 'orange' | 'gray'
                    | 'pink' | 'fuchsia' | 'indigo' | 'cyan' | 'lime' | 'teal';

export interface Theme {
  key: ThemeKey;
  label: string;
  color: string;
  primaryRgb: string;
  shade: string;
  tint: string;
  bg: string;
  bgRgb: string;
  text: string;
  textRgb: string;
  light: string;
  lightRgb: string;
  lightShade: string;
  muted: string;
  extraDark: string;
  faintBg: string;
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'if-theme';

  readonly themes: Theme[] = [
    { key: 'purple', label: 'Morado',   color: '#7C3AED', primaryRgb: '124,58,237',  shade: '#6D28D9', tint: '#8B5CF6',
      bg: '#F5F3FF', bgRgb: '245,243,255', text: '#1E1B4B', textRgb: '30,27,75',
      light: '#EDE9FE', lightRgb: '237,233,254', lightShade: '#DDD6FE',
      muted: '#C4B5FD', extraDark: '#5B21B6', faintBg: '#FAFAFE' },

    { key: 'red',    label: 'Rojo',     color: '#DC2626', primaryRgb: '220,38,38',   shade: '#B91C1C', tint: '#EF4444',
      bg: '#FFF5F5', bgRgb: '255,245,245', text: '#450A0A', textRgb: '69,10,10',
      light: '#FEE2E2', lightRgb: '254,226,226', lightShade: '#FECACA',
      muted: '#FCA5A5', extraDark: '#991B1B', faintBg: '#FFF8F8' },

    { key: 'blue',   label: 'Azul',     color: '#2563EB', primaryRgb: '37,99,235',   shade: '#1D4ED8', tint: '#3B82F6',
      bg: '#EFF6FF', bgRgb: '239,246,255', text: '#1E3A8A', textRgb: '30,58,138',
      light: '#DBEAFE', lightRgb: '219,234,254', lightShade: '#BFDBFE',
      muted: '#93C5FD', extraDark: '#1E3A8A', faintBg: '#F8FBFF' },

    { key: 'green',  label: 'Verde',    color: '#059669', primaryRgb: '5,150,105',   shade: '#047857', tint: '#10B981',
      bg: '#ECFDF5', bgRgb: '236,253,245', text: '#064E3B', textRgb: '6,78,59',
      light: '#D1FAE5', lightRgb: '209,250,229', lightShade: '#A7F3D0',
      muted: '#6EE7B7', extraDark: '#064E3B', faintBg: '#F7FDFB' },

    { key: 'yellow', label: 'Amarillo', color: '#D97706', primaryRgb: '217,119,6',   shade: '#B45309', tint: '#F59E0B',
      bg: '#FFFBEB', bgRgb: '255,251,235', text: '#78350F', textRgb: '120,53,15',
      light: '#FEF3C7', lightRgb: '254,243,199', lightShade: '#FDE68A',
      muted: '#FCD34D', extraDark: '#78350F', faintBg: '#FDFAF0' },

    { key: 'orange', label: 'Naranja',  color: '#EA580C', primaryRgb: '234,88,12',   shade: '#C2410C', tint: '#F97316',
      bg: '#FFF7ED', bgRgb: '255,247,237', text: '#7C2D12', textRgb: '124,45,18',
      light: '#FED7AA', lightRgb: '254,215,170', lightShade: '#FDBA74',
      muted: '#FB923C', extraDark: '#7C2D12', faintBg: '#FEF9F5' },

    { key: 'gray',    label: 'Gris',     color: '#475569', primaryRgb: '71,85,105',   shade: '#334155', tint: '#64748B',
      bg: '#F8FAFC', bgRgb: '248,250,252', text: '#0F172A', textRgb: '15,23,42',
      light: '#E2E8F0', lightRgb: '226,232,240', lightShade: '#CBD5E1',
      muted: '#94A3B8', extraDark: '#1E293B', faintBg: '#F9FAFB' },

    { key: 'pink',    label: 'Rosa',     color: '#EC4899', primaryRgb: '236,72,153',  shade: '#DB2777', tint: '#F472B6',
      bg: '#FDF2F8', bgRgb: '253,242,248', text: '#500724', textRgb: '80,7,36',
      light: '#FCE7F3', lightRgb: '252,231,243', lightShade: '#FBCFE8',
      muted: '#F9A8D4', extraDark: '#9D174D', faintBg: '#FFF8FC' },

    { key: 'fuchsia', label: 'Fucsia',   color: '#C026D3', primaryRgb: '192,38,211',  shade: '#A21CAF', tint: '#D946EF',
      bg: '#FDF4FF', bgRgb: '253,244,255', text: '#4A044E', textRgb: '74,4,78',
      light: '#FAE8FF', lightRgb: '250,232,255', lightShade: '#F5D0FE',
      muted: '#F0ABFC', extraDark: '#86198F', faintBg: '#FEF8FF' },

    { key: 'indigo',  label: 'Índigo',   color: '#4F46E5', primaryRgb: '79,70,229',   shade: '#4338CA', tint: '#6366F1',
      bg: '#EEF2FF', bgRgb: '238,242,255', text: '#1E1B4B', textRgb: '30,27,75',
      light: '#E0E7FF', lightRgb: '224,231,255', lightShade: '#C7D2FE',
      muted: '#A5B4FC', extraDark: '#312E81', faintBg: '#F5F6FF' },

    { key: 'cyan',    label: 'Cian',     color: '#0891B2', primaryRgb: '8,145,178',   shade: '#0E7490', tint: '#06B6D4',
      bg: '#ECFEFF', bgRgb: '236,254,255', text: '#164E63', textRgb: '22,78,99',
      light: '#CFFAFE', lightRgb: '207,250,254', lightShade: '#A5F3FC',
      muted: '#67E8F9', extraDark: '#155E75', faintBg: '#F4FEFF' },

    { key: 'lime',    label: 'Lima',     color: '#65A30D', primaryRgb: '101,163,13',  shade: '#4D7C0F', tint: '#84CC16',
      bg: '#F7FEE7', bgRgb: '247,254,231', text: '#1A2E05', textRgb: '26,46,5',
      light: '#ECFCCB', lightRgb: '236,252,203', lightShade: '#D9F99D',
      muted: '#A3E635', extraDark: '#365314', faintBg: '#FBFEF0' },

    { key: 'teal',    label: 'Teal',     color: '#0D9488', primaryRgb: '13,148,136',  shade: '#0F766E', tint: '#14B8A6',
      bg: '#F0FDFA', bgRgb: '240,253,250', text: '#134E4A', textRgb: '19,78,74',
      light: '#CCFBF1', lightRgb: '204,251,241', lightShade: '#99F6E4',
      muted: '#5EEAD4', extraDark: '#134E4A', faintBg: '#F5FEFA' },
  ];

  constructor() {
    this.applyTheme(this.getSavedTheme());
  }

  getSavedTheme(): ThemeKey {
    return (localStorage.getItem(this.STORAGE_KEY) as ThemeKey) || 'purple';
  }

  setTheme(key: ThemeKey) {
    localStorage.setItem(this.STORAGE_KEY, key);
    this.applyTheme(key);
  }

  private applyTheme(key: ThemeKey) {
    const t = this.themes.find(th => th.key === key);
    if (!t) return;
    const r = document.documentElement;

    // ── Ionic primary ──────────────────────────────────────────────────────
    r.style.setProperty('--ion-color-primary',              t.color);
    r.style.setProperty('--ion-color-primary-rgb',          t.primaryRgb);
    r.style.setProperty('--ion-color-primary-contrast',     '#ffffff');
    r.style.setProperty('--ion-color-primary-contrast-rgb', '255,255,255');
    r.style.setProperty('--ion-color-primary-shade',        t.shade);
    r.style.setProperty('--ion-color-primary-tint',         t.tint);

    // ── Ionic light (theme tint) ───────────────────────────────────────────
    r.style.setProperty('--ion-color-light',                t.light);
    r.style.setProperty('--ion-color-light-rgb',            t.lightRgb);
    r.style.setProperty('--ion-color-light-shade',          t.lightShade);
    r.style.setProperty('--ion-color-light-tint',           t.bg);
    r.style.setProperty('--ion-color-light-contrast',       t.text);
    r.style.setProperty('--ion-color-light-contrast-rgb',   t.textRgb);

    // ── App-wide ───────────────────────────────────────────────────────────
    r.style.setProperty('--ion-background-color',           t.bg);
    r.style.setProperty('--ion-background-color-rgb',       t.bgRgb);
    r.style.setProperty('--ion-text-color',                 t.text);
    r.style.setProperty('--ion-text-color-rgb',             t.textRgb);
    r.style.setProperty('--ion-toolbar-background',         t.color);
    r.style.setProperty('--ion-tab-bar-border-color',       t.light);

    // ── Custom app tokens ──────────────────────────────────────────────────
    r.style.setProperty('--app-primary-muted',      t.muted);
    r.style.setProperty('--app-primary-extra-dark', t.extraDark);
    r.style.setProperty('--app-faint-bg',           t.faintBg);

    // ── Legacy if- tokens ──────────────────────────────────────────────────
    r.style.setProperty('--if-primary',          t.color);
    r.style.setProperty('--if-primary-light',    t.light);
    r.style.setProperty('--if-primary-dark',     t.shade);
    r.style.setProperty('--if-card-shadow',
      `0 1px 3px rgba(${t.primaryRgb},0.06), 0 4px 16px rgba(${t.primaryRgb},0.08)`);
    r.style.setProperty('--if-card-shadow-hover',
      `0 8px 32px rgba(${t.primaryRgb},0.16)`);
    r.style.setProperty('--if-sidebar-bg',
      `linear-gradient(160deg, ${t.shade} 0%, ${t.color} 60%, ${t.tint} 100%)`);
  }
}
