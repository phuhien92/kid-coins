# Feature Plan: Parent Kids Management + Kid Character Studio

**Branch:** `feature/kid-profile-character-studio`  
**Worktree:** `.worktrees/feature/kid-profile-character-studio`

---

## Design Decisions (settled)

| Decision | Choice | Rationale |
|---|---|---|
| Who creates kid profile? | Parent (name + PIN + color) | Role boundary: parent controls identity, kid controls expression |
| Add-kid flow | Dedicated `/parent/kids/new` page | Mobile-first, stepped form is clearer on small screens than a modal |
| Form fields | Name + 4-digit PIN + confirm PIN + 6-color swatch | Minimal but gives each card a distinct colour from day one |
| Post-creation redirect | `/parent/kids` list | Keep parent on overview; tasks added separately |
| Kid list card | Full card (avatar, name, balance, "+ Add tasks" placeholder) | Real visual shell now, actions wired later |
| Character Studio | Kid-facing only, from `/kid/profile` | Kids own their character; parents own the identity |
| Scope | Both parent side + kid Character Studio | Complete vertical slice, one testable journey |
| Character persistence | DB primary (`PUT /api/kids/[id]/character`), localStorage cache | DB survives device changes; cache keeps reads fast |

---

## UI Prototype

**Route:** `/prototype/kids?variant=A` (or B, C)  
**File:** `src/app/(parent)/prototype/kids/page.tsx`  
**Switcher:** `src/components/ui/PrototypeSwitcher/PrototypeSwitcher.tsx`

### Variants

| Variant | Kids List | Add Form | Character Studio |
|---|---|---|---|
| **A — Card Grid + Stepped** | 2-col card grid (matches design spec) | 3-step wizard: name → color → PIN | Full-page route |
| **B — Avatar Wall + Single** | Large centred avatars, horizontal scroll | Single scrolling form, all fields at once | Bottom sheet |
| **C — List Rows + Inline** | Compact accordion list rows | Inline expansion below list | Modal overlay |

**Run:** `pnpm dev` → visit `/prototype/kids?variant=A`  
**Switch:** floating bar at bottom (← →), or keyboard arrow keys

> **TODO after prototype review:** Delete losing variants + switcher, promote winner to real route.

---

## Implementation Tasks

### 1. Backend API routes

**File:** `src/app/api/kids/route.ts` (add `POST` to existing file)

```
POST /api/kids
  Body: { name, pin, avatarColor }
  - Verify parent session via Supabase
  - bcrypt hash the PIN (10 rounds)
  - Insert into kidProfiles
  - Insert default row into characters table
  - Log kid_added event to activityLog
  Returns: { kid: { id, name, avatarColor, balance } }
```

**File:** `src/app/api/kids/[id]/character/route.ts` (new file)

```
GET /api/kids/[id]/character
  - Returns characters row for kidId

PUT /api/kids/[id]/character
  Body: { color, hat, eye, extra, bg }
  - Upsert characters row
  - Returns updated character
```

Auth on GET: verify kid session (localStorage `earnie_kid_id` == `[id]`)  
Auth on PUT: verify kid session matches `[id]`

### 2. Parent-side pages

**`src/app/(parent)/kids/page.tsx`** — Kids list  
- Fetch `GET /api/kids` → render kid cards
- Kid card: avatar circle (avatarColor), name, balance badge, "+ Add tasks" (purple, placeholder link), "Edit" (ghost, disabled for now)
- Dashed "Add a kid" card → links to `/parent/kids/new`
- Empty state: just the dashed "Add a kid" card + instructional copy

**`src/app/(parent)/kids/new/page.tsx`** — Add kid form  
- Mobile-first, stepped (name → color → PIN) based on prototype winner
- Client component (`"use client"`)
- On submit: `POST /api/kids` → redirect to `/parent/kids` with `?created=1`
- Validation: name required, PIN 4 digits, confirm PIN matches
- Color swatch: 6 preset colors from design tokens (mint, peach, lemon, coral, sky, coin)

