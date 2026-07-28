"use client";

import * as React from "react";
import { Modal, Button, CoinIcon } from "@/components/ui";
import type { JarType } from "@/hooks/useJars";
import { cn } from "@/lib/utils";

type Mode = "to-save" | "to-give" | "from-save";

export type JarAllocatorProps = {
  open: boolean;
  onClose: () => void;
  spend: number;
  save: number;
  onAllocate: (jarType: JarType, amount: number) => Promise<void>;
  onWithdraw: (amount: number) => Promise<void>;
};

const MODES: { id: Mode; label: string }[] = [
  { id: "to-save", label: "Into Save 🐷" },
  { id: "to-give", label: "Into Give 💝" },
  { id: "from-save", label: "Out of Save" },
];

const PRESETS = [5, 10, 25];

/**
 * Move coins between the kid's Spend balance and their Save/Give jars.
 *
 * Kid-first input: a destination picker, quick-amount chips, and a plus/minus
 * stepper — no free-text number entry. The amount is always clamped to what the
 * source bucket holds, and the server's guarded write is still the authority
 * (an over-move comes back as an error surfaced here). Built on the Base
 * UI-backed Modal, which supplies the focus trap and Escape handling.
 */
function JarAllocator({
  open,
  onClose,
  spend,
  save,
  onAllocate,
  onWithdraw,
}: JarAllocatorProps) {
  const [mode, setMode] = React.useState<Mode>("to-save");
  const [amount, setAmount] = React.useState(1);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  const max = mode === "from-save" ? save : spend;
  const clampedAmount = Math.min(amount, Math.max(0, max));
  const canSubmit = clampedAmount >= 1 && !submitting;

  // Reset to a clean state whenever the modal is (re)opened.
  React.useEffect(() => {
    if (open) {
      setMode("to-save");
      setAmount(1);
      setError("");
      setSubmitting(false);
    }
  }, [open]);

  function pickMode(next: Mode) {
    setMode(next);
    setError("");
    setAmount((a) => Math.max(1, a));
  }

  function step(delta: number) {
    setError("");
    setAmount((a) => Math.min(Math.max(1, a + delta), Math.max(1, max)));
  }

  async function handleConfirm() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      if (mode === "from-save") {
        await onWithdraw(clampedAmount);
      } else {
        await onAllocate(mode === "to-save" ? "save" : "give", clampedAmount);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Couldn't move the coins.");
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} width="sm" aria-label="Move coins between jars">
      <div className="flex flex-col gap-5">
        <h2 className="font-display font-bold text-xl text-ink">Move coins</h2>

        <div role="group" aria-label="Where to move coins" className="flex flex-wrap gap-2">
          {MODES.map((m) => (
            <Button
              key={m.id}
              type="button"
              variant="chip"
              aria-pressed={mode === m.id}
              onClick={() => pickMode(m.id)}
              className={cn(mode === m.id && "bg-green text-white")}
            >
              {m.label}
            </Button>
          ))}
        </div>

        <p className="font-body text-sm text-ink-soft">
          You can move up to{" "}
          <span className="font-bold text-ink inline-flex items-center gap-1">
            <CoinIcon size="sm" />
            {Math.max(0, max)}
          </span>
          .
        </p>

        <div className="flex items-center justify-center gap-4">
          <Button
            type="button"
            variant="ghost"
            aria-label="Fewer coins"
            disabled={clampedAmount <= 1}
            onClick={() => step(-1)}
          >
            −
          </Button>
          <span
            aria-live="polite"
            className="min-w-16 text-center font-display font-bold text-2xl text-ink inline-flex items-center justify-center gap-1.5"
          >
            <CoinIcon size="md" />
            {clampedAmount}
          </span>
          <Button
            type="button"
            variant="ghost"
            aria-label="More coins"
            disabled={clampedAmount >= Math.max(1, max)}
            onClick={() => step(1)}
          >
            +
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {PRESETS.filter((p) => p <= max).map((p) => (
            <Button
              key={p}
              type="button"
              variant="chip"
              onClick={() => {
                setError("");
                setAmount(p);
              }}
            >
              {p}
            </Button>
          ))}
          {max >= 1 ? (
            <Button
              type="button"
              variant="chip"
              onClick={() => {
                setError("");
                setAmount(max);
              }}
            >
              All
            </Button>
          ) : null}
        </div>

        {error ? (
          <p role="alert" className="font-body text-sm text-coral text-center">
            {error}
          </p>
        ) : null}

        <div className="flex gap-3">
          <Button type="button" variant="ghost" size="full" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="green"
            size="full"
            disabled={!canSubmit}
            onClick={handleConfirm}
          >
            {submitting ? "Moving…" : "Move coins"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export { JarAllocator };
