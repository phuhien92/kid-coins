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
  const generatedId = React.useId();
  const inputId = id ?? generatedId;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "inline-flex items-center gap-3 min-h-tap min-w-tap cursor-pointer select-none",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      {label && (
        <span className="font-body font-semibold text-base text-fg">
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
          "bg-surface-sunken border-edge data-[checked]:bg-success data-[checked]:border-success",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
        )}
      >
        <Switch.Thumb
          className={cn(
            "absolute top-0.5 left-0.5 size-5 rounded-pill shadow-card transition-transform duration-150",
            "bg-fg-muted data-[checked]:translate-x-5 data-[checked]:bg-surface"
          )}
        />
      </Switch.Root>
    </label>
  );
}

export { Toggle };
