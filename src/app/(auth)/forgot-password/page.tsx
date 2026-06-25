"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";

type State = "idle" | "sent";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<State>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: `${window.location.origin}/reset-password` }
      );
      if (authError) {
        setError(authError.message);
        return;
      }
      setState("sent");
    } finally {
      setLoading(false);
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

      <div className="bg-cream-card rounded-card shadow-card border border-line p-7">
        {state === "idle" ? (
          <>
            <h2 className="font-display font-semibold text-xl text-ink mb-1">
              Reset password
            </h2>
            <p className="font-body text-sm text-ink-soft mb-6">
              Enter your email and we&apos;ll send a reset link right away.
            </p>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="reset-email"
                  className="font-display font-semibold text-[13px] text-ink uppercase tracking-wide"
                >
                  Email
                </label>
                <input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className="border-2 border-ink rounded-control px-4 py-3 font-body text-[14px] text-ink placeholder:text-ink-soft bg-white outline-none focus:border-purple transition-colors"
                />
              </div>

              {error && (
                <p role="alert" className="font-body text-[13px] text-red-600 font-semibold -mt-1">
                  {error}
                </p>
              )}

              <Button type="submit" variant="purple" size="full" disabled={loading} className="mt-1">
                {loading ? "Sending…" : "Send reset link"}
              </Button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center text-center gap-4">
            <span className="text-4xl">✉️</span>
            <div>
              <h2 className="font-display font-semibold text-xl text-ink mb-1">
                Check your inbox
              </h2>
              <p className="font-body text-sm text-ink-soft">
                We sent a password reset link to
              </p>
              <p className="font-display font-semibold text-[15px] text-ink mt-1 bg-lav-pale px-3 py-1.5 rounded-control inline-block">
                {email}
              </p>
            </div>
          </div>
        )}
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
