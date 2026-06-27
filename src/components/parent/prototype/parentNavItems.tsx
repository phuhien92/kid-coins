import * as React from "react";

export type ParentNavSection = "home" | "approvals" | "kids" | "settings";

export type ParentNavItem = {
  id: ParentNavSection;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
};

function HomeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

function ApprovalsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 12l2 2 4-4" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function KidsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="9" cy="8" r="3.4" />
      <circle cx="17" cy="9" r="2.6" />
      <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <path d="M16 14c2.4.2 4.5 2 4.5 5" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2l-.3-2.5h-2.6l-.3 2.5a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2 1.2l.3 2.5h2.6l.3-2.5a7 7 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z" />
    </svg>
  );
}

export const PARENT_NAV_ITEMS: ParentNavItem[] = [
  { id: "home", label: "Home", href: "/parent/home", icon: <HomeIcon /> },
  { id: "approvals", label: "Approvals", href: "/parent/approvals", icon: <ApprovalsIcon />, badge: 1 },
  { id: "kids", label: "Kids", href: "/parent/kids", icon: <KidsIcon /> },
  { id: "settings", label: "Settings", href: "/parent/settings", icon: <SettingsIcon /> },
];

export const MOCK_PARENT = {
  name: "Sam",
  fullName: "Sam Rivera",
  family: "The Rivera family",
  kidCount: 2,
  goalCount: 3,
};
