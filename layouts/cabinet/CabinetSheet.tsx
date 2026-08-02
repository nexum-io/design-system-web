"use client";

import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '../../primitives/sheet';
import { cx } from '../../utils/cx';

const SIZE = { sm: 'sm:max-w-sm', md: 'sm:max-w-md', lg: 'sm:max-w-lg' } as const;

export interface CabinetSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  closeLabel: string;
  footer?: ReactNode;
  children: ReactNode;
  /** default 'md' → sm:max-w-md; 'sm' → sm:max-w-sm; 'lg' → sm:max-w-lg */
  size?: 'sm' | 'md' | 'lg';
  hideCloseButton?: boolean;
  className?: string;
  /** When true, ignore dismiss (busy signing) */
  preventDismiss?: boolean;
}

export function CabinetSheet({
  open,
  onOpenChange,
  title,
  description,
  closeLabel,
  footer,
  children,
  size = 'md',
  hideCloseButton = false,
  className,
  preventDismiss = false,
}: CabinetSheetProps) {
  function requestClose() {
    if (preventDismiss) return;
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={(next) => (next ? onOpenChange(true) : requestClose())}>
      <SheetContent
        side="right"
        hideCloseButton
        data-slot="cabinet-sheet"
        {...(description ? undefined : { 'aria-describedby': '' })}
        className={cx('w-full gap-0 border-l-0 p-0 sm:border-l', SIZE[size], className)}
      >
        <div
          data-slot="cabinet-sheet-header"
          className="shrink-0 border-b border-border-muted px-4 py-4 sm:px-6 sm:py-5"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <SheetTitle className="text-base font-semibold sm:text-lg">{title}</SheetTitle>
              {description ? (
                <SheetDescription className="text-sm text-muted-foreground">{description}</SheetDescription>
              ) : null}
            </div>
            {!hideCloseButton ? (
              <button
                type="button"
                onClick={requestClose}
                disabled={preventDismiss}
                className={cx(
                  'flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg p-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  preventDismiss
                    ? 'cursor-not-allowed text-muted-foreground/30'
                    : 'cursor-pointer text-muted-foreground hover:text-foreground',
                )}
                aria-label={closeLabel}
                aria-disabled={preventDismiss || undefined}
              >
                <X className="h-5 w-5" />
              </button>
            ) : null}
          </div>
        </div>

        <div
          data-slot="cabinet-sheet-body"
          className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 py-4 sm:px-6"
        >
          {children}
        </div>

        {footer != null ? (
          <div
            data-slot="cabinet-sheet-footer"
            className="shrink-0 border-t border-border-muted bg-bg-subtle px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] sm:px-6"
          >
            {footer}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
