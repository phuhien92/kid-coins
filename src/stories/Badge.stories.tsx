import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../components/ui/Badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  argTypes: {
    variant: {
      control: "select",
      options: ["streak", "count", "goal-chip", "lav"],
    },
    children: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Streak: Story = {
  args: { variant: "streak", children: "🔥 7 days" },
};

export const Count: Story = {
  args: { variant: "count", children: "3" },
};

export const GoalChip: Story = {
  name: "Goal chip",
  args: { variant: "goal-chip", children: "⭐ New bike" },
};

export const Lav: Story = {
  name: "Lavender",
  args: { variant: "lav", children: "In progress" },
};

export const AllVariants: Story = {
  name: "All variants",
  render: () => (
    <div className="flex flex-wrap gap-3 items-center">
      <Badge variant="streak">🔥 7 days</Badge>
      <Badge variant="count">5</Badge>
      <Badge variant="goal-chip">⭐ New bike</Badge>
      <Badge variant="lav">In progress</Badge>
    </div>
  ),
};
