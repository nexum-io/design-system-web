import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { IconBox, type IconBoxVariant } from "../components/IconBox";
import { StatusBadge } from "../components/StatusBadge";
import { cx } from "../utils/cx";

export interface AuthChoiceRowProps {
  disabled?: boolean;
  onClick: () => void;
  icon: ReactNode;
  iconVariant?: IconBoxVariant;
  title: string;
  hint: string;
  badge?: string;
  /** Recommended path: brand-tinted row. */
  featured?: boolean;
}

/** Full-width choice row for the signing sheet; the chevron signals a next step. */
export function AuthChoiceRow({
  disabled,
  onClick,
  icon,
  iconVariant = "neutral",
  title,
  hint,
  badge,
  featured = false,
}: AuthChoiceRowProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "flex w-full cursor-pointer items-start gap-3 rounded-xl border p-4 text-left transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-60",
        featured
          ? "border-brand/40 bg-brand-subtle/40 hover:border-brand hover:bg-brand-subtle/60"
          : "border-border-muted bg-card hover:border-border hover:bg-bg-subtle/50",
      )}
    >
      <IconBox variant={iconVariant} size="md" className="mt-0.5" aria-hidden>
        {icon}
      </IconBox>
      <span className="min-w-0 flex-1 space-y-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="ds-text-label-md text-foreground">{title}</span>
          {badge ? (
            <StatusBadge variant="brand" size="sm">
              {badge}
            </StatusBadge>
          ) : null}
        </span>
        <span className="ds-text-body-sm block leading-relaxed text-muted-foreground">{hint}</span>
      </span>
      <ChevronRight className="mt-1 size-4 shrink-0 text-fg-muted" aria-hidden />
    </button>
  );
}
