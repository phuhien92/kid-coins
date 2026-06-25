"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

const RESEND_COOLDOWN = 60;

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function handleResend() {
    if (!email || resending || cooldown > 0) return;
    setResending(true);
    try {
      const supabase = createClient();
      await supabase.auth.resend({ type: "signup", email });
      setResent(true);
      setCooldown(RESEND_COOLDOWN);
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="flex flex-col items-center mb-8">
        <span className="text-5xl mb-3">🪙</span>
        <h1 className="font-display font-bold text-3xl text-ink tracking-tight">
          Earnie
        </h1>
      </div>

      <div className="bg-cream-card rounded-card shadow-card border border-line p-7 flex flex-col items-center text-center gap-4">
        <div className="text-5xl">✉️</div>

        <div>
          <h2 className="font-display font-semibold text-xl text-ink mb-1">
            Check your inbox
          </h2>
          <p className="font-body text-sm text-ink-soft">
            We sent a confirmation link to
          </p>
          {email && (
            <p className="font-display font-semibold text-[15px] text-ink mt-1 bg-lav-pale px-3 py-1.5 rounded-control inline-block">
              {email}
            </p>
          )}
        </div>

        <ol className="flex flex-col gap-2 w-full text-left">
          {[
            "Open the email from Earnie",
            "Click the confirmation link",
            "You're in — set up your first kid!",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-purple text-white font-display font-semibold text-[12px] flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="font-body text-[14px] text-ink">{step}</span>
            </li>
          ))}
        </ol>

        {resent && (
          <p className="font-body text-[13px] text-green font-semibold">
            Email resent!
          </p>
        )}

        <div className="font-body text-[13px] text-ink-soft">
          Didn&apos;t get it?{" "}
          <button
            onClick={handleResend}
            disabled={cooldown > 0 || resending}
            className="text-purple font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending ? "Sending…" : "Resend email"}
          </button>
          {cooldown > 0 && (
            <span className="ml-1 text-ink-soft">({cooldown}s)</span>
          )}
        </div>
      </div>

      <div className="flex justify-center mt-5">
        <Link
          href="/login"
          className="font-body text-sm text-ink-soft hover:text-ink transition-colors"
        >
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
