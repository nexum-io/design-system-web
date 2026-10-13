import type { ReactNode } from "react";
import { AlertCircle, Check } from "lucide-react";
import { cx } from "../utils/cx";

export type SignStepTimelineStatus = "pending" | "active" | "completed" | "error";

export interface SignStepTimelineStep {
  id: string;
  label: string;
  status: SignStepTimelineStatus;
  description?: string;
  result?: ReactNode;
  /** Optional action slot rendered to the right of the step text (e.g. Disconnect). */
  trailing?: ReactNode;
  children?: ReactNode;
}

export interface SignStepTimelineProps {
  steps: SignStepTimelineStep[];
  ariaLabel?: string;
  className?: string;
}

const markerClass: Record<SignStepTimelineStatus, string> = {
  completed: "bg-brand text-primary-foreground shadow-sm shadow-brand/25",
  active: "border-2 border-brand bg-background text-brand",
  error: "border-2 border-danger bg-danger text-destructive-foreground shadow-sm shadow-danger/20",
  pending: "border-2 border-border-muted bg-background text-fg-subtle",
};

const labelClass: Record<SignStepTimelineStatus, string> = {
  completed: "text-sm font-semibold text-foreground",
  active: "text-base font-semibold tracking-tight text-foreground",
  error: "text-base font-semibold tracking-tight text-foreground",
  pending: "text-sm font-medium text-muted-foreground",
};

export function SignStepTimeline({ steps, ariaLabel, className }: SignStepTimelineProps) {
  return (
    <ol className={cx("flex flex-col", className)} aria-label={ariaLabel}>
      {steps.map((step, index) => {
        const showBody =
          step.status === "active" ||
          step.status === "error" ||
          (step.status === "completed" && Boolean(step.children));
        const isLast = index === steps.length - 1;
        return (
          <li key={step.id} className="relative flex gap-3.5">
            <div className="flex w-9 shrink-0 flex-col items-center pt-0.5">
              <div
                className={cx(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
                  markerClass[step.status],
                )}
                aria-current={step.status === "active" ? "step" : undefined}
              >
                {step.status === "completed" ? (
                  <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                ) : step.status === "error" ? (
                  <AlertCircle className="h-4 w-4" aria-hidden />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              {!isLast ? (
                <div
                  className={cx(
                    "my-1.5 w-0.5 flex-1 min-h-7 rounded-full",
                    step.status === "completed" ? "bg-brand" : "bg-border-muted",
                  )}
                  aria-hidden
                />
              ) : null}
            </div>
            <div className={cx("min-w-0 flex-1", isLast ? "pb-0" : "pb-6")}>
              <div className="flex items-start gap-2.5">
                <div className="min-w-0 flex-1">
                  <p className={labelClass[step.status]}>{step.label}</p>
                  {step.description ? (
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  ) : null}
                  {step.result != null ? (
                    <div
                      className={cx(
                        "mt-2 inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-xs font-medium",
                        step.status === "completed"
                          ? "bg-brand-subtle text-brand"
                          : "bg-bg-muted text-foreground",
                      )}
                    >
                      <span className="truncate">{step.result}</span>
                    </div>
                  ) : null}
                </div>
                {step.trailing != null ? (
                  <div className="shrink-0 self-start pt-0.5">{step.trailing}</div>
                ) : null}
              </div>
              {showBody && step.children ? (
                <div
                  className={cx(
                    "mt-3 rounded-2xl border p-4 sm:p-5",
                    // Error content owns its own accent; keep the shell neutral (Proton/SuperHi).
                    step.status === "error"
                      ? "border-border-muted bg-background shadow-sm"
                      : "border-border-muted bg-bg-subtle/80",
                  )}
                >
                  {step.children}
                </div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
