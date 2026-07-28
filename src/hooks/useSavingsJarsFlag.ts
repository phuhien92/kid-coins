"use client";

import { useFeatureFlagEnabled } from "posthog-js/react";

export const SAVINGS_JARS_FLAG = "savings-jars";

/**
 * Whether the savings-jars feature should be shown to this kid.
 *
 * When PostHog is configured, the flag is authoritative (defaulting to off
 * until the flag resolves). When it isn't configured — local development and
 * test — the feature is surfaced so it can be built and exercised without a
 * PostHog project.
 */
export function useSavingsJarsFlag(): boolean {
  const enabled = useFeatureFlagEnabled(SAVINGS_JARS_FLAG);
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return true;
  return enabled ?? false;
}
