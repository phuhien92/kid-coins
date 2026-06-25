"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CoinIcon, Modal } from "@/components/ui";
import { cn } from "@/lib/utils";

type Kid = {
  id: string;
  name: string;
  avatarColor: string;
  balance: number;
};

type LoadState = "loading" | "idle" | "error";
type PinState = "idle" | "verifying" | "wrong";

const NUMPAD = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["clear", "0", "back"],
] as const;

// ── Avatar circle ──────────────────────────────────────────────────────────

function KidAvatar({
  name,
  color,
  size = "lg",
}: {
  name: string;
  color: string;
  size?: "md" | "lg";
}) {
  const dim = size === "lg" ? "w-[76px] h-[76px] text-[32px] border-[3px]" : "w-[60px] h-[60px] text-[26px] border-[2.5px]";
  return (
    <div
      className={cn(
        "rounded-pill border-ink flex items-center justify-center flex-shrink-0",
        dim
      )}
      style={{ backgroundColor: color }}
      aria-hidden
    >
      <span className="font-display font-bold leading-none text-ink">
        {name[0]?.toUpperCase()}
      </span>
    </div>
  );
}

// ── Profile card ───────────────────────────────────────────────────────────

function ProfileCard({ kid, onClick }: { kid: Kid; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex flex-col items-center gap-3 p-5 w-full",
        "bg-cream-card border-[3px] border-ink rounded-card",
        "shadow-[0_5px_0_var(--color-ink)]",
        "active:translate-y-[5px] active:shadow-none",
        "transition-[transform,box-shadow] duration-75 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
      )}
    >
      <KidAvatar name={kid.name} color={kid.avatarColor} size="lg" />

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

// ── Add-kid card ───────────────────────────────────────────────────────────

function AddKidCard() {
  return (
    <Link
      href="/parent/kids"
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-5 h-full min-h-[156px]",
        "bg-cream border-[3px] border-dashed border-ink/25 rounded-card",
        "hover:border-ink/40 hover:bg-cream-card",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple focus-visible:ring-offset-2"
      )}
    >
      <div className="w-[52px] h-[52px] rounded-pill border-[2.5px] border-ink/30 flex items-center justify-center text-[24px] text-ink-soft">
        +
      </div>
      <p className="font-display font-semibold text-[14px] text-ink-soft leading-tight text-center">
        Add a kid
      </p>
    </Link>
  );
}

// ── Loading skeleton ───────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex flex-col items-center gap-3 p-5 bg-cream-card border-[3px] border-ink/10 rounded-card animate-pulse">
      <div className="w-[76px] h-[76px] rounded-pill bg-ink/8" />
      <div className="flex flex-col items-center gap-2 w-full">
        <div className="h-4 w-16 rounded-pill bg-ink/8" />
        <div className="h-3 w-10 rounded-pill bg-ink/5" />
      </div>
    </div>
  );
}

// ── PIN dot indicators ─────────────────────────────────────────────────────

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

// ── PIN modal ──────────────────────────────────────────────────────────────

