import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "../components/ui/Card";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  argTypes: {
    padding: { control: "select", options: ["none", "sm", "md", "lg"] },
    radius: { control: "select", options: ["card", "tile", "control", "sheet", "pill"] },
    children: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: (
      <div>
        <p className="font-display font-extrabold text-lg text-ink">Card title</p>
        <p className="font-body text-sm text-ink-soft mt-1">Some content goes here.</p>
      </div>
    ),
  },
};

export const Compact: Story = {
  args: {
    padding: "sm",
    radius: "tile",
    children: (
      <div>
        <p className="font-display font-extrabold text-base text-ink">Compact card</p>
        <p className="font-body text-sm text-ink-soft mt-0.5">Tighter padding, tile radius.</p>
      </div>
    ),
  },
};

export const NoPadding: Story = {
  name: "No padding (composable)",
  args: {
    padding: "none",
    children: (
      <div className="p-5 border-b border-line">
        <p className="font-display font-extrabold text-base">Header</p>
      </div>
    ),
  },
};
