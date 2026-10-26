/**
 * Typed names of the kid-coin semantic and component tokens. The CSS in
 * this package is the source of truth; tokens.test.ts checks that this list
 * matches it.
 */
export const colorRoles = [
  "page", "surface", "surface-sunken",
  "fg", "fg-muted", "fg-inverse",
  "edge", "line",
  "action", "action-hover", "action-pressed", "on-action",
  "action-secondary", "action-secondary-hover", "on-action-secondary",
  "focus",
  "success", "success-tint", "warning", "warning-tint", "error", "error-tint",
  "coin", "coin-hi", "coin-lo",
  "step-do", "step-do-tint", "step-do-ink",
  "step-earn", "step-earn-tint", "step-earn-ink",
  "step-save", "step-save-tint", "step-save-ink",
  "step-choose", "step-choose-tint", "step-choose-ink",
  "step-grow", "step-grow-tint", "step-grow-ink",
] as const;

export type ColorRole = (typeof colorRoles)[number];

export const radiusRoles = ["control", "tile", "card", "sheet", "pill"] as const;
export type RadiusRole = (typeof radiusRoles)[number];

export const shadowRoles = ["card", "lift", "sheet", "action"] as const;
export type ShadowRole = (typeof shadowRoles)[number];

export const breakpoints = { ipad: 768, "ipad-landscape": 1024, desktop: 1280 } as const;
export type Breakpoint = keyof typeof breakpoints;

/** Minimum touch target and spacing between targets, in CSS px. */
export const TAP_TARGET_PX = 44;
export const TAP_GAP_PX = 8;

export const steps = ["do", "earn", "save", "choose", "grow"] as const;
export type Step = (typeof steps)[number];

/** CSS variable for a colour role, for inline SVG/style use. */
export function colorVar(role: ColorRole): `var(--color-${ColorRole})` {
  return `var(--color-${role})`;
}
