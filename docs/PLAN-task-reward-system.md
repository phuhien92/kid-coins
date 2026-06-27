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

---

## Addendum A — Bounty Quest System + XP Track

### Overview

Bounty Quests are time-limited surprise challenges separate from regular tasks. They keep engagement high by offering a bonus XP multiplier when completed within a specific window (e.g. "Weekend Room Cleanup Blitz — ×2 XP if done by noon Sunday").

XP is a **separate currency from coins**:
- **Coins** — earned from tasks, spent on rewards
- **XP** — earned from task/bounty completions, spent exclusively on cosmetic unlocks in Character Studio

This keeps the two economies clean: coins fund real rewards, XP funds self-expression.

**Decisions:**
| Topic | Decision |
|---|---|
| Bounty scope | Parent chooses: broadcast to all kids, or target a specific kid |
| XP system | Separate track (coins + XP). XP used only for cosmetics. |
| Quest creator | Both: parent creates custom bounties AND AI Coach suggests weekly ones |

---

### A1 — Schema Additions

**Add `xp` to `kid_profiles`:**
```ts
xp: integer("xp").notNull().default(0),
```

**New table: `xpTransactions`** (append-only ledger, mirrors `coinTransactions`)
```ts
xpTransactions = pgTable("xp_transactions", {
  id: uuid().defaultRandom().primaryKey(),
  kidId: uuid().notNull().references(() => kidProfiles.id, { onDelete: "cascade" }),
  amount: integer().notNull(),           // always positive (XP never deducted)
  multiplier: numeric().notNull().default("1"), // 2 for bounty bonus
  source: xpSourceEnum(),                // "task" | "bounty" | "streak" | "manual"
  refId: uuid(),                         // taskCompletionId or bountyCompletionId
  description: text().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
})
```

**New table: `bountyQuests`**
```ts
bountyQuests = pgTable("bounty_quests", {
  id: uuid().defaultRandom().primaryKey(),
  familyId: uuid().notNull().references(() => families.id, { onDelete: "cascade" }),
  kidId: uuid().references(() => kidProfiles.id, { onDelete: "cascade" }), // null = family-wide
  title: text().notNull(),
  emoji: text().notNull().default("⚡"),
  description: text(),
  coinReward: integer().notNull().default(20),
  xpMultiplier: numeric().notNull().default("2"), // multiplier applied to base XP within window
  windowStart: timestamp().notNull(),
  windowEnd: timestamp().notNull(),
  isActive: boolean().notNull().default(true),
  isAiSuggested: boolean().notNull().default(false),
  createdAt: timestamp().defaultNow().notNull(),
})
```

**New table: `bountyCompletions`**
```ts
bountyCompletions = pgTable("bounty_completions", {
  id: uuid().defaultRandom().primaryKey(),
  bountyId: uuid().notNull().references(() => bountyQuests.id, { onDelete: "cascade" }),
  kidId: uuid().notNull().references(() => kidProfiles.id, { onDelete: "cascade" }),
  status: taskCompletionStatusEnum().notNull().default("pending"),  // reuse existing enum
  completedAt: timestamp().defaultNow().notNull(),
  withinWindow: boolean().notNull(),      // true if submitted before windowEnd
  coinsEarned: integer().notNull(),
  xpEarned: integer().notNull(),
  resolvedAt: timestamp(),
})
```

**New table: `cosmetics`** (catalog — seeded, not parent-created)
```ts
cosmetics = pgTable("cosmetics", {
  slug: text().primaryKey(),             // matches CHARACTER_OPTIONS value, e.g. "crown", "sunglasses"
  label: text().notNull(),
  category: cosmeticCategoryEnum(),      // "hat" | "eye" | "extra" | "color"
  unlockType: cosmeticUnlockEnum(),      // "default" | "xp" | "coins"
  xpRequired: integer(),                 // set when unlockType = "xp"
  coinCost: integer(),                   // set when unlockType = "coins"
})
```

**New table: `kidCosmetics`** (what each kid has unlocked)
```ts
kidCosmetics = pgTable("kid_cosmetics", {
  id: uuid().defaultRandom().primaryKey(),
  kidId: uuid().notNull().references(() => kidProfiles.id, { onDelete: "cascade" }),
  cosmeticSlug: text().notNull(),
  unlockedAt: timestamp().defaultNow().notNull(),
})
```

