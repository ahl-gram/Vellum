import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { bundleToString } from "../../scripts/build-explorer-bundle.ts";

// Sub 2 of the Surveyor's Glass epic (#163): the bindery gets a press. The
// Explorer runs native browser ESM today, so a bare specifier (d3-zoom, arriving
// in Sub 3) would not resolve. esbuild bundles each hand-authored entry into a
// gitignored .bundle.js twin, and the load path moves to the twin. This step is
// deliberately behavior-preserving; the wiring below is what "the load path
// moved, the source did not" looks like on the committed pages.

const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");

test("the Explorer page loads the bundled app twin, not the raw source (#163)", () => {
  const html = read("docs/explorer/index.html");
  assert.match(html, /<script type="module" src="\.\/app\.bundle\.js"><\/script>/);
  // the raw ESM entry must no longer be the loaded module
  assert.doesNotMatch(html, /src="\.\/app\.js"/);
});

test("the seed-of-the-day page loads the bundled app twin (#163)", () => {
  const html = read("docs/seed-of-the-day/index.html");
  assert.match(html, /<script type="module" src="app\.bundle\.js"><\/script>/);
  assert.doesNotMatch(html, /src="app\.js"/);
});

test("the Explorer's default worker spawn targets the bundled worker twin (#163)", () => {
  // Only the Explorer's own default flips. A cross-directory reuser (the Print
  // Room) still passes an explicit root-absolute URL, so it keeps the unbundled
  // worker; the default is what the bundled Explorer uses.
  const js = read("docs/explorer/worker-client.js");
  assert.match(js, /initWorker\(workerUrl = "\.\/worker\.bundle\.js"\)/);
});

// The behavior-preserving guarantees of the press itself, on a hermetic fixture
// (the real docs/ entries import ./engine/*.js, which only exists after the tsc
// emit; `npm test` runs before it, so the fixture keeps this test self-contained).
// The full e2e suite against dist/ is what proves the real entries stay invisible.

async function withFixture<T>(run: (dir: string) => T | Promise<T>): Promise<T> {
  const dir = mkdtempSync(join(tmpdir(), "vellum-bundle-"));
  try {
    // entry pulls a relative module, awaits at the top level, and carries a
    // non-ASCII glyph (like the gazetteer): each exercises one esbuild knob.
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

test("the press inlines relative imports into a self-contained bundle (#163)", async () => {
  const out = await withFixture((dir) => bundleToString(resolve(dir, "entry.js")));
  // the relative dependency is inlined, so no import statement survives
  assert.doesNotMatch(out, /\bimport\b[^\n]*\bfrom\b/);
  assert.doesNotMatch(out, /\bimport\s*\(/);
  // ...and its body actually made it in
  assert.match(out, /salut /);
});

test("the press preserves top-level await (format:esm) and non-ASCII (charset:utf8) (#163)", async () => {
  const out = await withFixture((dir) => bundleToString(resolve(dir, "entry.js")));
  // top-level await only survives an ESM-format bundle (an iife/cjs bundle would
  // have thrown at build time), so its presence proves format stayed esm
  assert.match(out, /await Promise\.resolve/);
  // the glyph stays a literal é, not a é escape
  assert.match(out, /café/);
  assert.doesNotMatch(out, /caf\\u00e9/);
});

test("the press is byte-reproducible for identical input (#163)", async () => {
  const [a, b] = await withFixture(async (dir) => {
    const entry = resolve(dir, "entry.js");
    return [await bundleToString(entry), await bundleToString(entry)];
  });
  assert.equal(a, b, "two bundles of the same source must be byte-identical");
});
