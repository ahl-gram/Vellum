import { build, type BuildOptions } from "esbuild";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Sub 2 of the Surveyor's Glass epic (#163): the bindery gets a press.
 *
 * Bundles each hand-authored browser entry into a self-contained, gitignored
 * .bundle.js twin so the page can keep loading a single module even once a bare
 * specifier (d3-zoom, arriving in Sub 3) is imported, which native browser ESM
 * cannot resolve. This step is deliberately behavior-preserving: every esbuild
 * knob below is chosen so the emitted bundle runs identically to the native-ESM
 * source it replaces (no minify, no syntax downlevel, one self-contained bundle
 * per entry, no shared chunks).
 *
 * Runs AFTER the tsc engine emit (the site/build npm scripts), because esbuild
 * inlines the ./engine/*.js the entries import, so those files must be on disk.
 *
 *   node scripts/build-explorer-bundle.ts public   # alongside `npm run astro:generate`
 *   node scripts/build-explorer-bundle.ts dist     # alongside `npm run build`
 */

// entry -> twin, relative to the site root (public/ for `npm run astro:generate`,
// dist/ for `npm run build`). The worker is its own entry: it is spawned by a
// string URL, invisible to import tracing, so it can never be a shared chunk of
// app.js.
export const BUNDLE_ENTRIES: ReadonlyArray<{ entry: string; twin: string }> = [
  { entry: "explorer/app.js", twin: "explorer/app.bundle.js" },
  { entry: "explorer/worker.js", twin: "explorer/worker.bundle.js" },
  { entry: "seed-of-the-day/app.js", twin: "seed-of-the-day/app.bundle.js" },
];

// Behavior-preserving options shared by every entry.
const SHARED = {
  bundle: true,
  format: "esm", // app.js uses top-level await; the twins load as <script type="module">
  platform: "browser",
  charset: "utf8", // keep gazetteer/name glyphs literal rather than \u-escaped
  logLevel: "silent",
} satisfies BuildOptions;

/** Bundle one entry to disk as its twin. */
export async function bundleEntry(absEntry: string, absTwin: string): Promise<void> {
  await build({ ...SHARED, entryPoints: [absEntry], outfile: absTwin });
}

/** Bundle every entry under `root`, writing each twin beside its source. */
export async function bundleExplorer(root: string): Promise<void> {
  for (const { entry, twin } of BUNDLE_ENTRIES) {
    await bundleEntry(resolve(root, entry), resolve(root, twin));
    console.log(`bundled ${entry} -> ${twin}`);
  }
}

/** Bundle one entry and return the emitted code without writing it (for tests). */
export async function bundleToString(absEntry: string): Promise<string> {
  const res = await build({ ...SHARED, entryPoints: [absEntry], write: false });
  const first = res.outputFiles?.[0];
  if (!first) throw new Error(`esbuild produced no output for ${absEntry}`);
  return first.text;
}

// Run as a script (not when imported by a test): `node build-explorer-bundle.ts [root]`.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = resolve(process.argv[2] ?? "docs");
  bundleExplorer(root).catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  });
}
