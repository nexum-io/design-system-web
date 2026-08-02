import {
  CABINET_LOCALE_KEY,
  CABINET_THEME_KEY,
  type CabinetLocale,
  type CabinetTheme,
} from './types';

function store(storage?: Storage): Storage | null {
  if (storage) return storage;
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function safeGetItem(s: Storage | null, key: string): string | null {
  if (!s) return null;
  try {
    return s.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(s: Storage | null, key: string, value: string): void {
  if (!s) return;
  try {
    s.setItem(key, value);
  } catch {
    // QuotaExceededError / private-mode — fail closed without throwing
  }
}

export function readCabinetTheme(storage?: Storage): CabinetTheme {
  const s = store(storage);
  const raw = safeGetItem(s, CABINET_THEME_KEY);
  if (raw === 'light' || raw === 'dark') return raw;
  safeSetItem(s, CABINET_THEME_KEY, 'light');
  return 'light';
}

export function writeCabinetTheme(theme: CabinetTheme, storage?: Storage): void {
  safeSetItem(store(storage), CABINET_THEME_KEY, theme);
}

export function readCabinetLocale(storage?: Storage): CabinetLocale {
  const s = store(storage);
  const raw = safeGetItem(s, CABINET_LOCALE_KEY);
  if (raw === 'en' || raw === 'ru') return raw;
  safeSetItem(s, CABINET_LOCALE_KEY, 'en');
  return 'en';
}

export function writeCabinetLocale(locale: CabinetLocale, storage?: Storage): void {
  safeSetItem(store(storage), CABINET_LOCALE_KEY, locale);
}

export { CABINET_LOCALE_KEY, CABINET_THEME_KEY } from './types';
