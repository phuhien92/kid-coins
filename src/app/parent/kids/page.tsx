"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, Page, Skeleton, Toast } from "@/components/ui";
import {
  ParentAddKidCard,
  ParentKidCard,
  type ParentKid,
} from "@/components/parent/ParentKidCard";
import { ProfilePickerLink } from "@/components/parent/ProfilePickerLink";
import { cn } from "@/lib/utils";

function ParentKidCardSkeleton({ className }: { className?: string }) {
  return (
    <Card
      compact
      padding="none"
      radius="parent"
      className={cn("p-[18px] animate-pulse", className)}
    >
      <div className="flex items-center gap-3 mb-4">
        <Skeleton.Circle size="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton.Block className="h-4 w-24" />
          <Skeleton.Block className="h-3 w-16" />
        </div>
      </div>
      <Skeleton.ProgressBar />
    </Card>
  );
}

function ParentKidsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
      {[0, 1].map((i) => (
        <ParentKidCardSkeleton key={i} />
      ))}
    </div>
  );
}

function ParentKidsContent() {
  const searchParams = useSearchParams();
  const [kids, setKids] = useState<ParentKid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreatedToast, setShowCreatedToast] = useState(false);

  useEffect(() => {
    if (searchParams.get("created") === "1") {
      setShowCreatedToast(true);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/kids")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load kids");
        return r.json();
      })
      .then((data) => setKids(data.kids ?? []))
      .catch(() => setError("Couldn't load kids. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Page>
      <Page.Content className="max-w-[760px] mx-auto w-full pt-6 pb-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-1">
          <div>
            <h1 className="font-display font-bold text-[28px] text-ink leading-tight">
              Your kids
            </h1>
            <p className="font-body font-[800] text-[13px] text-ink-soft mt-1.5">
              Manage children, goals and tasks
            </p>
          </div>
          <ProfilePickerLink className="self-start sm:mt-1" />
        </div>

        {kids.length === 0 && !loading && !error && (
          <p className="font-body text-[14px] text-ink-soft mt-4 mb-2">
            Add your first kid profile so they can start earning coins.
          </p>
        )}

        {error && (
          <p className="font-body text-[14px] text-red-600 mt-4" role="alert">
            {error}
          </p>
        )}

        {loading && <ParentKidsSkeleton />}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            {kids.map((kid) => (
              <ParentKidCard key={kid.id} kid={kid} />
            ))}
            <ParentAddKidCard />
          </div>
        )}
      </Page.Content>

      <Toast
        message="Kid profile created!"
        visible={showCreatedToast}
        onDismiss={() => setShowCreatedToast(false)}
      />
    </Page>
  );
}

export default function ParentKidsPage() {
  return (
    <Suspense
      fallback={
        <Page>
          <Page.Content className="max-w-[760px] mx-auto pt-6">
            <ParentKidsSkeleton />
          </Page.Content>
        </Page>
      }
    >
      <ParentKidsContent />
    </Suspense>
  );
}
