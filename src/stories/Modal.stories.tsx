"use client";

import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Modal } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";

const meta: Meta<typeof Modal> = {
  title: "UI/Modal",
  component: Modal,
  parameters: { layout: "fullscreen" },
  argTypes: {
    open: { control: "boolean" },
    width: { control: "select", options: ["sm", "md"] },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Open: Story = {
  args: {
    open: true,
    onClose: () => {},
    width: "md",
    children: (
      <div className="p-6">
        <p className="font-display font-semibold text-[18px] text-ink mb-2">Modal title</p>
        <p className="font-body text-[14px] text-ink-soft">
          This is the base modal panel. Content goes here.
        </p>
        <div className="mt-4 flex gap-2">
          <Button variant="green" size="sm">Confirm</Button>
          <Button variant="ghost" size="sm">Cancel</Button>
        </div>
      </div>
    ),
  },
};

export const Interactive: Story = {
  name: "Interactive (open/close)",
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Button variant="purple" onClick={() => setOpen(true)}>
          Open modal
        </Button>
        <Modal open={open} onClose={() => setOpen(false)}>
          <div className="p-6">
            <p className="font-display font-semibold text-[18px] text-ink mb-2">
              Character Studio
            </p>
            <p className="font-body text-[14px] text-ink-soft mb-4">
              Press Escape or click outside to close.
            </p>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </Modal>
      </div>
    );
  },
};

export const SmallWidth: Story = {
  name: "Small width",
  args: {
    open: true,
    onClose: () => {},
    width: "sm",
    children: (
      <div className="p-5">
        <p className="font-display font-semibold text-[16px]">Confirm action</p>
        <p className="font-body text-[13px] text-ink-soft mt-1">Are you sure?</p>
        <div className="mt-4 flex gap-2">
          <Button variant="mini-yes" size="sm">Yes</Button>
          <Button variant="mini-no" size="sm">No</Button>
        </div>
      </div>
    ),
  },
};
