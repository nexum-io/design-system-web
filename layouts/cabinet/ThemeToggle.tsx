import { Moon, Sun } from 'lucide-react';
import { Button } from '../../primitives/button';
import type { CabinetTheme } from './types';

export interface ThemeToggleProps {
  theme: CabinetTheme;
  onThemeChange: (theme: CabinetTheme) => void;
  labelToLight: string;
  labelToDark: string;
}

export function ThemeToggle({
  theme,
  onThemeChange,
  labelToLight,
  labelToDark,
}: ThemeToggleProps) {
  const isDark = theme === 'dark';
  const label = isDark ? labelToLight : labelToDark;

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={label}
      title={label}
      onClick={() => onThemeChange(isDark ? 'light' : 'dark')}
    >
      {isDark ? (
        <Sun className="size-[17px]" aria-hidden />
      ) : (
        <Moon className="size-[17px]" aria-hidden />
      )}
    </Button>
  );
}
