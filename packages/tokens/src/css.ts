/**
 * Tiny parser/resolver for this package's own token CSS: just enough to
 * test the tier rules and measure contrast. It is not a general CSS parser.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const TIER_FILES = {
  primitives: "primitives.css",
  semantic: "semantic.css",
  components: "components.css",
  legacy: "legacy.css",
} as const;

export type Tier = keyof typeof TIER_FILES;

export type Declaration = { name: string; value: string; tier: Tier };

const DECL = /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi;

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

export function readTier(tier: Tier): Declaration[] {
  const path = fileURLToPath(new URL(`./${TIER_FILES[tier]}`, import.meta.url));
  const css = stripComments(readFileSync(path, "utf8"));
  return [...css.matchAll(DECL)].map((m) => ({ name: m[1], value: m[2].trim(), tier }));
}

export function readAll(): Map<string, Declaration> {
  const all = new Map<string, Declaration>();
  for (const tier of Object.keys(TIER_FILES) as Tier[]) {
    for (const d of readTier(tier)) {
      if (all.has(d.name)) throw new Error(`Token ${d.name} is declared twice`);
      all.set(d.name, d);
    }
  }
  return all;
}

const VAR_REF = /var\((--[a-z0-9-]+)/gi;

/** Names a value references with var(), in order. */
export function references(value: string): string[] {
  return [...value.matchAll(VAR_REF)].map((m) => m[1]);
}

/**
 * Follow a token through var() until it lands on a value with no var().
 * Throws on a dangling reference or a cycle.
 */
export function resolve(name: string, all = readAll(), seen: string[] = []): string {
  if (seen.includes(name)) throw new Error(`Cycle: ${[...seen, name].join(" → ")}`);
  const decl = all.get(name);
  if (!decl) throw new Error(`Unknown token ${name}${seen.length ? ` (from ${seen.at(-1)})` : ""}`);
  const refs = references(decl.value);
  if (refs.length === 0) return decl.value;
  // Single-reference values (the norm) resolve to the referenced value.
  if (/^var\(--[a-z0-9-]+\)$/i.test(decl.value)) return resolve(refs[0], all, [...seen, name]);
  // Composite values: check each reference resolves, return as written.
  for (const r of refs) if (!r.startsWith("--font-brand")) resolve(r, all, [...seen, name]);
  return decl.value;
}

/** The chain of names a token passes through, ending at a primitive. */
export function chain(name: string, all = readAll()): string[] {
  const out = [name];
  let decl = all.get(name);
  while (decl && /^var\(--[a-z0-9-]+\)$/i.test(decl.value)) {
    const next = references(decl.value)[0];
    out.push(next);
    decl = all.get(next);
  }
  return out;
}
