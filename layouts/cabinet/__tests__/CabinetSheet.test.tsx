import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CabinetSheet } from '../CabinetSheet';

describe('CabinetSheet', () => {
  it('renders dialog with title, body, optional footer, and closes', async () => {
    const onOpenChange = vi.fn();
    render(
      <CabinetSheet
        open
        onOpenChange={onOpenChange}
        title="Create payment"
        closeLabel="Close"
        footer={<button type="button">Submit</button>}
      >
        <p>body</p>
      </CabinetSheet>,
    );
    expect(screen.getByRole('dialog', { name: 'Create payment' })).toBeInTheDocument();
    expect(screen.getByText('body')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not call onOpenChange when preventDismiss is true', async () => {
    const onOpenChange = vi.fn();
    render(
      <CabinetSheet open onOpenChange={onOpenChange} title="Sign" closeLabel="Close" preventDismiss>
        body
      </CabinetSheet>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
