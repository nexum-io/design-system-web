import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { assertRequiredSettingsSections, SettingsLayout } from '../SettingsLayout';

function TestLink({ to, children, ...props }: { to: string; children: ReactNode; 'aria-current'?: 'page' }) {
  return (
    <a href={to} {...props}>
      {children}
    </a>
  );
}

describe('SettingsLayout', () => {
  it('requires theme and language section ids', () => {
    expect(() =>
      assertRequiredSettingsSections([{ id: 'wallet', label: 'Wallet', href: '/settings/wallet' }]),
    ).toThrow(/theme/);
  });

  it('renders section navigation and children', () => {
    render(
      <SettingsLayout
        title="Settings"
        subtitle="Personalize your cabinet"
        sections={[
          { id: 'theme', label: 'Theme', href: '/settings/theme' },
          { id: 'language', label: 'Language', href: '/settings/language' },
        ]}
        linkComponent={TestLink}
        isActive={(href) => href === '/settings/theme'}
      >
        <div>Panel</div>
      </SettingsLayout>,
    );

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByText('Personalize your cabinet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Theme' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Panel')).toBeInTheDocument();
  });
});
