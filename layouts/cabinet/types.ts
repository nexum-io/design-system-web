import type { ComponentType, ReactNode } from 'react';

export type CabinetTheme = 'light' | 'dark';
export type CabinetLocale = 'en' | 'ru';

export const CABINET_THEME_KEY = 'nexum.cabinet.theme';
export const CABINET_LOCALE_KEY = 'nexum.cabinet.locale';

export interface CabinetNavItem {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  external?: boolean;
  /** Optional trailing badge (count, status). Omitted = no badge. */
  badge?: ReactNode;
}

export interface CabinetNavSection {
  id: string;
  label?: string;
  items: CabinetNavItem[];
}

export interface CabinetBrand {
  name: string;
  logo?: ReactNode;
}

export interface CabinetBreadcrumb {
  id: string;
  label: string;
  href?: string;
}

export interface CabinetAuthSignedOut {
  status: 'signed_out';
  signInLabel: string;
  onSignIn: () => void;
}

export interface CabinetAuthSignedIn {
  status: 'signed_in';
  label: string;
  subtitle?: string;
  signOutLabel: string;
  onSignOut: () => void;
}

export type CabinetAuth = CabinetAuthSignedOut | CabinetAuthSignedIn;

/** SPA link: apps pass react-router `Link` or `NavLink` adapter. */
export type CabinetLinkComponent = ComponentType<{
  to: string;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
  'aria-current'?: 'page' | undefined;
}>;

export interface CabinetLabels {
  collapseSidebar: string;
  expandSidebar: string;
  settings: string;
  menu: string;
  themeToLight: string;
  themeToDark: string;
  language: string;
  closeSheet: string;
}

export interface SettingsSection {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
}
