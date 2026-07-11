export const TASK_EMOJI_OPTIONS = [
  "✅",
  "🦷",
  "🛏️",
  "📚",
  "🍽️",
  "🧹",
  "🐕",
  "🎨",
  "💧",
  "👕",
  "🗑️",
  "🌱",
  "⚽",
  "🧺",
  "🚿",
  "📖",
  "🥗",
  "🪥",
  "🧸",
  "⭐",
] as const;

export type ParentTaskRecord = {
  id: string;
  kidId: string;
  kidName?: string;
  title: string;
  emoji: string;
  type: "daily" | "once";
  coinReward: number;
  scheduledStartAt: string | null;
  durationDays: number | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
};

export type TaskFormValues = {
  kidId: string;
  title: string;
  emoji: string;
  type: "daily" | "once";
  coinReward: number;
  scheduledStartAt: string;
  durationDays: string;
  isActive: boolean;
};

export function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function buildTaskPayload(values: TaskFormValues, isEdit: boolean) {
  const payload: Record<string, unknown> = {
    title: values.title.trim(),
    emoji: values.emoji,
    type: values.type,
    coinReward: values.coinReward,
  };

  if (!isEdit) {
    payload.kidId = values.kidId;
  }

  if (values.scheduledStartAt) {
    payload.scheduledStartAt = new Date(values.scheduledStartAt).toISOString();
    payload.durationDays = values.durationDays
      ? Number.parseInt(values.durationDays, 10)
      : null;
  } else {
    payload.scheduledStartAt = null;
    payload.durationDays = null;
  }

  if (isEdit) {
    payload.isActive = values.isActive;
  }

  return payload;
}
