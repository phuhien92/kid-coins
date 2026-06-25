# Product

## Register

product

## Users

**Kids (primary, ages ~5–12).** Use the app on a shared family device or their own tablet/phone, in short bursts (morning routine, after-school, before bed). They are not browsing — they are checking what's left to do, tapping tasks done, watching their coin balance grow, and customizing their character. They can read short labels but skim long sentences. They want immediate feedback for effort.

**Parents (secondary, but the gatekeeper).** Use the app on desktop or phone, between other things — coffee in hand, kids nearby. Their job-to-be-done is to set the right tasks, approve reward redemptions quickly, and shape goals (often with the AI coach). They need to trust that money concepts are handled responsibly.

The two audiences share the same product but live in different sub-shells (`/(kid)` vs `/(parent)`). Tone, density, and motion change accordingly; the brand identity does not.

## Product Purpose

Earnie teaches children responsibility and basic financial literacy by turning chores, hygiene, and self-care into a gamified loop: complete tasks → earn virtual coins → save toward a goal or redeem for parent-approved rewards. An AI coach helps parents shape realistic, motivating goals.

Success looks like: a kid checks the app daily without prompting, a parent approves a redemption in under 10 seconds, and a goal is reached without the family feeling like they wrestled an app to do it.

## Brand Personality

**Playful · Warm · Trustworthy.**

- **Playful** for the kid: rounded Fredoka display type, a coin pip you can almost feel, a customizable mascot (Penny, Lumi), confetti when you earn.
- **Warm** for the family: cream paper background, hand-feel borders, generous radii, an "off the kitchen counter" softness rather than a digital-product slickness.
- **Trustworthy** for the parent: money, approvals, and progress are unambiguous. Numbers don't lie or animate themselves into being. Whimsy never blocks information.

The voice is encouraging and direct, never saccharine. "Well done!" not "OMG amazing!!" — the app respects kids enough to talk to them like people.

## Anti-references

What Earnie must NOT look or feel like:

- **Generic kid-app cartoonish.** No gradient slime, no Comic Sans or hand-drawn-imitation display fonts, no neon rainbows, no "fun" drop-shadow text. The category default is exactly what we are not.
- **Toy-store loud.** No oversaturated reds, no exclamation-mark-on-every-sentence copy, no "BUY NOW"-energy CTAs, no overstimulated layouts that compete for attention. Joy is carried by warmth, not volume.
- **Cold fintech.** No navy-and-gold, no charts-first dashboards, no adult banking aesthetic stapled onto a kid product.
- **Sterile SaaS.** No gray-on-gray, no all-data-no-personality. The parent dashboard is still Earnie.

## Design Principles

1. **Two registers, one home.** The kid app feels like a game; the parent app feels like a tool. Both use the same tokens, type system, and mascot voice. Switching between them feels like changing rooms, not changing brands.
2. **Earnest, not patronizing.** Kids notice when an app talks down. We use direct language ("You earned 5 coins"), real numbers, and respect for the work they did. No baby talk, no participation-trophy energy.
3. **Reward feels earned.** Celebration is tied to a real accomplishment (task complete, goal reached), not to engagement metrics. Confetti is rare enough to still mean something.
4. **Parents trust through clarity.** Approval flows, coin balances, and goal math are unambiguous. The playful surface never obscures what is being approved, how much was earned, or how far away the goal is.
5. **Warmth carries the joy.** Cream paper, ink linework, rounded Fredoka, and the coin yellow do the playful work. We never need to shout, glow, or gradient our way to delight.

## Accessibility & Inclusion

**Floor: WCAG 2.2 AA.**

- Body text ≥4.5:1 against its background; large text ≥3:1. The ink/ink-soft pair on cream is the safe default; the `--color-line` divider (rgba ink at 0.12) is decorative only and never carries text.
- Tap targets ≥44px on the kid app (most are already 52px+ per the handoff). Parent app respects the same floor on mobile.
- Full keyboard navigation across both shells, including the character studio modal and AI coach modal.
- `prefers-reduced-motion: reduce` honored everywhere — the celebration overlay, character idle float, view transitions, and toast slides all collapse to crossfade or instant.
- Copy reading level: kid-facing strings target ~grade 2; parent strings can sit at adult-everyday reading level.
- Color is never the only carrier of meaning — completed tasks add a check glyph and strikethrough, not just a tint shift.