**`activityTypeEnum` — add two values:**
```ts
"bounty_completed"   // kid submitted a bounty completion
"bounty_approved"    // parent approved the bounty
```

---

### A2 — XP Earn Logic

**From regular task approval:**
- Base XP = `task.coinReward` (1 coin → 1 XP)
- Multiplier = 1 (no bonus)
- Written to `xpTransactions` (source=`task`, refId=completionId)
- `kidProfiles.xp += xp`

**From bounty approval:**
- If `withinWindow = true`: XP = `bountyQuest.coinReward × xpMultiplier`
- If `withinWindow = false`: XP = `bountyQuest.coinReward × 1` (base only, no bonus)
- Written to `xpTransactions` (source=`bounty`)
- `kidProfiles.xp += xp`

**From streak milestones** (future): bonus XP at 7-day, 30-day etc. streaks.

---

### A3 — Cosmetic Catalog (Seed Data)

Suggested default unlock tiers — final values to be confirmed by product:

| Slug | Category | Unlock type | Threshold |
|---|---|---|---|
| `none` (hat/extra) | — | default | free |
| `default` (eye) | eye | default | free |
| `yellow` (color) | color | default | free |
| `mint`, `sky`, `peach`, `coral`, `lav` | color | xp | 100–500 XP |
| `cap` (straw hat) | hat | xp | 200 XP |
| `party` | hat | xp | 500 XP |
| `crown` | hat | xp | 1,000 XP |
| `freckles` | extra | default | free |
| `bow` | extra | xp | 150 XP |
| `sunglasses` | extra | coins | 300 coins |
| `mustache` | extra | xp | 400 XP |
| `star` (eye) | eye | xp | 300 XP |
| `sun` (eye) | eye | xp | 600 XP |

---

### A4 — API Routes

| Route | Method | Notes |
|---|---|---|
| `GET /api/bounties` | GET | Active bounties visible to the authenticated kid |
| `POST /api/bounties` | POST | Parent creates a bounty (body: title, emoji, coinReward, xpMultiplier, windowStart, windowEnd, kidId?) |
| `PATCH /api/bounties/[id]` | PATCH | Parent edits or deactivates |
| `POST /api/bounties/[id]/complete` | POST | Kid submits completion; sets `withinWindow` based on current time |
| `POST /api/parent/approvals/bounty/[id]/approve` | POST | Approve; credits coins + XP, writes transactions |
| `POST /api/parent/approvals/bounty/[id]/decline` | POST | Decline |
| `GET /api/ai/bounty-suggestions` | GET | Returns AI-generated weekly bounty suggestions for the family |
| `GET /api/kids/[id]/cosmetics` | GET | Kid's unlocked cosmetics |
| `POST /api/kids/[id]/cosmetics/unlock` | POST | Unlock a cosmetic (body: slug); validates XP or deducts coins |

---

### A5 — Parent UI: Bounty Management

**`src/app/parent/bounties/page.tsx`** — Server component listing active/upcoming/past bounties.

**`src/components/parent/BountyForm.tsx`** (client):
- Emoji + title
- Scope toggle: "All kids" / "Specific kid" (kid selector dropdown appears when specific)
- Coin reward + XP multiplier selector (×1 / ×1.5 / ×2 / ×3)
- Window: date-time picker for start + end (or duration presets: 1h / 2h / 4h / All day)
- Submits to `POST /api/bounties`

**`src/components/parent/BountyCard.tsx`**:
- Shows emoji, title, scope chip, countdown, coin reward, XP multiplier badge
- Active/upcoming/expired status
- Edit and deactivate actions

**AI Suggestions panel** (`src/components/parent/AiBountySuggestions.tsx`):
- Calls `GET /api/ai/bounty-suggestions` on mount
- Shows 2–3 ready-to-activate suggestion cards
- Each has: emoji, title, suggested window, coin/XP values, "Activate" button → pre-fills BountyForm

---

### A6 — Kid UI: Bounty Quest Display

**`src/components/kid/BountyQuestCard.tsx`**:
- Special visual treatment: golden border, `⚡` or bounty emoji, animated countdown timer
- Shows: title, window end countdown, coin reward, XP multiplier badge (e.g. "×2 XP")
- States:
  - **Active** (within window): "Complete Quest" button
  - **Pending** (submitted, awaiting approval): yellow pending chip
  - **Expired** (past window, not completed): greyed out
  - **Completed** (approved): celebration state

