import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";

// The bindery keeps one press (#208, ratified 2026-07-23): one multi-entry Vite build covers every app page, the worker spawn moves to the static import-URL form Vite rewrites, and esbuild retires.

const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");

test("all four app pages load their bundled app twin via is:inline, none load raw source (#208, #254)", () => {
  // is:inline is load-bearing: without it Astro routes the script through its own Vite pass, which #204's ratified analysis rejects for these surfaces.
  for (const [pageSource, src] of [
    ["src/pages/explorer/index.astro", /<script type="module" src="\.\/app\.bundle\.js" is:inline><\/script>/],
    ["src/pages/print-room/index.astro", /<script type="module" src="\.\/app\.bundle\.js" is:inline><\/script>/],
    ["src/pages/seed-of-the-day/index.astro", /<script type="module" src="app\.bundle\.js" is:inline><\/script>/],
    ["src/pages/reading-room/index.astro", /<script type="module" src="\.\/app\.bundle\.js" is:inline><\/script>/],
  ] as const) {
    const html = read(pageSource);
    assert.match(html, src, `${pageSource} should load its bundle twin, opted out of Astro's script processing`);
    assert.doesNotMatch(html, /src="(\.\/)?app\.js"/, `${pageSource} must not load the raw ESM entry`);
  }
});

test("the hand-coded public/ shells retired with the re-shell (#254): routes and public/ stay disjoint", () => {
  // Sub 1 constraint 9: Astro documents no collision precedence between a public/ file and a same-path route, so the routes must be the only claimants of these URLs.
  for (const shell of [
    "public/explorer/index.html",
    "public/print-room/index.html",
    "public/reading-room/index.html",
    "public/seed-of-the-day/index.html",
  ]) {
    assert.ok(!existsSync(resolve(REPO, shell)), `${shell} must not exist: its route renders through BaseLayout`);
  }
});

test("the worker spawn is the static import-URL form Vite owns (#208, TS source since #260)", () => {
  const ts = read("src/site/explorer/worker-client.ts");
  // Vite only rewrites a STATICALLY ANALYZABLE new Worker(new URL(...)); a variable spawn target would emit no worker chunk and 404 at runtime, so the literal form is contractual.
  assert.match(
    ts,
    /new Worker\(new URL\("\.\/worker\.ts", import\.meta\.url\), \{ type: "module" \}\)/,
    "worker-client must spawn via the static import-URL form",
  );
  assert.doesNotMatch(ts, /workerUrl/, "the parameterized spawn target retired with the twin arrangement");
  assert.match(read("src/site/explorer/app.ts"), /await initWorker\(\);/);
  const printRoom = read("src/site/print-room/app.ts");
  assert.match(printRoom, /await initWorker\(\);/);
  assert.doesNotMatch(printRoom, /initWorker\("/, "the Print Room no longer passes a spawn URL");
});

test("the press bundles from the src/site TypeScript entries (#260)", async () => {
  const { BUNDLE_ENTRIES } = await import("../../scripts/build-app-bundles.ts");
  assert.deepEqual(
    BUNDLE_ENTRIES.map(({ entry, twin }) => ({ entry, twin })),
    [
      { entry: "src/site/explorer/app.ts", twin: "explorer/app.bundle.js" },
      { entry: "src/site/print-room/app.ts", twin: "print-room/app.bundle.js" },
      { entry: "src/site/seed-of-the-day/app.ts", twin: "seed-of-the-day/app.bundle.js" },
      { entry: "src/site/reading-room/app.ts", twin: "reading-room/app.bundle.js" },
      { entry: "src/site/prospect/app.ts", twin: "prospect/app.bundle.js" },
      { entry: "src/site/ribbon/app.ts", twin: "ribbon/app.bundle.js" },
      { entry: "src/site/home/app.ts", twin: "app.bundle.js" },
    ],
    "entries are the TS sources; twins keep their served names untouched",
  );
});

test("public/ holds no committed source: the raw app JS and the .d.ts twins retired (#260)", () => {
  // git ls-files is the oracle: the generated twins/chunks are .js too but gitignored; the acceptance is about COMMITTED content.
  const tracked = execFileSync("git", ["ls-files", "public"], { cwd: REPO, encoding: "utf8" })
    .split("\n")
    .filter((f) => f.endsWith(".js") || f.endsWith(".d.ts"));
  assert.deepEqual(tracked, [], "no committed .js or .d.ts may remain under public/");
});

test("the tsc engine emit retired: no browser tsconfig, astro:generate is clean-bundle-showcases (#260)", () => {
  assert.ok(!existsSync(resolve(REPO, "tsconfig.browser.json")), "tsconfig.browser.json retires with the emit");
  const pkg = JSON.parse(read("package.json"));
  assert.equal(
    pkg.scripts["astro:generate"],
    "node scripts/clean-public-generated.ts && node scripts/build-app-bundles.ts && node scripts/generate-showcases.ts && node scripts/generate-discovery.ts",
    "no tsc step: Vite compiles the engine graph from src/ directly",
  );
});

test("one bundler: vite is the devDep, esbuild is gone (#208)", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.ok(pkg.devDependencies.vite, "vite must be an explicit devDependency (the press imports it)");
  assert.equal(pkg.devDependencies.esbuild, undefined, "esbuild retires with the fold");
  assert.equal(pkg.dependencies.esbuild, undefined, "esbuild must not hide in dependencies either");
});

test("the cleaned set and gitignore cover the Print Room and Reading Room twins and the chunk dir (#208, #221)", async () => {
  const { GENERATED_SUBTREES } = await import("../../scripts/clean-public-generated.ts");
  for (const sub of ["print-room/app.bundle.js", "reading-room/app.bundle.js", "explorer/chunks"]) {
    assert.ok(GENERATED_SUBTREES.includes(sub), `GENERATED_SUBTREES must include ${sub}`);
  }
  const lines = read(".gitignore").split("\n");
  for (const line of ["public/print-room/app.bundle.js", "public/reading-room/app.bundle.js", "public/explorer/chunks/"]) {
    assert.ok(lines.includes(line), `.gitignore should carry the exact line ${line}`);
  }
});

// Characterization of the press on a hermetic fixture (the real entries only resolve after generation; npm test runs before it); the full e2e against dist/ is what proves the real entries stay invisible.

async function withFixture<T>(run: (dir: string) => T | Promise<T>): Promise<T> {
  const dir = mkdtempSync(join(tmpdir(), "vellum-bundle-"));
  try {
    // The entry pulls a relative module, awaits at top level, and carries a non-ASCII glyph: each exercises one press knob.
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
  assert.doesNotMatch(out, /\bimport\b[^\n]*\bfrom\b/);
  assert.doesNotMatch(out, /\bimport\s*\(/);
  assert.match(out, /salut /);
});

test("the press preserves top-level await (format es) and non-ASCII glyphs (#208)", async () => {
  const out = await withFixture((dir) => bundleToString(resolve(dir, "entry.js")));
  // Top-level await only survives an ESM-format bundle (iife/cjs would have thrown at build time), so its presence proves format stayed es.
  assert.match(out, /await Promise\.resolve/);
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
