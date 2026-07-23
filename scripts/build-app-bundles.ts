import { build, type InlineConfig } from "vite";
import { cp, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Sub 7 of the Scriptorium epic (#208): the bindery keeps one press. Replaces
 * the Glass's esbuild step (build-explorer-bundle.ts): a single multi-entry
 * Vite build bundles the three app surfaces into their gitignored .bundle.js
 * twins, beside their committed sources under public/. The worker is emitted
 * ONCE (worker-client.js's static import-URL spawn, which Vite detects and
 * rewrites) at the fixed path explorer/worker.bundle.js; both the Explorer and
 * the Print Room spawn that one chunk. Modules shared between entries land in
 * explorer/chunks/ (gitignored, fixed names, no hashing: the committed shells
 * reference fixed entry names, and the e2e harness pins the worker path).
 *
 * Every knob is chosen to keep the emitted code running identically to the
 * source it replaces (no minify, no downlevel, no preload polyfill), the same
 * behavior-preserving discipline the esbuild press had.
 *
 * Runs AFTER the tsc engine emit (`npm run astro:generate` sequences it so),
 * because the entries import ./engine/*.js, which must be on disk.
 *
 *   node scripts/build-app-bundles.ts          # bundles into public/
 *   node scripts/build-app-bundles.ts <root>   # another root (tests)
 */

// entry -> twin, relative to the bundled root (public/). Input keys are the
// twin names minus .bundle.js, so Rollup's [name] emits each twin in place.
export const BUNDLE_ENTRIES: ReadonlyArray<{ entry: string; twin: string }> = [
  { entry: "explorer/app.js", twin: "explorer/app.bundle.js" },
  { entry: "print-room/app.js", twin: "print-room/app.bundle.js" },
  { entry: "seed-of-the-day/app.js", twin: "seed-of-the-day/app.bundle.js" },
];

// Behavior-preserving output shape shared by the page build and the worker build.
const OUTPUT = {
  format: "es",
  entryFileNames: "[name].bundle.js",
  chunkFileNames: "explorer/chunks/[name].js",
  assetFileNames: "explorer/chunks/[name][extname]",
} as const;

const pressConfig = (root: string, outDir: string): InlineConfig => ({
  configFile: false,
  logLevel: "warn",
  // root must be the served tree: the Print Room imports "/explorer/..." and
  // "/lib/..." root-absolute, and Vite resolves those against this root.
  root,
  // CRITICAL: Vite's publicDir default is <root>/public and is copied into the
  // outDir verbatim; our root IS public/, so any truthy value here would
  // recursively copy the site into itself.
  publicDir: false,
  build: {
    // A staging dir, not root itself: writing into root would trip Vite's
    // outDir-inside-root guard on every build. bundleAppSurfaces copies the
    // emitted twins into place afterward. emptyOutDir is explicit so Vite does
    // not warn about emptying a dir outside the project root.
    outDir,
    emptyOutDir: true,
    target: "esnext", // no syntax downlevel; top-level await survives as authored
    minify: false,
    sourcemap: false,
    modulePreload: false, // no polyfill injection; the shells load plain modules
    rollupOptions: {
      input: Object.fromEntries(
        BUNDLE_ENTRIES.map(({ entry }) => [entry.replace(/\.js$/, ""), join(root, entry)]),
      ),
      output: OUTPUT,
    },
  },
  worker: {
    // The worker chunk must be an ES module: worker.js imports ./engine/*.js and
    // is spawned { type: "module" } (Vite's default worker format is iife).
    format: "es",
    rollupOptions: {
      output: { ...OUTPUT, entryFileNames: "explorer/worker.bundle.js" },
    },
  },
});

/** Bundle the three app surfaces (and the one shared worker) under `root`. */
export async function bundleAppSurfaces(root: string): Promise<void> {
  const staging = await mkdtemp(join(tmpdir(), "vellum-press-"));
  try {
    await build(pressConfig(root, staging));
    // The staging tree mirrors root-relative paths (explorer/app.bundle.js,
    // explorer/chunks/*, ...), so a recursive copy lands every twin in place.
    await cp(staging, root, { recursive: true });
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
  for (const { entry, twin } of BUNDLE_ENTRIES) {
    console.log(`bundled ${entry} -> ${twin}`);
  }
}

/** Bundle one entry and return the emitted code without writing it (for tests). */
export async function bundleToString(absEntry: string): Promise<string> {
  const res = await build({
    configFile: false,
    logLevel: "silent",
    root: dirname(absEntry),
    publicDir: false,
    build: {
      write: false,
      target: "esnext",
      minify: false,
      sourcemap: false,
      modulePreload: false,
      rollupOptions: { input: absEntry, output: { format: "es" } },
    },
  });
  const outputs = Array.isArray(res) ? res : [res];
  for (const out of outputs) {
    if (!("output" in out)) continue;
    for (const chunk of out.output) {
      if (chunk.type === "chunk" && chunk.isEntry) return chunk.code;
    }
  }
  throw new Error(`vite produced no entry chunk for ${absEntry}`);
}

// Run as a script (not when imported by a test): `node build-app-bundles.ts [root]`.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = resolve(process.argv[2] ?? "public");
  bundleAppSurfaces(root).catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  });
}
