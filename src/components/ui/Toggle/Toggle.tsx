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
  ring?: "green" | "purple";
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
  ring = "green",
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
        <span className="font-body font-semibold text-[15px] text-ink">
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
          "relative inline-flex w-12 h-7 rounded-pill border-[2.5px] border-ink transition-colors duration-150",
          "data-[checked]:bg-green bg-white",
          ring === "purple"
            ? "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple focus-visible:ring-offset-1"
            : "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-1"
        )}
      >
        <Switch.Thumb
          className={cn(
            "absolute top-[2px] w-5 h-5 rounded-full transition-all duration-150",
            "data-[checked]:left-[22px] data-[checked]:bg-white",
            "left-[2px] bg-ink"
          )}
        />
      </Switch.Root>
    </label>
  );
}

export { Toggle };
