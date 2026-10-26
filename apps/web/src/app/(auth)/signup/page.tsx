"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { AuthBrand } from "../_components/AuthBrand";
import { AuthField } from "../_components/AuthField";

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

        router.push("/profile-picker");
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
      <AuthBrand />

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
              <AuthField
                id="su-email"
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(v) => { setEmail(v); setError(""); }}
              />

              <AuthField
                id="su-password"
                label="Password"
                type="password"
                autoComplete="new-password"
                placeholder="Choose a strong password"
                value={password}
                onChange={(v) => { setPassword(v); setError(""); }}
              >
                <PasswordStrength password={password} />
              </AuthField>

              <AuthField
                id="su-confirm"
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(v) => { setConfirmPassword(v); setError(""); }}
              />

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
              <AuthField
                id="su-family-name"
                label={
                  <>
                    Family name{" "}
                    <span className="normal-case text-ink-soft font-semibold tracking-normal">
                      · optional
                    </span>
                  </>
                }
                type="text"
                autoComplete="family-name"
                placeholder="e.g. The Rivera Family"
                value={familyName}
                onChange={setFamilyName}
              >
                <p className="font-body text-[12px] text-ink-soft">
                  Shown to your kids on the app. You can change it later.
                </p>
              </AuthField>

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
