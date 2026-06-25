import Link from "next/link";
import { Card } from "@/components/ui";

export type KidComingSoonProps = {
  title: string;
  body: string;
  emoji: string;
};

/**
 * Placeholder for kid surfaces that aren't built yet. Stays inside the
 * design system: no neon, no shouted copy, no third hue, no decorative
 * coin yellow. It's a quiet "we're working on it" that still feels like Earnie.
 */
export function KidComingSoon({ title, body, emoji }: KidComingSoonProps) {
  return (
    // `flex-1` fills the layout main's reserved area so the card sits centered
    // (vs. `min-h-full` which won't resolve against a min-height parent).
    <div className="flex-1 flex items-center justify-center px-5 py-10">
      <Card padding="lg" className="w-full max-w-[420px] text-center">
        <div
          className="mx-auto w-16 h-16 rounded-[20px] border-[2.5px] border-ink bg-lav-pale flex items-center justify-center text-[34px] mb-4"
          aria-hidden
        >
          {emoji}
        </div>
        <h1 className="font-display font-semibold text-[24px] text-ink leading-tight">
          {title}
        </h1>
        <p className="font-body font-bold text-[14px] text-ink-soft mt-2">
          {body}
        </p>
        <Link
          href="/kid/home"
          className="inline-block mt-6 bg-green text-white border-[2.5px] border-ink font-display font-semibold text-[15px] rounded-[14px] px-5 py-2.5 shadow-[0_4px_0_var(--color-green-dk)] active:translate-y-[3px] active:shadow-[0_1px_0_var(--color-green-dk)] transition-all duration-100"
        >
          Back home
        </Link>
      </Card>
    </div>
  );
}
