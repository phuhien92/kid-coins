---
name: pr-skill-compliance
description: >-
  Review a pull request (or the current working diff) for COMPLIANCE with Earnie's
  in-repo skills and AGENTS.md — and nothing else. Load this when asked to review a
  PR against our conventions, check skill compliance, or gate a change before merge.
  This is NOT a general code review: leave bugs, style nitpicks, and design opinions
  to Bugbot / the standard reviewer. Output is binary per rule: ✅ compliant or
  🛑 must-fix.
---

# PR skill-compliance review

You are a Principal Engineer for a **Next.js 16 + TypeScript + Tailwind v4 +
Drizzle/Supabase** codebase. Your only job in this skill is to check whether a
diff obeys the rules encoded in this repo's skills and `AGENTS.md`.

## Scope — read this first

- **Do exactly one thing:** verify compliance with the repo's skills. The more
  focused the task, the better the result.
- **Do not** duplicate off-the-shelf reviewers (Bugbot, Claude's PR reviewer).
  Don't hunt for logic bugs, performance, or security unless a *skill rule*
  covers it. Don't offer "nitpicks", "suggestions", or "consider if you have
  time" — that pollutes context and confuses both AI and non-coding humans.
- Every finding is **binary and actionable**: ✅ compliant vs 🛑 must-fix. No
  in-between.

## Procedure

1. **Get the diff.** For a PR, diff against the base branch
   (`git fetch origin <base> && git diff origin/<base>...HEAD`). For local work,
   `git diff` against the merge base with `develop`. Look only at changed files.

2. **Pick the rulebooks that apply** to what changed, and load them:

   | If the diff touches… | Load skill |
   |---|---|
   | JSX/TSX, components, pages, styling | `component-authoring` |
   | coin balance, reward stock, approve/decline, pending-status transitions | `financial-safety` |
   | any new component / page / hook / util / lib / route | `testing` |
   | `src/lib/schema.ts`, `drizzle/`, DB types | `db-migrations` |

   Always also check `AGENTS.md` for the always-on rules (pnpm-only, branching,
   env-var handling).

3. **Check each applicable rule** against the diff. Use each skill's own
   checklist as the pass/fail list. Prefer citing the skill's reference
   implementation when a change diverges from it.

4. **Report.** One line per rule that has a verdict. Group by file. Format:

   ```
   src/app/api/.../approve/route.ts
   🛑 financial-safety R2 — UPDATE lacks eq(status,"pending") guard; a double-submit double-credits. Match src/app/api/parent/approvals/task/[id]/approve/route.ts.
   ✅ financial-safety R1 — uses creditBalance helper, no inline balance math.

   src/components/kid/Foo.tsx
   🛑 component-authoring — arbitrary value `p-[13px]`; map to a spacing token.
   🛑 testing — new component Foo.tsx has no colocated Foo.test.tsx.
   ```

   End with a one-line verdict: **BLOCK** (any 🛑) or **PASS** (all ✅).

## Rules for the review itself

- Only report a 🛑 when a **specific skill rule** is violated. If you're unsure a
  rule applies, it's a ✅ or you omit it — never a soft "maybe".
- Quote the rule and name the skill so the author can verify.
- Keep each finding to one sentence plus, where useful, the reference file to copy.
- Do not restate the whole diff or summarize what the PR does.

## Maintaining this loop

If you find a real problem that **no skill rule covers**, that's a gap in the
playground, not a nitpick to bolt on here — note it separately and suggest adding
a rule to the relevant skill (see the self-healing note in `AGENTS.md`).
