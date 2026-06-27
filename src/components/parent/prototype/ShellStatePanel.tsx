import type { ParentNavSection } from "./parentNavItems";

export type ShellVariant = "spec" | "kid-parity" | "top-nav" | "focus-rail";

export type ViewportBucket = "mobile" | "tablet" | "desktop";

export type ShellPrototypeState = {
  variant: ShellVariant;
  activeSection: ParentNavSection;
  viewport: ViewportBucket;
  drawerOpen: boolean;
  features: string[];
};

type ShellStatePanelProps = {
  state: ShellPrototypeState;
};

export function ShellStatePanel({ state }: ShellStatePanelProps) {
  return (
    <aside
      aria-label="Prototype state"
      className="border-2 border-dashed border-purple bg-lav-pale rounded-card p-4 text-sm"
    >
      <p className="font-display font-semibold text-purple-dk text-xs uppercase tracking-wide mb-3">
        PROTOTYPE state
      </p>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 font-body">
        <dt className="font-extrabold text-ink-soft">variant</dt>
        <dd className="font-bold text-ink">{state.variant}</dd>
        <dt className="font-extrabold text-ink-soft">activeSection</dt>
        <dd className="font-bold text-ink">{state.activeSection}</dd>
        <dt className="font-extrabold text-ink-soft">viewport</dt>
        <dd className="font-bold text-ink">{state.viewport}</dd>
        <dt className="font-extrabold text-ink-soft">drawerOpen</dt>
        <dd className="font-bold text-ink">{String(state.drawerOpen)}</dd>
      </dl>
      <ul className="mt-3 space-y-1 font-body text-xs text-ink-soft list-disc pl-4">
        {state.features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
    </aside>
  );
}
