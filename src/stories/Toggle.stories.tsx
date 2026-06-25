import type { Meta, StoryObj } from "@storybook/react";
import { Toggle } from "../components/ui/Toggle";

const meta: Meta<typeof Toggle> = {
  title: "UI/Toggle",
  component: Toggle,
  argTypes: {
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
    label: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Off: Story = {
  args: { defaultChecked: false },
};

export const On: Story = {
  args: { defaultChecked: true },
};

export const WithLabel: Story = {
  name: "With label",
  args: { defaultChecked: true, label: "Push notifications" },
};

export const Disabled: Story = {
  args: { defaultChecked: false, disabled: true, label: "Locked setting" },
};

export const DisabledOn: Story = {
  name: "Disabled (on)",
  args: { defaultChecked: true, disabled: true, label: "Read only" },
};
