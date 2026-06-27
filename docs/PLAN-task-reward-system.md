# Plan: Task Creation, Assignment & Reward System

## Context

The parent dashboard is currently a placeholder stub. The kid task page exists but runs entirely on mocked local state — no API calls are made. There is no reward browsing, approval, or penalty flow wired up anywhere.

This document is the implementation plan for the full task-and-reward loop:

> Parent creates tasks → Kid completes them → Parent approves with tiered payout → Rewards can be redeemed → Parent can penalise

### Decisions (locked in via product interview)

| Topic | Decision |
|---|---|
| Task scheduling | Start date + duration in days. Auto-deactivates after N days; parent can re-enable manually. |
| Approval payout | Fixed tiers (100 / 75 / 50 / 0 %) + optional bonus coins on top |
| Penalties | Both: task-denial rollback AND ad-hoc coin deductions with a reason |
| Reward scope | Family-wide — any kid can see and redeem any active reward |
| Reward reuse | Limited quantity — parent sets stock; auto-deactivates when exhausted |
| Coin reservation | Coins are **not** deducted on request; kid UI shows `balance − pending_reservations` as spendable |

---

## Phase 1 — Schema & Type Changes

### `src/lib/schema.ts`

**`tasks` — add 3 columns**

```ts
emoji: text("emoji").notNull().default("✅"),
scheduledStartAt: timestamp("scheduled_start_at"),  // null = active immediately
durationDays: integer("duration_days"),              // null = never auto-expires
```

**`taskCompletions` — add 2 columns**

```ts
paymentPercent: integer("payment_percent").notNull().default(100), // 100 | 75 | 50 | 0
bonusCoins: integer("bonus_coins").notNull().default(0),
```

`coinsEarned` becomes the actual paid amount: `floor(coinReward × paymentPercent / 100) + bonusCoins`.

**`rewards` — add 2 columns**

```ts
quantity: integer("quantity"),                              // null = unlimited
quantityUsed: integer("quantity_used").notNull().default(0),
```

When `quantityUsed >= quantity` on redemption approval → auto-set `isActive = false`.

**After editing schema:**

```bash
pnpm db:generate   # produces a migration file in drizzle/
pnpm db:migrate    # applies it
```

### `src/types/index.ts`

| Type | New fields |
|---|---|
| `Task` | `emoji: string`, `scheduledStartAt?: string`, `durationDays?: number`, `expiresAt?: string` (derived) |
| `TaskCompletion` | `paymentPercent: number`, `bonusCoins: number` |
| `Reward` | `quantity?: number`, `quantityUsed: number` |

---

## Phase 2 — API Routes

All parent-facing routes require a valid Supabase auth session (check via `createServerClient` from `src/lib/supabase.ts`; return 401 if missing). Use Drizzle client from `src/lib/db.ts`.

### Task CRUD

| Route | Method | Body |
|---|---|---|
| `/api/tasks` | POST | `{ kidId, title, emoji, type, coinReward, scheduledStartAt?, durationDays? }` |
| `/api/tasks/[id]` | PATCH | any subset of task fields, including `isActive` |
| `/api/tasks/[id]` | DELETE | hard delete (cascades to completions) |

**Task visibility logic** (used by kid-facing queries):

Task is considered active when:
- `isActive = true`, AND
- `scheduledStartAt` is null **or** `scheduledStartAt ≤ now()`, AND
- `durationDays` is null **or** `scheduledStartAt + durationDays days ≥ now()`

Expiry is computed at query time — no background job needed.

### Approval Routes (enhanced)

| Route | Method | Body |
|---|---|---|
| `/api/parent/approvals/task/[id]/approve` | POST | `{ paymentPercent: 100\|75\|50, bonusCoins?: number }` |
| `/api/parent/approvals/task/[id]/decline` | POST | `{ reason?: string }` |
| `/api/parent/approvals/redemption/[id]/approve` | POST | — |
| `/api/parent/approvals/redemption/[id]/decline` | POST | `{ reason?: string }` |

