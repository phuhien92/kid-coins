<p align="center">
  <img src="docs/assets/kid-coin-logo.png" alt="Kid Coin — a smiling gold coin beside the kid-coin wordmark" width="420" />
</p>

# Kid Coin

**Little wins. Big money habits.**

Earn. Save. Grow together.

![Kid Coin: a friendly robot holding a star coin beside a growing savings jar](docs/assets/kid-coin-banner.jpeg)

## A little responsibility. A moment of pride.

Imagine a child saving for a LEGO set. Today, they pack their backpack and help clear the table. They mark a task done, a parent approves it, and a few coins bring that LEGO set closer. Tomorrow, there is a choice: spend on a small reward now, or keep working toward something bigger.

That small decision is where Kid Coin begins.

Kid Coin is a family web app that turns everyday effort into visible progress. Children practice responsibility, patience, and making choices. Parents set clear expectations and meaningful rewards. The moment we want to create is simple: **“I did this myself.”**

> Our vision: help kids become more independent and thoughtful with money through everyday accomplishments.

## Built for kids. Guided by parents.

Our initial focus is families with children **ages 6–10**, within the broader 5–12 audience described in the [product brief](PRODUCT.md).

For a child, three things should be obvious: what can I do today, what have I earned, and what am I working toward? For a parent, assigning tasks and approving progress should fit into an ordinary busy day.

Rewards can be a toy, choosing dinner, or special time together. Coins are virtual, and parents decide what they mean for their family. Real-money transfers are outside the MVP.

Families should also decide which activities earn coins. Helping at home and caring for yourself can be responsibilities in their own right; every act of kindness does not need a price tag.

## The MVP: one complete family journey

**Assign a task → submit completion → parent approves → earn coins → request a reward → parent approves and delivers it.**

A box is checked only when the feature works in the app on `develop`: the screen exists and calls the real API. Server routes that no screen uses yet are noted but stay unchecked. Nothing here has been verified in a family pilot yet.

### Set up
- [x] Parent signup, login, and password reset
- [x] Create child profiles
- [x] Profile picker for a shared device, with an optional parent PIN

### Assign
- [x] Parent creates, edits, and removes tasks with a title and coin value
- [x] Daily or one-time schedule

### Complete
- [ ] Child sees today's real tasks (the kid screens still use sample data)
- [ ] Child submits completed work (API route exists; the kid screen doesn't call it yet)

### Approve
- [x] Parent approval queue
- [x] Approve a task, or decline it with a reason so the child can try again

### Earn
- [ ] Child sees their real coin balance (the kid home screen still uses sample data)
- [ ] Simple history of coins earned and spent (transactions are recorded, but there's no screen for them)

### Redeem
- [ ] Parent manages rewards with fixed coin prices (API route exists; no parent screen yet)
- [ ] Child browses rewards and requests one (the shop is a "coming soon" placeholder; the API route exists)
- [x] Parent approves or declines reward requests
- [ ] Fulfillment tracking: mark a reward as delivered

### Trust
- [x] Coins awarded only after parent approval (on by default; a stored family setting can turn it off, but there is no screen for it yet)
- [x] Pending reward requests are held against the balance
- [x] Duplicate awards and overspending are blocked on the server
- [ ] Every balance change is understandable to parent and child (needs the coin history)

## Target plan

These are release goals, not claims of completed validation.

- [ ] **Finish and verify the core journey.** Walk through setup, daily tasks, approvals, coin history, redemption, and fulfillment as both parent and child. Resolve gaps before expanding the experience.
- [ ] **Make the first five minutes easy.** Target: a parent creates a child profile, three tasks, and one reward within five minutes. A child understands the next action without a tutorial.
- [ ] **Try it with 3–5 families for two weeks.** Look for repeated task completion, at least one completed reward cycle per family, and parents finding approvals easy enough to maintain.
- [ ] **Improve from family feedback.** Prioritize confusing steps, repeated reminders, accessibility, and reliability before adding more features.

Success means a routine needs fewer reminders, a child feels proud of a reward they earned, and a parent wants to keep using the app. Time spent in the app can stay low.

## Project status

**MVP in active development · package version 0.1.0**

The immediate priority is connecting the kid screens to the real data so the core family journey works end to end, then simplifying it for a small pilot.

### Foundations
- [x] Design-system components with Storybook stories
- [x] Vitest unit tests and Playwright end-to-end specs
- [x] GitHub Actions builds the app and runs unit tests

### Already built beyond the MVP
These exist in code but don't expand the first-release commitment.
- [x] Savings and giving jars: allocate, withdraw, and interest accrual
- [x] Character customization

This status describes source code and configuration. It does not assert that a production deployment, current CI run, or family pilot has been verified.

**Naming note:** the repository is `kid-coins`; existing product documents, screens, and internal identifiers use **Earnie**. This README introduces the supplied **Kid Coin** branding. Updating the application branding is separate work.

## Beyond the first little win

Once the core loop earns families' trust, Kid Coin can grow with the child. These are future directions rather than promised release dates.

- [ ] **Savings goals and jars:** let children choose a goal and practice setting coins aside; refine the existing jar implementation through family feedback
- [ ] **Better routines:** add flexible schedules, responsibility-only tasks, and gentle reminders without requiring coins for every activity
- [ ] **A growing companion:** build on character customization with milestone celebrations that recognize effort and welcome kids back after a break
- [ ] **Parent planning assistance:** help parents turn "make mornings easier" into an age-appropriate routine; parents review suggestions and control rewards
- [ ] **Family reflection:** offer a short weekly review of accomplishments, choices, and what to adjust together
- [ ] **Everyday money lessons:** introduce saving, spending, giving, and tradeoffs when a child's own decisions make them relevant

AI coaching, elaborate character progression, advanced analytics, and real-money integrations are outside the MVP. Some supporting code already exists; the release scope stays focused on tasks, coins, and parent-approved rewards.

## For builders

Kid Coin uses **Next.js 16 and React 19**, **TypeScript**, **Tailwind CSS v4**, and **Framer Motion**. Data lives in a local **SQLite** file through **Drizzle ORM**, with **Supabase Auth** for parent accounts. The repository also includes Anthropic SDK and PostHog integrations.

### Run locally

Use Node.js 22 (matching CI) and pnpm 9.

```bash
pnpm install --frozen-lockfile
cp .env.example .env.local
```

Fill in the Supabase settings in `.env.local` using a development Supabase project, and set `SQLITE_PATH` to an absolute file path outside the checkout. The example file also documents Anthropic, PostHog, and savings-jar cron settings for those integrations. Keep service-role credentials on the server.

```bash
SQLITE_PATH=/absolute/path/earnie.sqlite pnpm db:sqlite:migrate
pnpm dev
```

Open [localhost:3000](http://localhost:3000).

| Command | Purpose |
| --- | --- |
| `pnpm build` | Create a production build |
| `pnpm test:run` | Run Vitest tests |
| `pnpm test:e2e` | Run Playwright tests; see [configuration](playwright.config.ts) for server setup |
| `pnpm storybook` | Explore the component library |

### Explore the project

- [Product purpose and principles](PRODUCT.md)
- [Design system](DESIGN.md)
- [Visual handoff and screen prototypes](design_handoff_earnie/README.md)
- [Task and reward implementation plan](docs/PLAN-task-reward-system.md)
- [Contributor and agent guide](AGENTS.md)

Feature branches start from `develop` and return through a pull request. Read the contributor guide and relevant repository skills before changing application code.

Original design inspiration: [Kids Educational App Branding](https://dribbble.com/shots/27139208-Kids-Educational-App-Branding).
