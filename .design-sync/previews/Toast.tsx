import * as React from 'react';
import { Button } from '@/components/ui/Button';

// Owned preview — bypasses framer-motion opacity:0 initial state and
// position:fixed (which escapes the preview card bounds).

export function Visible() {
  return (
    <div className="flex items-end justify-center h-32 bg-cream p-4">
      <div
        role="status"
        aria-live="polite"
        className="bg-ink text-cream rounded-pill font-display font-semibold text-[14px] px-5 py-3 whitespace-nowrap"
      >
        Task completed! +10 coins 🎉
      </div>
    </div>
  );
}

export function Interactive() {
  const [visible, setVisible] = React.useState(false);
  return (
    <div className="min-h-[200px] bg-cream flex items-center justify-center">
      <Button variant="green" onClick={() => setVisible(true)}>
        Show toast
      </Button>
      {visible && (
        <div
          role="status"
          aria-live="polite"
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-ink text-cream rounded-pill font-display font-semibold text-[14px] px-5 py-3 whitespace-nowrap"
        >
          Task completed! +10 coins 🎉
        </div>
      )}
    </div>
  );
}
