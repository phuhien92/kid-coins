import { Page } from "@/components/ui";

export default function ParentApprovalsPage() {
  return (
    <Page>
      <Page.Content className="max-w-3xl mx-auto w-full">
        <h2 className="font-display font-semibold text-xl text-ink">Pending approvals</h2>
        <p className="font-body font-bold text-sm text-ink-soft mt-1">
          Task completions and reward redemptions will queue here.
        </p>
      </Page.Content>
    </Page>
  );
}
