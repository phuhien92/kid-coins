"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { AuthBrand } from "../../_components/AuthBrand";

const RESEND_COOLDOWN = 60;

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [resendError, setResendError] = useState("");

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function handleResend() {
    if (!email || resending || cooldown > 0) return;
    setResending(true);
    setResendError("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) {
        setResendError(error.message);
        return;
      }
      setResent(true);
      setCooldown(RESEND_COOLDOWN);
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <AuthBrand />

      <div className="bg-surface rounded-card shadow-card border border-line p-7 flex flex-col items-center text-center gap-4">
        <div className="text-5xl">✉️</div>

        <div>
          <h2 className="font-display font-extrabold text-xl text-fg mb-1">
            Check your inbox
          </h2>
          <p className="font-body text-sm text-fg-muted">
            We sent a confirmation link to
          </p>
          {email && (
            <p className="font-display font-extrabold text-base text-fg mt-1 bg-step-grow-tint px-3 py-1.5 rounded-control inline-block">
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
              <span className="w-6 h-6 rounded-full bg-action-secondary text-on-action-secondary font-display font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="font-body text-sm text-fg">{step}</span>
            </li>
          ))}
        </ol>

        {resent && (
          <p className="font-body text-sm text-success font-semibold">
            Email resent!
          </p>
        )}
        {resendError && (
          <p role="alert" className="font-body text-sm text-error font-semibold">
            {resendError}
          </p>
        )}

        <div className="font-body text-sm text-fg-muted">
          Didn&apos;t get it?{" "}
          <button
            onClick={handleResend}
            disabled={cooldown > 0 || resending}
            className="inline-flex min-h-tap items-center px-1 text-step-grow-ink font-semibold underline underline-offset-2 hover:decoration-2 focus-visible:decoration-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending ? "Sending…" : "Resend email"}
          </button>
          {cooldown > 0 && (
            <span className="ml-1 text-fg-muted">({cooldown}s)</span>
          )}
        </div>
      </div>

      <div className="flex justify-center mt-5">
        <Link
          href="/login"
          className="inline-flex min-h-tap items-center rounded-control px-2 font-body text-sm text-fg-muted hover:text-fg focus-visible:text-fg transition-colors"
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
