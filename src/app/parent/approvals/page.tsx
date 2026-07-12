"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Badge, Button, Modal, Page, Skeleton, Tabs, Toast } from "@/components/ui";
import { ProfilePickerLink } from "@/components/parent/ProfilePickerLink";
import { ApprovalCard } from "@/components/parent/ApprovalCard";
import { useApprovals } from "@/hooks/useApprovals";
import type { RedemptionRequest, TaskCompletion } from "@/types";
import { formatRelativeTime } from "@/lib/utils";

const FALLBACK_AVATAR = "#F4D34E";

type DeclineTarget =
  | { kind: "task"; id: string; label: string }
  | { kind: "reward"; id: string; label: string };

function ApprovalsSkeleton() {
  return (
    <div className="flex flex-col gap-3 mt-6">
      {[0, 1, 2].map((i) => (
        <Skeleton.Block key={i} className="h-28 w-full rounded-[20px]" />
      ))}
    </div>
  );
}

function TabLabel({ children, count }: { children: React.ReactNode; count: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      {children}
      {count > 0 && <Badge variant="count">{count}</Badge>}
    </span>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-body font-[800] text-[14px] text-ink-soft text-center py-10 leading-relaxed"
      role="status"
    >
      {children}
    </p>
  );
}

export default function ParentApprovalsPage() {
  const {
    loading,
    error,
    taskCompletions,
    redemptions,
    kidsById,
    taskCount,
    redemptionCount,
    approveTask,
    declineTask,
    approveRedemption,
    declineRedemption,
    approveAllTasks,
    approveAllRedemptions,
    refresh,
  } = useApprovals();

  const [tab, setTab] = useState<string>("tasks");
  const [toast, setToast] = useState("");
  const [declineTarget, setDeclineTarget] = useState<DeclineTarget | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set());
  const [approvingAll, setApprovingAll] = useState(false);

  function avatarColor(kidId: string) {
    return kidsById[kidId]?.avatarColor ?? FALLBACK_AVATAR;
  }

  function kidBalance(kidId: string) {
    return kidsById[kidId]?.balance;
  }

  function setPending(id: string, pending: boolean) {
    setPendingIds((current) => {
      const next = new Set(current);
      if (pending) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  /** A row's actions are disabled while its own request — or a bulk run — is in flight. */
  function isBusy(id: string) {
    return approvingAll || pendingIds.has(id);
  }

  async function handleApproveTask(item: TaskCompletion) {
    setPending(item.id, true);
    try {
      await approveTask(item.id);
      setToast(`Approved — ${item.coinsEarned} coins sent to ${item.kidName}`);
    } catch {
      setToast("Couldn't approve. Please try again.");
    } finally {
      setPending(item.id, false);
    }
  }

  async function handleApproveRedemption(item: RedemptionRequest) {
    setPending(item.id, true);
    try {
      await approveRedemption(item.id);
      setToast(`Approved — ${item.rewardTitle} for ${item.kidName}`);
    } catch {
      setToast("Couldn't approve. Please try again.");
    } finally {
      setPending(item.id, false);
    }
  }

  async function handleApproveAll() {
    if (approvingAll) return;
    setApprovingAll(true);
    try {
      if (tab === "tasks") await approveAllTasks();
      else await approveAllRedemptions();
      setToast("All caught up 🎉");
    } catch {
      setToast("Some approvals couldn't be saved.");
    } finally {
      setApprovingAll(false);
    }
  }

  function openDecline(target: DeclineTarget) {
    setReason("");
    setDeclineTarget(target);
  }

  async function confirmDecline() {
    if (!declineTarget) return;
    const trimmed = reason.trim() || undefined;
    const { kind, id } = declineTarget;
    setSubmitting(true);
    setPending(id, true);
    try {
      if (kind === "task") await declineTask(id, trimmed);
      else await declineRedemption(id, trimmed);
      setToast("Declined — coins stay saved");
      setDeclineTarget(null);
    } catch {
      setToast("Couldn't decline. Please try again.");
    } finally {
      setSubmitting(false);
      setPending(id, false);
    }
  }

  const activeCount = tab === "tasks" ? taskCount : redemptionCount;

  return (
    <Page>
      <Page.Content className="max-w-[760px] mx-auto w-full pt-6 pb-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-1">
          <div>
            <h1 className="font-display font-bold text-[28px] text-ink leading-tight">
              Approvals
            </h1>
            <p className="font-body font-[800] text-[13px] text-ink-soft mt-1.5">
              Review what your kids have submitted — approve to send coins, or
              decline to keep them saved
            </p>
          </div>
          <ProfilePickerLink className="self-start sm:mt-1" />
        </div>

        {error && (
          <div className="flex flex-col items-start gap-3 mt-4">
            <p className="font-body text-[14px] text-red-600" role="alert">
              {error}
            </p>
            <Button type="button" variant="purple" size="sm" onClick={refresh}>
              Try again
            </Button>
          </div>
        )}

        {loading && <ApprovalsSkeleton />}

        {!loading && !error && (
          <Tabs.Root value={tab} onValueChange={(value) => setTab(String(value))} className="mt-5">
            <Tabs.List>
              <Tabs.Tab value="tasks" variant="parent">
                <TabLabel count={taskCount}>Tasks</TabLabel>
              </Tabs.Tab>
              <Tabs.Tab value="rewards" variant="parent">
                <TabLabel count={redemptionCount}>Rewards</TabLabel>
              </Tabs.Tab>
            </Tabs.List>

            {(activeCount > 3 || approvingAll) && (
              <Button
                type="button"
                variant="purple"
                size="full"
                disabled={approvingAll}
                onClick={handleApproveAll}
                className="mt-6"
              >
                {approvingAll ? "Approving…" : `✓ Approve all (${activeCount})`}
              </Button>
            )}

            <Tabs.Panel value="tasks" className="mt-4">
              {taskCompletions.length === 0 ? (
                <EmptyState>
                  All caught up 🎉
                  <br />
                  No task completions waiting.
                </EmptyState>
              ) : (
                <ul className="flex flex-col gap-3">
                  <AnimatePresence initial={false}>
                    {taskCompletions.map((item) => (
                      <ApprovalCard
                        key={item.id}
                        kidName={item.kidName}
                        avatarColor={avatarColor(item.kidId)}
                        title={item.taskTitle}
                        subtitle="Task completed"
                        coins={item.coinsEarned}
                        kidBalance={kidBalance(item.kidId)}
                        timeLabel={formatRelativeTime(new Date(item.completedAt))}
                        busy={isBusy(item.id)}
                        onApprove={() => handleApproveTask(item)}
                        onDecline={() =>
                          openDecline({ kind: "task", id: item.id, label: item.taskTitle })
                        }
                      />
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="rewards" className="mt-4">
              {redemptions.length === 0 ? (
                <EmptyState>
                  All caught up 🎉
                  <br />
                  No reward redemptions waiting.
                </EmptyState>
              ) : (
                <ul className="flex flex-col gap-3">
                  <AnimatePresence initial={false}>
                    {redemptions.map((item) => (
                      <ApprovalCard
                        key={item.id}
                        kidName={item.kidName}
                        avatarColor={avatarColor(item.kidId)}
                        title={item.rewardTitle}
                        subtitle="Reward redemption"
                        coins={item.coinsSpent}
                        kidBalance={kidBalance(item.kidId)}
                        timeLabel={formatRelativeTime(new Date(item.createdAt))}
                        busy={isBusy(item.id)}
                        onApprove={() => handleApproveRedemption(item)}
                        onDecline={() =>
                          openDecline({
                            kind: "reward",
                            id: item.id,
                            label: item.rewardTitle,
                          })
                        }
                      />
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </Tabs.Panel>
          </Tabs.Root>
        )}
      </Page.Content>

      <Modal
        open={!!declineTarget}
        onClose={() => setDeclineTarget(null)}
        width="sm"
        aria-labelledby="decline-title"
      >
        <div className="p-6">
          <Modal.Close />
          <Modal.Title className="mb-1">Decline this?</Modal.Title>
          <p className="font-body font-[700] text-[13.5px] text-ink-soft">
            {declineTarget?.label}
          </p>

          <label
            htmlFor="decline-reason"
            className="block font-display font-semibold text-[14px] text-ink mt-5 mb-2"
          >
            Reason <span className="text-ink-soft font-body font-[700]">(optional)</span>
          </label>
          <textarea
            id="decline-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Let them know why…"
            className="w-full border-[2px] border-ink rounded-control px-4 py-3 font-body font-[700] text-[13.5px] text-ink placeholder:text-ink-soft bg-white outline-none focus:border-purple transition-colors resize-none"
          />

          <div className="flex gap-2 mt-5">
            <Button
              type="button"
              variant="ghost"
              size="full"
              disabled={submitting}
              onClick={() => setDeclineTarget(null)}
            >
              Keep it
            </Button>
            <Button
              type="button"
              variant="purple"
              size="full"
              disabled={submitting}
              onClick={confirmDecline}
            >
              Decline
            </Button>
          </div>
        </div>
      </Modal>

      <Toast message={toast} visible={!!toast} onDismiss={() => setToast("")} />
    </Page>
  );
}
