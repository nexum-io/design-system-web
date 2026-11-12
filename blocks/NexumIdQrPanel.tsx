import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Check, Copy, Loader2 } from 'lucide-react';
import { Button } from '../primitives/button';
import { Card } from '../components/Card';
import { QrCode } from '../components/QrCode';

export type NexumIdQrPhase = 'creating' | 'waiting' | 'completing';

export interface NexumIdQrPanelLabels {
  appRequired: string;
  qrAlt: string;
  copyCode: string;
  copied: string;
  creating: string;
  waiting: string;
  completing: string;
  rotates: string;
  expiresIn: (seconds: number) => string;
  newCode: string;
  useWallet: string;
}

export interface NexumIdQrPanelProps {
  phase: NexumIdQrPhase;
  qrPayload: string | null;
  expiresAt: string | null;
  error: string | null;
  onRestart: () => void;
  onUseWallet: () => void;
  labels: NexumIdQrPanelLabels;
}

const COPIED_RESET_MS = 2000;

function remainingSeconds(expiresAt: string | null, nowMs: number): number | null {
  if (!expiresAt) return null;
  const expiresMs = Date.parse(expiresAt);
  if (Number.isNaN(expiresMs)) return null;
  return Math.max(0, Math.ceil((expiresMs - nowMs) / 1000));
}

/**
 * Cross-device sign-in with the Nexum ID app: challenge QR, countdown, status,
 * error with a new-code action, copy-code and a wallet fallback. Presentation
 * only; the polling hook and all copy live in the host app.
 */
export function NexumIdQrPanel({
  phase,
  qrPayload,
  expiresAt,
  error,
  onRestart,
  onUseWallet,
  labels,
}: NexumIdQrPanelProps) {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | null>(null);

  const mounted = useRef(false);

  useEffect(() => {
    if (!expiresAt || phase !== 'waiting') return;
    // nowMs may be stale from an earlier phase; resync before the first tick.
    setNowMs(Date.now());
    const timer = window.setInterval(() => setNowMs(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, [expiresAt, phase]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (resetTimer.current !== null) {
        window.clearTimeout(resetTimer.current);
        resetTimer.current = null;
      }
    };
  }, []);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
    // The clipboard may resolve after unmount: no state update, no timer.
    if (!mounted.current) return;
    setCopied(true);
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => {
      resetTimer.current = null;
      setCopied(false);
    }, COPIED_RESET_MS);
  };

  const secondsLeft = remainingSeconds(expiresAt, nowMs);
  const statusLabel =
    phase === 'completing' ? labels.completing : phase === 'waiting' ? labels.waiting : labels.creating;

  return (
    <div className="space-y-4 text-left" data-slot="nexum-id-login">
      <p className="text-sm text-muted-foreground">{labels.appRequired}</p>

      <Card variant="outline" padding="sm" className="flex flex-col items-center gap-3">
        <div className="flex size-44 items-center justify-center rounded-lg bg-white p-2">
          {qrPayload ? (
            <QrCode payload={qrPayload} label={labels.qrAlt} className="size-40" />
          ) : (
            <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
          )}
        </div>
        {qrPayload ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => {
              void copy(qrPayload);
            }}
          >
            {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
            {copied ? labels.copied : labels.copyCode}
          </Button>
        ) : null}
        <p className="flex items-center gap-2 text-sm text-foreground">
          {phase === 'waiting' ? null : (
            <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden />
          )}
          {statusLabel}
        </p>
        <p className="text-center text-xs text-muted-foreground">
          {secondsLeft == null ? labels.rotates : labels.expiresIn(secondsLeft)}
        </p>
      </Card>

      {error ? (
        <div className="flex items-start gap-2 rounded-lg border border-warning/25 bg-warning-subtle px-3 py-2.5 text-xs text-warning-fg">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div className="space-y-2">
            <span>{error}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-warning/40 bg-transparent text-warning-fg hover:bg-warning-subtle"
              onClick={onRestart}
            >
              {labels.newCode}
            </Button>
          </div>
        </div>
      ) : null}

      <Button type="button" variant="ghost" size="sm" className="w-full" onClick={onUseWallet}>
        {labels.useWallet}
      </Button>
    </div>
  );
}