Rendered in a "Bounty" section above the regular task list on `/kid/tasks`.

---

### A7 — Character Studio: Locked Cosmetics

**Update `src/components/kid/CharacterStudio/CharacterStudio.tsx`:**
- Each option tile checks if the cosmetic slug is in `kidCosmetics`
- If locked:
  - Greyed overlay + padlock icon
  - Shows unlock cost: "🔒 300 XP" or "🔒 200 🪙"
  - Tapping opens `CosmeticUnlockModal`
- XP progress bar shown under categories with locked items

**`src/components/kid/CosmeticUnlockModal.tsx`** (client):
- Shows cosmetic preview (mini CharacterSVG with the item)
- "Unlock for X XP" or "Unlock for X coins"
- Confirm → `POST /api/kids/[id]/cosmetics/unlock`
- On success: item appears unlocked, toast "New look unlocked!"

---

### A8 — Tests

| Module | Key assertions |
|---|---|
| `POST /api/bounties/[id]/complete` | Sets `withinWindow=true` when before windowEnd, `false` after |
| Bounty approve route | Credits correct coin+XP when withinWindow; base-only XP when not |
| `POST /api/kids/[id]/cosmetics/unlock` | Blocks if kid lacks XP/coins; inserts kidCosmetics row |
| `BountyQuestCard` | Renders all four states (active/pending/expired/completed) |
| `CharacterStudio` | Locked items show padlock; unlocked items are selectable |
| `CosmeticUnlockModal` | Confirm dispatches unlock; error when insufficient XP |

---

## Addendum B — Kid Personality Interview

### Decisions

| Topic | Decision |
|---|---|
| Interview format | Conversational AI chat — Earnie AI asks questions with chip quick-replies; parent types free-form answers or taps chips |
| Trigger | Shown once immediately after a new kid profile is created; re-editable anytime from parent kid-settings |
| Output | Structured `kidContext` row + AI-generated `aiSummary` paragraph injected into all subsequent task/bounty suggestion prompts |

---

### B1 — Schema

**New table `kidContext`** in `src/lib/schema.ts`:

```ts
export const kidContext = pgTable("kid_context", {
  id: uuid("id").defaultRandom().primaryKey(),
  kidId: uuid("kid_id")
    .notNull()
    .unique()
    .references(() => kidProfiles.id, { onDelete: "cascade" }),
  // Structured data captured during interview
  traits:          json("traits").$type<string[]>(),          // e.g. ["energetic","creative"]
  interests:       json("interests").$type<string[]>(),       // e.g. ["dinosaurs","Lego"]
  challenges:      json("challenges").$type<string[]>(),      // e.g. ["forgets to tidy","screen time"]
  goalDescription: text("goal_description"),                  // parent's own words
  financialGoal:   text("financial_goal"),                    // e.g. "save for a bike"
  behavioralGoal:  text("behavioral_goal"),                   // e.g. "build morning routine"
  // AI-generated paragraph used verbatim in task/bounty prompts
  aiSummary:       text("ai_summary"),
  updatedAt:       timestamp("updated_at").defaultNow().notNull(),
});
```

Add relation on `kidProfilesRelations`:
```ts
context: one(kidContext, { fields: [kidProfiles.id], references: [kidContext.kidId] }),
```

Add `kidContext?: KidContext` to `src/types/index.ts`:
```ts
export interface KidContext {
  id: string;
  kidId: string;
  traits: string[];
  interests: string[];
  challenges: string[];
  goalDescription?: string;
  financialGoal?: string;
  behavioralGoal?: string;
  aiSummary?: string;
  updatedAt: string;
}
```

Run `pnpm db:generate && pnpm db:migrate` after editing the schema.

---

### B2 — Interview Questions & Flow

The interview is a linear conversation of 6 steps. The AI host (Earnie) asks one question at a time. Chip quick-replies accelerate entry; parent can always type freely.

