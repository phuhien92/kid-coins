import { Card } from "@/components/ui";
import type { ParentNavSection } from "./parentNavItems";

const SECTION_COPY: Record<ParentNavSection, { title: string; lede: string }> = {
  home: {
    title: "Dashboard home",
    lede: "Stat row, kid grid, approvals panel, activity feed — placeholder only.",
  },
  approvals: {
    title: "Pending approvals",
    lede: "Task completions and reward redemptions queue here.",
  },
  kids: {
    title: "Your kids",
    lede: "Kid cards with goals and quick actions.",
  },
  settings: {
    title: "Family settings",
    lede: "Toggles, co-parent invite, password reset.",
  },
};

type MockShellContentProps = {
  section: ParentNavSection;
};

/** Throwaway placeholder blocks — not real page content. */
export function MockShellContent({ section }: MockShellContentProps) {
  const copy = SECTION_COPY[section];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display font-semibold text-xl text-ink">{copy.title}</h2>
        <p className="font-body font-bold text-sm text-ink-soft mt-1">{copy.lede}</p>
      </div>

      {section === "home" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Family saved", value: "4,180", tint: "bg-coin" },
              { label: "Tasks done", value: "38", tint: "bg-green-tint" },
              { label: "Active goals", value: "3", tint: "bg-lav-pale" },
              { label: "Pending OK", value: "1", tint: "bg-peach" },
            ].map((stat) => (
              <Card key={stat.label} compact radius="parent" className="p-4">
                <div className={`w-10 h-10 rounded-control border-2 border-ink ${stat.tint} mb-3`} />
                <p className="font-body font-extrabold text-xs text-ink-soft uppercase">{stat.label}</p>
                <p className="font-display font-bold text-2xl text-ink mt-0.5">{stat.value}</p>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <Card compact radius="parent" className="lg:col-span-2 p-4 min-h-48">
              <p className="font-display font-semibold text-ink">Kid grid slot</p>
              <p className="font-body text-sm text-ink-soft mt-2">Mia + Leo cards would render here.</p>
            </Card>
            <Card compact radius="parent" className="p-4 min-h-48">
              <p className="font-display font-semibold text-ink">Approvals + activity</p>
              <p className="font-body text-sm text-ink-soft mt-2">Right column panels from handoff.</p>
            </Card>
          </div>
        </>
      )}

      {section !== "home" && (
        <Card compact radius="parent" className="p-6 min-h-64">
          <p className="font-body text-sm text-ink-soft">
            Route body for <strong className="text-ink">{section}</strong> goes in the main column.
          </p>
        </Card>
      )}
    </div>
  );
}
