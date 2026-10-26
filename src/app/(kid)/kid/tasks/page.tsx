"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge, Button, CoinIcon, Page, Tabs, Modal } from "@/components/ui";
import { PennyMascot } from "@/components/kid/PennyMascot";
import { cn } from "@/lib/utils";
import { useKidTasksData } from "@/context/KidContext";
import type { Task } from "@/types";

// Step tints — Do · Earn · Save · Choose · Grow.
const CARD_COLORS = [
  "bg-gold-tint",
  "bg-earn-tint",
  "bg-save-tint",
  "bg-mint-tint",
  "bg-grow-tint",
];

const TASK_EMOJIS = ["🦷", "🛏️", "📚", "🍽️", "🧹", "🐕", "🎨", "💧"];

const CONFETTI_COLORS = [
  "var(--color-gold)",
  "var(--color-earn)",
  "var(--color-save)",
  "var(--color-mint)",
  "var(--color-grow)",
  "var(--color-gold-lt)",
];

export default function KidTasksPage() {
  const { tasks, addCoins, streak } = useKidTasksData();
  const [locallyCompleted, setLocallyCompleted] = useState<Set<string>>(new Set());
  const [celebration, setCelebration] = useState<{ open: boolean; task: Task | null }>({
    open: false,
    task: null,
  });

  const isDone = (task: Task) =>
    task.completedToday === true || locallyCompleted.has(task.id);

  function handleTaskTap(task: Task) {
    if (isDone(task)) return;
    setLocallyCompleted((prev) => new Set([...prev, task.id]));
    addCoins(task.coinReward);
    setCelebration({ open: true, task });
  }

  function handleDismiss() {
    setCelebration({ open: false, task: null });
  }

  return (
    <Page>
      <Page.Header>
        <Badge variant="streak" aria-label={`${streak}-day streak`}>
          <span aria-hidden>🔥</span> {streak}
        </Badge>
      </Page.Header>

      <Page.Content>
        <h1 className="font-display font-black text-3xl text-ink">
          My tasks
        </h1>
        <p className="font-body font-semibold text-base text-ink-soft mt-1 mb-5">
          Small tasks. Real progress.
        </p>

        <Tabs.Root defaultValue="daily">
          <Tabs.List className="mb-5">
            <Tabs.Tab value="daily" variant="kid">Daily</Tabs.Tab>
            <Tabs.Tab value="once"  variant="kid">One-time</Tabs.Tab>
          </Tabs.List>

          {(["daily", "once"] as const).map((tab) => {
            const filtered = tasks.filter((t) => t.type === tab);
            return (
              <Tabs.Panel key={tab} value={tab}>
                {filtered.length === 0 ? (
                  <EmptyState tab={tab} />
                ) : (
                  <ul className="flex flex-col gap-3">
                    {filtered.map((task, i) => (
                      <li key={task.id}>
                        <TaskCard
                          task={task}
                          index={i}
                          done={isDone(task)}
                          onTap={() => handleTaskTap(task)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </Tabs.Panel>
            );
          })}
        </Tabs.Root>
      </Page.Content>

      <CelebrationModal
        open={celebration.open}
        task={celebration.task}
        onDismiss={handleDismiss}
      />
    </Page>
  );
}

/* ─── Sub-components ──────────────────────────────────────────────── */

function EmptyState({ tab }: { tab: "daily" | "once" }) {
  return (
    <section
      className="my-auto py-16 text-center"
      aria-label={tab === "daily" ? "No daily tasks" : "No one-time tasks"}
    >
      <div className="text-5xl mb-3" aria-hidden>📋</div>
      <p className="font-display font-extrabold text-lg text-ink">
        No {tab === "daily" ? "daily" : "one-time"} tasks yet
      </p>
      <p className="font-body font-bold text-sm text-ink-soft mt-1">
        Ask a parent to add some!
      </p>
    </section>
  );
}

function TaskCard({
  task,
  index,
  done,
  onTap,
}: {
  task: Task;
  index: number;
  done: boolean;
  onTap: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onTap}
      disabled={done}
      aria-label={`${task.title}, ${task.coinReward} coins${done ? ", completed" : ""}`}
      className={cn(
        "w-full flex items-center gap-3.5 border border-line rounded-tile p-4 text-left",
        "shadow-card transition duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2",
        done
          ? "bg-mint-tint cursor-default"
          : "bg-cream-card hover:-translate-y-0.5 hover:shadow-lift active:translate-y-px cursor-pointer"
      )}
    >
      {/* Color icon box */}
      <div
        className={cn(
          "size-13 rounded-control flex items-center justify-center text-3xl flex-shrink-0",
          CARD_COLORS[index % CARD_COLORS.length]
        )}
        aria-hidden
      >
        {TASK_EMOJIS[index % TASK_EMOJIS.length]}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={cn("font-display font-extrabold text-lg leading-tight", done && "line-through text-ink-soft")}>
          {task.title}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <CoinIcon size="sm" />
          <span className="font-body font-bold text-sm text-mint-ink">
            {done ? `+${task.coinReward} · done!` : `+${task.coinReward} coins`}
          </span>
        </div>
      </div>

      {/* Check circle */}
      <div
        className={cn(
          "size-9 rounded-pill border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-150",
          done ? "bg-mint-ink border-mint-ink" : "bg-cream-card border-edge"
        )}
        aria-hidden
      >
        {done && <span className="text-white font-black text-lg leading-none">✓</span>}
      </div>
    </button>
  );
}

function CelebrationModal({
  open,
  task,
  onDismiss,
}: {
  open: boolean;
  task: Task | null;
  onDismiss: () => void;
}) {
  const confetti = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.6,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: Math.random() * 8 + 6,
        duration: Math.random() * 1.5 + 1.5,
      })),
    []
  );

  if (!task) return null;

  return (
    <Modal
      open={open}
      onClose={onDismiss}
      width="sm"
      aria-label="Task completed"
      className="!inset-x-0 !top-0 !translate-y-0 !w-full !max-w-full !h-full !max-h-full !rounded-none flex flex-col items-center justify-center gap-3 text-center px-6 bg-cream/95 border-0 shadow-none"
    >
      {/* Confetti */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
            {confetti.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-sm"
                style={{ left: `${p.x}%`, top: -20, width: p.size, height: p.size, backgroundColor: p.color }}
                animate={{ y: "110vh", rotate: 360 }}
                transition={{ duration: p.duration, delay: p.delay, ease: "linear", repeat: Infinity }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <PennyMascot float className="size-40" />

      <div className="font-display font-black text-4xl text-ink bg-gold rounded-pill px-6 py-2 shadow-gold inline-flex items-center gap-2">
        <CoinIcon size="lg" />
        +{task.coinReward}
      </div>

      <p className="font-body font-extrabold text-sm uppercase tracking-wider text-earn-ink">Celebrate the effort</p>
      <h2 className="font-display font-black text-3xl text-ink">Well done!</h2>
      <p className="font-body font-semibold text-base text-ink-soft max-w-xs">
        You finished &ldquo;{task.title}&rdquo; and earned {task.coinReward}{" "}
        {task.coinReward === 1 ? "coin" : "coins"}.
      </p>

      <Button onClick={onDismiss} autoFocus className="mt-2 px-8 py-3.5">
        Collect 🎉
      </Button>
    </Modal>
  );
}
