"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge, CoinIcon, Page, Tabs, Modal } from "@/components/ui";
import { PennyMascot } from "@/components/kid/PennyMascot";
import { cn } from "@/lib/utils";
import { useKidTasksData } from "@/context/KidContext";
import type { Task } from "@/types";

const CARD_COLORS = [
  "bg-lav-pale",
  "bg-mint",
  "bg-coin",
  "bg-peach",
  "bg-lemon",
  "bg-sky",
];

const TASK_EMOJIS = ["🦷", "🛏️", "📚", "🍽️", "🧹", "🐕", "🎨", "💧"];

const CONFETTI_COLORS = [
  "#2F7A55", // green
  "#F4D34E", // coin
  "#7B6BE6", // purple
  "#DEE0FA", // lav-pale
  "#F8D3B2", // peach
  "#C7E9D4", // mint
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
        <h1 className="font-display font-bold text-[26px] text-ink mb-4">
          My tasks
        </h1>

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
                  <ul className="flex flex-col gap-[13px]">
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
      <div className="text-[48px] mb-3" aria-hidden>📋</div>
      <p className="font-display font-semibold text-[18px] text-ink">
        No {tab === "daily" ? "daily" : "one-time"} tasks yet
      </p>
      <p className="font-body font-bold text-[14px] text-ink-soft mt-1">
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
        "w-full flex items-center gap-[14px] border-[3px] border-ink rounded-[20px] p-[15px] text-left",
        "shadow-[0_4px_0_rgba(28,27,23,0.07)] transition-transform duration-[80ms]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-1",
        done
          ? "bg-green-tint cursor-default"
          : "bg-white hover:translate-x-[3px] active:translate-x-[3px] cursor-pointer"
      )}
    >
      {/* Color icon box */}
      <div
        className={cn(
          "w-[52px] h-[52px] rounded-[15px] border-[2.5px] border-ink flex items-center justify-center text-[27px] flex-shrink-0",
          CARD_COLORS[index % CARD_COLORS.length]
        )}
        aria-hidden
      >
        {TASK_EMOJIS[index % TASK_EMOJIS.length]}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={cn("font-display font-semibold text-[17px] leading-tight", done && "line-through opacity-50")}>
          {task.title}
        </p>
        <div className="flex items-center gap-[5px] mt-[3px]">
          <CoinIcon size="sm" />
          <span className="font-body font-bold text-[13px] text-green">
            {done ? `+${task.coinReward} · done!` : `+${task.coinReward} coins`}
          </span>
        </div>
      </div>

      {/* Check circle */}
      <div
        className={cn(
          "w-[34px] h-[34px] rounded-full border-[3px] border-ink flex items-center justify-center flex-shrink-0 transition-colors duration-150",
          done ? "bg-green" : "bg-white"
        )}
        aria-hidden
      >
        {done && <span className="text-white font-black text-[17px] leading-none">✓</span>}
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

      <PennyMascot float className="w-[160px] h-[160px]" />

      <div className="font-display font-bold text-[34px] text-green border-[3px] border-ink bg-coin rounded-pill px-6 py-[9px] shadow-[4px_4px_0_var(--color-ink)] inline-flex items-center gap-[9px]">
        <CoinIcon size="lg" />
        +{task.coinReward}
      </div>

      <h2 className="font-display font-bold text-[28px] text-ink">Well done!</h2>
      <p className="font-body font-bold text-[15px] text-ink-soft max-w-[280px]">
        You finished &ldquo;{task.title}&rdquo; and earned {task.coinReward}{" "}
        {task.coinReward === 1 ? "coin" : "coins"}.
      </p>

      <button
        onClick={onDismiss}
        autoFocus
        className="mt-2 bg-green text-white border-[3px] border-ink font-display font-semibold text-[17px] rounded-[18px] shadow-[0_5px_0_var(--color-green-dk)] hover:bg-green-dk active:translate-y-1 active:shadow-[0_1px_0_var(--color-green-dk)] transition-all duration-[80ms] px-8 py-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
      >
        Collect 🎉
      </button>
    </Modal>
  );
}
