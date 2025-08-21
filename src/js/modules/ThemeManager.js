import { StorageUtils } from '../utils/storageUtils.js';
import { STORAGE_KEYS, THEMES } from '../utils/constants.js';

export class ThemeManager {
  constructor() {
    this.currentTheme = this.loadTheme();
    this.initializeTheme();
  }

  loadTheme() {
    return StorageUtils.get(STORAGE_KEYS.THEME, THEMES.LIGHT);
  }

  saveTheme(theme) {
    return StorageUtils.set(STORAGE_KEYS.THEME, theme);
  }

  initializeTheme() {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    this.updateThemeToggle();
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    this.saveTheme(this.currentTheme);
    this.updateThemeToggle();
    return this.currentTheme;
  }

  updateThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    if (toggle) {
      toggle.textContent = this.currentTheme === THEMES.DARK ? '☀️' : '🌙';
      toggle.setAttribute('aria-label', `Switch to ${this.currentTheme === THEMES.DARK ? 'light' : 'dark'} mode`);
    }
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  isDarkMode() {
    return this.currentTheme === THEMES.DARK;
  }
}
