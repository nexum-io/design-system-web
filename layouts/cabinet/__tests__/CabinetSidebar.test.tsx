import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CabinetSidebar } from '../CabinetSidebar';

interface TestLinkProps {
  to: string;
  children: ReactNode;
  className?: string;
  'aria-current'?: 'page';
}

function TestLink({ to, children, ...props }: TestLinkProps): ReactNode {
  return (
    <a href={to} {...props}>
      {children}
    </a>
  );
}

const defaultProps = {
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
  collapsed: false,
  onCollapsedChange: vi.fn(),
  collapseLabel: 'Collapse',
  expandLabel: 'Expand',
  linkComponent: TestLink,
  isActive: (href: string) => href === '/',
};

describe('CabinetSidebar', () => {
  it('renders section labels and settings link', () => {
    render(<CabinetSidebar {...defaultProps} />);

    expect(screen.getByText('Main')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/settings');
  });

  it('omits org region when orgSlot is not passed', () => {
    const { container } = render(<CabinetSidebar {...defaultProps} />);

    expect(container.querySelector('[data-slot="cabinet-org"]')).toBeNull();
  });

  it('renders orgSlot inside data-slot=cabinet-org when provided', () => {
    render(<CabinetSidebar {...defaultProps} orgSlot={<div>Org</div>} />);

    expect(screen.getByText('Org').closest('[data-slot="cabinet-org"]')).not.toBeNull();
  });

  it('pins settings and footer content above the collapse control', async () => {
    const onCollapsedChange = vi.fn();
    const { container } = render(
      <CabinetSidebar
        {...defaultProps}
        footerSlot={<button type="button">Reset demo</button>}
        onCollapsedChange={onCollapsedChange}
      />,
    );

    const footer = container.querySelector('[data-slot="cabinet-sidebar-footer"]');
    expect(footer).not.toBeNull();
    expect(footer?.textContent).toContain('Settings');
    expect(footer?.textContent).toContain('Reset demo');

    await userEvent.click(screen.getByRole('button', { name: 'Collapse' }));
    expect(onCollapsedChange).toHaveBeenCalledWith(true);
  });

  it('uses the expand label and hides visible text when collapsed', () => {
    render(<CabinetSidebar {...defaultProps} collapsed />);

    expect(screen.getByRole('button', { name: 'Expand' })).toBeInTheDocument();
    expect(screen.queryByText('Main')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument();
  });

  it('renders item.badge after the label when provided', () => {
    render(
      <CabinetSidebar
        {...defaultProps}
        sections={[
          {
            id: 'main',
            items: [
              {
                id: 'active',
                label: 'Active',
                href: '/active',
                badge: <span data-testid="nav-badge">3</span>,
              },
            ],
          },
        ]}
      />,
    );
    expect(screen.getByTestId('nav-badge')).toHaveTextContent('3');
  });

  it('omits badge region when badge is undefined', () => {
    const { container } = render(<CabinetSidebar {...defaultProps} />);
    expect(container.querySelector('[data-slot="cabinet-nav-badge"]')).toBeNull();
  });
});
