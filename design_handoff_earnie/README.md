# Handoff: Earnie — Kid Coins App

**Repo:** https://github.com/phuhien92/kid-coins  
**Design date:** June 2026  
**Fidelity:** High-fidelity — pixel-perfect mockups with final colors, typography, spacing, and interactions.

---

## Overview

Earnie is a gamified financial-literacy web app for families. Kids complete daily chores, hygiene routines, and one-time tasks to earn virtual coins. Coins can be saved toward a goal or redeemed for parent-approved rewards. Parents manage tasks, approve redemptions, and set goals with the help of an AI coach.

The HTML files in this package are **design references** — prototypes showing intended look and behavior. The task is to **recreate these designs in the target codebase** using its established patterns, components, and framework (React recommended). Do not ship the HTML directly.

---

## App surfaces

| Surface | File | Notes |
|---|---|---|
| Kid Web App | `Earnie - Kid Web App.html` | Primary child-facing UI. Mobile-first with desktop sidebar. |
| Parent Web App | `Earnie - Parent Web App.html` | Parent dashboard. Desktop sidebar + mobile bottom nav. |
| Login & Profiles | `Earnie - Login & Profiles.html` | Auth + profile picker |
| Parent Control | `Earnie - Parent Control.html` | Task/goal management panel |
| Brand Board | `Earnie - Brand & Screens.html` | Visual language overview |
| Character Studio | `Earnie - Character Studio.html` | Standalone character customization view |

---

## Design Tokens

### Colors

```css
--cream:        #FBF8EF   /* page background */
--cream-card:   #FCFAF3   /* card surface */
--ink:          #1C1B17   /* primary text + borders */
--ink-soft:     #5C5A50   /* secondary / muted text */
--line:         rgba(28,27,23,.12)  /* dividers */

--green:        #2F7A55   /* primary CTA (kid app), success */
--green-dk:     #245F42   /* green press/shadow */
--green-tint:   #CFE7D8   /* green chip background */

--purple:       #7B6BE6   /* parent CTA */
--purple-dk:    #5E4FCB   /* purple press/shadow */
--lavpale:      #DEE0FA   /* lavender tint background */
--lav:          #C7CAF4   /* lavender mid */

--coin:         #F4D34E   /* coin / highlight yellow */
--coin-dk:      #E3BE34   /* coin shadow */

--mint:         #C7E9D4
--peach:        #F8D3B2
--lemon:        #F7E68C
--coral:        #F0A6A0
--sky:          #CDE7F2

--shadow:       0 10px 26px -14px rgba(28,27,23,.30)
```

### Typography

| Token | Value |
|---|---|
| Display font | **Fredoka** 400/500/600/700 (Google Fonts) |
| Body font | **Nunito** 400/600/700/800/900 (Google Fonts) |
| Title size | 2rem |
| Lede size | 1rem |
| Body | 13–15px |
| Min tap text | 13px |

Use Fredoka for headings, nav labels, buttons, coin amounts, and any "playful" display text. Nunito for body copy, labels, and secondary UI.

### Spacing & Radius

```
--space-2: 0.5rem    --space-3: 0.75rem   --space-4: 1rem
--space-6: 1.5rem    --space-8: 2rem

--radius-card:    16px   /* outer cards */
--radius-control: 10px   /* buttons, inputs, small chips */
--radius-pill:    999px  /* badge, coin balance chips */
```

---

## Screens — Kid Web App

### 1. Home

**Layout:** Two-column grid on ≥768px (`1.3fr 1fr`), single column on mobile.

**Balance card** (left column)
- 3px ink border, 26px radius, cream-card background
- Large coin balance: Fredoka 700, 54px. Inline coin pip (`border-radius:50%; background:--coin; border:1.6px solid --ink; 1em × 1em`).
- Sparkline bar chart below: 4 bars, last bar active (`--coin` fill). Bars share `flex-end` alignment within a 130px-tall row.

**Goal card** (right column, stacked above promo)
- Emoji icon (50×50, 15px radius, 2.5px ink border)
- Goal name + sub-label
- Progress bar: 16px tall, 2.5px ink border, `--lavpale` track, `--coin` fill, 999px radius
- Progress meta: percentage left, `coin + current / total` right

**Promo banner** — links to Tasks view
- `--green` background, 3px ink border, 3×3 24px radius card
- `6px 0 --green-dk` box-shadow (bottom-only)
- White text, Fredoka 600 20px
- Mascot SVG characters bottom-left

### 2. Tasks

**Tab switcher:** Daily / One-time  
Tabs: Fredoka 600 15px, 2.5px border, 14px radius, full-width pill in a max-340px row. Active tab: `--ink` bg, `--cream` text.

**Task item**
- `border: 3px solid --ink; border-radius: 20px; background: #fff; padding: 15px`
- Left icon: 52×52, 15px radius, colored background (varies per category — see palette above), emoji inside
- Center: task name (Fredoka 600 17px) + reward line (`--green` text, coin pip + amount)
- Right: 34px circle check (3px ink border). Completed state: `--green` fill, ✓ glyph, `--green-tint` card bg, strike-through task name
- Tap to complete → triggers **Celebration overlay**

