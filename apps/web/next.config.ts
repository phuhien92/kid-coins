import path from "node:path";
import type { NextConfig } from "next";

// The app lives in apps/web of a pnpm/Turborepo workspace. Point file tracing
// and Turbopack at the monorepo root so hoisted workspace deps are found and
// Next doesn't guess the root from stray lockfiles.
const monorepoRoot = path.join(__dirname, "../..");

const nextConfig: NextConfig = {
  // Workspace packages ship TypeScript source (e.g. brandHex for the manifest).
  transpilePackages: ["@kid-coin/tokens"],
  outputFileTracingRoot: monorepoRoot,
  turbopack: {
    root: monorepoRoot,
  },
};

export default nextConfig;
