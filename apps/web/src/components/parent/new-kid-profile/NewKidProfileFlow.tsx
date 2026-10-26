"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Page } from "@/components/ui/Page";
import { FantasyGuildCharacter } from "@/components/kid/FantasyGuildCharacter";
import { DEFAULT_CHARACTER } from "@/lib/character";
import {
  COLOR_SWATCHES,
  GUILD_LOADOUTS,
  OUTFIT_OPTIONS,
  isOutfitFreeAtSignup,
  outfitSceneBg,
  outfitXpCost,
  upgradeXpRequirement,
  type GuildAccessory,
} from "@/lib/guild-loadouts";
import { cn } from "@/lib/utils";
import type { CharacterState } from "@/types";
import {
  AccessoryChips,
  AccessoryImage,
  UpgradeRail,
} from "./GuildAccessoryArt";

type Phase = "class" | "customize" | "details";

type AccessoryTrial = {
  kind: "starter";
  slot: GuildAccessory["slot"];
  name: string;
};

const PHASES: Phase[] = ["class", "customize", "details"];

export function NewKidProfileFlow() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("class");
  const [character, setCharacter] = useState<CharacterState>({
    ...DEFAULT_CHARACTER,
    outfit: "wizard",
    bg: outfitSceneBg("wizard"),
  });
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [starterSelections, setStarterSelections] = useState<Record<string, string[]>>({});
  const [tryingAccessory, setTryingAccessory] = useState<AccessoryTrial | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const outfitOptions = OUTFIT_OPTIONS.filter((opt) => opt.value !== "none");
  const selectedLabel =
    OUTFIT_OPTIONS.find((opt) => opt.value === character.outfit)?.label ?? "Wizard";
  const selectedLoadout = GUILD_LOADOUTS[character.outfit] ?? GUILD_LOADOUTS.wizard;
  const selectedSkin =
    COLOR_SWATCHES.find((sw) => sw.key === character.color)?.value ?? "var(--color-coin)";
  const selectedStarterNames =
    starterSelections[character.outfit] ??
    selectedLoadout.starter.map((item) => item.name);
  const previewAccessory =
    tryingAccessory ??
    selectedLoadout.starter.find((item) => selectedStarterNames.includes(item.name)) ??
    selectedLoadout.starter[0];
  const phaseIndex = PHASES.indexOf(phase);
  const pinsMatch = pin.length === 4 && pin === confirmPin;

  function updateCharacter(field: "color" | "outfit", value: string) {
    setCharacter((current) => {
      const next = { ...current, [field]: value };
      if (field === "outfit") {
        next.bg = outfitSceneBg(value);
      }
      return next;
    });
  }

  function toggleStarter(name: string) {
    setStarterSelections((current) => {
      const existing =
        current[character.outfit] ?? selectedLoadout.starter.map((item) => item.name);
      const next = existing.includes(name)
        ? existing.filter((item) => item !== name)
        : [...existing, name];

      return { ...current, [character.outfit]: next };
    });
  }

  function saveTryingStarter() {
    if (!tryingAccessory) return;
    if (!selectedStarterNames.includes(tryingAccessory.name)) {
      toggleStarter(tryingAccessory.name);
    }
  }

  async function handleSubmit() {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/kids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          pin,
          character,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      router.push("/parent/kids?created=1");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page className="min-h-screen bg-page pb-28">
      <Page.Header className="justify-between border-b border-fg/10 px-4 py-4">
        <Link
          href={phase === "class" ? "/parent/kids" : "#"}
          onClick={(event) => {
            if (phase !== "class") {
              event.preventDefault();
              setPhase(PHASES[phaseIndex - 1]);
            }
          }}
          className="inline-flex min-h-tap items-center rounded-control px-2 font-body text-sm text-fg-muted hover:text-fg focus-visible:text-fg transition-colors"
        >
          ← Back
        </Link>
        <div className="flex gap-2">
          {PHASES.map((step, index) => (
            <div
              key={step}
              className={cn(
                "w-8 h-1.5 rounded-pill",
                index <= phaseIndex ? "bg-action-secondary" : "bg-fg/15"
              )}
            />
          ))}
        </div>
        <span className="font-body text-sm text-fg-muted">{phaseIndex + 1}/3</span>
      </Page.Header>

      <Page.Content className="max-w-5xl mx-auto w-full pt-6">
        {error && (
          <p className="font-body text-sm text-error mb-4" role="alert">
            {error}
          </p>
        )}

        {phase === "class" ? (
          <>
            <section className="mb-6">
              <h1 className="font-display font-black text-3xl text-fg">Choose a class</h1>
              <p className="font-body text-sm text-fg-muted mt-1 max-w-xl">
                Every class ships with a free starter kit. More classes unlock as your
                kid earns XP.
              </p>
            </section>

            <section className="mb-6 rounded-card border border-line bg-surface p-4 shadow-card">
              <div className="flex flex-col gap-4 ipad-landscape:flex-row ipad-landscape:items-center ipad-landscape:justify-between">
                <div>
                  <p className="font-display font-black text-xl text-fg">
                    {selectedLabel} starter kit
                  </p>
                  <p className="font-body text-sm text-fg-muted">
                    Included on day one so the class feels complete.
                  </p>
                  <AccessoryChips items={selectedLoadout.starter} className="mt-3" />
                </div>
                <div className="ipad-landscape:max-w-md">
                  <p className="font-display font-black text-sm text-fg mb-2">
                    Later upgrades
                  </p>
                  <UpgradeRail upgrades={selectedLoadout.upgrades} />
                </div>
              </div>
            </section>

            <ul className="grid grid-cols-2 sm:grid-cols-3 ipad-landscape:grid-cols-4 gap-4">
              {outfitOptions.map((opt) => {
                const xp = outfitXpCost(opt.value);
                const selected = character.outfit === opt.value;
                const unlocked = isOutfitFreeAtSignup(opt.value);
                const loadout = GUILD_LOADOUTS[opt.value] ?? GUILD_LOADOUTS.wizard;

                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      disabled={!unlocked}
                      onClick={() => updateCharacter("outfit", opt.value)}
                      className={cn(
                        "relative w-full min-h-56 flex flex-col items-center justify-between rounded-card border border-line bg-surface p-3 shadow-card transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                        selected && "ring-4 ring-fg ring-offset-2",
                        unlocked
                          ? "hover:-translate-y-1"
                          : "opacity-70 cursor-not-allowed"
                      )}
                    >
                      {xp === null ? (
                        <span className="absolute top-2 right-2 font-display font-extrabold text-xs bg-success-tint text-success border border-fg rounded-pill px-2 py-0.5">
                          Free
                        </span>
                      ) : (
                        <span className="absolute top-2 right-2 font-display font-extrabold text-xs bg-step-grow-tint text-step-grow-ink border border-fg rounded-pill px-2 py-0.5">
                          {xp} XP
                        </span>
                      )}

                      <motion.div
                        className="flex-1 flex items-center justify-center pt-4"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <FantasyGuildCharacter
                          outfit={opt.value}
                          mode="coin"
                          skinColor={selectedSkin}
                          size={132}
                        />
                      </motion.div>

                      <div className="text-center">
                        <p className="font-display font-black text-xl text-fg leading-none">
                          {opt.label}
                        </p>
                        <p className="font-body text-xs text-fg-muted mt-1">
                          {xp === null ? "Starter class" : `${xp} XP to unlock`}
                        </p>
                        <div className="mt-2 flex flex-wrap justify-center gap-1">
                          {loadout.starter.slice(0, 3).map((item) => (
                            <span
                              key={`${opt.value}-${item.slot}`}
                              className="rounded-pill border border-line bg-page px-2 py-0.5 font-body text-xs text-fg-muted"
                            >
                              {item.slot}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        ) : phase === "customize" ? (
          <section className="grid gap-6 ipad-landscape:grid-cols-[320px_1fr]">
            <div className="rounded-card border border-line bg-surface p-5 shadow-card self-start ipad-landscape:sticky ipad-landscape:top-6">
              <p className="font-display font-black text-2xl text-fg">
                Customize {selectedLabel}
              </p>
              <p className="font-body text-sm text-fg-muted mt-1">
                Pick a coin color and review the free starter accessories.
              </p>
              <div className="mt-5 flex justify-center rounded-card border border-line bg-page p-4">
                <FantasyGuildCharacter
                  outfit={character.outfit}
                  mode="coin"
                  skinColor={selectedSkin}
                  size={180}
                />
              </div>
              <div className="mt-4 rounded-control border border-line bg-success-tint p-3">
                <p className="font-display font-black text-sm text-fg">Trying on</p>
                <p className="font-body text-xs text-fg-muted mt-1">
                  {previewAccessory
                    ? `${previewAccessory.slot}: ${previewAccessory.name}`
                    : "Tap an accessory to preview it"}
                </p>
                {previewAccessory && (
                  <div className="mt-3 flex items-center gap-3">
                    <AccessoryImage
                      slot={previewAccessory.slot}
                      name={previewAccessory.name}
                    />
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={saveTryingStarter}
                      disabled={!tryingAccessory}
                      className="flex-1"
                    >
                      Save starter
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <section className="rounded-card border border-line bg-surface p-5">
                <h2 className="font-display font-black text-xl text-fg">1. Pick a skin</h2>
                <p className="font-body text-sm text-fg-muted mt-1">
                  This changes the coin body color for the class character.
                </p>
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {COLOR_SWATCHES.map((sw) => (
                    <button
                      key={sw.key}
                      type="button"
                      onClick={() => updateCharacter("color", sw.key)}
                      aria-pressed={character.color === sw.key}
                      className={cn(
                        "min-h-20 rounded-card border border-line bg-page p-2 font-body text-xs font-bold text-fg transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                        character.color === sw.key && "ring-4 ring-fg ring-offset-2"
                      )}
                    >
                      <span
                        className="mx-auto mb-2 block h-9 w-9 rounded-pill border border-line"
                        style={{ backgroundColor: sw.value }}
                      />
                      {sw.label}
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-card border border-line bg-surface p-5">
                <h2 className="font-display font-black text-xl text-fg">
                  2. Starter accessories
                </h2>
                <p className="font-body text-sm text-fg-muted mt-1">
                  Each item has artwork. Tap to try it on, then save it to the starter kit.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {selectedLoadout.starter.map((item) => {
                    const selected = selectedStarterNames.includes(item.name);
                    const trying = tryingAccessory?.name === item.name;

                    return (
                      <button
                        key={`${item.slot}-${item.name}`}
                        type="button"
                        onClick={() =>
                          setTryingAccessory({
                            kind: "starter",
                            slot: item.slot,
                            name: item.name,
                          })
                        }
                        aria-pressed={selected}
                        className={cn(
                          "min-h-40 rounded-card border border-line p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                          trying ? "bg-step-grow-tint" : selected ? "bg-success-tint" : "bg-page"
                        )}
                      >
                        <AccessoryImage slot={item.slot} name={item.name} />
                        <span className="font-body text-xs font-bold text-success">
                          {item.slot}
                        </span>
                        <span className="block font-display font-black text-lg text-fg leading-tight">
                          {item.name}
                        </span>
                        <span className="mt-2 block font-body text-xs text-fg-muted">
                          {trying
                            ? "Trying on now"
                            : selected
                              ? "Saved to starter kit"
                              : "Tap to try on"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-card border border-line bg-surface p-5">
                <h2 className="font-display font-black text-xl text-fg">
                  3. Future upgrades
                </h2>
                <p className="font-body text-sm text-fg-muted mt-1">
                  These unlock later when your kid earns XP and coins.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {selectedLoadout.upgrades.map((upgrade) => {
                    const xpRequired = upgradeXpRequirement(upgrade);

                    return (
                      <div
                        key={`${upgrade.slot}-${upgrade.name}`}
                        className="min-h-44 rounded-card border border-line bg-page p-3 text-left opacity-80"
                      >
                        <AccessoryImage slot={upgrade.slot} name={upgrade.name} />
                        <span className="font-body text-xs font-bold text-step-grow-ink">
                          {upgrade.slot}
                        </span>
                        <span className="block font-display font-black text-lg text-fg leading-tight">
                          {upgrade.name}
                        </span>
                        <span className="mt-1 block font-body text-xs text-fg-muted">
                          Requires {xpRequired} XP · {upgrade.coins} coins
                        </span>
                        <span className="mt-2 block font-body text-xs font-bold text-fg">
                          Locked until earned
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </section>
        ) : (
          <section className="max-w-sm mx-auto flex flex-col gap-6">
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-card border border-line bg-surface p-4 shadow-card">
                <FantasyGuildCharacter
                  outfit={character.outfit}
                  mode="coin"
                  skinColor={selectedSkin}
                  size={156}
                />
              </div>
              <p className="font-body text-sm text-fg-muted text-center">
                Class: <span className="font-bold text-fg">{selectedLabel}</span>
              </p>
              <div className="w-full rounded-card border border-line bg-surface p-4">
                <p className="font-display font-black text-base text-fg">Starts with</p>
                <AccessoryChips
                  items={selectedLoadout.starter.filter((item) =>
                    selectedStarterNames.includes(item.name)
                  )}
                  className="mt-2"
                />
              </div>
            </div>

            <label className="flex flex-col gap-1">
              <span className="font-display font-black text-2xl text-fg">Kid&apos;s name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Emma"
                className="px-4 py-3 bg-surface border border-line rounded-control font-display font-extrabold text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-body font-bold text-sm text-fg-muted uppercase">
                4-digit PIN
              </span>
              <input
                id="kid-pin"
                value={pin}
                onChange={(event) =>
                  setPin(event.target.value.replace(/\D/g, "").slice(0, 4))
                }
                inputMode="numeric"
                maxLength={4}
                placeholder="••••"
                className="px-4 py-3 bg-surface border border-line rounded-control font-display font-black text-2xl text-center tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-body font-bold text-sm text-fg-muted uppercase">
                Confirm PIN
              </span>
              <input
                id="kid-pin-confirm"
                value={confirmPin}
                onChange={(event) =>
                  setConfirmPin(event.target.value.replace(/\D/g, "").slice(0, 4))
                }
                inputMode="numeric"
                maxLength={4}
                placeholder="••••"
                className={cn(
                  "px-4 py-3 bg-surface border-2 rounded-control font-display font-black text-2xl text-center tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                  confirmPin && !pinsMatch ? "border-error" : "border-fg"
                )}
              />
              {confirmPin && !pinsMatch && (
                <p className="font-body text-xs text-error">PINs don&apos;t match</p>
              )}
            </label>

            <Button
              type="button"
              variant="primary"
              size="full"
              disabled={loading || !name.trim() || !pinsMatch}
              onClick={handleSubmit}
            >
              {loading ? "Creating…" : "Create profile"}
            </Button>
          </section>
        )}
      </Page.Content>

      {phase !== "details" && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-fg/10 bg-page px-6 pt-4 pb-bar-bottom">
          <div className="max-w-lg mx-auto flex gap-3">
            {phase !== "class" && (
              <Button
                type="button"
                variant="ghost"
                size="full"
                onClick={() => setPhase(PHASES[phaseIndex - 1])}
              >
                ← Back
              </Button>
            )}
            <Button
              type="button"
              variant="primary"
              size="full"
              onClick={() => setPhase(PHASES[phaseIndex + 1])}
            >
              {phase === "class" ? "Continue — customize" : "Continue — name & PIN"}
            </Button>
          </div>
        </div>
      )}
    </Page>
  );
}
