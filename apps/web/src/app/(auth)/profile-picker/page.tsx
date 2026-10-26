"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashedActionCard, KidCoinLogo } from "@/components/ui";
import { ParentSignOutButton } from "@/components/shared/ParentSignOutButton";
import {
  ParentPickerTile,
  ProfilePickerTile,
  ProfilePickerTileSkeleton,
} from "@/components/shared/ProfilePickerTile";
import { KID_SESSION_TOKEN_KEY } from "@/lib/kid-session";

type Kid = {
  id: string;
  name: string;
  avatarColor: string;
  balance: number;
};

type LoadState = "loading" | "idle" | "error";

export default function ProfilePickerPage() {
  const router = useRouter();
  const [kids, setKids] = useState<Kid[]>([]);
  const [hasParentPin, setHasParentPin] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  const loadKids = () => {
    setLoadState("loading");
    fetch("/api/kids")
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((data) => {
        setKids(data.kids ?? []);
        setHasParentPin(!!data.hasParentPin);
        setLoadState("idle");
      })
      .catch(() => setLoadState("error"));
  };

  useEffect(() => { loadKids(); }, []);

  const handleKidSelect = async (kid: Kid) => {
    try {
      const res = await fetch(`/api/kids/${kid.id}/session`, { method: "POST" });
      if (!res.ok) return;
      const data = await res.json() as { sessionToken?: string };
      localStorage.setItem("earnie_kid_id", kid.id);
      localStorage.setItem("earnie_kid_name", kid.name);
      localStorage.setItem("earnie_kid_avatar_color", kid.avatarColor);
      if (data.sessionToken) {
        localStorage.setItem(KID_SESSION_TOKEN_KEY, data.sessionToken);
      }
      router.push("/kid/home");
    } catch {
      // Network failure — stay on page so the user can retry
    }
  };

  return (
    <div className="w-full max-w-lg">
      {/* Brand + heading */}
      <div className="text-center mb-8">
        <Link
          href="/"
          className="inline-flex min-h-tap items-center rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
        >
          <KidCoinLogo size="sm" />
        </Link>
        <h1 className="font-display font-black text-4xl text-fg mt-5 leading-tight tracking-tight">
          Who&apos;s playing?
        </h1>
        <p className="font-body text-base text-fg-muted mt-1">
          Earn. Save. Grow together.
        </p>
      </div>

      {/* Loading */}
      {loadState === "loading" && (
        <div className="grid grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <ProfilePickerTileSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error */}
      {loadState === "error" && (
        <div className="text-center py-10">
          <p className="font-body font-bold text-base text-fg">
            Couldn&apos;t load profiles.
          </p>
          <button
            onClick={loadKids}
            className="mt-3 inline-flex min-h-tap items-center px-3 rounded-control font-body font-bold text-sm text-step-earn-ink underline underline-offset-2 hover:decoration-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            Try again
          </button>
        </div>
      )}

      {/* Grid */}
      {loadState === "idle" && (
        <div className="grid grid-cols-2 gap-4">
          <ParentPickerTile hasPin={hasParentPin} />
          {kids.map((kid) => (
            <ProfilePickerTile
              key={kid.id}
              kid={kid}
              onClick={() => handleKidSelect(kid)}
            />
          ))}
          <DashedActionCard href="/parent/kids" title="Add a kid" variant="picker" />
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 flex justify-center">
        <ParentSignOutButton variant="button" />
      </div>
    </div>
  );
}
