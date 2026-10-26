import type { Meta, StoryObj } from "@storybook/react";
import { ProgressBar } from "../components/ui/ProgressBar";

const meta: Meta<typeof ProgressBar> = {
  title: "UI/ProgressBar",
  component: ProgressBar,
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100 } },
    color: { control: "select", options: ["coin", "green", "purple"] },
    height: { control: "select", options: ["sm", "md"] },
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Empty: Story = { args: { value: 0 } };
export const Half: Story = { args: { value: 50 } };
export const Full: Story = { args: { value: 100 } };

export const AllColors: Story = {
  name: "All colors",
  render: () => (
    <div className="w-64 flex flex-col gap-3">
      <ProgressBar value={65} color="coin" aria-label="Coin progress" />
      <ProgressBar value={45} color="green" aria-label="Green progress" />
      <ProgressBar value={80} color="purple" aria-label="Purple progress" />
    </div>
  ),
};

export const Small: Story = {
  args: { value: 60, height: "sm" },
};
