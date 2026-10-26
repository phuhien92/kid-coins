"use client";

import * as React from "react";
import { Switch } from "@base-ui/react/switch";
import { cn } from "@/lib/utils";

export type ToggleProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
  className?: string;
};

/**
 * Accessible toggle switch built on Base UI Switch.
 * Handles all keyboard/ARIA automatically; styling maps to design tokens.
 */
function Toggle({
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  label,
  id,
  className,
}: ToggleProps) {
  const inputId = id ?? React.useId();

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "inline-flex items-center gap-3 cursor-pointer select-none",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      {label && (
        <span className="font-body font-semibold text-base text-ink">
          {label}
        </span>
      )}

      <Switch.Root
        id={inputId}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onChange}
        disabled={disabled}
        className={cn(
          "relative inline-flex w-12 h-7 shrink-0 rounded-pill border-2 transition-colors duration-150",
          "bg-cream-deep border-edge data-[checked]:bg-mint-ink data-[checked]:border-mint-ink",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
        )}
      >
        <Switch.Thumb
          className={cn(
            "absolute top-0.5 left-0.5 size-5 rounded-pill shadow-card transition-transform duration-150",
            "bg-ink-soft data-[checked]:translate-x-5 data-[checked]:bg-cream-card"
          )}
        />
      </Switch.Root>
    </label>
  );
}

export { Toggle };
