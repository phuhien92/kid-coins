import { ParentLayoutShell } from "@/components/parent/ParentLayoutShell";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return <ParentLayoutShell>{children}</ParentLayoutShell>;
}
