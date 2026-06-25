"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type ModalWidth = "sm" | "md";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: ModalWidth;
  className?: string;
};

const widthClasses: Record<ModalWidth, string> = {
  sm: "w-[min(380px,100%)]",
  md: "w-[min(440px,100%)]",
};

function Modal({ open, onClose, children, width = "md", className }: ModalProps) {
  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Scrim */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-[rgba(28,27,23,0.45)] backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ duration: 0.3, ease: [0.2, 1.2, 0.4, 1] }}
            className={cn(
              "fixed z-50 inset-x-4 top-1/2 -translate-y-1/2 mx-auto",
              "bg-cream-card border-[3px] border-ink",
              "rounded-[26px]",
              "shadow-[0_30px_60px_-20px_rgba(28,27,23,0.5)]",
              "max-h-[94vh] overflow-y-auto",
              widthClasses[width],
              className
            )}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export { Modal };
