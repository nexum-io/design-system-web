import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { IconBox, type IconBoxVariant } from '../components/IconBox';
import { Spinner } from '../components/Spinner';
import { cx } from '../utils/cx';

export type StepStatusPanelStatus = 'active' | 'completed' | 'error';

export interface StepStatusPanelProps {
  icon: LucideIcon;
  label: string;
  description: string;
  status: StepStatusPanelStatus;
  loading?: boolean;
  hint?: string;
  error?: string | null;
  actions?: ReactNode;
  className?: string;
}

const statusVariant: Record<StepStatusPanelStatus, IconBoxVariant> = {
  active: 'brand',
  completed: 'success',
  error: 'danger',
};

export function StepStatusPanel({
  icon: Icon,
  label,
  description,
  status,
  loading = false,
  hint,
  error,
  actions,
  className,
}: StepStatusPanelProps) {
  return (
    <div
      className={cx(
        'flex items-start gap-3 rounded-xl border px-4 py-3',
        status === 'error'
          ? 'border-danger/25 bg-danger-subtle/60'
          : status === 'completed'
            ? 'border-success/25 bg-success-subtle/50'
            : 'border-border-muted bg-bg-subtle/80',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <IconBox variant={statusVariant[status]} size="md" className="mt-0.5">
        {loading ? <Spinner size="sm" /> : <Icon className="w-4 h-4" />}
      </IconBox>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="mt-0.5 break-words text-xs leading-relaxed text-muted-foreground">{description}</p>
        {hint ? <p className="mt-1.5 break-words text-xs leading-relaxed text-brand">{hint}</p> : null}
        {error ? <p className="mt-1.5 break-words text-xs text-danger-fg">{error}</p> : null}
        {actions ? <div className="mt-2">{actions}</div> : null}
      </div>
    </div>
  );
}
