import type { LucideIcon } from 'lucide-react';
import { Check, AlertCircle } from 'lucide-react';
import { cx } from '../utils/cx';

export type StepIndicatorStatus = 'inactive' | 'active' | 'completed' | 'error' | 'upcoming';

export interface StepIndicatorItem {
  id: string;
  label: string;
  icon: LucideIcon;
  status: StepIndicatorStatus;
}

export interface StepIndicatorProps {
  steps: StepIndicatorItem[];
  ariaLabel?: string;
  className?: string;
  /** Smaller circles and tighter spacing for dense layouts (e.g. modals). */
  compact?: boolean;
}

const statusClasses: Record<StepIndicatorStatus, string> = {
  completed: 'bg-brand text-primary-foreground',
  active: 'bg-brand text-primary-foreground ring-4 ring-brand/20',
  error: 'bg-danger text-destructive-foreground ring-4 ring-danger/20',
  inactive: 'bg-bg-muted text-fg-subtle',
  upcoming: 'bg-bg-muted text-fg-subtle',
};

export function StepIndicator({ steps, ariaLabel, className, compact = false }: StepIndicatorProps) {
  return (
    <div
      className={cx('flex min-w-0 items-center overflow-x-auto', className)}
      role="list"
      aria-label={ariaLabel}
    >
      {steps.map((step, index) => {
        const StepIcon = step.icon;
        const isCompleted = step.status === 'completed';
        const isError = step.status === 'error';
        return (
          <div key={step.id} className="contents">
            <div className="flex flex-col items-center" role="listitem">
              <div
                className={cx(
                  'rounded-full flex items-center justify-center transition-all duration-300',
                  compact ? 'w-9 h-9' : 'w-12 h-12',
                  statusClasses[step.status],
                  compact && (step.status === 'active' || step.status === 'error') && 'ring-2',
                )}
                aria-current={step.status === 'active' ? 'step' : undefined}
              >
                {isCompleted ? (
                  <Check className={compact ? 'w-4 h-4' : 'w-6 h-6'} />
                ) : isError ? (
                  <AlertCircle className={compact ? 'w-4 h-4' : 'w-6 h-6'} />
                ) : (
                  <StepIcon className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
                )}
              </div>
              <div className={cx('text-center', compact ? 'mt-1.5 hidden sm:block' : 'mt-2 hidden sm:block')}>
                <p
                  className={cx(
                    'font-medium whitespace-nowrap',
                    compact ? 'text-[11px]' : 'text-xs',
                    step.status === 'active' || step.status === 'completed'
                      ? 'text-foreground'
                      : 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cx(
                  'h-0.5 flex-1 transition-all duration-300',
                  compact ? 'mx-2' : 'mx-3',
                  isCompleted ? 'bg-brand' : 'bg-bg-muted',
                )}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
