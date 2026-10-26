import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

const mockUseFeatureFlagEnabled = vi.fn();
vi.mock("posthog-js/react", () => ({
  useFeatureFlagEnabled: (...args: unknown[]) => mockUseFeatureFlagEnabled(...args),
}));

import { useSavingsJarsFlag, SAVINGS_JARS_FLAG } from "./useSavingsJarsFlag";

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("useSavingsJarsFlag", () => {
  it("is on when PostHog is not configured (dev/test)", () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "");
    mockUseFeatureFlagEnabled.mockReturnValue(false);
    const { result } = renderHook(() => useSavingsJarsFlag());
    expect(result.current).toBe(true);
  });

  it("follows the flag when PostHog is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test");

    mockUseFeatureFlagEnabled.mockReturnValue(true);
    expect(renderHook(() => useSavingsJarsFlag()).result.current).toBe(true);

    mockUseFeatureFlagEnabled.mockReturnValue(false);
    expect(renderHook(() => useSavingsJarsFlag()).result.current).toBe(false);
  });

  it("defaults to off while the flag is still resolving", () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test");
    mockUseFeatureFlagEnabled.mockReturnValue(undefined);
    expect(renderHook(() => useSavingsJarsFlag()).result.current).toBe(false);
  });

  it("queries the savings-jars flag", () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test");
    mockUseFeatureFlagEnabled.mockReturnValue(true);
    renderHook(() => useSavingsJarsFlag());
    expect(mockUseFeatureFlagEnabled).toHaveBeenCalledWith(SAVINGS_JARS_FLAG);
  });
});