| Step | Earnie asks | Captures | Quick-reply chips |
|---|---|---|---|
| 1 | "What's [name] like? Pick a few words that describe them." | `traits[]` | Energetic · Creative · Shy · Competitive · Caring · Curious · Stubborn · Funny |
| 2 | "What does [name] love doing?" | `interests[]` | Reading · Sports · Gaming · Art · Music · Animals · Lego · Outdoors |
| 3 | "What's the one thing that's hardest for [name] right now?" | `challenges[]` | Tidying up · Screen time · Morning routine · Homework · Eating veggies · Being kind to siblings |
| 4 | "In your own words, what do you most want [name] to build as a habit?" | `goalDescription` | Free-form text (no chips) |
| 5 | "Is [name] saving up for something specific, or is this more about learning money habits?" | `financialGoal` | Saving for a toy · Learning to save · Earning pocket money · All of the above |
| 6 | "Anything else Earnie should know about [name]?" | appended to `behavioralGoal` | Skip (chip) |

After step 6, the parent taps **"Save & Finish"**. The client POSTs all collected answers to `/api/kids/[id]/context`. The server generates `aiSummary` via Claude and persists the full row.

---

### B3 — API Routes

| Route | Method | Body / Notes |
|---|---|---|
| `POST /api/kids/[id]/context` | POST | `{ traits, interests, challenges, goalDescription, financialGoal, behavioralGoal }` — upserts `kidContext`, calls Claude to generate `aiSummary`, returns full row |
| `GET /api/kids/[id]/context` | GET | Returns `kidContext` row for the kid (parent-only) |

**`aiSummary` generation prompt** (sent to `claude-haiku-4-5-20251001`):

```
You are Earnie, a friendly AI coach helping parents motivate their kids with chores and saving goals.
Write a short (3–5 sentence) personality summary for a parent's kid based on the interview answers below.
Use warm, encouraging language. This summary will be injected into task and challenge suggestions.

Kid name: {name}
Traits: {traits.join(", ")}
Interests: {interests.join(", ")}
Challenges: {challenges.join(", ")}
Parent's goal in their own words: {goalDescription}
Financial goal: {financialGoal}
Behavioral goal: {behavioralGoal}
```

---

### B4 — AI Prompt Injection

All existing and future AI endpoints that generate task or bounty suggestions must include `kidContext.aiSummary` when it exists.

**In `src/app/api/ai/` route handlers** — inject after the system message:

```ts
const summary = await db.query.kidContext.findFirst({ where: eq(kidContext.kidId, kidId) });
const contextBlock = summary?.aiSummary
  ? `\n\nAbout this kid:\n${summary.aiSummary}`
  : "";
// Prepend contextBlock to the user message or append to the system prompt
```

This applies to:
- `/api/ai/coach` (existing AI coach)
- `/api/ai/bounty-suggestions` (from Addendum A)
- Any future `/api/ai/task-suggestions` route

---

### B5 — Parent UI: Interview Flow

**Trigger at kid creation** — after the parent completes the "Add Kid" wizard (name → avatar → PIN), redirect to `/parent/kids/[id]/interview` before landing on the kid detail page. Show a skip option ("I'll do this later").

**`src/app/parent/kids/[id]/interview/page.tsx`** (client component):
- Chat-style layout matching the existing `CoachChat` design (`src/components/kid/CoachChat/`)
- Earnie avatar (coin face) on the left; parent messages on the right
- Progress bar at the top: "Step 2 of 6"
- Quick-reply chip row below the input
- Back/next navigation; can go back to revise an answer
- Final "Save & Finish" button posts to `/api/kids/[id]/context`
- On success: redirect to `/parent/kids/[id]` with a toast "Earnie knows [name] now! Suggestions will be personalised."

**Re-edit entry point** — `src/app/parent/kids/[id]/settings/page.tsx` (to be created):
- "Personalise suggestions" section with a button "Re-run personality interview"
- Links to the same `/parent/kids/[id]/interview` page; POST upserts the row

---

### B6 — Tests

| Module | Key assertions |
|---|---|
| `POST /api/kids/[id]/context` | Upserts row; calls Claude; returns `aiSummary`; 401 without parent session |
| `GET /api/kids/[id]/context` | Returns existing row; 404 if not found; 401 without session |
| AI routes | When `kidContext.aiSummary` exists, it appears in the prompt sent to Claude |
| Interview page | Steps advance on chip tap; free-form input captured; skip on step 6 works; Save posts correct payload |
