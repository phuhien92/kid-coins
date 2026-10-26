/** WCAG 2.1 relative luminance + contrast ratio for #RRGGBB colours. */
export function luminance(hex: string): number {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) throw new Error(`Not a #RRGGBB colour: ${hex}`);
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(m[1].slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** body = normal text (4.5:1); large = ≥24px or ≥19px bold, and UI/graphics (3:1). */
export type ContrastLevel = "body" | "large";

export const THRESHOLD: Record<ContrastLevel, number> = { body: 4.5, large: 3 };

export type ContrastPair = {
  fg: string;
  bg: string;
  level: ContrastLevel;
  use: string;
};

/**
 * Every foreground/background pairing the system promises. Add a row when a
 * new semantic pairing is introduced. The test fails if any row misses AA.
 */
export const CONTRAST_PAIRS: ContrastPair[] = [
  { fg: "--color-fg", bg: "--color-page", level: "body", use: "Body text on the page" },
  { fg: "--color-fg", bg: "--color-surface", level: "body", use: "Body text on cards" },
  { fg: "--color-fg", bg: "--color-surface-sunken", level: "body", use: "Text in wells / hover fills" },
  { fg: "--color-fg-muted", bg: "--color-page", level: "body", use: "Secondary text on the page" },
  { fg: "--color-fg-muted", bg: "--color-surface", level: "body", use: "Secondary text on cards" },
  { fg: "--color-fg-muted", bg: "--color-surface-sunken", level: "body", use: "Secondary text in wells" },
  { fg: "--color-on-action", bg: "--color-action", level: "body", use: "Primary button label" },
  { fg: "--color-on-action", bg: "--color-action-hover", level: "body", use: "Primary button label (hover)" },
  { fg: "--color-on-action", bg: "--color-action-pressed", level: "body", use: "Primary button label (pressed)" },
  { fg: "--color-on-action-secondary", bg: "--color-action-secondary", level: "body", use: "Secondary button label" },
  { fg: "--color-on-action-secondary", bg: "--color-action-secondary-hover", level: "body", use: "Secondary button label (hover)" },
  { fg: "--color-fg", bg: "--color-coin", level: "body", use: "Text on coin/streak badges" },
  { fg: "--color-success", bg: "--color-success-tint", level: "body", use: "Success message" },
  { fg: "--color-success", bg: "--color-page", level: "body", use: "Success text (e.g. +coins)" },
  { fg: "--color-warning", bg: "--color-warning-tint", level: "body", use: "Warning message" },
  { fg: "--color-error", bg: "--color-error-tint", level: "body", use: "Error message" },
  { fg: "--color-error", bg: "--color-page", level: "body", use: "Inline field error" },
  { fg: "--color-step-do-ink", bg: "--color-step-do-tint", level: "body", use: "Do label on its tint" },
  { fg: "--color-step-earn-ink", bg: "--color-step-earn-tint", level: "body", use: "Earn label on its tint" },
  { fg: "--color-step-save-ink", bg: "--color-step-save-tint", level: "body", use: "Save label on its tint" },
  { fg: "--color-step-choose-ink", bg: "--color-step-choose-tint", level: "body", use: "Choose label on its tint" },
  { fg: "--color-step-grow-ink", bg: "--color-step-grow-tint", level: "body", use: "Grow label on its tint" },
  { fg: "--color-step-do-ink", bg: "--color-page", level: "body", use: "Do label on the page" },
  { fg: "--color-step-earn-ink", bg: "--color-page", level: "body", use: "Earn label / link on the page" },
  { fg: "--color-step-save-ink", bg: "--color-page", level: "body", use: "Save label on the page" },
  { fg: "--color-step-choose-ink", bg: "--color-page", level: "body", use: "Choose label on the page" },
  { fg: "--color-step-grow-ink", bg: "--color-page", level: "body", use: "Grow label on the page" },
  { fg: "--color-fg", bg: "--color-step-do-tint", level: "body", use: "Body text on Do tiles" },
  { fg: "--color-fg", bg: "--color-step-earn-tint", level: "body", use: "Body text on Earn tiles" },
  { fg: "--color-fg", bg: "--color-step-save-tint", level: "body", use: "Body text on Save tiles" },
  { fg: "--color-fg", bg: "--color-step-choose-tint", level: "body", use: "Body text on Choose tiles" },
  { fg: "--color-fg", bg: "--color-step-grow-tint", level: "body", use: "Body text on Grow tiles" },
  { fg: "--color-fg-muted", bg: "--color-step-grow-tint", level: "body", use: "Secondary text on Grow tiles (lowest of the tints)" },
  { fg: "--color-focus", bg: "--color-page", level: "large", use: "Focus ring on the page" },
  { fg: "--color-focus", bg: "--color-surface", level: "large", use: "Focus ring on cards" },
  { fg: "--color-edge", bg: "--color-surface", level: "large", use: "Input / toggle outline on cards" },
  { fg: "--color-edge", bg: "--color-page", level: "large", use: "Input / toggle outline on the page" },
  { fg: "--color-success", bg: "--color-surface-sunken", level: "large", use: "Toggle 'on' track vs off track" },
  { fg: "--color-fg-inverse", bg: "--color-success", level: "body", use: "Check mark / thumb on success fill" },
  { fg: "--color-fg", bg: "--color-step-do", level: "large", use: "Step number on its body colour (StepBadge)" },
  { fg: "--color-fg", bg: "--color-step-earn", level: "large", use: "Step number on Earn body colour" },
  { fg: "--color-fg", bg: "--color-step-save", level: "large", use: "Step number on Save body colour" },
  { fg: "--color-fg", bg: "--color-step-choose", level: "large", use: "Step number on Choose body colour" },
  { fg: "--color-fg", bg: "--color-step-grow", level: "large", use: "Step number on Grow body colour" },
  { fg: "--color-fg", bg: "--color-mint", level: "body", use: "Avatar initial on persisted Mint" },
  { fg: "--color-fg", bg: "--color-peach", level: "body", use: "Avatar initial on persisted Peach" },
  { fg: "--color-fg", bg: "--color-lemon", level: "body", use: "Avatar initial on persisted Lemon" },
  { fg: "--color-fg", bg: "--color-coral", level: "body", use: "Avatar initial on persisted Coral" },
  { fg: "--color-fg", bg: "--color-sky", level: "body", use: "Avatar initial on persisted Sky" },
];
