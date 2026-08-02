import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CabinetTabBar } from '../CabinetTabBar';

function TestLink({
  to,
  children,
  ...props
}: {
  to: string;
  children: ReactNode;
  'aria-current'?: 'page';
}): ReactNode {
  return (
    <a href={to} {...props}>
      {children}
    </a>
  );
}

const defaultProps = {
  menuLabel: 'Menu',
  onOpenMenu: vi.fn(),
  linkComponent: TestLink,
  isActive: () => false,
};

describe('CabinetTabBar', () => {
  it('renders compact badge on tab items when provided', () => {
    render(
      <CabinetTabBar
        {...defaultProps}
        items={[
          {
            id: 'active',
            label: 'Active',
            href: '/active',
            badge: <span data-testid="tab-badge">4</span>,
          },
        ]}
      />,
    );
    expect(screen.getByTestId('tab-badge')).toHaveTextContent('4');
  });

  it('renders tabs and opens the menu', async () => {
    const onOpenMenu = vi.fn();
    render(
      <CabinetTabBar
        items={[
          { id: 'home', label: 'Home', href: '/' },
          { id: 'deals', label: 'Deals', href: '/deals' },
        ]}
        menuLabel="Menu"
        onOpenMenu={onOpenMenu}
        linkComponent={TestLink}
        isActive={(href) => href === '/deals'}
      />,
    );

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Deals' })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
    expect(onOpenMenu).toHaveBeenCalledOnce();
  });
});
