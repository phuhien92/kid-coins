import Link from "next/link";
import { Card, Page } from "@/components/ui";
import { ProfilePickerLink } from "@/components/parent/ProfilePickerLink";

const NAV_ITEMS = [
  {
    href: "/parent/approvals",
    title: "Approvals",
    description: "Review completed tasks and reward redemptions",
  },
  {
    href: "/parent/tasks",
    title: "Tasks",
    description: "Create chores and set coin rewards",
  },
  {
    href: "/parent/kids",
    title: "Kids",
    description: "Manage kid profiles and goals",
  },
  {
    href: "/parent/settings",
    title: "Settings",
    description: "Family preferences and account",
  },
] as const;

export default function ParentHomePage() {
  return (
    <Page>
      <Page.Content className="max-w-[760px] mx-auto w-full pt-6 pb-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-1">
          <div>
            <h1 className="font-display font-bold text-[28px] text-ink leading-tight">
              Parent dashboard
            </h1>
            <p className="font-body font-[800] text-[13px] text-ink-soft mt-1.5">
              Jump to the area you need
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
              className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple focus-visible:ring-offset-2 rounded-[20px]"
            >
              <Card
                radius="parent"
                padding="md"
                className="h-full border-[2.5px] border-purple bg-lav-pale transition-colors group-hover:bg-lav-pale/80"
              >
                <h2 className="font-display font-semibold text-[17px] text-ink">
                  {item.title}
                </h2>
                <p className="font-body font-[800] text-[13px] text-ink-soft mt-1.5 leading-relaxed">
                  {item.description}
                </p>
              </Card>
            </Link>
          ))}
        </nav>
      </Page.Content>
    </Page>
  );
}
