# design/

The kid-coin design source: what the brand is, how the redesign is planned, and
every design token with its measured contrast. Code lives in the
[`@kid-coin/tokens`](../packages/tokens) workspace package. These docs explain it.

| File | What it holds |
|---|---|
| [brand.md](brand.md) | The brand spec: name and logo, taglines, palette, type, mascot, the five steps, the feel, and the touch/iPad rules every screen follows |
| [plan.md](plan.md) | The redesign plan: PR order, screens in order, components touched, risks, and what's deferred |
| [tokens.md](tokens.md) | Every token with its role and light value, plus the measured WCAG contrast of every promised pairing |

## How the tokens are layered

```
packages/tokens/src/
  primitives.css   tier 1: raw ramps, radii, spacing, shadows, type scale, motion (--kc-*, no utilities)
  semantic.css     tier 2: roles that point at primitives (Tailwind @theme → bg-page, text-fg, bg-action, bg-step-earn-tint…)
  components.css   tier 3: component-specific values, only where no role fits
  legacy.css       aliases: persisted avatar colours (permanent) + pre-token names (removed by the restyle)
  theme.css        entry point the app imports
```

The app imports it once, in `apps/web/src/app/globals.css`:

```css
@import "tailwindcss";
@import "@kid-coin/tokens/theme.css";
```

## How to change a token

1. **Retune a colour, radius or shadow:** change the primitive in `primitives.css`. Every role that points at it follows.
2. **Change what a role means**, for example making the focus ring a different blue: point the role in `semantic.css` at a different primitive. Don't put a raw value in a role.
3. **Add a role:** add it to `semantic.css`, add its name to `src/index.ts` (the typed export) and, if it's a text/background pairing, add a row to `CONTRAST_PAIRS` in `src/contrast.ts`.
4. Run the checks:
   ```bash
   pnpm --filter @kid-coin/tokens test     # every role resolves to a primitive + AA contrast
   pnpm --filter @kid-coin/tokens report   # prints the tables for tokens.md
   ```
5. Paste the report output into [tokens.md](tokens.md) between the `GENERATED` markers, so the recorded ratios stay true.

Never rename or delete a legacy avatar colour (`--color-mint`, `--color-coral`, …). Those strings are stored in the database.

> Dev tip: if a token change doesn't show up in `pnpm dev`, the Turbopack dev cache is stale. Delete `apps/web/.next/dev` and restart.