**Task approve logic:**
1. Load task → get `coinReward`
2. `coinsEarned = floor(coinReward × paymentPercent / 100) + (bonusCoins ?? 0)`
3. Update `taskCompletions`: `status=approved`, `paymentPercent`, `bonusCoins`, `coinsEarned`, `resolvedAt=now()`
4. `kidProfiles.balance += coinsEarned`
5. Insert `coinTransactions` (type=`earned`, amount=coinsEarned, description=task title)
6. Insert `activityLog` (type=`task_approved`)

**Redemption approve logic:**
1. Update `redemptionRequests`: `status=approved`, `resolvedAt=now()`
2. `kidProfiles.balance -= coinsSpent`
3. `rewards.quantityUsed += 1`; if `quantityUsed >= quantity` → `rewards.isActive = false`
4. Insert `coinTransactions` (type=`redeemed`, amount=`-coinsSpent`)
5. Insert `activityLog` (type=`reward_approved`)

### Penalties

| Route | Method | Body |
|---|---|---|
| `/api/parent/kids/[id]/penalty` | POST | `{ amount: number, reason: string }` |

Logic: `kidProfiles.balance -= amount`, insert `coinTransactions` (type=`adjusted`, amount=`-amount`, description=reason), insert `activityLog` (type=`coins_adjusted`, payload=`{ delta: -amount, reason }`).

### Rewards CRUD

| Route | Method | Body |
|---|---|---|
| `/api/rewards` | POST | `{ title, emoji, description?, coinCost, quantity? }` |
| `/api/rewards/[id]` | PATCH | any subset of reward fields |
| `/api/rewards/[id]` | DELETE | soft delete (`isActive=false`) |

### Kid — Task Completion

| Route | Method | Body |
|---|---|---|
| `/api/kids/[id]/task-completions` | POST | `{ taskId }` |

Insert `taskCompletions` with `status=pending`, `coinsEarned=task.coinReward`. If `familySettings.requireTaskApproval = false` → immediately approve: update status, credit balance, insert `coinTransactions` + `activityLog`.

### Kid — Redemption Request

| Route | Method | Body |
|---|---|---|
| `/api/kids/[id]/redemptions` | POST | `{ rewardId }` |

Validate:
- `balance - SUM(pending redemptionRequests.coinsSpent) >= reward.coinCost`
- `reward.isActive = true` and remaining stock > 0

Insert `redemptionRequests` + `activityLog` (type=`reward_redeemed`). Return the new request.

---

## Phase 3 — Parent UI: Task Management

### Pages

- **`src/app/parent/tasks/page.tsx`** — Server component. Fetches all family tasks grouped by kid. Kid selector tabs + task list with one `TaskCard` per task.

### Components

**`src/components/parent/TaskForm.tsx`** (client) — used for create and edit:
- Kid selector (dropdown of family kids)
- Emoji picker (grid of common emoji, ~20 options)
- Title text input
- Type toggle: Daily / One-time (existing `Toggle` from `src/components/ui/`)
- Coin reward number input
- Scheduled start date input (optional)
- Duration in days number input (optional; only shown when a start date is set)
- Active toggle

Submits to `POST /api/tasks` or `PATCH /api/tasks/[id]`.

**`src/components/parent/TaskCard.tsx`** — displays:
- Emoji, title, coin reward, type badge
- Schedule info (start date / expiry date when applicable)
- Inline enable/disable toggle (`PATCH isActive`)
- Edit → opens `TaskForm` inside existing `Modal`
- Delete → confirmation then `DELETE /api/tasks/[id]`

---

## Phase 4 — Parent UI: Enhanced Approval Modal

**`src/components/parent/ApprovalModal.tsx`** (client):
- Shows kid name, task title, base coin reward
- Payout tier buttons (mutually exclusive): **Full (100%)**, **75%**, **50%**, **Decline (0%)**
- Bonus coins input (optional, visible when tier ≠ 0%)
- Confirm → dispatches approve or decline request
- Optimistic: removes row from the approvals panel immediately on confirm

The planned `ApprovalRow` in the parent dashboard calls this modal.

---

## Phase 5 — Parent UI: Penalty Modal

