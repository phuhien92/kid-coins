# PROTOTYPE — Parent dashboard shell (HIE-17)

**Question:** What shell layout should wrap every parent route — sidebar vs top-nav, how mobile/tablet breakpoints behave, and where persistent chrome (greeting, AI coach CTA, approval badge) lives?

**Run:** `pnpm dev` → open `/parent/prototype-shell` (add `?variant=spec|kid-parity|top-nav|focus-rail`).

| Variant | Idea |
|---------|------|
| `spec` | Design-handoff faithful: 250px sidebar → tablet icon rail → mobile bottom nav + hamburger drawer + sticky topbar |
| `kid-parity` | Mirror `KidLayoutShell`: 230px sidebar + mobile bottom tabs only; pages own their headers |
| `top-nav` | No sidebar — horizontal nav in sticky header (conventional SaaS contrast) |
| `focus-rail` | Permanent 74px icon rail on all desktop widths; max content area |

## Verdict

**`spec` promoted to production** as `ParentLayoutShell` (`src/components/parent/ParentLayoutShell.tsx`) via `src/app/parent/layout.tsx`.

Critique score at promotion: 28/40. Follow-up before deleting prototype:

- [x] Nav active state: **`green-tint`** (handoff-faithful, shared with kid shell)
- [ ] `/impeccable adapt` — prototype switcher vs mobile nav collision
- [ ] `/impeccable polish` — normalize border grammar across remaining prototype variants

- [x] `spec` — **production base**
- [ ] `kid-parity`
- [ ] `top-nav`
- [ ] `focus-rail`
- [ ] Hybrid: ___

**Notes from review:**

Promoted after `/impeccable critique` (2026-06-28). Production shell drops prototype state panel and uses real `Link` navigation. Placeholder parent name/family in `PARENT_SHELL_PLACEHOLDER` until family context is wired.
