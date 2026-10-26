import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "../components/ui/Card";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  argTypes: {
    padding: { control: "select", options: ["none", "sm", "md", "lg"] },
    compact: { control: "boolean" },
    children: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: (
      <div>
        <p className="font-display font-semibold text-[19px] text-ink">Card title</p>
        <p className="font-body text-[14px] text-ink-soft mt-1">Some content goes here.</p>
      </div>
    ),
  },
};

export const Compact: Story = {
  args: {
    compact: true,
    children: (
      <div>
        <p className="font-display font-semibold text-[15px] text-ink">Compact card</p>
        <p className="font-body text-[13px] text-ink-soft mt-0.5">2.5px border variant.</p>
      </div>
    ),
  },
};

export const NoPadding: Story = {
  name: "No padding (composable)",
  args: {
    padding: "none",
    children: (
      <div className="p-5 border-b-[2.5px] border-ink">
        <p className="font-display font-semibold text-[15px]">Header</p>
      </div>
    ),
  },
};
