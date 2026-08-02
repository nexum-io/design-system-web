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

export function readCabinetTheme(storage?: Storage): CabinetTheme {
  const s = store(storage);
  const raw = s?.getItem(CABINET_THEME_KEY);
  if (raw === 'light' || raw === 'dark') return raw;
  if (s) s.setItem(CABINET_THEME_KEY, 'light');
  return 'light';
}

export function writeCabinetTheme(theme: CabinetTheme, storage?: Storage): void {
  store(storage)?.setItem(CABINET_THEME_KEY, theme);
}

export function readCabinetLocale(storage?: Storage): CabinetLocale {
  const s = store(storage);
  const raw = s?.getItem(CABINET_LOCALE_KEY);
  if (raw === 'en' || raw === 'ru') return raw;
  if (s) s.setItem(CABINET_LOCALE_KEY, 'en');
  return 'en';
}

export function writeCabinetLocale(locale: CabinetLocale, storage?: Storage): void {
  store(storage)?.setItem(CABINET_LOCALE_KEY, locale);
}

export { CABINET_LOCALE_KEY, CABINET_THEME_KEY } from './types';
