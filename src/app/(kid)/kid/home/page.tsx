"use client";

import Link from "next/link";
import { Badge, ProgressBar } from "@/components/ui";
import { PennyMascot } from "@/components/kid/PennyMascot";
import { useKidHomeData } from "@/context/KidContext";

/**
 * Kid Home — the daily entry point.
 *
 * Layout: single-column, mobile-first. The coin balance is the canvas;
 * the goal collapses to a slim pill; today's tasks land as a full-bleed
 * bottom CTA. See DESIGN.md §1 for the "Picture-Book Ledger" rationale.
 *
 * Data flows from `<KidProvider>` (parent layout) via `useKidHomeData()`.
 */
export default function KidHomePage() {
  const { kidName, balance, streak, todayEarned, goal, pendingTaskCount } =
    useKidHomeData();
  const goalPercent = Math.round((goal.current / goal.target) * 100);
  const taskCopy = pendingTaskCount === 1 ? "task" : "tasks";

  return (
    // `flex-1` fills the layout main's reserved (viewport − tab bar) area,
    // so the bottom CTA sits cleanly above the mobile tab bar.
    <div className="flex-1 flex flex-col">
      {/* Top bar — just the streak badge; the sidebar carries the brand at md+ */}
      <header className="flex items-center justify-end px-5 pt-5">
        <Badge variant="streak" aria-label={`${streak}-day streak`}>
          <span aria-hidden>🔥</span> {streak}
        </Badge>
      </header>

      {/* Hero — balance is the screen */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-10 text-center">
        <p className="font-body font-bold text-[14px] text-ink-soft uppercase tracking-wider mb-2">
          Hi {kidName}, you have
        </p>

        <div className="flex items-center gap-2">
          <span
            className="font-display font-bold text-ink leading-[0.9]"
            style={{
              fontSize: "clamp(5rem, 22vw, 9rem)",
              letterSpacing: "-0.04em",
            }}
            aria-label={`${balance} coins`}
          >
            {balance}
          </span>
          <PennyMascot
            float
            className="w-[clamp(72px,18vw,128px)] h-auto -mb-2"
          />
        </div>
        <h1 className="font-display font-semibold text-[22px] text-ink mt-1">
          coins
        </h1>

        <p className="font-body font-bold text-[15px] text-ink-soft mt-3">
          +{todayEarned} earned today
        </p>

        {/* Goal strip */}
        <section
          aria-label="Goal progress"
          className="w-full max-w-[480px] mt-10 bg-cream-card border-[2.5px] border-ink rounded-pill px-4 py-3 shadow-card"
        >
          <div className="flex items-center gap-3 text-left">
            <div
              className="w-9 h-9 rounded-pill border-[2px] border-ink bg-lav-pale flex items-center justify-center text-[18px] flex-shrink-0"
              aria-hidden
            >
              {goal.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-[14px] text-ink leading-tight truncate">
                {goal.name}
              </p>
              <div className="mt-1.5">
                <ProgressBar
                  value={goalPercent}
                  color="coin"
                  height="sm"
                  aria-label={`Saving for ${goal.name}: ${goal.current} of ${goal.target} coins`}
                />
              </div>
            </div>
            <span className="font-body font-bold text-[12px] text-ink-soft whitespace-nowrap">
              {goal.current}/{goal.target}
            </span>
          </div>
        </section>
      </main>

      {/* Full-bleed bottom CTA */}
      <Link
        href="/kid/tasks"
        className="block bg-green text-white border-t-[3px] border-ink px-6 pt-5 pb-7 shadow-[inset_0_4px_0_var(--color-green-dk)] active:bg-green-dk transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-ink focus-visible:outline-offset-[-6px]"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-body font-bold text-[12px] uppercase tracking-wider opacity-85">
              Today
            </p>
            <p className="font-display font-semibold text-[22px] leading-tight">
              {pendingTaskCount} {taskCopy} to earn coins
            </p>
          </div>
          <div
            className="w-14 h-14 rounded-pill border-[2.5px] border-ink bg-white text-ink flex items-center justify-center font-display font-bold text-[24px] flex-shrink-0"
            aria-hidden
          >
            →
          </div>
        </div>
      </Link>
    </div>
  );
}
