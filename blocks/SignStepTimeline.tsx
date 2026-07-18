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
  children?: ReactNode;
}

export interface SignStepTimelineProps {
  steps: SignStepTimelineStep[];
  ariaLabel?: string;
  className?: string;
}

const markerClass: Record<SignStepTimelineStatus, string> = {
  completed: "bg-brand text-primary-foreground",
  active: "bg-brand text-primary-foreground ring-2 ring-brand/20",
  error: "bg-danger text-destructive-foreground ring-2 ring-danger/20",
  pending: "bg-bg-muted text-fg-subtle",
};

export function SignStepTimeline({ steps, ariaLabel, className }: SignStepTimelineProps) {
  return (
    <ol className={cx("flex flex-col gap-0", className)} role="list" aria-label={ariaLabel}>
      {steps.map((step, index) => {
        const showBody = step.status === "active" || step.status === "error";
        const isLast = index === steps.length - 1;
        return (
          <li key={step.id} className="relative flex gap-3" role="listitem">
            <div className="flex w-8 shrink-0 flex-col items-center">
              <div
                className={cx(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
                  markerClass[step.status],
                )}
                aria-current={step.status === "active" ? "step" : undefined}
              >
                {step.status === "completed" ? (
                  <Check className="h-4 w-4" aria-hidden />
                ) : step.status === "error" ? (
                  <AlertCircle className="h-4 w-4" aria-hidden />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              {!isLast ? (
                <div
                  className={cx(
                    "mt-1 w-0.5 flex-1 min-h-4",
                    step.status === "completed" ? "bg-brand" : "bg-bg-muted",
                  )}
                  aria-hidden
                />
              ) : null}
            </div>
            <div className={cx("min-w-0 flex-1", isLast ? "pb-0" : "pb-5")}>
              <p
                className={cx(
                  "text-sm font-medium",
                  step.status === "pending" ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {step.label}
              </p>
              {step.description ? (
                <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>
              ) : null}
              {step.result != null ? (
                <div className="mt-1 text-xs font-medium text-foreground">{step.result}</div>
              ) : null}
              {showBody && step.children ? <div className="mt-3">{step.children}</div> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
