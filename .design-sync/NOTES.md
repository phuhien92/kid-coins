# Design-sync notes — kid-coins (Earnie)

## Build configuration

- **Entry**: `./src/components/ui/index.ts` — TypeScript source (no compiled `dist/`; `"noEmit": true` in tsconfig)
- **node-modules flag**: `./node_modules` (repo root) — react lives there, not in `.ds-sync/node_modules/`
- **tsconfig.types.json**: created to generate `.d.ts` files alongside sources (`rootDir: src, declarationDir: src`). The main tsconfig has `noEmit: true`, so a separate tsconfig was needed for type extraction.
- **`"types"` in package.json**: added pointing to `src/components/ui/index.d.ts` so `dts.mjs`'s `projectFor()` finds the correct entry (otherwise falls back to non-existent `index.d.ts` at repo root → 0 exports).
- **CSS from storybook**: `[CSS_FROM_STORYBOOK]` fires on every build because there's no `dist/` CSS. The converter scrapes CSS from `.design-sync/sb-reference/assets/iframe-*.css`. This is expected.
- **No preview decorators**: `.storybook/preview.ts` never registers decorators (only imports `globals.css`); `preview-decorators.js` is not produced.
- **Fonts**: Fredoka + Nunito loaded via `next/font/google` at runtime. `runtimeFontPrefixes: ["Fredoka", "Nunito"]` suppresses `[FONT_MISSING]`. Both fonts fall back to system sans-serif in preview — this is expected and not a defect.

## Component notes

- **Toast**: Owned preview at `.design-sync/previews/Toast.tsx` — bypasses framer-motion opacity:0 initial state and position:fixed. The `Hidden` story is skipped (`cfg.overrides.Toast.skip: ["ui-toast--hidden"]`) because it renders an intentionally empty root in storybook.
- **Modal**: `cardMode: "single"` — uses position:fixed which escapes grid cells. Title crops at the top of the card (fixed positioning puts panel at absolute coords, not centered within card). Accepted as `close`.
- **Avatar**: `cardMode: "column"` — AllColors story is wider than grid cells.

## Re-sync risks

- **CSS source**: `_ds_bundle.css` is scraped from `.design-sync/sb-reference/assets/iframe-*.css` on every build. If the storybook is rebuilt and the asset hash changes, the CSS is still captured correctly — but if CSS moves between files or the storybook cache is stale, review the CSS. Rebuild sb-reference when Tailwind tokens or component styles change.
- **Runtime fonts**: Fredoka and Nunito never ship as font files — they're loaded via Google Fonts at runtime in the hosted app. If either font is ever removed from the app's `next/font` config, the design agent will silently use the fallback sans-serif. No re-sync warning will surface this.
- **TypeScript entry**: The bundle builds from `src/components/ui/index.ts` (TS source). If the component barrel changes (new exports, renames), run `tsc --project tsconfig.types.json` before re-syncing so the `.d.ts` files are in sync.
- **Toast owned preview**: `.design-sync/previews/Toast.tsx` is tied to the Toast API (`visible`, `message` props) and the specific Tailwind classes (`bg-ink text-cream rounded-pill font-display font-semibold text-[14px] px-5 py-3`). If the Toast component API or styling changes, update this file.
- **Story cap**: Button was capped at 6/9 stories (first 6 covered). The 3 uncovered stories (likely size/state variants) were not individually graded — they ride the sibling-trusted coverage.
- **node-modules path**: Build must use `--node-modules ./node_modules`. The `.ds-sync/node_modules` only has esbuild + ts-morph; react is at the repo root.
- **`buildCmd`**: Not set in config — a re-sync must run the TypeScript type generation manually (`tsc --project tsconfig.types.json`) if component signatures changed before running the driver.
