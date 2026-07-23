import { build, type InlineConfig } from "vite";
import { cp, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Sub 7 of the Scriptorium epic (#208): the bindery keeps one press. A single
 * multi-entry Vite build bundles the three app surfaces into their gitignored
 * .bundle.js twins under public/. Since Sub 9 (#260) the entries are the
 * TypeScript sources in src/site, which import the engine's src/ directly, so
 * Vite compiles the whole graph itself (the tsc browser emit retired). The
 * worker is emitted ONCE (worker-client.ts's static import-URL spawn, which
 * Vite detects and rewrites) at the fixed path explorer/worker.bundle.js; both
 * the Explorer and the Print Room spawn that one chunk. Modules shared between
 * entries land in explorer/chunks/ (gitignored, fixed names, no hashing: the
 * app pages reference fixed entry names, and the e2e harness pins the worker
 * path).
 *
 * Every knob is chosen to keep the emitted code running identically to the
 * source it replaces (no minify, no downlevel, no preload polyfill), the same
 * behavior-preserving discipline the esbuild press had.
 *
 *   node scripts/build-app-bundles.ts          # bundles into public/
 *   node scripts/build-app-bundles.ts <root>   # another served root (tests)
 */

const REPO = fileURLToPath(new URL("..", import.meta.url));

// entry (repo-relative TS source) -> twin (relative to the served root,
// public/). Input keys are the twin names minus .bundle.js, so Rollup's [name]
// emits each twin in place.
export const BUNDLE_ENTRIES: ReadonlyArray<{ entry: string; twin: string }> = [
  { entry: "src/site/explorer/app.ts", twin: "explorer/app.bundle.js" },
  { entry: "src/site/print-room/app.ts", twin: "print-room/app.bundle.js" },
  { entry: "src/site/seed-of-the-day/app.ts", twin: "seed-of-the-day/app.bundle.js" },
];

// Behavior-preserving output shape shared by the page build and the worker build.
const OUTPUT = {
  format: "es",
  entryFileNames: "[name].bundle.js",
  chunkFileNames: "explorer/chunks/[name].js",
  assetFileNames: "explorer/chunks/[name][extname]",
} as const;

const pressConfig = (outDir: string): InlineConfig => ({
  configFile: false,
  logLevel: "warn",
  // The repo is the Vite root: the entries live in src/site, import the engine
  // src relatively, and pull d3 from node_modules (root-absolute imports
  // retired with the JS source at Sub 9).
  root: REPO,
  // CRITICAL: Vite's publicDir default is <root>/public, copied into the
  // outDir verbatim; ours holds the whole served site, so any truthy value
  // here would copy it into the staging tree and then back over itself.
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
        BUNDLE_ENTRIES.map(({ entry, twin }) => [twin.replace(/\.bundle\.js$/, ""), join(REPO, entry)]),
      ),
      output: OUTPUT,
    },
  },
  worker: {
    // The worker chunk must be an ES module: worker.ts imports the engine src
    // and is spawned { type: "module" } (Vite's default worker format is iife).
    format: "es",
    rollupOptions: {
      output: { ...OUTPUT, entryFileNames: "explorer/worker.bundle.js" },
    },
  },
});

/** Bundle the three app surfaces (and the one shared worker) into `root`, the served tree. */
export async function bundleAppSurfaces(root: string): Promise<void> {
  const staging = await mkdtemp(join(tmpdir(), "vellum-press-"));
  try {
    await build(pressConfig(staging));
    // The staging tree mirrors served-root-relative paths (explorer/app.bundle.js,
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
