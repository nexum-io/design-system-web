"use client";

import { ChevronDown, ChevronRight, LifeBuoy, LogOut } from 'lucide-react';
import { Button } from '../../primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../primitives/dropdown-menu';
import type {
  CabinetAuth,
  CabinetBreadcrumb,
  CabinetLabels,
  CabinetLinkComponent,
  CabinetLocale,
  CabinetTheme,
} from './types';
import { LocaleSwitch } from './LocaleSwitch';
import { ThemeToggle } from './ThemeToggle';

export interface CabinetTopbarProps {
  breadcrumbs: CabinetBreadcrumb[];
  linkComponent: CabinetLinkComponent;
  theme: CabinetTheme;
  onThemeChange: (theme: CabinetTheme) => void;
  locale: CabinetLocale;
  onLocaleChange: (locale: CabinetLocale) => void;
  auth: CabinetAuth;
  labels: Pick<CabinetLabels, 'themeToLight' | 'themeToDark' | 'language'>;
}

export function CabinetTopbar({
  breadcrumbs,
  linkComponent: Link,
  theme,
  onThemeChange,
  locale,
  onLocaleChange,
  auth,
  labels,
}: CabinetTopbarProps) {
  return (
    <header
      data-slot="cabinet-topbar"
      className="flex min-h-14 items-center gap-3 border-b border-border bg-background px-3 sm:px-4"
    >
      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <ol className="flex min-w-0 items-center gap-1 text-sm">
          {breadcrumbs.map((breadcrumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <li key={breadcrumb.id} className="flex min-w-0 items-center gap-1">
                {index > 0 ? (
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                ) : null}
                {breadcrumb.href && !isLast ? (
                  <Link
                    to={breadcrumb.href}
                    className="truncate text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {breadcrumb.label}
                  </Link>
                ) : (
                  <span
                    className={isLast ? 'truncate font-medium text-foreground' : 'truncate text-muted-foreground'}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {breadcrumb.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle
          theme={theme}
          onThemeChange={onThemeChange}
          labelToLight={labels.themeToLight}
          labelToDark={labels.themeToDark}
        />
        <LocaleSwitch
          locale={locale}
          onLocaleChange={onLocaleChange}
          ariaLabel={labels.language}
        />
        {auth.status === 'signed_out' ? (
          <Button type="button" onClick={auth.onSignIn}>
            {auth.signInLabel}
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" aria-label={auth.label}>
                <span className="max-w-32 truncate">{auth.label}</span>
                <ChevronDown className="size-4" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {auth.subtitle ? (
                <>
                  <DropdownMenuLabel className="max-w-64 truncate font-normal text-muted-foreground">
                    {auth.subtitle}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </>
              ) : null}
              {auth.supportLabel && auth.onSupport ? (
                <DropdownMenuItem onSelect={auth.onSupport}>
                  <LifeBuoy aria-hidden />
                  {auth.supportLabel}
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem onSelect={auth.onSignOut}>
                <LogOut aria-hidden />
                {auth.signOutLabel}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
