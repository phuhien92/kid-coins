"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CoinIcon, InitialAvatar, Modal, Skeleton } from "@/components/ui";
import { CoinFaceAvatar } from "@/components/shared/CoinFaceAvatar";
import { cn } from "@/lib/utils";

/** Shared "stamped" shell for the picker tiles — color tokens are layered on per tile. */
const tileShellBase = cn(
  "group flex flex-col items-center gap-3 p-5 w-full text-left",
  "border-[3px] rounded-card",
  "active:translate-y-[5px] active:shadow-none",
  "transition-[transform,box-shadow] duration-75 ease-out",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
);

// ── Kid tile ───────────────────────────────────────────────────────────────

type ProfilePickerKid = {
  name: string;
  avatarColor: string;
  balance: number;
};

type ProfilePickerTileProps = {
  kid: ProfilePickerKid;
  onClick: () => void;
};

/** Stamped profile tile for the kid profile picker grid. */
export function ProfilePickerTile({ kid, onClick }: ProfilePickerTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        tileShellBase,
        "bg-cream-card border-ink shadow-[0_5px_0_var(--color-ink)]",
        "focus-visible:ring-green"
      )}
    >
      <InitialAvatar name={kid.name} avatarColor={kid.avatarColor} size="picker" />
      <div className="text-center">
        <p className="font-display font-semibold text-[17px] text-ink leading-snug truncate max-w-[120px]">
          {kid.name}
        </p>
        <div className="flex items-center justify-center gap-1.5 mt-1">
          <CoinIcon size="sm" />
          <span className="font-body font-bold text-[13px] text-ink-soft">
            {kid.balance}
          </span>
        </div>
      </div>
    </button>
  );
}

export function ProfilePickerTileSkeleton({ className }: { className?: string }) {
  return (
    <Card
      padding="md"
      className={cn("flex flex-col items-center gap-3 border-ink/10 animate-pulse", className)}
    >
      <Skeleton.Circle size="lg" className="w-[76px] h-[76px]" />
      <div className="flex flex-col items-center gap-2 w-full">
        <Skeleton.Block className="h-4 w-16" />
        <Skeleton.Block className="h-3 w-10" />
      </div>
    </Card>
  );
}

// ── Parent tile + PIN modal ────────────────────────────────────────────────

const NUMPAD = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["clear", "0", "back"],
] as const;

type PinState = "idle" | "verifying" | "wrong";

function PinDots({ length, shaking }: { length: number; shaking: boolean }) {
  return (
    <motion.div
      className="flex gap-3"
      animate={shaking ? { x: [-10, 10, -10, 10, -6, 6, 0] } : {}}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className={cn(
            "w-[13px] h-[13px] rounded-full border-[2.5px] border-ink",
            "transition-colors duration-100"
          )}
          animate={{ scale: i < length ? 1.1 : 1 }}
          style={{ backgroundColor: i < length ? "var(--color-ink)" : "transparent" }}
        />
      ))}
    </motion.div>
  );
}

function ParentPinModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [pin, setPin] = useState("");
  const [pinState, setPinState] = useState<PinState>("idle");
  const [shaking, setShaking] = useState(false);

  const wrongTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (wrongTimerRef.current !== null) clearTimeout(wrongTimerRef.current);
    };
  }, []);

  const flagWrong = useCallback(() => {
    setPinState("wrong");
    setShaking(true);
    wrongTimerRef.current = setTimeout(() => {
      setShaking(false);
      setPin("");
      setPinState("idle");
    }, 600);
  }, []);

  const handleKey = useCallback(
    async (key: string) => {
      if (pinState === "verifying") return;

      if (key === "clear") {
        setPin("");
        setPinState("idle");
        return;
      }
      if (key === "back") {
        setPin((p) => p.slice(0, -1));
        if (pinState === "wrong") setPinState("idle");
        return;
      }
      if (pin.length >= 4) return;

      const next = pin + key;
      setPin(next);
      if (next.length < 4) return;

      setPinState("verifying");
      try {
        const res = await fetch("/api/parent/verify-pin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin: next }),
        });

        if (res.ok) {
          onSuccess();
        } else {
          flagWrong();
        }
      } catch {
        flagWrong();
      }
    },
    [pin, pinState, onSuccess, flagWrong]
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (/^\d$/.test(e.key)) handleKey(e.key);
      else if (e.key === "Backspace") handleKey("back");
      else if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey, onClose]);

  return (
    <div className="p-7 flex flex-col items-center gap-5">
      <Modal.Close />

      <div className="flex flex-col items-center gap-2.5 mt-1">
        <CoinFaceAvatar />
        <div className="text-center">
          <Modal.Title className="text-[22px]">Parent access</Modal.Title>
          <p className="font-body text-[14px] text-ink-soft mt-0.5">Enter your 4-digit PIN</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <PinDots length={pin.length} shaking={shaking} />
        <motion.p
          className="font-body font-bold text-[13px] text-red-600 h-4"
          animate={{ opacity: pinState === "wrong" ? 1 : 0 }}
          transition={{ duration: 0.15 }}
          aria-live="polite"
        >
          Wrong PIN — try again
        </motion.p>
      </div>

      <div className="flex flex-col gap-2 w-full">
        {NUMPAD.map((row, ri) => (
          <div key={ri} className="flex gap-2">
            {row.map((key) => {
              const isAction = key === "clear" || key === "back";
              return (
                <button
                  key={key}
                  onClick={() => handleKey(key)}
                  disabled={pinState === "verifying"}
                  aria-label={key === "clear" ? "Clear" : key === "back" ? "Backspace" : key}
                  className={cn(
                    "flex-1 h-[54px] rounded-[14px] border-[2.5px] border-ink",
                    "font-display font-semibold text-ink",
                    "shadow-[0_3px_0_var(--color-ink)]",
                    "active:translate-y-[3px] active:shadow-none",
                    "transition-[transform,box-shadow] duration-75 ease-out",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple focus-visible:ring-offset-1",
                    "disabled:opacity-40 disabled:cursor-not-allowed",
                    isAction
                      ? "bg-cream text-[16px] text-ink-soft"
                      : "bg-cream-card text-[22px]"
                  )}
                >
                  {key === "clear" ? "✕" : key === "back" ? "⌫" : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {pinState === "verifying" && (
        <p className="font-body text-[13px] text-ink-soft -mt-1">Checking…</p>
      )}
    </div>
  );
}

type ParentPickerTileProps = {
  /** Whether the parent has set a PIN. If false, tapping navigates directly. */
  hasPin: boolean;
};

/** Parent profile tile — first in the picker grid, PIN-guarded if a PIN is set. */
export function ParentPickerTile({ hasPin }: ParentPickerTileProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  const handleClick = () => {
    if (hasPin) {
      setModalOpen(true);
    } else {
      router.push("/parent/home");
    }
  };

  const handleSuccess = useCallback(() => {
    setModalOpen(false);
    router.push("/parent/home");
  }, [router]);

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          tileShellBase,
          "bg-purple-tint border-purple-dk shadow-[0_5px_0_var(--color-purple-dk)]",
          "focus-visible:ring-purple"
        )}
      >
        <CoinFaceAvatar />
        <div className="text-center">
          <p className="font-display font-semibold text-[17px] text-purple-dk leading-snug">
            Parent
          </p>
          <p className="font-body font-bold text-[13px] text-purple mt-0.5">
            {hasPin ? "🔐 PIN required" : "Dashboard"}
          </p>
        </div>
      </button>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} width="sm">
        <ParentPinModal
          onClose={() => setModalOpen(false)}
          onSuccess={handleSuccess}
        />
      </Modal>
    </>
  );
}
