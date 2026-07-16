import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import * as React from 'react';
import { Circle, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '../primitives/sheet';
import { StepIndicator, type StepIndicatorItem } from './StepIndicator';
import { SigningConfirmDialog } from './SigningConfirmDialog';
import { cx } from '../utils/cx';

/**
 * DS Block: SigningSheet
 *
 * Controlled right-side sheet shell for wallet-signing / operation-confirmation
 * flows: gradient header (title/subtitle/close), a static step-indicator strip,
 * a scrollable body, and a sticky footer. `busy` blocks every close affordance
 * (visibly disabled close button, swallowed Esc/overlay dismissal) so the user
 * can't dismiss the sheet mid-signature. An optional `closeConfirm` interposes
 * a nested `SigningConfirmDialog` before a non-busy close is honored; pending
 * confirm state (and any local state a consumer keys to `[itemId, intent]`)
 * drops whenever those identity props change or the sheet closes.
 *
 * Shell only — Task A4 derives `steps`/status from `intent` + `step` + `error`
 * instead of the placeholder mapping used here.
 */

export type SigningSheetIntent = 'auth' | 'connect-only' | 'operation';
export type SigningStep =
  | 'idle'
  | 'review'
  | 'connect_wallet'
  | 'signing'
  | 'executing'
  | 'completed'
  | 'failed';

export interface SigningSheetStepConfig {
  id: Exclude<SigningStep, 'idle' | 'failed'>;
  label?: string;
  icon?: LucideIcon;
}

export interface SigningSheetLabels {
  /** aria-label of the header close button. */
  close: string;
  /** Labels for visible indicator nodes (fallback: raw id). */
  steps?: Partial<Record<SigningStep, string>>;
  /** Shown under the header while busy, e.g. "Don't close this window". */
  busyHint?: string;
}

export interface SigningSheetCloseConfirm {
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
}

export interface SigningSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intent: SigningSheetIntent;
  step: SigningStep;
  labels: SigningSheetLabels;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  /** Identity of the signed item; local UI state resets on [itemId, intent] change (wired in A3). */
  itemId?: string;
  /** Marks the active indicator node as failed (full wiring in A4). */
  error?: string | null;
  /** Blocks every close affordance: visibly disabled close button, swallowed Esc/overlay/onOpenChange. */
  busy?: boolean;
  /** When set, a non-busy close attempt opens this confirm dialog instead of closing immediately. */
  closeConfirm?: SigningSheetCloseConfirm | null;
  steps?: SigningSheetStepConfig[];
  stepIcons?: Partial<Record<SigningStep, LucideIcon>>;
  hideStepIndicator?: boolean;
  failedStep?: SigningStep;
  children: ReactNode;
  /** Sticky footer; the region renders ONLY when non-null. */
  footer?: ReactNode;
  /** Non-scrolling strip between step indicator and body. */
  beforeContent?: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function SigningSheet({
  open,
  onOpenChange,
  intent,
  step,
  labels,
  title,
  subtitle,
  icon,
  badge,
  itemId,
  error,
  busy = false,
  closeConfirm,
  steps,
  stepIcons,
  hideStepIndicator = false,
  failedStep,
  children,
  footer,
  beforeContent,
  className,
  contentClassName,
}: SigningSheetProps) {
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  // Drop any pending close-confirm when the signed item's identity changes —
  // it belonged to the previous item/intent, not this one.
  React.useEffect(() => {
    setConfirmOpen(false);
  }, [itemId, intent]);

  // Drop it on close too, so it doesn't flash open the next time the sheet opens.
  React.useEffect(() => {
    if (!open) setConfirmOpen(false);
  }, [open]);

  function requestClose() {
    if (busy) return;
    if (closeConfirm) {
      setConfirmOpen(true);
      return;
    }
    onOpenChange(false);
  }

  const stepItems: StepIndicatorItem[] = (steps ?? []).map((stepConfig) => ({
    id: stepConfig.id,
    label: stepConfig.label ?? labels.steps?.[stepConfig.id] ?? stepConfig.id,
    icon: stepConfig.icon ?? stepIcons?.[stepConfig.id] ?? Circle,
    status: 'inactive',
  }));

  return (
    <Sheet open={open} onOpenChange={(next) => (next ? onOpenChange(true) : requestClose())}>
      <SheetContent
        side="right"
        hideCloseButton
        {...(subtitle ? undefined : { "aria-describedby": "" })}
        className={cx('w-full gap-0 border-l-0 p-0 sm:max-w-md sm:border-l', className)}
      >
        <div
          data-slot="signing-sheet-header"
          className="shrink-0 bg-gradient-to-r from-(--brand-gradient-from) to-(--brand-gradient-to) px-4 py-4 sm:px-6 sm:py-5"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              {icon ? (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  {icon}
                </div>
              ) : null}
              <div className="min-w-0">
                <SheetTitle className="text-base font-semibold text-white sm:text-xl">{title}</SheetTitle>
                {subtitle ? (
                  <SheetDescription className="text-sm text-white/80">{subtitle}</SheetDescription>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              onClick={requestClose}
              disabled={busy}
              className={cx(
                'flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg p-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white',
                busy ? 'cursor-not-allowed text-white/30' : 'cursor-pointer text-white/80 hover:text-white',
              )}
              aria-label={labels.close}
              aria-disabled={busy || undefined}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {badge ? <div className="mt-2">{badge}</div> : null}
          {busy && labels.busyHint ? <p className="mt-2 text-xs text-white/80">{labels.busyHint}</p> : null}
        </div>

        {!hideStepIndicator && steps && steps.length > 0 ? (
          <div
            data-slot="signing-sheet-steps"
            className="shrink-0 border-b border-border-muted px-4 py-3 sm:px-6"
          >
            <StepIndicator compact steps={stepItems} ariaLabel={title} />
          </div>
        ) : null}

        {beforeContent ? <div className="shrink-0">{beforeContent}</div> : null}

        <div
          data-slot="signing-sheet-body"
          className={cx(
            'min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 py-4 sm:px-6',
            contentClassName,
          )}
        >
          {children}
        </div>

        {footer != null ? (
          <div
            data-slot="signing-sheet-footer"
            className="shrink-0 border-t border-border-muted bg-bg-subtle px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] sm:px-6"
          >
            {footer}
          </div>
        ) : null}
      </SheetContent>

      {closeConfirm ? (
        <SigningConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={closeConfirm.title}
          description={closeConfirm.description}
          confirmLabel={closeConfirm.confirmLabel}
          cancelLabel={closeConfirm.cancelLabel}
          destructive={closeConfirm.destructive}
          resetKey={`${intent}:${itemId ?? ''}`}
          onConfirm={() => {
            setConfirmOpen(false);
            onOpenChange(false);
          }}
        />
      ) : null}
    </Sheet>
  );
}
