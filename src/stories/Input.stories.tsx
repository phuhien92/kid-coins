import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "../components/ui/Input";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  argTypes: {
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Empty: Story = {
  args: { placeholder: "Ask the coach…" },
};

export const WithValue: Story = {
  name: "With value",
  args: { defaultValue: "I want to save for a new bike", placeholder: "Ask the coach…" },
};

export const Disabled: Story = {
  args: { placeholder: "Not available", disabled: true },
};
