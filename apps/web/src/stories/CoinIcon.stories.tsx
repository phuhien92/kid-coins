import type { Meta, StoryObj } from "@storybook/react";
import { CoinIcon } from "../components/ui/CoinIcon";

const meta: Meta<typeof CoinIcon> = {
  title: "UI/CoinIcon",
  component: CoinIcon,
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
};

export default meta;
type Story = StoryObj<typeof CoinIcon>;

export const Small: Story = {
  name: "Small (inline)",
  render: () => (
    <p className="font-display font-bold text-[32px] text-ink flex items-center gap-2">
      <CoinIcon size="sm" /> 450 coins
    </p>
  ),
};

export const Medium: Story = {
  args: { size: "md" },
};

export const Large: Story = {
  args: { size: "lg" },
};

export const AllSizes: Story = {
  name: "All sizes",
  render: () => (
    <div className="flex items-center gap-4">
      <CoinIcon size="sm" />
      <CoinIcon size="md" />
      <CoinIcon size="lg" />
    </div>
  ),
};
