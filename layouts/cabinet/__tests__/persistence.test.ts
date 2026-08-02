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

  it('returns defaults when setItem throws (QuotaExceededError / private mode)', () => {
    const quotaError = new DOMException('QuotaExceededError', 'QuotaExceededError');
    const throwingStorage = memoryStorage();
    throwingStorage.setItem = () => {
      throw quotaError;
    };

    expect(() => readCabinetTheme(throwingStorage)).not.toThrow();
    expect(readCabinetTheme(throwingStorage)).toBe('light');

    expect(() => readCabinetLocale(throwingStorage)).not.toThrow();
    expect(readCabinetLocale(throwingStorage)).toBe('en');
  });

  it('write does not throw when setItem throws', () => {
    const quotaError = new DOMException('QuotaExceededError', 'QuotaExceededError');
    const throwingStorage = memoryStorage();
    throwingStorage.setItem = () => {
      throw quotaError;
    };

    expect(() => writeCabinetTheme('dark', throwingStorage)).not.toThrow();
    expect(() => writeCabinetLocale('ru', throwingStorage)).not.toThrow();
  });

  it('returns defaults when getItem throws', () => {
    const throwingStorage = memoryStorage({ [CABINET_THEME_KEY]: 'dark' });
    throwingStorage.getItem = () => {
      throw new DOMException('SecurityError');
    };

    expect(() => readCabinetTheme(throwingStorage)).not.toThrow();
    expect(readCabinetTheme(throwingStorage)).toBe('light');
    expect(() => readCabinetLocale(throwingStorage)).not.toThrow();
    expect(readCabinetLocale(throwingStorage)).toBe('en');
  });
});
