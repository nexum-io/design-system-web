"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "./utils";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer w-4 h-4 shrink-0 rounded border-2 border-gray-300 transition-all outline-none",
        "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
        "data-[state=checked]:bg-brand data-[state=checked]:border-brand",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "hover:border-gray-400 data-[state=checked]:hover:bg-brand-hover",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-white"
      >
        <Check className="w-3 h-3 stroke-[3]" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };