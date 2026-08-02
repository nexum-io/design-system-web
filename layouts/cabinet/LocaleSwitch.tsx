import { cx } from '../../utils/cx';
import type { CabinetLocale } from './types';

const DEFAULT_LOCALES: CabinetLocale[] = ['en', 'ru'];

export interface LocaleSwitchProps {
  locale: CabinetLocale;
  onLocaleChange: (locale: CabinetLocale) => void;
  ariaLabel: string;
  locales?: CabinetLocale[];
}

export function LocaleSwitch({
  locale,
  onLocaleChange,
  ariaLabel,
  locales = DEFAULT_LOCALES,
}: LocaleSwitchProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="border-border bg-background inline-flex rounded-md border p-0.5 text-xs font-semibold"
    >
      {locales.map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => onLocaleChange(lng)}
          aria-pressed={locale === lng}
          className={cx(
            'rounded-sm px-2 py-1 transition',
            locale === lng
              ? 'bg-bg-muted text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
