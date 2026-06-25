"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const posthog = usePostHog();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (!password) { setError("Please enter your password."); return; }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError(
          authError.message === "Invalid login credentials"
            ? "Incorrect email or password. Please try again."
            : authError.message
        );
        return;
      }

      posthog?.capture("parent_signed_in");
      router.push("/parent/home");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Brand */}
      <div className="flex flex-col items-center mb-8">
        <span className="text-5xl mb-3">🪙</span>
        <h1 className="font-display font-bold text-3xl text-ink tracking-tight">
          Earnie
        </h1>
      </div>

      {/* Card */}
      <div className="bg-cream-card rounded-card shadow-card border border-line p-7">
        <h2 className="font-display font-semibold text-xl text-ink mb-1">
          Welcome back
        </h2>
        <p className="font-body text-sm text-ink-soft mb-6">
          Sign in to your family account
        </p>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-semibold text-[13px] text-ink uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              className="border-2 border-ink rounded-control px-4 py-3 font-body text-[14px] text-ink placeholder:text-ink-soft bg-white outline-none focus:border-purple transition-colors"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-display font-semibold text-[13px] text-ink uppercase tracking-wide">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="font-body text-[13px] text-purple font-semibold hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                className="w-full border-2 border-ink rounded-control px-4 py-3 pr-12 font-body text-[14px] text-ink placeholder:text-ink-soft bg-white outline-none focus:border-purple transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-lg leading-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="font-body text-[13px] text-red-600 font-semibold -mt-1">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="purple"
            size="full"
            disabled={loading}
            className="mt-1"
          >
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>

      {/* Footer */}
      <p className="font-body text-sm text-ink-soft text-center mt-5">
        New to Earnie?{" "}
        <Link
          href="/signup"
          className="text-purple font-semibold hover:underline"
        >
          Create a family account
        </Link>
      </p>
    </div>
  );
}
