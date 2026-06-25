"use client";

import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Toast } from "../components/ui/Toast";
import { Button } from "../components/ui/Button";

const meta: Meta<typeof Toast> = {
  title: "UI/Toast",
  component: Toast,
  parameters: { layout: "fullscreen" },
  argTypes: {
    message: { control: "text" },
    visible: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Toast>;

export const Visible: Story = {
  args: { visible: true, message: "Task completed! +10 coins 🎉" },
};

export const Hidden: Story = {
  args: { visible: false, message: "This won't show" },
};

export const Interactive: Story = {
  name: "Interactive (click to show)",
  render: () => {
    const [visible, setVisible] = React.useState(false);
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Button
          variant="green"
          onClick={() => setVisible(true)}
        >
          Show toast
        </Button>
        <Toast
          message="Task completed! +10 coins 🎉"
          visible={visible}
          onDismiss={() => setVisible(false)}
        />
      </div>
    );
  },
};
