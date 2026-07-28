---
name: financial-safety
description: >-
  Concurrency and money-handling rules for anything that reads or writes a kid's
  coin balance, reward stock, or the status of a task completion / redemption
  request. Load this BEFORE writing or reviewing any API route or lib function
  that credits/debits coins, approves or declines a completion or redemption,
  spends reward stock, or does a state transition on a pending record. Coins are
  real value to kids; violating these rules causes silent data corruption that is
  very hard to debug.
---

# Financial safety (concurrency & money handling)

These rules exist because coins are real value to kids. The failure mode is a
lost-update or double-spend race that corrupts a balance silently — no error, no
stack trace, just wrong numbers.

## Reference implementations — read these first

Do not paraphrase the rules from memory. The canonical, correct implementations
live here; match them:

| Pattern | Canonical file |
|---|---|
| Atomic credit / debit / affordability-guarded debit | `src/lib/kid-balance.ts` |
| Stock claim guarded in SQL | `src/lib/rewards.ts` (`claimRewardStock`) |
| Full state-transition + transaction + 409 in a route | `src/app/api/parent/approvals/task/[id]/approve/route.ts` |
| Tests for the money helpers | `src/lib/kid-balance.test.ts`, `src/lib/rewards.test.ts` |

## Rule 1 — Never read-then-write a balance

**Forbidden** (lost-update race):

```ts
const kid = await db.query.kidProfiles.findFirst(...)
await tx.update(kidProfiles).set({ balance: kid.balance + amount })
```

**Required** — use the helpers in `src/lib/kid-balance.ts`:

```ts
await creditBalance(tx, kidId, amount)   // balance = balance + amount (atomic)
await debitBalance(tx, kidId, amount)    // balance = GREATEST(0, balance - amount)
```

Never bypass these helpers with inline ``sql`...` `` balance arithmetic.

## Rule 2 — Always guard state-transition updates on the current state

When approving or declining a completion / redemption, the UPDATE must include a
`status = 'pending'` condition so a double-submit cannot process the same record
twice:

```ts
.where(and(eq(table.id, id), eq(table.status, "pending")))
```

If `.returning()` yields no row, return **409 Conflict** — do not fall through
to crediting coins.

## Rule 3 — Never spend coins or stock you only checked beforehand

A read-then-check outside the transaction is advisory: two concurrent approvals
both read the pre-spend state and both pass it. The condition has to be part of
the write, and the write has to tell you whether it applied:

```ts
await claimRewardStock(tx, rewardId)                 // false → sold out
await debitBalanceIfAffordable(tx, kidId, amount)    // false → can't afford it
```

Both live where the rest of that resource's rules do (`src/lib/rewards.ts`,
`src/lib/kid-balance.ts`) and guard themselves in SQL (`quantity_used < quantity`,
`balance >= amount`) using `.returning()` to detect the losing writer. When
either returns `false`, roll the transaction back and return **400** — never
fall through to the other write.

`hasRewardStock(...)` / a balance comparison before the transaction are still
worth keeping as a fast rejection, but they are a UX shortcut, not the safety
property.

## Review checklist

- [ ] No `balance: kid.balance ± amount` anywhere — only the `kid-balance.ts` helpers.
- [ ] Every approve/decline UPDATE carries an `eq(status, "pending")` guard.
- [ ] `.returning()` is checked; missing row → **409**, never a silent credit.
- [ ] Spending stock/coins uses the SQL-guarded helper and honors its `false` → **400**, not a pre-transaction check alone.
- [ ] All of credit + transaction-log insert + activity-log insert happen inside one `db.transaction`.
