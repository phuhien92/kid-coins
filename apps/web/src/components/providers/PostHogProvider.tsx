"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

const isDev = process.env.NODE_ENV === "development";

// Initialize at module scope so it's ready before any pageview fires
if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY && !isDev) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    capture_pageview: false,
    capture_pageleave: true,
    person_profiles: "identified_only",
  });
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY || isDev) return;
    if (pathname) {
      let url = window.location.origin + pathname;
      const search = searchParams.toString();
      if (search) url += "?" + search;
      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      {process.env.NEXT_PUBLIC_POSTHOG_KEY && !isDev && (
        <Suspense fallback={null}>
          <PostHogPageView />
        </Suspense>
      )}
      {children}
    </PHProvider>
  );
}
