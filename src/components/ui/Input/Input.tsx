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
    <div className={cn("flex items-center gap-[9px]", className)}>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "flex-1 min-w-0",
          "border-[2px] border-ink rounded-pill",
          "px-4 py-[11px]",
          "font-body font-[700] text-[13.5px] text-ink",
          "placeholder:text-ink-soft",
          "bg-white outline-none",
          "focus:border-purple transition-colors duration-150",
          "disabled:opacity-50"
        )}
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={disabled || !inputValue.trim()}
        aria-label="Send"
        className={cn(
          "w-[42px] h-[42px] flex-shrink-0",
          "rounded-pill border-[2.5px] border-ink",
          "bg-green text-white",
          "flex items-center justify-center",
          "text-[18px] font-bold",
          "transition-opacity duration-150",
          "disabled:opacity-40"
        )}
      >
        ↑
      </button>
    </div>
  );
}

export { Input };