**`src/components/parent/PenaltyModal.tsx`** (client):
- Amount input (positive integer)
- Reason text input (required)
- Confirm → `POST /api/parent/kids/[id]/penalty`
- Triggered from the kid detail view or kids-list kebab menu

---

## Phase 6 — Parent UI: Reward Management

### Pages

- **`src/app/parent/rewards/page.tsx`** — Server component. Lists family rewards. "New reward" CTA opens `RewardForm`.

### Components

**`src/components/parent/RewardForm.tsx`** (client):
- Emoji picker, title, description (optional), coin cost, quantity (leave blank for unlimited), active toggle
- Submits to `POST /api/rewards` or `PATCH /api/rewards/[id]`

**`src/components/parent/ParentRewardCard.tsx`**:
- Shows emoji, title, cost, remaining stock (`quantity - quantityUsed` or "Unlimited"), active badge
- Edit (opens `RewardForm`) and soft-delete (PATCH `isActive=false`) actions

---

## Phase 7 — Kid UI: Wire Task Completion to API

Edit **`src/app/(kid)/kid/tasks/page.tsx`**:
- Replace the local-only `handleTaskTap()` with a call to `POST /api/kids/[id]/task-completions`
- Keep optimistic local state for instant feedback (celebration modal fires immediately)
- On API error: roll back local state, show error toast
- Refresh task list after completion so `completedToday` flag reflects reality

`kidId` must come from `KidContext` (once real Supabase session is wired in).

---

## Phase 8 — Kid UI: Rewards Page

**`src/app/(kid)/kid/rewards/page.tsx`** — Replace stub. Server component fetches:
- All active family rewards
- Kid's pending redemptions (to compute reserved coins)

Displays kid's **available balance** (`balance - pending_reservations`) at top.

**`src/components/kid/RewardCard.tsx`** — four visual states:

| State | Condition | UI |
|---|---|---|
| Affordable | balance ≥ cost & stock > 0 | Green "Redeem" button |
| Locked | balance < cost | Muted button + padlock icon |
| Pending | kid has open request | Coin-yellow "Pending" chip |
| Sold out | `isActive=false` or stock=0 | Grey "Sold out" label |

Tapping Redeem → confirm dialog → `POST /api/kids/[id]/redemptions` → card flips to Pending state.

---

## Phase 9 — Tests

Every new module ships with a colocated test file (`.test.tsx` / `.test.ts`).

| Module | Key assertions |
|---|---|
| Task CRUD API routes | Insert, update, delete; auth guard returns 401 |
| Approve task route | Correct `coinsEarned` for each tier + bonus; balance updated; `coinTransactions` inserted |
| Decline task route | Status=denied; balance unchanged |
| Approve redemption route | Balance deducted; `quantityUsed` incremented; auto-deactivate when stock exhausted |
| Penalty route | Balance decremented; `coinTransactions` inserted with negative amount |
| Task completion route | Pending path vs auto-approve path based on `familySettings.requireTaskApproval` |
| Redemption request route | Rejects when effective balance insufficient; rejects when out of stock |
| `TaskForm` | Fields render; submit fires correct endpoint; empty title blocked |
| `ApprovalModal` | Tier buttons mutually exclusive; bonus field visible only for non-zero tiers |
| `RewardCard` | All four states render correctly |

---

## Verification

```bash
pnpm db:generate && pnpm db:migrate   # migration applies cleanly
pnpm test:run                         # all tests green
pnpm build                            # no TypeScript errors
```

**Manual smoke path:**

1. Parent creates task (with emoji, start date, 7-day duration) → kid sees it
2. Kid taps done → parent sees approval pending
3. Parent approves at 75% + 5 bonus coins → kid balance reflects `floor(reward × 0.75) + 5`
4. Parent issues ad-hoc penalty → balance decreases; activity log shows reason
5. Parent creates reward with qty=2 → kid redeems → parent approves → stock drops to 1
6. Second redemption approved → stock=0 → reward auto-deactivates
7. Kid reward page shows correct available balance (excludes any pending reservation)
