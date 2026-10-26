import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../components/ui/Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  argTypes: {
    variant: {
      control: "select",
      options: ["green", "purple", "ghost", "chip", "mini-yes", "mini-no"],
    },
    size: { control: "select", options: ["sm", "md", "full"] },
    disabled: { control: "boolean" },
    children: { control: "text" },
  },
  args: { children: "Save goal" },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const GreenPrimary: Story = {
  name: "Green (kid CTA)",
  args: { variant: "green", children: "Complete task ✓" },
};

export const Purple: Story = {
  name: "Purple (parent CTA)",
  args: { variant: "purple", children: "Approve" },
};

export const Ghost: Story = {
  args: { variant: "ghost", children: "Cancel" },
};

export const Chip: Story = {
  args: { variant: "chip", size: "sm", children: "Daily tasks" },
};

export const MiniYes: Story = {
  name: "Mini — Approve",
  args: { variant: "mini-yes", size: "sm", children: "Approve" },
};

export const MiniNo: Story = {
  name: "Mini — Decline",
  args: { variant: "mini-no", size: "sm", children: "Decline" },
};

export const Disabled: Story = {
  args: { variant: "green", disabled: true, children: "Locked" },
};

export const FullWidth: Story = {
  name: "Full width",
  args: { variant: "green", size: "full", children: "Collect coins" },
  parameters: { layout: "padded" },
};

export const AllVariants: Story = {
  name: "All variants",
  render: () => (
    <div className="flex flex-wrap gap-3 items-center">
      <Button variant="green" size="sm">Green</Button>
      <Button variant="purple" size="sm">Purple</Button>
      <Button variant="ghost" size="sm">Ghost</Button>
      <Button variant="chip" size="sm">Chip</Button>
      <Button variant="mini-yes" size="sm">Yes</Button>
      <Button variant="mini-no" size="sm">No</Button>
    </div>
  ),
};
