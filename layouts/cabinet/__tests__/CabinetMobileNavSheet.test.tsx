import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CabinetMobileNavSheet } from '../CabinetMobileNavSheet';

function TestLink({
  to,
  children,
  ...props
}: {
  to: string;
  children: ReactNode;
  onClick?: () => void;
  'aria-current'?: 'page';
}): ReactNode {
  return (
    <a href={to} {...props}>
      {children}
    </a>
  );
}

const defaultProps = {
  open: false,
  onOpenChange: vi.fn(),
  brand: { name: 'Nexum' },
  sections: [
    {
      id: 'main',
      label: 'Main',
      items: [{ id: 'home', label: 'Home', href: '/' }],
    },
  ],
  settingsHref: '/settings',
  settingsLabel: 'Settings',
  linkComponent: TestLink,
  isActive: (href: string) => href === '/',
  closeLabel: 'Close navigation',
};

describe('CabinetMobileNavSheet', () => {
  it('renders left navigation and closes when a link is selected', async () => {
    const onOpenChange = vi.fn();
    const { container } = render(
      <CabinetMobileNavSheet
        open
        onOpenChange={onOpenChange}
        brand={{ name: 'Nexum' }}
        sections={[
          {
            id: 'main',
            label: 'Main',
            items: [{ id: 'home', label: 'Home', href: '/' }],
          },
        ]}
        settingsHref="/settings"
        settingsLabel="Settings"
        linkComponent={TestLink}
        isActive={(href) => href === '/'}
        closeLabel="Close navigation"
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Nexum' })).toBeInTheDocument();
    expect(screen.getByText('Main')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/settings');
    expect(container.ownerDocument.querySelector('[data-side="left"]')).not.toBeNull();

    await userEvent.click(screen.getByRole('link', { name: 'Home' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders the optional organization slot', () => {
    render(
      <CabinetMobileNavSheet
        open
        onOpenChange={vi.fn()}
        brand={{ name: 'Nexum' }}
        sections={[]}
        settingsHref="/settings"
        settingsLabel="Settings"
        linkComponent={TestLink}
        isActive={() => false}
        orgSlot={<div>Acme</div>}
        closeLabel="Close navigation"
      />,
    );

    expect(screen.getByText('Acme')).toBeInTheDocument();
  });

  it('renders nav item badge', () => {
    render(
      <CabinetMobileNavSheet
        {...defaultProps}
        open
        sections={[
          {
            id: 'main',
            items: [
              {
                id: 'active',
                label: 'Active',
                href: '/active',
                badge: <span data-testid="m-badge">2</span>,
              },
            ],
          },
        ]}
      />,
    );
    expect(screen.getByTestId('m-badge')).toHaveTextContent('2');
  });
});