### 3. Kid-facing Character Studio

**`src/components/kid/CharacterStudio/CharacterStudio.tsx`** — Modal component  
- Backed by `Modal` from `src/components/ui/Modal/` (Base UI)
- Categories: Color, Hat, Eye, Extra, Scene (horizontal scroll)
- Options grid: 5 cols, aspect-ratio 1:1 cells, selected = green-tint + checkmark
- Composable SVG character (layers: body fill, hat, eye, extra)
- Dice button: randomize all options with pop animation
- Save: `PUT /api/kids/[id]/character` + write to `localStorage('earnie_char')` + close + toast

**`src/app/(kid)/kid/profile/page.tsx`** — Kid profile page  
- Left: character preview (lavpale bg + dot grid + animated CharacterSVG)
- "Edit my character" green button → opens CharacterStudio modal
- Right: badges grid (locked at 40% opacity) + milestone trail
- On mount: hydrate charState from `localStorage('earnie_char')`, fall back to `GET /api/kids/[id]/character`

### 4. E2E Tests

**File:** `e2e/kids-profile.spec.ts` (Playwright)

```
Test suite: Kid profile creation and character customization

1. Parent creates kid profile
   - Login as parent
   - Navigate to /parent/kids
   - Click "Add a kid"
   - Fill name ("Test Kid"), pick a color, set PIN (1234), confirm PIN
   - Submit → assert redirect to /parent/kids
   - Assert new kid card appears with correct name and color

2. Kid logs in with PIN
   - Navigate to /profile-picker
   - Click "Test Kid" card
   - Enter PIN 1234
   - Assert redirect to /kid/home

3. Kid customizes character
   - Navigate to /kid/profile
   - Click "Edit my character"
   - Assert Character Studio modal opens
   - Select a Hat option (Cap)
   - Select a Scene option (Mint)
   - Click Save
   - Assert modal closes
   - Assert toast appears
   - Assert character preview reflects changes

4. Character persists across reload
   - Reload /kid/profile
   - Assert character still shows Cap hat + Mint scene
```

---

## File Checklist

| File | Status | Notes |
|---|---|---|
| `src/app/api/kids/route.ts` | Needs POST added | GET already exists |
| `src/app/api/kids/[id]/character/route.ts` | New | GET + PUT |
| `src/app/(parent)/kids/page.tsx` | Replace stub | Full kids list |
| `src/app/(parent)/kids/new/page.tsx` | New | Add-kid form |
| `src/components/kid/CharacterStudio/CharacterStudio.tsx` | New | Studio modal |
| `src/app/(kid)/kid/profile/page.tsx` | Update | Wire in CharacterStudio |
| `src/components/ui/PrototypeSwitcher/PrototypeSwitcher.tsx` | Done | Delete after prototype review |
| `src/app/(parent)/prototype/kids/page.tsx` | Done | Delete after prototype review |
| `e2e/kids-profile.spec.ts` | New | Playwright E2E |

---

## Avatar color palette

| Token class | Hex | Label |
|---|---|---|
| `bg-[#C7E9D4]` | `#C7E9D4` | Mint |
| `bg-[#F8D3B2]` | `#F8D3B2` | Peach |
| `bg-[#F7E68C]` | `#F7E68C` | Lemon |
| `bg-[#F0A6A0]` | `#F0A6A0` | Coral |
| `bg-[#CDE7F2]` | `#CDE7F2` | Sky |
| `bg-[#F4D34E]` | `#F4D34E` | Coin |

---

## Open questions

- [ ] Should the parent be able to **rename** a kid or **change their PIN** from the kids list? (out of scope for now — needs an "Edit" detail page)
- [ ] Should the kid's character be **visible on the parent dashboard** kid cards? (nice-to-have; needs character fetch in the parent API)
- [ ] Prototype winner — needs review before implementation of forms begins
