import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";

// Sub 7 of the Scriptorium epic (#208): the bindery keeps one press. The Glass
// (#163) introduced esbuild to bundle the Explorer's d3-zoom; Astro brought
// Vite. This sub folds the esbuild step into a Vite build (the ratified
// 2026-07-23 decisions on #208): one multi-entry build covers the Explorer,
// the Seed of the Day, AND the Print Room (no longer unbundled), the worker
// spawn moves to the static import-URL form Vite rewrites, and Vite emits one
// shared bundled worker both spawning pages use. esbuild retires.

const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");

test("all three app pages load their bundled app twin via is:inline, none load raw source (#208, #254)", () => {
  // is:inline is load-bearing: without it Astro routes the script through its
  // own Vite pass, which #204's ratified analysis rejects for these surfaces
  // (the twins are already pressed by scripts/build-app-bundles.ts).
  for (const [pageSource, src] of [
    ["src/pages/explorer/index.astro", /<script type="module" src="\.\/app\.bundle\.js" is:inline><\/script>/],
    ["src/pages/print-room/index.astro", /<script type="module" src="\.\/app\.bundle\.js" is:inline><\/script>/],
    ["src/pages/seed-of-the-day/index.astro", /<script type="module" src="app\.bundle\.js" is:inline><\/script>/],
  ] as const) {
    const html = read(pageSource);
    assert.match(html, src, `${pageSource} should load its bundle twin, opted out of Astro's script processing`);
    assert.doesNotMatch(html, /src="(\.\/)?app\.js"/, `${pageSource} must not load the raw ESM entry`);
  }
});

test("the hand-coded public/ shells retired with the re-shell (#254): routes and public/ stay disjoint", () => {
  // Sub 1 constraint 9: Astro documents no collision precedence between a
  // public/ file and a same-path route, so the src/pages/ routes above must be
  // the only claimants of these URLs.
  for (const shell of [
    "public/explorer/index.html",
    "public/print-room/index.html",
    "public/seed-of-the-day/index.html",
  ]) {
    assert.ok(!existsSync(resolve(REPO, shell)), `${shell} must not exist: its route renders through BaseLayout`);
  }
});

test("the worker spawn is the static import-URL form Vite owns (#208)", () => {
  const js = read("public/explorer/worker-client.js");
  // Vite only rewrites a STATICALLY ANALYZABLE `new Worker(new URL("./worker.js",
  // import.meta.url), ...)`; a variable spawn target would emit no worker chunk
  // and 404 at runtime. The literal form below is therefore contractual.
  assert.match(
    js,
    /new Worker\(new URL\("\.\/worker\.js", import\.meta\.url\), \{ type: "module" \}\)/,
    "worker-client must spawn via the static import-URL form",
  );
  assert.doesNotMatch(js, /workerUrl/, "the parameterized spawn target retired with the twin arrangement");
  // Both spawning pages call the bare form; the emitted worker URL is Vite's.
  assert.match(read("public/explorer/app.js"), /await initWorker\(\);/);
  const printRoom = read("public/print-room/app.js");
  assert.match(printRoom, /await initWorker\(\);/);
  assert.doesNotMatch(printRoom, /initWorker\("/, "the Print Room no longer passes a spawn URL");
});

test("one bundler: vite is the devDep, esbuild is gone (#208)", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.ok(pkg.devDependencies.vite, "vite must be an explicit devDependency (the press imports it)");
  assert.equal(pkg.devDependencies.esbuild, undefined, "esbuild retires with the fold");
  assert.equal(pkg.dependencies.esbuild, undefined, "esbuild must not hide in dependencies either");
});

test("the cleaned set and gitignore cover the Print Room twin and the chunk dir (#208)", async () => {
  const { GENERATED_SUBTREES } = await import("../../scripts/clean-public-generated.ts");
  for (const sub of ["print-room/app.bundle.js", "explorer/chunks"]) {
    assert.ok(GENERATED_SUBTREES.includes(sub), `GENERATED_SUBTREES must include ${sub}`);
  }
  const lines = read(".gitignore").split("\n");
  for (const line of ["public/print-room/app.bundle.js", "public/explorer/chunks/"]) {
    assert.ok(lines.includes(line), `.gitignore should carry the exact line ${line}`);
  }
});

// The behavior-preserving guarantees of the press itself, on a hermetic fixture
// (the real public/ entries import ./engine/*.js, which only exists after the tsc
// emit; `npm test` runs before it, so the fixture keeps this test self-contained).
// Characterization of the new press, like #163's were of esbuild: the full e2e
// against dist/ is what proves the real entries stay invisible.

async function withFixture<T>(run: (dir: string) => T | Promise<T>): Promise<T> {
  const dir = mkdtempSync(join(tmpdir(), "vellum-bundle-"));
  try {
    // entry pulls a relative module, awaits at the top level, and carries a
    // non-ASCII glyph (like the gazetteer): each exercises one press knob.
    mkdirSync(join(dir, "lib"));
    writeFileSync(join(dir, "lib", "greet.js"), `export const greet = (n) => "salut " + n;\n`);
    writeFileSync(
      join(dir, "entry.js"),
      `import { greet } from "./lib/greet.js";\n` +
        `export const ready = await Promise.resolve(true);\n` +
        `export const line = greet("Laukuwelua café");\n`,
    );
    // await inside the try so cleanup runs only after the bundle has read the dir
    return await run(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const bundleToString = async (absEntry: string): Promise<string> =>
  (await import("../../scripts/build-app-bundles.ts")).bundleToString(absEntry);

test("the press inlines relative imports into a self-contained bundle (#208)", async () => {
  const out = await withFixture((dir) => bundleToString(resolve(dir, "entry.js")));
  // the relative dependency is inlined, so no import statement survives
  assert.doesNotMatch(out, /\bimport\b[^\n]*\bfrom\b/);
  assert.doesNotMatch(out, /\bimport\s*\(/);
  // ...and its body actually made it in
  assert.match(out, /salut /);
});

test("the press preserves top-level await (format es) and non-ASCII glyphs (#208)", async () => {
  const out = await withFixture((dir) => bundleToString(resolve(dir, "entry.js")));
  // top-level await only survives an ESM-format bundle (an iife/cjs bundle would
  // have thrown at build time), so its presence proves format stayed es
  assert.match(out, /await Promise\.resolve/);
  // the glyph stays a literal é, not a \u escape
  assert.match(out, /café/);
  assert.doesNotMatch(out, /caf\\u00e9/);
});

test("the press is byte-reproducible for identical input (#208)", async () => {
  const [a, b] = await withFixture(async (dir) => {
    const entry = resolve(dir, "entry.js");
    return [await bundleToString(entry), await bundleToString(entry)];
  });
  assert.equal(a, b, "two bundles of the same source must be byte-identical");
});
