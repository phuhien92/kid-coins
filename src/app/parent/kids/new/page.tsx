"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AVATAR_COLORS } from "@/lib/character";
import { cn } from "@/lib/utils";

type FormState = {
  name: string;
  color: string;
  pin: string;
  confirm: string;
};

export default function AddKidPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    name: "",
    color: AVATAR_COLORS[0].value,
    pin: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/kids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          pin: form.pin,
          avatarColor: form.color,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      router.push("/parent/kids?created=1");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-ink/10">
        <Link
          href={step === 0 ? "/parent/kids" : "#"}
          onClick={(e) => {
            if (step > 0) {
              e.preventDefault();
              setStep((s) => s - 1);
            }
          }}
          className="font-body text-ink-soft text-[14px] hover:text-ink transition-colors"
        >
          ← Back
        </Link>
        <div className="flex gap-2 mx-auto">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "w-8 h-1.5 rounded-pill",
                i <= step ? "bg-purple" : "bg-ink/15"
              )}
            />
          ))}
        </div>
        <span className="font-body text-[13px] text-ink-soft">{step + 1}/3</span>
      </div>

      <div className="flex-1 flex flex-col gap-6 p-6 max-w-sm mx-auto w-full">
        {error && (
          <p className="font-body text-[13px] text-red-600" role="alert">
            {error}
          </p>
        )}

        {step === 0 && (
          <>
            <div>
              <h1 className="font-display font-bold text-[28px] text-ink">
                What&apos;s their name?
              </h1>
              <p className="font-body text-[14px] text-ink-soft mt-1">
                This is how they&apos;ll appear in the app.
              </p>
            </div>
            <input
              autoFocus
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Emma"
              className="w-full px-4 py-3.5 bg-cream-card border-[2.5px] border-ink rounded-control font-display font-semibold text-[18px] text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2"
            />
            <StepButton onClick={() => setStep(1)} disabled={!form.name.trim()}>
              Next
            </StepButton>
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <h1 className="font-display font-bold text-[28px] text-ink">
                Pick a colour
              </h1>
              <p className="font-body text-[14px] text-ink-soft mt-1">
                This will be {form.name}&apos;s profile colour.
              </p>
            </div>
            <div className="flex justify-center">
              <div
                className="w-24 h-24 rounded-pill border-[3px] border-ink flex items-center justify-center text-[36px] font-display font-bold text-ink shadow-card"
                style={{ backgroundColor: form.color }}
              >
                {form.name[0]?.toUpperCase()}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color: c.value }))}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-card border-[2.5px] transition-colors",
                    form.color === c.value
                      ? "border-ink shadow-card bg-cream-card"
                      : "border-ink/20 bg-cream"
                  )}
                >
                  <div
                    className="w-10 h-10 rounded-pill border-[2px] border-ink/40"
                    style={{ backgroundColor: c.value }}
                  />
                  <span className="font-body text-[12px] text-ink capitalize">
                    {c.label}
                  </span>
                </button>
              ))}
            </div>
            <StepButton onClick={() => setStep(2)}>Next</StepButton>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <h1 className="font-display font-bold text-[28px] text-ink">Set a PIN</h1>
              <p className="font-body text-[14px] text-ink-soft mt-1">
                {form.name} will use this to log in.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <PinField
                id="kid-pin"
                label="4-digit PIN"
                value={form.pin}
                onChange={(pin) => setForm((f) => ({ ...f, pin }))}
              />
              <PinField
                id="kid-pin-confirm"
                label="Confirm PIN"
                value={form.confirm}
                onChange={(confirm) => setForm((f) => ({ ...f, confirm }))}
                invalid={Boolean(form.confirm) && form.confirm !== form.pin}
                error="PINs don't match"
              />
            </div>
            <StepButton
              onClick={handleSubmit}
              disabled={
                loading || form.pin.length < 4 || form.pin !== form.confirm
              }
            >
              {loading ? "Creating…" : "Create profile"}
            </StepButton>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Sub-components ──────────────────────────────────────────────── */

function StepButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full py-4 bg-purple hover:bg-purple-dk disabled:opacity-40 text-cream font-display font-bold text-[17px] rounded-control border-[2.5px] border-ink shadow-[0_4px_0_var(--color-purple-dk)] active:translate-y-[4px] active:shadow-none transition-[transform,box-shadow] duration-75"
    >
      {children}
    </button>
  );
}

function PinField({
  id,
  label,
  value,
  onChange,
  invalid = false,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="font-body font-bold text-[13px] text-ink-soft uppercase tracking-wide mb-1.5 block"
      >
        {label}
      </label>
      <input
        id={id}
        type="password"
        maxLength={4}
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        placeholder="••••"
        className={cn(
          "w-full px-4 py-3.5 bg-cream-card border-[2.5px] rounded-control font-display font-bold text-[24px] text-center tracking-[0.5em] text-ink placeholder:tracking-normal placeholder:text-[16px] focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2",
          invalid ? "border-red-500" : "border-ink"
        )}
      />
      {invalid && error && (
        <p className="font-body text-[12px] text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}
