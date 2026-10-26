"use client";

import { useState } from "react";

/** Shared styling for the labeled text/password inputs used across auth forms. */
const FIELD_INPUT_CLASS =
  "w-full border-2 border-edge rounded-control px-4 py-3 font-body text-base text-fg placeholder:text-fg-muted bg-surface outline-none transition-colors focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/30";

const FIELD_LABEL_CLASS =
  "font-display font-extrabold text-sm text-fg";

type AuthFieldProps = {
  id: string;
  label: React.ReactNode;
  /** Right-aligned label addon (e.g. a "Forgot password?" link). */
  labelRight?: React.ReactNode;
  type?: "email" | "text" | "password";
  autoComplete?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  /** Content rendered below the input (e.g. a strength meter or hint). */
  children?: React.ReactNode;
};

/**
 * Labeled auth input. Password fields render an inline show/hide toggle whose
 * reveal state is managed locally.
 */
export function AuthField({
  id,
  label,
  labelRight,
  type = "text",
  autoComplete,
  placeholder,
  value,
  onChange,
  children,
}: AuthFieldProps) {
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";

  const labelEl = (
    <label htmlFor={id} className={FIELD_LABEL_CLASS}>
      {label}
    </label>
  );

  return (
    <div className="flex flex-col gap-1.5">
      {labelRight ? (
        <div className="flex items-center justify-between">
          {labelEl}
          {labelRight}
        </div>
      ) : (
        labelEl
      )}

      {isPassword ? (
        <div className="relative">
          <input
            id={id}
            type={reveal ? "text" : "password"}
            autoComplete={autoComplete}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`${FIELD_INPUT_CLASS} pr-12`}
          />
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            className="absolute right-1 top-1/2 -translate-y-1/2 flex size-tap items-center justify-center rounded-control text-lg leading-none hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            aria-label={reveal ? "Hide password" : "Show password"}
          >
            {reveal ? "🙈" : "👁️"}
          </button>
        </div>
      ) : (
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={FIELD_INPUT_CLASS}
        />
      )}

      {children}
    </div>
  );
}
