"use client";

import { useState } from "react";
import { Button, Tabs, Toggle } from "@/components/ui";
import { ParentFormField } from "@/components/parent/ParentFormField";
import type { ParentKid } from "@/components/parent/ParentKidCard";
import {
  TASK_EMOJI_OPTIONS,
  buildTaskPayload,
  toDateInputValue,
  type ParentTaskRecord,
  type TaskFormValues,
} from "@/components/parent/task-shared";
import { cn } from "@/lib/utils";

type TaskFormProps = {
  kids: ParentKid[];
  task?: ParentTaskRecord;
  defaultKidId?: string;
  onSuccess: (task: ParentTaskRecord) => void;
  onCancel: () => void;
};

function initialValues(
  kids: ParentKid[],
  task: ParentTaskRecord | undefined,
  defaultKidId?: string
): TaskFormValues {
  return {
    kidId: task?.kidId ?? defaultKidId ?? kids[0]?.id ?? "",
    title: task?.title ?? "",
    emoji: task?.emoji ?? "✅",
    type: task?.type ?? "daily",
    coinReward: task?.coinReward ?? 10,
    scheduledStartAt: toDateInputValue(task?.scheduledStartAt),
    durationDays: task?.durationDays ? String(task.durationDays) : "",
    isActive: task?.isActive ?? true,
  };
}

export function TaskForm({
  kids,
  task,
  defaultKidId,
  onSuccess,
  onCancel,
}: TaskFormProps) {
  const isEdit = !!task;
  const [values, setValues] = useState<TaskFormValues>(() =>
    initialValues(kids, task, defaultKidId)
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update<K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setError("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!values.title.trim()) {
      setError("Title is required");
      return;
    }

    if (!isEdit && !values.kidId) {
      setError("Choose a kid");
      return;
    }

    if (!Number.isFinite(values.coinReward) || values.coinReward <= 0) {
      setError("Coin reward must be at least 1");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = buildTaskPayload(values, isEdit);
      const res = await fetch(isEdit ? `/api/tasks/${task.id}` : "/api/tasks", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Couldn't save task");
        return;
      }

      onSuccess(data.task);
    } catch {
      setError("Couldn't save task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
      <h2 className="font-display font-bold text-[22px] text-ink">
        {isEdit ? "Edit task" : "New task"}
      </h2>

      {!isEdit && (
        <div className="flex flex-col gap-1.5">
          <span className="font-display font-semibold text-[13px] text-ink uppercase tracking-wide">
            Assign to
          </span>
          <div className="flex flex-wrap gap-2">
            {kids.map((kid) => (
              <button
                key={kid.id}
                type="button"
                onClick={() => update("kidId", kid.id)}
                className={cn(
                  "font-display font-semibold text-[14px] border-2 border-ink rounded-pill px-4 py-2 transition-colors",
                  values.kidId === kid.id
                    ? "bg-purple text-white"
                    : "bg-white text-ink hover:bg-black/5"
                )}
              >
                {kid.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <span className="font-display font-semibold text-[13px] text-ink uppercase tracking-wide">
          Emoji
        </span>
        <div className="grid grid-cols-5 gap-2">
          {TASK_EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              aria-label={`Choose ${emoji}`}
              onClick={() => update("emoji", emoji)}
              className={cn(
                "h-11 rounded-control border-2 border-ink text-[22px] transition-colors",
                values.emoji === emoji ? "bg-lav-pale" : "bg-white hover:bg-black/5"
              )}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <ParentFormField
        id="task-title"
        label="Title"
        value={values.title}
        onChange={(title) => update("title", title)}
        placeholder="e.g. Brush teeth"
      />

      <div className="flex flex-col gap-1.5">
        <span className="font-display font-semibold text-[13px] text-ink uppercase tracking-wide">
          Type
        </span>
        <Tabs.Root
          value={values.type}
          onValueChange={(next) => update("type", next as "daily" | "once")}
        >
          <Tabs.List>
            <Tabs.Tab value="daily" variant="parent">
              Daily
            </Tabs.Tab>
            <Tabs.Tab value="once" variant="parent">
              One-time
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.Root>
      </div>

      <ParentFormField
        id="task-coins"
        label="Coin reward"
        type="number"
        min={1}
        value={String(values.coinReward)}
        onChange={(raw) => update("coinReward", Number.parseInt(raw, 10) || 0)}
      />

      <ParentFormField
        id="task-start"
        label="Start date"
        type="date"
        value={values.scheduledStartAt}
        onChange={(scheduledStartAt) => {
          update("scheduledStartAt", scheduledStartAt);
          if (!scheduledStartAt) update("durationDays", "");
        }}
        hint="Optional — leave blank to start immediately"
      />

      {values.scheduledStartAt && (
        <ParentFormField
          id="task-duration"
          label="Duration (days)"
          type="number"
          min={1}
          value={values.durationDays}
          onChange={(durationDays) => update("durationDays", durationDays)}
          hint="Task auto-deactivates after this many days"
        />
      )}

      {isEdit && (
        <Toggle
          checked={values.isActive}
          onChange={(isActive) => update("isActive", isActive)}
          label="Task active"
          ring="purple"
        />
      )}

      {error && (
        <p role="alert" className="font-body text-[13px] text-red-600 font-semibold">
          {error}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="ghost" size="md" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="purple"
          size="md"
          disabled={loading}
          className="flex-[2]"
        >
          {loading ? "Saving…" : isEdit ? "Save changes" : "Create task"}
        </Button>
      </div>
    </form>
  );
}
