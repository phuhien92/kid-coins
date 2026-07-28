"use client";

import * as React from "react";
import { Button, Skeleton } from "@/components/ui";
import { JarCard } from "@/components/shared/JarCard";
import { JarAllocator } from "@/components/kid/JarAllocator";
import { useJars } from "@/hooks/useJars";
import { useSavingsJarsFlag } from "@/hooks/useSavingsJarsFlag";

export type KidJarsSectionProps = {
  /** Kid id; falls back to the persisted session id when omitted. */
  kidId?: string | null;
};

function useResolvedKidId(explicit?: string | null): string | null {
  const [id, setId] = React.useState<string | null>(explicit ?? null);
  React.useEffect(() => {
    if (explicit !== undefined) {
      setId(explicit);
      return;
    }
    if (typeof window !== "undefined") {
      setId(localStorage.getItem("earnie_kid_id"));
    }
  }, [explicit]);
  return id;
}

/**
 * The kid-facing "My jars" block: Spend / Save / Give balances, a projected
 * weekly-interest nudge on the Save jar, and a modal to move coins between
 * buckets. Rendered only when the savings-jars flag is on, so it can be dropped
 * into any kid page without further gating.
 */
function KidJarsSection({ kidId }: KidJarsSectionProps) {
  const flagOn = useSavingsJarsFlag();
  const resolvedKidId = useResolvedKidId(kidId);
  const { loading, error, jars, interest, allocate, withdraw } = useJars(resolvedKidId);
  const [allocatorOpen, setAllocatorOpen] = React.useState(false);

  if (!flagOn) return null;

  return (
    <section aria-labelledby="jars-heading" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 id="jars-heading" className="font-display font-semibold text-lg text-ink">
          My jars
        </h2>
        {jars ? (
          <Button
            type="button"
            variant="chip"
            onClick={() => setAllocatorOpen(true)}
          >
            Move coins
          </Button>
        ) : null}
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Skeleton.Block className="h-20" />
          <Skeleton.Block className="h-20" />
          <Skeleton.Block className="h-20" />
        </div>
      ) : error ? (
        <p role="alert" className="font-body text-sm text-coral">
          {error}
        </p>
      ) : jars ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <JarCard emoji="💰" label="Spend" balance={jars.spend} accent="spend" />
          <JarCard
            emoji="🐷"
            label="Save"
            balance={jars.save}
            accent="save"
            footnote={
              interest && interest.projectedNextWeek > 0
                ? `Earns ${interest.projectedNextWeek} more next week`
                : undefined
            }
          />
          <JarCard emoji="💝" label="Give" balance={jars.give} accent="give" />
        </div>
      ) : null}

      {jars ? (
        <JarAllocator
          open={allocatorOpen}
          onClose={() => setAllocatorOpen(false)}
          spend={jars.spend}
          save={jars.save}
          onAllocate={allocate}
          onWithdraw={withdraw}
        />
      ) : null}
    </section>
  );
}

export { KidJarsSection };
