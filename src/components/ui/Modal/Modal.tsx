"use client";

import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { cn } from "@/lib/utils";

export type ModalWidth = "sm" | "md";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: ModalWidth;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

const widthClasses: Record<ModalWidth, string> = {
  sm: "w-modal-sm",
  md: "w-modal-md",
};

/**
 * App-wide modal dialog built on Base UI Dialog.
 * Handles focus trap, scroll lock, Escape key, and backdrop dismiss automatically.
 * Framer Motion entrance is replaced by CSS data-attribute transitions supplied
 * by Base UI (data-starting-style / data-ending-style).
 */
function Modal({
  open,
  onClose,
  children,
  width = "md",
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Backdrop
          className={cn(
            "fixed inset-0 z-40 bg-ink/45 backdrop-blur-sm",
            "transition-opacity duration-200",
            "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0"
          )}
        />

        {/* Panel */}
        <Dialog.Popup
          aria-label={ariaLabel ?? (ariaLabelledby ? undefined : "Dialog")}
          aria-labelledby={ariaLabelledby}
          className={cn(
            "fixed z-50 inset-x-4 top-1/2 -translate-y-1/2 mx-auto",
            "bg-cream-card border-heavy border-ink",
            "rounded-dialog",
            "shadow-dialog",
            "max-h-[94vh] overflow-y-auto",
            "transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.2,1.2,0.4,1)]",
            "data-[starting-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:translate-y-[-44%]",
            "data-[ending-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:translate-y-[-44%]",
            widthClasses[width],
            className
          )}
        >
          {children}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * Convenience close button — renders inside a Modal panel.
 */
function ModalClose({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <Dialog.Close
      className={cn(
        "absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center",
        "font-display font-bold text-base text-ink-soft",
        "hover:bg-black/8 active:bg-black/12 transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple focus-visible:ring-offset-1",
        className
      )}
      aria-label="Close"
    >
      {children ?? "✕"}
    </Dialog.Close>
  );
}

/**
 * Renders a styled <Dialog.Title> so consumers don't need to import Base UI directly.
 */
function ModalTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Dialog.Title
      className={cn(
        "font-display font-bold text-xl text-ink leading-tight",
        className
      )}
    >
      {children}
    </Dialog.Title>
  );
}

Modal.Close = ModalClose;
Modal.Title = ModalTitle;

export { Modal };
