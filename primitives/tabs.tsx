"use client";

/**
 * DS Tabs — headless, accessible tab control (no extra Radix dep).
 *
 * Implements the WAI-ARIA tabs pattern: a roving tabindex over the triggers,
 * Arrow/Home/End keyboard navigation, and `role=tab`/`role=tabpanel` wiring.
 * Controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue`).
 * All colors are semantic --ds-* tokens, so it flips correctly in dark mode.
 */
import * as React from "react";

import { cn } from "./utils";

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  idBase: string;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Tabs.* must be used within <Tabs>");
  return ctx;
}

interface TabsProps extends Omit<React.ComponentProps<"div">, "onChange"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

function Tabs({ value: controlled, defaultValue, onValueChange, className, children, ...props }: TabsProps) {
  const idBase = React.useId();
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "");
  const value = controlled ?? uncontrolled;

  const setValue = React.useCallback(
    (next: string) => {
      if (controlled === undefined) setUncontrolled(next);
      onValueChange?.(next);
    },
    [controlled, onValueChange],
  );

  const ctx = React.useMemo<TabsContextValue>(() => ({ value, setValue, idBase }), [value, setValue, idBase]);

  return (
    <TabsContext.Provider value={ctx}>
      <div data-slot="tabs" className={cn("flex flex-col gap-4", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="tablist"
      data-slot="tabs-list"
      className={cn("inline-flex items-center gap-1 rounded-xl bg-bg-muted p-1", className)}
      {...props}
    />
  );
}

interface TabsTriggerProps extends React.ComponentProps<"button"> {
  value: string;
}

function TabsTrigger({ value: triggerValue, className, disabled, onClick, ...props }: TabsTriggerProps) {
  const { value, setValue, idBase } = useTabsContext();
  const active = value === triggerValue;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const navKeys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!navKeys.includes(event.key)) return;
    const list = event.currentTarget.closest('[role="tablist"]');
    if (!list) return;
    const tabs = Array.from(list.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'));
    const index = tabs.indexOf(event.currentTarget);
    if (index === -1) return;
    let next: HTMLButtonElement | undefined;
    if (event.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
    else if (event.key === "ArrowLeft") next = tabs[(index - 1 + tabs.length) % tabs.length];
    else if (event.key === "Home") next = tabs[0];
    else next = tabs[tabs.length - 1];
    if (next) {
      event.preventDefault();
      next.focus();
      next.click();
    }
  };

  return (
    <button
      type="button"
      role="tab"
      id={`${idBase}-tab-${triggerValue}`}
      aria-controls={`${idBase}-panel-${triggerValue}`}
      aria-selected={active}
      tabIndex={active ? 0 : -1}
      disabled={disabled}
      data-state={active ? "active" : "inactive"}
      data-slot="tabs-trigger"
      onClick={(event) => {
        setValue(triggerValue);
        onClick?.(event);
      }}
      onKeyDown={handleKeyDown}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-all outline-none focus-visible:ring-ring focus-visible:ring-[2px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
        active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

interface TabsContentProps extends React.ComponentProps<"div"> {
  value: string;
}

function TabsContent({ value: contentValue, className, ...props }: TabsContentProps) {
  const { value, idBase } = useTabsContext();
  if (value !== contentValue) return null;
  return (
    <div
      role="tabpanel"
      id={`${idBase}-panel-${contentValue}`}
      aria-labelledby={`${idBase}-tab-${contentValue}`}
      data-slot="tabs-content"
      tabIndex={0}
      className={cn("outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
