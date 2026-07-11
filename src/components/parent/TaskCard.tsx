"use client";

import { useState } from "react";
import { Badge, Button, CoinIcon, Toggle } from "@/components/ui";
import { Card } from "@/components/ui/Card";
import type { ParentTaskRecord } from "@/components/parent/task-shared";
import { cn, formatDate } from "@/lib/utils";

type TaskCardProps = {
  task: ParentTaskRecord;
  onEdit: (task: ParentTaskRecord) => void;
  onUpdated: (task: ParentTaskRecord) => void;
  onDeleted: (taskId: string) => void;
};

function formatSchedule(task: ParentTaskRecord): string | null {
  if (!task.scheduledStartAt && !task.expiresAt) return null;

  const parts: string[] = [];
  if (task.scheduledStartAt) {
    parts.push(`Starts ${formatDate(new Date(task.scheduledStartAt))}`);
  }
  if (task.expiresAt) {
    parts.push(`Ends ${formatDate(new Date(task.expiresAt))}`);
  }
  return parts.join(" · ");
}

export function TaskCard({ task, onEdit, onUpdated, onDeleted }: TaskCardProps) {
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const schedule = formatSchedule(task);

  async function handleToggle(isActive: boolean) {
    setToggling(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      const data = await res.json();
      if (res.ok) onUpdated(data.task);
    } finally {
      setToggling(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      if (res.ok) onDeleted(task.id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Card compact padding="none" radius="parent" className="p-4">
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-control border-2 border-ink bg-lav-pale flex items-center justify-center text-2xl flex-shrink-0"
          aria-hidden
        >
          {task.emoji}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-display font-semibold text-[17px] text-ink leading-tight truncate">
                {task.title}
              </p>
              {task.kidName && (
                <p className="font-body font-bold text-[12px] text-ink-soft mt-0.5">
                  {task.kidName}
                </p>
              )}
            </div>
            <Badge variant="lav" className="flex-shrink-0 capitalize">
              {task.type}
            </Badge>
          </div>

          <div className="flex items-center gap-1 mt-2 text-green-dk">
            <CoinIcon size="sm" />
            <span className="font-body font-bold text-[13px]">
              {task.coinReward} coins
            </span>
          </div>

          {schedule && (
            <p className="font-body font-bold text-[12px] text-ink-soft mt-2">
              {schedule}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t-2 border-line">
        <Toggle
          checked={task.isActive}
          onChange={handleToggle}
          disabled={toggling}
          label={task.isActive ? "Active" : "Paused"}
          ring="purple"
        />

        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(task)}
            className={cn(!task.isActive && "opacity-100")}
          >
            Edit
          </Button>
          <Button
            type="button"
            variant="mini-no"
            size="sm"
            disabled={deleting}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
