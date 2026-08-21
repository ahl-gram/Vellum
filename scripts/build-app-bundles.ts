import { build, type InlineConfig } from "vite";
import { cp, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** #208 Sub 7: one multi-entry Vite press bundles the app surfaces into their gitignored .bundle.js twins under public/; the worker is emitted ONCE at explorer/worker.bundle.js (both pages spawn it), shared chunks land in explorer/chunks/ with fixed names, and every knob keeps the emitted code behaviorally identical to the source (no minify, no downlevel, no preload polyfill). */

const REPO = fileURLToPath(new URL("..", import.meta.url));

export const BUNDLE_ENTRIES: ReadonlyArray<{ entry: string; twin: string }> = [
  { entry: "src/site/explorer/app.ts", twin: "explorer/app.bundle.js" },
  { entry: "src/site/print-room/app.ts", twin: "print-room/app.bundle.js" },
  { entry: "src/site/seed-of-the-day/app.ts", twin: "seed-of-the-day/app.bundle.js" },
  { entry: "src/site/reading-room/app.ts", twin: "reading-room/app.bundle.js" },
  { entry: "src/site/prospect/app.ts", twin: "prospect/app.bundle.js" },
  { entry: "src/site/ribbon/app.ts", twin: "ribbon/app.bundle.js" },
];

const OUTPUT = {
  format: "es",
  entryFileNames: "[name].bundle.js",
  chunkFileNames: "explorer/chunks/[name].js",
  assetFileNames: "explorer/chunks/[name][extname]",
} as const;

const pressConfig = (outDir: string): InlineConfig => ({
  configFile: false,
  logLevel: "warn",
  root: REPO,
  publicDir: false,
  build: {
    // A staging dir, not root itself: writing into root trips Vite's outDir-inside-root guard; the emitted twins are copied into place afterward.
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
    // The worker chunk must be an ES module (it is spawned { type: "module" }); Vite's default worker format is iife.
    format: "es",
    rollupOptions: {
      output: { ...OUTPUT, entryFileNames: "explorer/worker.bundle.js" },
    },
  },
});

/** Bundle the app surfaces (and the one shared worker) into `root`, the served tree. */
export async function bundleAppSurfaces(root: string): Promise<void> {
  const staging = await mkdtemp(join(tmpdir(), "vellum-press-"));
  try {
    await build(pressConfig(staging));
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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = resolve(process.argv[2] ?? "public");
  bundleAppSurfaces(root).catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  });
}
