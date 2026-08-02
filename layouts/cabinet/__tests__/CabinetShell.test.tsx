import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CabinetShell } from '../CabinetShell';

function TestLink({
  to,
  children,
  ...props
}: {
  to: string;
  children: ReactNode;
  onClick?: () => void;
  'aria-current'?: 'page';
}) {
  return (
    <a href={to} {...props}>
      {children}
    </a>
  );
}

const props = {
  brand: { name: 'Nexum' },
  sections: [
    {
      id: 'main',
      label: 'Main',
      items: [{ id: 'home', label: 'Home', href: '/' }],
    },
  ],
  mobileTabItems: [{ id: 'home', label: 'Home', href: '/' }],
  settingsHref: '/settings',
  breadcrumbs: [{ id: 'cabinet', label: 'Cabinet' }],
  auth: {
    status: 'signed_out' as const,
    signInLabel: 'Sign In',
    onSignIn: vi.fn(),
  },
  labels: {
    collapseSidebar: 'Collapse sidebar',
    expandSidebar: 'Expand sidebar',
    settings: 'Settings',
    menu: 'Menu',
    themeToLight: 'Use light theme',
    themeToDark: 'Use dark theme',
    language: 'Language',
    closeSheet: 'Close navigation',
  },
  theme: 'light' as const,
  onThemeChange: vi.fn(),
  locale: 'en' as const,
  onLocaleChange: vi.fn(),
  collapsed: false,
  onCollapsedChange: vi.fn(),
  linkComponent: TestLink,
  isActive: (href: string) => href === '/',
};

describe('CabinetShell', () => {
  it('composes desktop and mobile cabinet navigation around main content', async () => {
    render(
      <CabinetShell {...props}>
        <div>Dashboard content</div>
      </CabinetShell>,
    );

    expect(screen.getByText('Nexum')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveTextContent('Dashboard content');

    await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
    expect(screen.getByRole('dialog', { name: 'Nexum' })).toBeInTheDocument();
  });
});