function PinModal({
  kid,
  onClose,
  onSuccess,
}: {
  kid: Kid;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [pin, setPin] = useState("");
  const [pinState, setPinState] = useState<PinState>("idle");
  const [shaking, setShaking] = useState(false);

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

      // Auto-submit on 4th digit
      setPinState("verifying");
      try {
        const res = await fetch(`/api/kids/${kid.id}/verify-pin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin: next }),
        });

        if (res.ok) {
          localStorage.setItem("earnie_kid_id", kid.id);
          localStorage.setItem("earnie_kid_name", kid.name);
          onSuccess();
        } else {
          setPinState("wrong");
          setShaking(true);
          setTimeout(() => {
            setShaking(false);
            setPin("");
            setPinState("idle");
          }, 600);
        }
      } catch {
        setPinState("wrong");
        setShaking(true);
        setTimeout(() => {
          setShaking(false);
          setPin("");
          setPinState("idle");
        }, 600);
      }
    },
    [kid.id, pin, pinState, onSuccess]
  );

  // Physical keyboard support
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

      {/* Kid identity */}
      <div className="flex flex-col items-center gap-2.5 mt-1">
        <KidAvatar name={kid.name} color={kid.avatarColor} size="md" />
        <div className="text-center">
          <Modal.Title className="text-[22px]">Hi, {kid.name}!</Modal.Title>
          <p className="font-body text-[14px] text-ink-soft mt-0.5">
            Enter your 4-digit PIN
          </p>
        </div>
      </div>

      {/* PIN dots */}
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

      {/* Numpad */}
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
                  aria-label={
                    key === "clear" ? "Clear" : key === "back" ? "Backspace" : key
                  }
                  className={cn(
                    "flex-1 h-[54px] rounded-[14px] border-[2.5px] border-ink",
                    "font-display font-semibold text-ink",
                    "shadow-[0_3px_0_var(--color-ink)]",
                    "active:translate-y-[3px] active:shadow-none",
                    "transition-[transform,box-shadow] duration-75 ease-out",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-1",
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

// ── Page ───────────────────────────────────────────────────────────────────

export default function ProfilePickerPage() {
  const router = useRouter();
  const [kids, setKids] = useState<Kid[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [selectedKid, setSelectedKid] = useState<Kid | null>(null);

  useEffect(() => {
    fetch("/api/kids")
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((data) => {
        setKids(data.kids ?? []);
        setLoadState("idle");
      })
      .catch(() => setLoadState("error"));
  }, []);

  const handleSuccess = useCallback(() => {
    router.push("/kid/home");
  }, [router]);

  return (
    <div className="w-full max-w-lg">
      {/* Brand + heading */}
      <div className="text-center mb-8">
        <Link
          href="/"
          className="font-display font-bold text-[20px] text-ink-soft hover:text-ink transition-colors"
        >
          Earnie
        </Link>
        <h1 className="font-display font-bold text-[34px] text-ink mt-3 leading-tight tracking-tight">
          Who's playing?
        </h1>
        <p className="font-body text-[15px] text-ink-soft mt-1">
          Pick your profile to start earning coins
        </p>
      </div>

      {/* Loading */}
      {loadState === "loading" && (
        <div className="grid grid-cols-2 gap-4">
          {[0, 1, 2].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Error */}
      {loadState === "error" && (
        <div className="text-center py-10">
          <p className="font-body font-bold text-[15px] text-ink">
            Couldn't load profiles.
          </p>
          <button
            onClick={() => {
              setLoadState("loading");
              fetch("/api/kids")
                .then((r) => r.json())
                .then((d) => {
                  setKids(d.kids ?? []);
                  setLoadState("idle");
                })
                .catch(() => setLoadState("error"));
            }}
            className="mt-3 font-body font-bold text-[14px] text-purple hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple"
          >
            Try again
          </button>
        </div>
      )}

      {/* Grid */}
      {loadState === "idle" && (
        <div className="grid grid-cols-2 gap-4">
          {kids.map((kid) => (
            <ProfileCard
              key={kid.id}
              kid={kid}
              onClick={() => setSelectedKid(kid)}
            />
          ))}
          <AddKidCard />
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center">
        <Link
          href="/parent/home"
          className="font-body font-bold text-[13px] text-ink-soft hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple rounded"
        >
          Parent dashboard →
        </Link>
      </div>

      {/* PIN modal */}
      <Modal
        open={!!selectedKid}
        onClose={() => setSelectedKid(null)}
        width="sm"
        aria-labelledby="pin-modal-title"
      >
        {selectedKid && (
          <PinModal
            kid={selectedKid}
            onClose={() => setSelectedKid(null)}
            onSuccess={handleSuccess}
          />
        )}
      </Modal>
    </div>
  );
}
