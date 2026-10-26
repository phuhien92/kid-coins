"use client";

const FIELD_INPUT_CLASS =
  "w-full border-2 border-edge rounded-control px-4 py-3 font-body text-sm text-fg placeholder:text-fg-muted bg-surface outline-none focus-visible:border-focus transition-colors";

const FIELD_LABEL_CLASS =
  "font-display font-extrabold text-sm text-fg uppercase tracking-wide";

type ParentFormFieldProps = {
  id: string;
  label: string;
  type?: "text" | "number" | "date";
  min?: number;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  disabled?: boolean;
};

export function ParentFormField({
  id,
  label,
  type = "text",
  min,
  placeholder,
  value,
  onChange,
  hint,
  disabled = false,
}: ParentFormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={FIELD_LABEL_CLASS}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        min={min}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={FIELD_INPUT_CLASS}
      />
      {hint && (
        <p className="font-body text-xs text-fg-muted font-bold">{hint}</p>
      )}
    </div>
  );
}
