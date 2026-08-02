import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { CabinetSheet } from '../layouts/cabinet/CabinetSheet';
import { Button } from '../primitives/button';

const meta: Meta<typeof CabinetSheet> = {
  title: 'Layouts/Cabinet/CabinetSheet',
  component: CabinetSheet,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof CabinetSheet>;

function CabinetSheetDemo({ size }: { size?: 'sm' | 'md' | 'lg' }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open cabinet sheet</Button>
      <CabinetSheet
        open={open}
        onOpenChange={setOpen}
        title="Create payment"
        description="Send USDT to a recipient on Polygon."
        closeLabel="Close"
        size={size}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="gradient">Continue</Button>
          </div>
        }
      >
        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Amount</dt>
            <dd className="font-medium text-foreground">250.00 USDT</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Network</dt>
            <dd className="font-medium text-foreground">Polygon</dd>
          </div>
        </dl>
      </CabinetSheet>
    </>
  );
}

export const Default: Story = {
  render: () => <CabinetSheetDemo />,
};

export const Small: Story = {
  render: () => <CabinetSheetDemo size="sm" />,
};

export const Large: Story = {
  render: () => <CabinetSheetDemo size="lg" />,
};