**One-time tasks** identical markup; hidden behind tab.

**Completion flow:**
1. Mark task done visually (green check, strikethrough)
2. Add coin amount to running balance
3. Show celebration overlay (confetti + coin pop + "Well done!" + "Collect" CTA)
4. On "Collect": dismiss overlay, update balance display

### 3. Rewards / Shop

**Balance bar** — full-width, `--coin` bg, 3px ink border, 20px radius. Shows current coin total.

**Reward grid** — `repeat(auto-fill, minmax(230px, 1fr))` with 15px gap. Each card:
- 96px tall emoji header section (`border-bottom: 2.5px solid --ink`) with colored background
- Padded body: reward name (Fredoka 600 17px), cost + redeem button
- **Redeem** states: available (green), locked (white/muted, "N to go"), pending (coin yellow, "⏳ Pending")
- Tapping Redeem → pending state + toast ("Sent to parent for approval")

On mobile (≤767px): 2-column grid; emoji header shrinks to 78px.

### 4. Profile

**Layout:** `300px 1fr` grid on desktop, stacked on mobile.

**Character card** (left)
- 240px stage: `--lavpale` bg, dot-grid pattern overlay, animated SVG mascot (idle float, `translateY` + `rotate` loop, 3s)
- "Edit my character" green button below

**Right column** — two panels stacked:
- **Badges** grid: `repeat(auto-fill, minmax(90px, 1fr))`, each badge 2.5px border 16px radius. Locked badges at 40% opacity.
- **Milestone trail**: dashed vertical line (3px, repeating gradient), milestone dots (28px circles), done = `--green`, current = `--coin`, upcoming = white.

### Navigation (Kid App)

**Desktop (≥768px):** Left sidebar, 230px wide, sticky, `height:100vh`.  
**Mobile (<768px):** Fixed bottom tab bar, 4 items, `env(safe-area-inset-bottom)` padding.

Active nav item: `--green-tint` bg + ink border.  
Active tab icon: 46×38 rounded pill with `--green-tint` bg + ink border.

---

## Screens — Parent Web App

### 1. Home

**Stat row** — 4 cards, `repeat(4, 1fr)` grid. Collapses to 2-col at ≤1180px.
Each stat card: 40px emoji icon with colored square (12px radius, 2px border), label, large Fredoka number, delta line.

**Two-column below** (`1.6fr 1fr`, collapses at ≤1180px):
- Left: Kid cards grid + "Add a kid" dashed card
- Right: Approvals panel + Recent activity panel

**Kid card:**
- Avatar (46px circle, ink border, colored bg)
- Name (Fredoka 600 18px) + age
- Goal chip (top-right, pill, `--green-tint` + ink border, Fredoka 600 12.5px)
- Progress bar + meta (same style as kid app)
- Two action buttons: "View" (ghost) and "+ New goal" (purple primary)
- Hover: `translateY(-3px)`

**Add a kid card:** dashed purple border (`--lavpale` bg), plus circle, centered text.

**Approvals panel:**
- Per-request row: avatar, name + type, coin cost, Approve/Decline buttons
- Approve = green primary with `0 3px 0 --green-dk` shadow
- Decline = ghost white
- Approved/declined → row removes, count badge updates

**Activity feed:** icon square (34×34, 10px radius), title + timestamp, coin delta right-aligned.

### 2. Approvals (full view)

Same approval cards as home panel, max-width 620px.

### 3. Kids (management)

Same kid cards as home, max-width 760px. "Edit tasks" + "+ New goal" actions.

### 4. Settings

Max-width 560px card with setting rows:
- 40px icon square + label + description
- Toggle switch (`48×28`, 2.5px border, `--green` when on, slide animation 0.15s)
- Some rows: action button instead of toggle

### Navigation (Parent App)

**Desktop ≥1024px:** Full sidebar, 250px. Shows label text + active state.  
**Tablet 768–1023px:** Collapsed to 74px icon-only rail.  
**Mobile <768px:** Hidden sidebar + fixed bottom nav (4 items) + hamburger in topbar.

Hamburger opens sidebar as overlay with dark scrim behind it.

Active nav item: `--green-tint` bg + ink border.

---

## Character Studio (Kid App — Modal)

Triggered from Profile. Opens as a bottom-sheet-style modal (`min(440px, 100%)` wide, centered with dark scrim).

**Categories (horizontal scroll):** Color, Hats, Glasses, Extras, Scene  
Each category: icon button (46×46, 14px radius) + label. Active: `--green-tint` bg, `0 4px 0 --green-dk` shadow.

**Options grid:** 5 columns, aspect-ratio 1:1 cells. Selected cell: `--green-tint` + checkmark badge (top-right, 20px green circle).

**Character SVG** is fully composable:
- `cFill` — body fill color (circle + feet)
- `cHat` — hat layer: `cap`, `party`, `crown`, `beanie`, `band` (show/hide via `display`)
- `cEye` — eye style: `sun`, `round`, `star`
- `cExtra` — accessories: `bow`, `flower`, `pin`, `freckles`
- `cBg` — stage background color

