import Link from "next/link";
import { Card, KidCoinLogo, Page, STEP_TONES, StepBadge } from "@/components/ui";
import type { StepId } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { ProfilePickerLink } from "@/components/parent/ProfilePickerLink";

const NAV_ITEMS: readonly {
  href: string;
  title: string;
  description: string;
  /** Brand step the area maps to; tints the tile. Settings stays neutral. */
  step?: StepId;
}[] = [
  {
    href: "/parent/approvals",
    title: "Approvals",
    description: "Review completed tasks and reward redemptions",
    step: "earn",
  },
  {
    href: "/parent/tasks",
    title: "Tasks",
    description: "Create chores and set coin rewards",
    step: "do",
  },
  {
    href: "/parent/kids",
    title: "Kids",
    description: "Manage kid profiles and goals",
    step: "grow",
  },
  {
    href: "/parent/settings",
    title: "Settings",
    description: "Family preferences and account",
  },
];

export default function ParentHomePage() {
  return (
    <Page>
      <Page.Content className="max-w-3xl mx-auto w-full pt-6 pb-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-1">
          <div>
            <KidCoinLogo size="sm" className="mb-5" />
            <h1 className="font-display font-black text-3xl text-ink leading-tight">
              Parent dashboard
            </h1>
            <p className="font-body font-semibold text-base text-ink-soft mt-1.5">
              Build habits together — jump to the area you need.
            </p>
          </div>
          <ProfilePickerLink className="self-start sm:mt-1" />
        </div>

        <nav
          aria-label="Parent areas"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 rounded-card"
            >
              <Card
                className={cn(
                  "h-full transition duration-150 group-hover:-translate-y-0.5 group-hover:shadow-lift",
                  item.step && cn(STEP_TONES[item.step].tint, "border-transparent")
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display font-black text-xl text-ink">
                    {item.title}
                  </h2>
                  {item.step && <StepBadge step={item.step} numbered={false} className="bg-cream-card" />}
                </div>
                <p className="font-body font-semibold text-sm text-ink-soft mt-1.5 leading-relaxed">
                  {item.description}
                </p>
                <span aria-hidden className="mt-4 inline-block font-display font-black text-lg text-ink">
                  →
                </span>
              </Card>
            </Link>
          ))}
        </nav>
      </Page.Content>
    </Page>
  );
}
