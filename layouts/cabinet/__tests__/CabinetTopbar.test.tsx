import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CabinetTopbar } from '../CabinetTopbar';

function TestLink({ to, children }: { to: string; children: ReactNode }): ReactNode {
  return <a href={to}>{children}</a>;
}

const defaultProps = {
  breadcrumbs: [
    { id: 'cabinet', label: 'Cabinet', href: '/' },
    { id: 'deals', label: 'Deals' },
  ],
  linkComponent: TestLink,
  theme: 'light' as const,
  onThemeChange: vi.fn(),
  locale: 'en' as const,
  onLocaleChange: vi.fn(),
  auth: {
    status: 'signed_out' as const,
    signInLabel: 'Sign In',
    onSignIn: vi.fn(),
  },
  labels: {
    themeToLight: 'Use light theme',
    themeToDark: 'Use dark theme',
    language: 'Language',
  },
};

describe('CabinetTopbar', () => {
  it('renders breadcrumbs, theme, locale, and sign in without extra controls', async () => {
    const onSignIn = vi.fn();
    render(<CabinetTopbar {...defaultProps} auth={{ ...defaultProps.auth, onSignIn }} />);

    expect(screen.getByRole('link', { name: 'Cabinet' })).toHaveAttribute('href', '/');
    expect(screen.getByText('Deals')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Use dark theme' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Language' })).toBeInTheDocument();
    expect(screen.queryByText(/organization|search|notification|menu/i)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    expect(onSignIn).toHaveBeenCalledOnce();
  });

  it('shows signed-in account menu with sign out action', async () => {
    const onSignOut = vi.fn();
    render(
      <CabinetTopbar
        {...defaultProps}
        auth={{
          status: 'signed_in',
          label: 'Alex',
          subtitle: 'alex@example.com',
          signOutLabel: 'Sign Out',
          onSignOut,
        }}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Alex' }));
    expect(screen.getByText('alex@example.com')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Sign Out' }));
    expect(onSignOut).toHaveBeenCalledOnce();
  });

  it('shows Support menu item before Sign out when supportLabel and onSupport are set', async () => {
    const onSupport = vi.fn();
    render(
      <CabinetTopbar
        {...defaultProps}
        auth={{
          status: 'signed_in',
          label: 'Alex',
          signOutLabel: 'Sign Out',
          onSignOut: vi.fn(),
          supportLabel: 'Support',
          onSupport,
        }}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Alex' }));
    const items = screen.getAllByRole('menuitem');
    expect(items.map((item) => item.textContent)).toEqual(['Support', 'Sign Out']);

    await userEvent.click(screen.getByRole('menuitem', { name: 'Support' }));
    expect(onSupport).toHaveBeenCalledOnce();
  });

  it('hides locale switch when showLocaleSwitch is false', () => {
    render(<CabinetTopbar {...defaultProps} showLocaleSwitch={false} />);

    expect(screen.queryByRole('group', { name: 'Language' })).not.toBeInTheDocument();
  });

  it('omits the Support menu item when support props are not provided', async () => {
    render(
      <CabinetTopbar
        {...defaultProps}
        auth={{
          status: 'signed_in',
          label: 'Alex',
          signOutLabel: 'Sign Out',
          onSignOut: vi.fn(),
        }}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Alex' }));
    expect(screen.getAllByRole('menuitem')).toHaveLength(1);
    expect(screen.queryByRole('menuitem', { name: 'Support' })).not.toBeInTheDocument();
  });
});
