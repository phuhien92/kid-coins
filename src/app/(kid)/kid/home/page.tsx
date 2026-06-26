"use client";

import { Page } from "@/components/ui";
import {
  KidBalanceCard,
  KidGoalCard,
  KidHomeHeader,
  KidTasksPromoCard,
} from "@/components/kid/home";
import { SwitchProfileButton } from "@/components/kid/SwitchProfileButton";
import { useKidHomeData } from "@/context/KidContext";

/**
 * Kid Home — daily entry point. Matches design handoff layout:
 * kbar header → balance card + (goal card + tasks promo).
 */
export default function KidHomePage() {
  const {
    kidName,
    avatarColor,
    balance,
    streak,
    todayEarned,
    goal,
    pendingTaskCount,
  } = useKidHomeData();

  const taskCopy = pendingTaskCount === 1 ? "task" : "tasks";

  return (
    <Page>
      <Page.Content className="w-full max-w-[960px] mx-auto pt-3 md:pt-5 pb-8 gap-5">
        <div className="md:hidden flex justify-end">
          <SwitchProfileButton />
        </div>

        <KidHomeHeader
          kidName={kidName}
          avatarColor={avatarColor}
          streak={streak}
        />

        <div className="grid gap-4 md:grid-cols-[1.3fr_1fr] md:items-start">
          <KidBalanceCard balance={balance} todayEarned={todayEarned} />

          <div className="flex flex-col gap-4">
            <KidGoalCard
              emoji={goal.emoji}
              name={goal.name}
              current={goal.current}
              target={goal.target}
            />
            <KidTasksPromoCard
              href="/kid/tasks"
              pendingTaskCount={pendingTaskCount}
              taskCopy={taskCopy}
            />
          </div>
        </div>
      </Page.Content>
    </Page>
  );
}
