"use client";

import * as React from "react";
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

function Toggle({
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  label,
  id,
  className,
}: ToggleProps) {
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
  const isControlled = checked !== undefined;
  const isOn = isControlled ? checked : internalChecked;
  const inputId = id ?? React.useId();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!isControlled) setInternalChecked(e.target.checked);
    onChange?.(e.target.checked);
  }

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "inline-flex items-center gap-3 cursor-pointer select-none",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      <input
        id={inputId}
        type="checkbox"
        checked={isOn}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
      />
      {/* Track */}
      <span
        aria-hidden="true"
        className={cn(
          "relative inline-block w-12 h-7 rounded-pill border-[2.5px] border-ink transition-colors duration-150",
          isOn ? "bg-green" : "bg-white"
        )}
      >
        {/* Thumb */}
        <span
          className={cn(
            "absolute top-[2px] w-5 h-5 rounded-full bg-ink transition-all duration-150",
            isOn ? "left-[22px]" : "left-[2px]",
            isOn && "bg-white"
          )}
        />
      </span>
      {label && (
        <span className="font-body font-semibold text-[15px] text-ink">
          {label}
        </span>
      )}
    </label>
  );
}

export { Toggle };
