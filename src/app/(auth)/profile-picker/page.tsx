"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashedActionCard } from "@/components/ui";
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
      if (res.ok) {
        const data = await res.json() as { sessionToken?: string };
        localStorage.setItem("earnie_kid_id", kid.id);
        localStorage.setItem("earnie_kid_name", kid.name);
        localStorage.setItem("earnie_kid_avatar_color", kid.avatarColor);
        if (data.sessionToken) {
          localStorage.setItem(KID_SESSION_TOKEN_KEY, data.sessionToken);
        }
      }
    } catch {
      // Non-fatal — navigate anyway; session token simply won't be set
    }
    router.push("/kid/home");
  };

  return (
    <div className="w-full max-w-lg">
      {/* Brand + heading */}
      <div className="text-center mb-8">
        <Link
          href="/"
          className="font-display font-bold text-[20px] text-ink-soft hover:text-ink transition-colors"
        >
          Earnie
        </Link>
        <h1 className="font-display font-bold text-[34px] text-ink mt-3 leading-tight tracking-tight">
          Who's playing?
        </h1>
        <p className="font-body text-[15px] text-ink-soft mt-1">
          Pick your profile to start earning coins
        </p>
      </div>

      {/* Loading */}
      {loadState === "loading" && (
        <div className="grid grid-cols-2 gap-4">
          {/* Parent tile appears immediately — no data needed */}
          <ParentPickerTile hasPin={false} />
          {[0, 1, 2].map((i) => (
            <ProfilePickerTileSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error */}
      {loadState === "error" && (
        <div className="text-center py-10">
          <p className="font-body font-bold text-[15px] text-ink">
            Couldn't load profiles.
          </p>
          <button
            onClick={loadKids}
            className="mt-3 font-body font-bold text-[14px] text-purple hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple"
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
