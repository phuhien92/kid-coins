"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

function Input({
  value,
  defaultValue = "",
  onChange,
  onSubmit,
  placeholder = "Type a message…",
  disabled = false,
  className,
}: InputProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const isControlled = value !== undefined;
  const inputValue = isControlled ? value : internalValue;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!isControlled) setInternalValue(e.target.value);
    onChange?.(e.target.value);
  }

  function handleSubmit() {
    if (!inputValue.trim()) return;
    onSubmit?.(inputValue.trim());
    if (!isControlled) setInternalValue("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSubmit();
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "flex-1 min-w-0",
          "border-2 border-edge rounded-pill",
          "px-4 py-2.5",
          "font-body font-semibold text-sm text-ink",
          "placeholder:text-ink-soft",
          "bg-cream-card outline-none",
          "focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/30 transition-colors duration-150",
          "disabled:opacity-50"
        )}
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={disabled || !inputValue.trim()}
        aria-label="Send"
        className={cn(
          "size-11 flex-shrink-0",
          "rounded-pill bg-gold text-ink shadow-gold hover:bg-gold-lt",
          "flex items-center justify-center",
          "text-lg font-bold",
          "transition duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2",
          "disabled:opacity-40"
        )}
      >
        ↑
      </button>
    </div>
  );
}

export { Input };
