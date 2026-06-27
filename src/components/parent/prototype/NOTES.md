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

_TBD — pick one (or a hybrid) after reviewing variants side-by-side._

- [ ] `spec`
- [ ] `kid-parity`
- [ ] `top-nav`
- [ ] `focus-rail`
- [ ] Hybrid: ___

**Notes from review:**

_(fill in)_
