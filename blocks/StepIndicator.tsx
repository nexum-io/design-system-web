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
}

const statusClasses: Record<StepIndicatorStatus, string> = {
  completed: 'bg-brand text-white',
  active: 'bg-brand text-white ring-4 ring-brand/20',
  error: 'bg-red-500 text-white ring-4 ring-red-500/20',
  inactive: 'bg-gray-100 text-gray-400',
  upcoming: 'bg-gray-100 text-gray-400',
};

export function StepIndicator({ steps, ariaLabel, className }: StepIndicatorProps) {
  return (
    <div className={cx('flex items-center', className)} role="list" aria-label={ariaLabel}>
      {steps.map((step, index) => {
        const StepIcon = step.icon;
        const isCompleted = step.status === 'completed';
        const isError = step.status === 'error';
        return (
          <div key={step.id} className="contents">
            <div className="flex flex-col items-center" role="listitem">
              <div
                className={cx(
                  'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300',
                  statusClasses[step.status],
                )}
                aria-current={step.status === 'active' ? 'step' : undefined}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6" />
                ) : isError ? (
                  <AlertCircle className="w-6 h-6" />
                ) : (
                  <StepIcon className="w-5 h-5" />
                )}
              </div>
              <div className="mt-2 text-center hidden sm:block">
                <p
                  className={cx(
                    'text-xs font-medium whitespace-nowrap',
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
                  'h-0.5 flex-1 mx-3 transition-all duration-300',
                  isCompleted ? 'bg-brand' : 'bg-gray-200',
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
