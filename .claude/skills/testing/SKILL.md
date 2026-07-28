---
name: testing
description: >-
  Earnie's testing contract — when a new module requires a colocated test, what to
  test per module type, and the quality bar. Load this whenever you add or change a
  component, page, hook, util, lib function, or API route, or when deciding whether
  a change needs a test. A PR that adds a new module without a test is incomplete.
---

# Testing

Stack: **Vitest + Testing Library**. Commands: `pnpm test` (watch),
`pnpm test:run` (single run / CI), `pnpm test:coverage`.

## Reference implementations — copy these shapes

| Module type | Canonical example |
|---|---|
| React component | `src/components/parent/ApprovalCard.test.tsx` |
| Hook | `src/hooks/useApprovals.test.ts` |
| Util / lib | `src/lib/kid-balance.test.ts`, `src/lib/utils.test.ts` |
| API route (mocked DB) | `src/app/api/parent/approvals/task/[id]/approve/route.test.ts` |

Testing Library setup lives in `src/test/setup.ts`.

## When to add a test — required

Every new **component, page, hook, util, or API route** created during active
development must ship with a colocated test file. This is not optional.

## When to skip

Bug fixes that don't add new modules, config/tooling changes, copy or
design-token updates, and changes that only consume existing tested APIs.

## Placement — colocated next to the code

| New module | Test file |
|---|---|
| React component (`*.tsx`) | `ComponentName.test.tsx` in the same directory |
| Hook, util, lib (`*.ts`) | `filename.test.ts` in the same directory |
| API route (`route.ts`) | `route.test.ts` in the same directory |

## What to test per module type

- **Components** — Testing Library. Render and assert on user-visible output:
  text, roles, states (disabled, checked, aria attributes). Do **not** test
  implementation details like class names or internal state.
- **Hooks & utils** — pure logic. Cover the happy path, edge cases, and
  error/fallback behavior.
- **API routes** — mock Supabase and Drizzle at the boundary (**never** hit the
  real DB). Assert on response status codes and body shape for success and error
  paths. For money routes, assert the concurrency guards too (see the
  `financial-safety` skill): the 409-on-already-resolved and 400-on-can't-afford
  paths.

## Quality bar

Tests must cover meaningful behavior, not trivial renders. A component test that
only checks "it mounts without crashing" is not sufficient. Assert on what a user
or caller would actually observe. Do not test props that merely mirror
implementation.

## E2E

Add **Playwright E2E** (`e2e/*.spec.ts`) only for new end-to-end user flows
(e.g. signup → create kid → kid login), not for every page. Config:
`playwright.config.ts`.

Manual E2E passes should be narrow: identify the one user-visible behavior to
verify, run the minimal path to confirm it, and stop. Manual E2E is not a
substitute for automated tests.
