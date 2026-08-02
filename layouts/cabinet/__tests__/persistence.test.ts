// layouts/cabinet/__tests__/persistence.test.ts
import { describe, expect, it } from 'vitest';
import {
  CABINET_LOCALE_KEY,
  CABINET_THEME_KEY,
  readCabinetLocale,
  readCabinetTheme,
  writeCabinetLocale,
  writeCabinetTheme,
} from '../persistence';

function memoryStorage(initial: Record<string, string> = {}): Storage {
  const map = new Map(Object.entries(initial));
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k) => (map.has(k) ? map.get(k)! : null),
    setItem: (k, v) => void map.set(k, String(v)),
    removeItem: (k) => void map.delete(k),
    key: (i) => [...map.keys()][i] ?? null,
  };
}

describe('cabinet persistence', () => {
  it('defaults theme to light and rewrites invalid values', () => {
    const storage = memoryStorage({ [CABINET_THEME_KEY]: 'system' });
    expect(readCabinetTheme(storage)).toBe('light');
    expect(storage.getItem(CABINET_THEME_KEY)).toBe('light');
  });

  it('round-trips dark theme', () => {
    const storage = memoryStorage();
    writeCabinetTheme('dark', storage);
    expect(readCabinetTheme(storage)).toBe('dark');
  });

  it('defaults locale to en and rewrites invalid values', () => {
    const storage = memoryStorage({ [CABINET_LOCALE_KEY]: 'de' });
    expect(readCabinetLocale(storage)).toBe('en');
    expect(storage.getItem(CABINET_LOCALE_KEY)).toBe('en');
  });

  it('round-trips ru locale', () => {
    const storage = memoryStorage();
    writeCabinetLocale('ru', storage);
    expect(readCabinetLocale(storage)).toBe('ru');
  });
});
