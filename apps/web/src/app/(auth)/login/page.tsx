"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { AuthBrand } from "../_components/AuthBrand";
import { AuthField } from "../_components/AuthField";

export default function LoginPage() {
  const router = useRouter();
  const posthog = usePostHog();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

      // Ensure a families row exists (accounts created before provisioning, or
      // signup that skipped the family insert, would otherwise 404 on /api/kids).
      await fetch("/api/families/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "My Family" }),
      });

      router.push("/profile-picker");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <AuthBrand />

      {/* Card */}
      <div className="bg-cream-card rounded-card shadow-card border border-line p-7">
        <h2 className="font-display font-semibold text-xl text-ink mb-1">
          Welcome back
        </h2>
        <p className="font-body text-sm text-ink-soft mb-6">
          Sign in to your family account
        </p>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <AuthField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(v) => { setEmail(v); setError(""); }}
          />

          <AuthField
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(v) => { setPassword(v); setError(""); }}
            labelRight={
              <Link
                href="/forgot-password"
                className="font-body text-[13px] text-purple font-semibold hover:underline"
              >
                Forgot password?
              </Link>
            }
          />

          {/* Error */}
          {error && (
            <p role="alert" className="font-body text-[13px] text-red-600 font-semibold -mt-1">
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