Persist character state to `localStorage` key `earnie_char` as JSON `{ color, hat, eye, extra, bg }`.

**Dice button** — randomizes all options with pop animation (`cubic-bezier(.2,1.5,.4,1)`).  
**Save** — sparks animation + localStorage write + close modal + toast.

---

## AI Coach Modal (Parent App)

Opens from any "+ New goal" / "Set a goal with AI" button.

**Conversation script** — 5 steps, each with an AI bubble + quick-reply chips:
1. What's the big picture?
2. What are they saving for?
3. Roughly what does it cost?
4. By when?
5. Show plan card → "Create it"

**Plan mini-card:** emoji icon, goal name, 3 stat cells (Target / Timeline / Pace).

**Kid picker:** horizontal chip row inside modal header area. Switching kid restarts conversation.

**Input:** text field + send button. "Type my own" chip focuses the field.

**On finish:** close modal, show toast "🎉 New goal created for [Kid]!"

---

## Interactions & Behavior

### Shared
- View transitions: `translateY(8–10px) → none`, 280–300ms ease, `animation-fill-mode: both`
- Toast: slides up from bottom (translateY 20px → 0), opacity 0→1, auto-dismiss 2200ms
- All primary buttons have a bottom-only box-shadow (`0 4–6px 0 darker-shade`). On `:active`: `translateY(4px)`, shadow collapses to 1px.

### Task completion
1. Add `.done` class to task row (green-tint bg, strikethrough text, green check)
2. Show celebration overlay: confetti burst (32 colored `<i>` elements, CSS fall animation) + coin pop + "Well done!" heading
3. Collect CTA dismisses overlay, updates balance counter

### Approval flow
1. Approve → row removed from both home panel and Approvals view simultaneously, badge count decrements
2. Decline → same removal, toast message differs

### Toggles (Settings)
- Toggle `on` class: green bg, thumb slides right (left: 2px → 22px, 0.15s)

### Streak counter (Kid App)
- Displayed in top-right: `🔥 12` pill, Fredoka 600 16px, `--coin` bg, bottom shadow

---

## Responsive Breakpoints

| Breakpoint | Kid App | Parent App |
|---|---|---|
| < 430px | Single-col rewards, smaller balance text | — |
| < 767px | Bottom tabs, no sidebar, 2-col rewards | Bottom nav, hamburger, single kid-card col |
| 768–1023px | Desktop sidebar shown | Icon-only rail (74px) |
| ≥ 1024px | Full sidebar + wider content | Full sidebar |

---

## Mascots / Illustration

Two SVG mascot characters are embedded inline (as `<symbol>` sprites):

- **Penny** (`#m-penny`) — round yellow coin face, default kid character
- **Lumi** (`#m-lumi`) — purple blob friend
- **Penny (cheer)** (`#m-penny-cheer`) — arms raised, used in celebration overlay

The kid character in the Studio is a fully layered composable SVG (not one of the mascot symbols). Keep it as SVG for performance and customizability — do not replace with images.

---

## State Management

### Kid App
| Variable | Type | Notes |
|---|---|---|
| `balance` | number | Total coins. Updates on task complete + reward redeem. |
| `charState` | object | `{ color, hat, eye, extra, bg }`. Persisted to `localStorage('earnie_char')`. |
| `currentView` | string | `home` / `tasks` / `rewards` / `profile` |
| `activeTab` | string | `daily` / `once` (Tasks screen) |

### Parent App
| Variable | Type | Notes |
|---|---|---|
| `pendingApprovals` | array | List of reward requests. Approve/decline mutates in real time. |
| `currentView` | string | `home` / `approvals` / `kids` / `settings` |
| `coachKid` | string | Currently selected kid in AI Coach modal |
| `coachStep` | number | Index into the 5-step conversation script |

---

## Assets & Icons

All icons are inline SVG (Heroicons-style, 24×24, `stroke-width: 2.2–2.4`). No icon font or external icon library required.

Mascot SVGs are hand-drawn and embedded inline. No external image files needed for the base UI.

Google Fonts CDN:
```
https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800;900&display=swap
```

---

## Files in This Package

```
design_handoff_earnie/
├── README.md                          ← this file
├── Earnie - Kid Web App.html          ← kid-facing UI (primary)
├── Earnie - Parent Web App.html       ← parent dashboard
├── Earnie - Login & Profiles.html     ← auth + profile picker
├── Earnie - Parent Control.html       ← task management
├── Earnie - Character Studio.html     ← character customizer
└── Earnie - Brand & Screens.html      ← visual language overview
```

Open each HTML file in a browser to explore the design interactively. All interactions (task completion, approvals, character studio, AI coach) are wired up.

---

## Suggested Tech Stack

If starting fresh, recommended stack:

- **React** (Vite or Next.js)
- **CSS Modules** or **Tailwind** with the token values above
- **Framer Motion** for the entrance animations, celebration overlay, and character studio transitions
- **localStorage** for character state and streak persistence
- **React Context** for shared coin balance + approval state across views

No external component library needed — the design uses a fully custom component set.
