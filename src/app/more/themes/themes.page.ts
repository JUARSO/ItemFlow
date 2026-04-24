import { Component } from '@angular/core';
import { ThemeService, ThemeKey, Theme } from '../../core/services/theme.service';

@Component({
  standalone: false,
  selector: 'app-themes',
  templateUrl: './themes.page.html',
  styleUrls: ['./themes.page.scss']
})
export class ThemesPage {
  themes: Theme[];
  activeTheme: ThemeKey;

  constructor(private themeService: ThemeService) {
    this.themes = this.themeService.themes;
    this.activeTheme = this.themeService.getSavedTheme();
  }

  ionViewWillEnter() {
    this.activeTheme = this.themeService.getSavedTheme();
  }

  get activeThemeObj(): Theme | undefined {
    return this.themes.find(t => t.key === this.activeTheme);
  }

  selectTheme(key: ThemeKey) {
    this.activeTheme = key;
    this.themeService.setTheme(key);
  }
}
