import { ButtonLink, Card } from "@/components/ui";

export type KidComingSoonProps = {
  title: string;
  body: string;
  emoji: string;
};

/**
 * Placeholder for kid surfaces that aren't built yet. Stays inside the
 * design system: no neon, no shouted copy, no third hue, no decorative
 * coin yellow. It's a quiet "we're working on it" that still feels like kid-coin.
 */
export function KidComingSoon({ title, body, emoji }: KidComingSoonProps) {
  return (
    // `flex-1` fills the layout main's reserved area so the card sits centered
    // (vs. `min-h-full` which won't resolve against a min-height parent).
    <div className="flex-1 flex items-center justify-center px-5 py-10">
      <Card padding="lg" className="w-full max-w-md text-center">
        <div
          className="mx-auto size-16 rounded-tile bg-success-tint flex items-center justify-center text-4xl mb-4"
          aria-hidden
        >
          {emoji}
        </div>
        <h1 className="font-display font-extrabold text-2xl text-fg leading-tight">
          {title}
        </h1>
        <p className="font-body font-bold text-sm text-fg-muted mt-2">
          {body}
        </p>
        <ButtonLink href="/kid/home" className="mt-6">
          Back home
        </ButtonLink>
      </Card>
    </div>
  );
}
