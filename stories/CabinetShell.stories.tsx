import type { Meta, StoryObj } from '@storybook/react-vite';
import { Home, ReceiptText, Wallet } from 'lucide-react';
import * as React from 'react';
import { CabinetShell } from '../layouts/cabinet/CabinetShell';

const meta: Meta<typeof CabinetShell> = {
  title: 'Layouts/Cabinet/CabinetShell',
  component: CabinetShell,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof CabinetShell>;

function StoryLink({ to, children, ...props }: React.ComponentProps<'a'> & { to: string }) {
  return (
    <a href={to} {...props}>
      {children}
    </a>
  );
}

function CabinetShellDemo() {
  const [collapsed, setCollapsed] = React.useState(false);
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  const [locale, setLocale] = React.useState<'en' | 'ru'>('en');
  const sections = [
    {
      id: 'main',
      label: 'Workspace',
      items: [
        { id: 'overview', label: 'Overview', href: '#overview', icon: <Home /> },
        { id: 'payments', label: 'Payments', href: '#payments', icon: <ReceiptText /> },
        { id: 'wallet', label: 'Wallet', href: '#wallet', icon: <Wallet /> },
      ],
    },
  ];

  return (
    <CabinetShell
      brand={{ name: 'Nexum' }}
      sections={sections}
      mobileTabItems={sections[0].items.slice(0, 2)}
      settingsHref="#settings"
      breadcrumbs={[
        { id: 'cabinet', label: 'Cabinet', href: '#overview' },
        { id: 'overview', label: 'Overview' },
      ]}
      auth={{ status: 'signed_out', signInLabel: 'Sign in', onSignIn: () => undefined }}
      labels={{
        collapseSidebar: 'Collapse sidebar',
        expandSidebar: 'Expand sidebar',
        settings: 'Settings',
        menu: 'Menu',
        themeToLight: 'Use light theme',
        themeToDark: 'Use dark theme',
        language: 'Language',
        closeSheet: 'Close navigation',
      }}
      theme={theme}
      onThemeChange={setTheme}
      locale={locale}
      onLocaleChange={setLocale}
      collapsed={collapsed}
      onCollapsedChange={setCollapsed}
      linkComponent={StoryLink}
      isActive={(href) => href === '#overview'}
      orgSlot={<div className="rounded-md bg-sidebar-accent px-3 py-2 text-sm">Acme Inc.</div>}
    >
      <div className="rounded-xl border border-border bg-card p-6">
        <h1 className="text-xl font-semibold">Overview</h1>
        <p className="mt-2 text-muted-foreground">Cabinet content renders inside the shared shell.</p>
      </div>
    </CabinetShell>
  );
}

export const Default: Story = {
  render: () => <CabinetShellDemo />,
};
