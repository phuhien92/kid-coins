"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";

type Step = "credentials" | "family";

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score =
    (password.length >= 8 ? 1 : 0) +
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/[0-9]/.test(password) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(password) ? 1 : 0);

  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "bg-red-400", "bg-coin", "bg-green-tint", "bg-green"];

  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= score ? colors[score] : "bg-line"
            }`}
          />
        ))}
      </div>
      <span className="font-body text-[11px] text-ink-soft font-semibold w-10 text-right">
        {labels[score]}
      </span>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const posthog = usePostHog();

  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function validateCredentials() {
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return false;
    }
    return true;
  }

  function handleNextStep(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (validateCredentials()) {
      setStep("family");
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const resolvedName = familyName.trim() || "My Family";

      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { family_name: resolvedName },
        },
      });

      if (authError) {
        if (authError.message.toLowerCase().includes("already registered")) {
          setError("An account with this email already exists.");
        } else {
          setError(authError.message);
        }
        setStep("credentials");
        return;
      }

      posthog?.capture("parent_signed_up", {
        has_family_name: !!familyName.trim(),
      });

      // Insert families row if session is already active (email confirmation disabled)
      if (data.session) {
        const res = await fetch("/api/families/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: resolvedName }),
        });

        if (!res.ok) {
          setError("Account created but family setup failed. Please contact support.");
          return;
        }

        router.push("/parent/home");
      } else {
        router.push(
          `/signup/verify-email?email=${encodeURIComponent(email.trim())}`
        );
      }
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
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-5">
          {(["credentials", "family"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-display font-semibold text-[12px] border-2 border-ink transition-colors ${
                  step === s
                    ? "bg-purple text-white"
                    : i < (step === "family" ? 1 : 0)
                    ? "bg-green text-white"
                    : "bg-white text-ink-soft"
                }`}
              >
                {i < (step === "family" ? 1 : 0) ? "✓" : i + 1}
              </div>
              {i < 1 && <div className="flex-1 h-[2px] w-8 bg-line" />}
            </div>
          ))}
        </div>

        {step === "credentials" ? (
          <>
            <h2 className="font-display font-semibold text-xl text-ink mb-1">
              Create your account
            </h2>
            <p className="font-body text-sm text-ink-soft mb-6">
              Start your family&apos;s coin adventure
            </p>

            <form onSubmit={handleNextStep} noValidate className="flex flex-col gap-4">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="su-email"
                  className="font-display font-semibold text-[13px] text-ink uppercase tracking-wide"
                >
                  Email
                </label>
                <input
                  id="su-email"
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
                <label
                  htmlFor="su-password"
                  className="font-display font-semibold text-[13px] text-ink uppercase tracking-wide"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="su-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Choose a strong password"
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
                <PasswordStrength password={password} />
              </div>

              {/* Confirm password */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="su-confirm"
                  className="font-display font-semibold text-[13px] text-ink uppercase tracking-wide"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="su-confirm"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                    className="w-full border-2 border-ink rounded-control px-4 py-3 pr-12 font-body text-[14px] text-ink placeholder:text-ink-soft bg-white outline-none focus:border-purple transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-lg leading-none"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <p role="alert" className="font-body text-[13px] text-red-600 font-semibold -mt-1">
                  {error}
                </p>
              )}

              <Button type="submit" variant="purple" size="full" className="mt-1">
                Continue
              </Button>
            </form>
          </>
        ) : (
          <>
            <h2 className="font-display font-semibold text-xl text-ink mb-1">
              About your family
            </h2>
            <p className="font-body text-sm text-ink-soft mb-6">
              Almost there — just one more step
            </p>

            <form onSubmit={handleSignup} noValidate className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="su-family-name"
                  className="font-display font-semibold text-[13px] text-ink uppercase tracking-wide"
                >
                  Family name{" "}
                  <span className="normal-case text-ink-soft font-semibold tracking-normal">
                    · optional
                  </span>
                </label>
                <input
                  id="su-family-name"
                  type="text"
                  autoComplete="family-name"
                  placeholder="e.g. The Rivera Family"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  className="border-2 border-ink rounded-control px-4 py-3 font-body text-[14px] text-ink placeholder:text-ink-soft bg-white outline-none focus:border-purple transition-colors"
                />
                <p className="font-body text-[12px] text-ink-soft">
                  Shown to your kids on the app. You can change it later.
                </p>
              </div>

              {/* Error */}
              {error && (
                <p role="alert" className="font-body text-[13px] text-red-600 font-semibold">
                  {error}
                </p>
              )}

              <div className="flex gap-2 mt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => { setStep("credentials"); setError(""); }}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="purple"
                  size="md"
                  disabled={loading}
                  className="flex-[2]"
                >
                  {loading ? "Creating account…" : "Create account"}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>

      {/* Footer */}
      <p className="font-body text-sm text-ink-soft text-center mt-5">
        Already have an account?{" "}
        <Link href="/login" className="text-purple font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
