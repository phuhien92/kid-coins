/**
 * kid-coin brand content — name, taglines, the five-step story and the
 * mascot artwork slots. UI copy that expresses the brand reads from here so
 * the story stays consistent across screens.
 */

export const BRAND_NAME = "kid-coin";

export const TAGLINE = "Little wins. Big money habits.";

export const SUBLINES = [
  "Earn. Save. Grow together.",
  "Make everyday progress feel rewarding.",
  "Every little step counts.",
] as const;

export type StepId = "do" | "earn" | "save" | "choose" | "grow";

export type BrandStep = {
  id: StepId;
  number: number;
  name: string;
  headline: string;
  body: string;
};

/** The product's mental model: Do → Earn → Save → Choose → Grow. */
export const STEPS: readonly BrandStep[] = [
  {
    id: "do",
    number: 1,
    name: "Do",
    headline: "Small tasks. Real progress.",
    body: "Build confidence, one everyday responsibility at a time.",
  },
  {
    id: "earn",
    number: 2,
    name: "Earn",
    headline: "Celebrate the effort.",
    body: "Turn completed tasks into a moment to feel proud.",
  },
  {
    id: "save",
    number: 3,
    name: "Save",
    headline: "Dream a little bigger.",
    body: "Practice setting coins aside for something special.",
  },
  {
    id: "choose",
    number: 4,
    name: "Choose",
    headline: "Learn through decisions.",
    body: "Explore the difference between spending now and saving.",
  },
  {
    id: "grow",
    number: 5,
    name: "Grow",
    headline: "Build habits together.",
    body: "Make room for family conversations and little celebrations.",
  },
];

export function getStep(id: StepId): BrandStep {
  const step = STEPS.find((s) => s.id === id);
  if (!step) throw new Error(`Unknown step: ${id}`);
  return step;
}

export type MascotSlotId = "hero" | StepId;

export type MascotArt = {
  /** Public path of the rendered PNG, or null until the owner drops it in. */
  src: string | null;
  alt: string;
  width: number;
  height: number;
};

/**
 * Mascot artwork slots. To ship the real art, drop the PNG at the path in the
 * comment and set `src` to it — every screen that renders the slot picks it up.
 */
export const MASCOT_ART: Record<MascotSlotId, MascotArt> = {
  // public/brand/mascot-hero.png
  hero: {
    src: null,
    alt: "The kid-coin robot, a glossy gold robot with glowing happy eyes, holding a star coin",
    width: 480,
    height: 480,
  },
  // public/brand/robot-do.png
  do: {
    src: null,
    alt: "Yellow kid-coin robot holding a checklist",
    width: 320,
    height: 320,
  },
  // public/brand/robot-earn.png
  earn: {
    src: null,
    alt: "Blue kid-coin robot holding a star coin",
    width: 320,
    height: 320,
  },
  // public/brand/robot-save.png
  save: {
    src: null,
    alt: "Coral kid-coin robot holding a jar of coins",
    width: 320,
    height: 320,
  },
  // public/brand/robot-choose.png
  choose: {
    src: null,
    alt: "Mint kid-coin robot holding a shopping cart and a sneaker",
    width: 320,
    height: 320,
  },
  // public/brand/robot-grow.png
  grow: {
    src: null,
    alt: "Lavender kid-coin robot beside a coin plant in a pot",
    width: 320,
    height: 320,
  },
};
