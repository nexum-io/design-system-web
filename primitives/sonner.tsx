"use client";

import { useSyncExternalStore } from "react";
import { Toaster as Sonner, ToasterProps } from "sonner";

const DARK = "dark";

/* Track the .dark class on <html> so toasts follow the app theme. */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function isDarkNow() {
  return document.documentElement.classList.contains(DARK);
}

const Toaster = ({ ...props }: ToasterProps) => {
  const isDark = useSyncExternalStore(subscribe, isDarkNow, () => false);

  return (
    <Sonner
      theme={isDark ? "dark" : "light"}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
