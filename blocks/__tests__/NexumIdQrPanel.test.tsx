import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NexumIdQrPanel, type NexumIdQrPanelLabels } from '../NexumIdQrPanel';

const labels: NexumIdQrPanelLabels = {
  appRequired: 'You need the Nexum ID app',
  qrAlt: 'Sign-in code',
  copyCode: 'Copy code',
  copied: 'Copied',
  creating: 'Preparing code',
  waiting: 'Waiting for phone',
  completing: 'Signing in',
  rotates: 'Code rotates automatically',
  expiresIn: (seconds) => `Expires in ${seconds}s`,
  newCode: 'New code',
  useWallet: 'Use a wallet',
};

const PAYLOAD = 'nexum-id://login?v=1&id=invite-1';

function renderPanel(props: Partial<React.ComponentProps<typeof NexumIdQrPanel>> = {}) {
  const onRestart = vi.fn();
  const onUseWallet = vi.fn();
  render(
    <NexumIdQrPanel
      phase="waiting"
      qrPayload={PAYLOAD}
      expiresAt={null}
      error={null}
      onRestart={onRestart}
      onUseWallet={onUseWallet}
      labels={labels}
      {...props}
    />,
  );
  return { onRestart, onUseWallet };
}

describe('NexumIdQrPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('shows a spinner, no QR and no copy button while creating', () => {
    renderPanel({ phase: 'creating', qrPayload: null });
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.queryByRole('button', { name: labels.copyCode })).toBeNull();
    expect(screen.getByText(labels.creating)).toBeTruthy();
  });

  it('renders the QR and waiting status', () => {
    renderPanel();
    expect(screen.getByRole('img', { name: labels.qrAlt })).toBeTruthy();
    expect(screen.getByText(labels.waiting)).toBeTruthy();
    expect(screen.getByText(labels.appRequired)).toBeTruthy();
  });

  it('counts down while waiting', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    renderPanel({ expiresAt: '2026-01-01T00:00:10Z' });
    expect(screen.getByText('Expires in 10s')).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText('Expires in 7s')).toBeTruthy();
  });

  it('shows the rotates copy for an unparsable date', () => {
    renderPanel({ expiresAt: 'not-a-date' });
    expect(screen.getByText(labels.rotates)).toBeTruthy();
    expect(screen.queryByText(/NaN/)).toBeNull();
  });

  it('clamps an expired date to zero seconds', () => {
    renderPanel({ expiresAt: new Date(Date.now() - 60_000).toISOString() });
    expect(screen.getByText('Expires in 0s')).toBeTruthy();
  });

  it('shows the error with a new-code button', () => {
    const { onRestart } = renderPanel({ error: 'x' });
    expect(screen.getByText('x')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: labels.newCode }));
    expect(onRestart).toHaveBeenCalledTimes(1);
  });

  it('copies the payload and reverts after 2s', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    renderPanel();
    vi.useFakeTimers();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: labels.copyCode }));
    });
    expect(writeText).toHaveBeenCalledWith(PAYLOAD);
    expect(screen.getByRole('button', { name: labels.copied })).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByRole('button', { name: labels.copyCode })).toBeTruthy();
  });

  it('does not show copied or throw when the clipboard rejects', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    renderPanel();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: labels.copyCode }));
    });
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: labels.copyCode })).toBeTruthy();
    expect(screen.queryByRole('button', { name: labels.copied })).toBeNull();
  });

  it('calls onUseWallet', () => {
    const { onUseWallet } = renderPanel();
    fireEvent.click(screen.getByRole('button', { name: labels.useWallet }));
    expect(onUseWallet).toHaveBeenCalledTimes(1);
  });
});
