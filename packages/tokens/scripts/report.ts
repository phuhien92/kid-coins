/**
 * Prints the Markdown tables for design/tokens.md: every token with its tier,
 * role and resolved light value, plus measured contrast for every promised
 * pair. Run `pnpm --filter @kid-coin/tokens report` and paste the output
 * between the GENERATED markers in design/tokens.md.
 */
import { chain, readAll, resolve, type Tier } from "../src/css.ts";
import { CONTRAST_PAIRS, THRESHOLD, contrastRatio } from "../src/contrast.ts";

const all = readAll();

const ROLES: Record<string, string> = {
  "--color-page": "Page background",
  "--color-surface": "Cards, sheets, inputs",
  "--color-surface-sunken": "Wells, empty tracks, hover fills",
  "--color-fg": "Primary text (headings, body)",
  "--color-fg-muted": "Secondary text",
  "--color-fg-inverse": "Text on navy",
  "--color-edge": "Control outlines (inputs, toggles, checkboxes)",
  "--color-line": "Decorative dividers only (never the sole boundary of a control)",
  "--color-action": "Primary action background",
  "--color-action-hover": "Primary action hover",
  "--color-action-pressed": "Primary action pressed",
  "--color-on-action": "Primary action label",
  "--color-action-secondary": "Secondary action background",
  "--color-action-secondary-hover": "Secondary action hover",
  "--color-on-action-secondary": "Secondary action label",
  "--color-focus": "Focus ring",
  "--color-success": "Success text / on-state",
  "--color-success-tint": "Success background",
  "--color-warning": "Warning text",
  "--color-warning-tint": "Warning background",
  "--color-error": "Error text",
  "--color-error-tint": "Error background",
  "--color-coin": "Coin fill (balance, badges, progress)",
  "--color-coin-hi": "Coin highlight",
  "--color-coin-lo": "Coin shade / rim",
  "--radius-control": "Inputs, small buttons, chips in rows",
  "--radius-tile": "List tiles, task rows",
  "--radius-card": "Cards",
  "--radius-sheet": "Hero cards, modals",
  "--radius-pill": "Pills, buttons, avatars",
  "--shadow-card": "Resting card",
  "--shadow-lift": "Hover / raised surface, bottom nav",
  "--shadow-sheet": "Modal",
  "--shadow-action": "Glow under gold actions",
  "--font-display": "Headings, numbers, button labels",
  "--font-body": "Body, descriptions, meta",
  "--spacing-tap": "Minimum tap target (44×44)",
  "--spacing-tap-gap": "Minimum gap between adjacent targets",
  "--spacing-safe-top": "Safe-area inset (standalone PWA)",
  "--spacing-safe-right": "Safe-area inset",
  "--spacing-safe-bottom": "Safe-area inset",
  "--spacing-safe-left": "Safe-area inset",
  "--breakpoint-ipad": "iPad portrait layout (primary)",
  "--breakpoint-ipad-landscape": "iPad landscape layout (primary)",
  "--breakpoint-desktop": "Desktop fallback",
  "--ease-out-soft": "Default easing",
  "--ease-spring": "Celebration / modal entrance (overshoot)",
  "--duration-fast": "Hover, press, toggles",
  "--duration-base": "Modals, toasts",
  "--duration-slow": "Progress fills",
  "--spacing-sidebar": "Kid sidebar width",
  "--spacing-bottom-nav": "Space reserved for the phone tab bar",
};

const stepRole = (name: string) => {
  const m = /^--color-step-(do|earn|save|choose|grow)(-tint|-ink)?$/.exec(name);
  if (!m) return undefined;
  const kind = m[2] === "-tint" ? "background tint" : m[2] === "-ink" ? "text on tint/page" : "body colour (fills, art)";
  return `Step ${m[1]}: ${kind}`;
};

function role(name: string, tier: Tier): string {
  if (ROLES[name]) return ROLES[name];
  const step = stepRole(name);
  if (step) return step;
  if (/^--text-[a-z]+$/.test(name)) return `Type role: ${name.slice(7)} size`;
  if (/^--text-.+--line-height$/.test(name)) return "Line height for the size above";
  if (name.startsWith("--coin-mark-")) return `KidCoinMark paint: ${name.slice(12)}`;
  if (tier === "legacy") return "Legacy alias (see legacy.css)";
  if (tier === "primitives") return name.replace(/^--kc-/, "").replace(/-/g, " ");
  return "";
}

const esc = (v: string) => v.replace(/\|/g, "\\|");

const TITLES: Record<Tier, string> = {
  primitives: "Tier 1: primitives",
  semantic: "Tier 2: semantic roles",
  components: "Tier 3: component tokens",
  legacy: "Legacy aliases",
};

const out: string[] = [];
for (const tier of ["semantic", "components", "primitives", "legacy"] as Tier[]) {
  out.push(`### ${TITLES[tier]}`, "", "| Token | Role | Light value | Resolves via |", "|---|---|---|---|");
  for (const d of all.values()) {
    if (d.tier !== tier) continue;
    const via = chain(d.name, all).slice(1).join(" → ") || "n/a";
    const value = d.value.startsWith("env(") || d.name.startsWith("--breakpoint-") ? d.value : resolve(d.name, all);
    out.push(`| \`${d.name}\` | ${role(d.name, tier)} | \`${esc(value)}\` | ${via === "n/a" ? "n/a" : `\`${via}\``} |`);
  }
  out.push("");
}

out.push("### Measured contrast (WCAG 2.1)", "", "| Foreground | Background | Use | Ratio | Needs | Result |", "|---|---|---|---|---|---|");
for (const p of CONTRAST_PAIRS) {
  const r = contrastRatio(resolve(p.fg, all), resolve(p.bg, all));
  const need = THRESHOLD[p.level];
  out.push(`| \`${p.fg}\` | \`${p.bg}\` | ${p.use} | ${r.toFixed(2)}:1 | ${need}:1 | ${r >= need ? "✅ pass" : "❌ FAIL"} |`);
}

console.log(out.join("\n"));
