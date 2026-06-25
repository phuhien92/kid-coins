import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "../components/ui/Avatar";

const meta: Meta<typeof Avatar> = {
  title: "UI/Avatar",
  component: Avatar,
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    color: {
      control: "select",
      options: ["mint", "lemon", "peach", "coral", "sky", "lav", "coin"],
    },
    children: { control: "text" },
  },
  args: { children: "🐸" },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: { color: "mint", size: "md", children: "🐸" },
};

export const AllColors: Story = {
  name: "All colors",
  render: () => (
    <div className="flex items-center gap-3">
      {(["mint","lemon","peach","coral","sky","lav","coin"] as const).map((color) => (
        <Avatar key={color} color={color} size="md">🎈</Avatar>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  name: "All sizes",
  render: () => (
    <div className="flex items-end gap-3">
      <Avatar size="sm" color="mint">🌿</Avatar>
      <Avatar size="md" color="lemon">⭐</Avatar>
      <Avatar size="lg" color="coral">🎯</Avatar>
    </div>
  ),
};
