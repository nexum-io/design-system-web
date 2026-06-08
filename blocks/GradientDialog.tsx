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
          'max-w-2xl w-full gap-0 overflow-hidden rounded-2xl border-0 p-0 sm:max-w-2xl',
          className,
        )}
        aria-describedby={subtitle ? undefined : undefined}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        {subtitle ? <DialogDescription className="sr-only">{subtitle}</DialogDescription> : null}

        <div className="bg-gradient-to-r from-brand to-[var(--ds-color-purple-500)] px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon ? (
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  {icon}
                </div>
              ) : null}
              <div>
                <p className="text-xl font-semibold text-white">{title}</p>
                {subtitle ? <p className="text-sm text-white/80">{subtitle}</p> : null}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="text-white/80 hover:text-white transition-colors p-1 focus-visible:ring-2 focus-visible:ring-white/50 rounded-lg"
              aria-label={closeLabel}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {headerExtra}
        </div>

        {beforeContent}

        <div className={cx('px-6 py-8', contentClassName)}>{children}</div>

        {footer ? (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">{footer}</div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
