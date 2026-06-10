import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '../primitives/dialog';
import { cx } from '../utils/cx';

export interface GradientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  closeLabel?: string;
  children: ReactNode;
  footer?: ReactNode;
  headerExtra?: ReactNode;
  beforeContent?: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function GradientDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  icon,
  closeLabel = 'Close',
  children,
  footer,
  headerExtra,
  beforeContent,
  className,
  contentClassName,
}: GradientDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideCloseButton
        closeLabel={closeLabel}
        className={cx(
          'flex max-h-[90dvh] min-w-0 max-w-2xl w-full flex-col gap-0 overflow-hidden rounded-2xl border-0 p-0 sm:max-w-2xl max-sm:rounded-b-none',
          className,
        )}
        aria-describedby={subtitle ? undefined : undefined}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        {subtitle ? <DialogDescription className="sr-only">{subtitle}</DialogDescription> : null}

        <div className="shrink-0 bg-gradient-to-r from-(--brand-gradient-from) to-(--brand-gradient-to) px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              {icon ? (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  {icon}
                </div>
              ) : null}
              <div className="min-w-0">
                <p className="text-base font-semibold text-white sm:text-xl">{title}</p>
                {subtitle ? <p className="text-sm text-white/80">{subtitle}</p> : null}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg p-2 text-white/80 transition-colors outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-white"
              aria-label={closeLabel}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {headerExtra}
        </div>

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
          {beforeContent ? <div className="shrink-0">{beforeContent}</div> : null}
          <div className={cx('px-4 py-4 sm:px-6 sm:py-8', contentClassName)}>{children}</div>
        </div>

        {footer ? (
          <div className="shrink-0 border-t border-border-muted bg-bg-subtle px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] sm:px-6">
            {footer}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
