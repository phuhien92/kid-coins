"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type ToastProps = {
  message: string;
  visible: boolean;
  onDismiss?: () => void;
  className?: string;
};

function Toast({ message, visible, onDismiss, className }: ToastProps) {
  React.useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => onDismiss?.(), 2200);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 20, x: "-50%" }}
          transition={{ duration: 0.3 }}
          className={cn(
            "fixed bottom-[30px] left-1/2 z-50",
            "bg-ink text-cream rounded-pill",
            "font-display font-semibold text-[14px]",
            "px-5 py-3",
            "pointer-events-none select-none whitespace-nowrap",
            className
          )}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { Toast };
