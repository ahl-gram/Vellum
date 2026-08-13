import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { MAX_TILT } from "../../src/render/voyage-geometry.ts";
import { RDP_EPSILON, COAST_EMBARK_MAX } from "../../src/render/voyage-route.ts";
import { INLAND_STUB_CELLS } from "../../src/render/voyage-water.ts";
import { MARGIN_FRACTION } from "../../src/render/transform.ts";
import { BACKDROP_SAMPLES, FOREGROUND_SAMPLES } from "../../src/prospect/transect.ts";
import { LOD_BANDS } from "../../src/world/lod.ts";
import { defaultRecipe } from "../../src/world/generate.ts";
import { POSTER_PRESETS } from "../../src/site/print-room/poster-presets.ts";
import { MAX_PIXELS, fitScaleToBudget } from "../../src/site/lib/rasterize.ts";

// Constant contracts that span files: each pair must move together, and where the far
// side is an e2e script or a DOM-bound page module, this suite reads it as source.

const ROOT = resolve(import.meta.dirname, "..", "..");
const src = (p: string) => readFileSync(join(ROOT, p), "utf8");
// Truncate each line at // so no comment, full-line or trailing, can count as code.
// Naive about strings, which is fine: neither guarded file carries // inside a literal.
const codeOnly = (code: string) =>
  code.split("\n").map((l) => { const i = l.indexOf("//"); return i === -1 ? l : l.slice(0, i); }).join("\n");
const walk = (dir: string): string[] =>
  readdirSync(join(ROOT, dir), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : e.name.endsWith(".ts") ? [join(dir, e.name)] : [],
  );

test("RDP_EPSILON is pinned absolutely, so an epsilon bump is a conscious change here too", () => {
  assert.equal(RDP_EPSILON, 0.75);
});

test("COAST_EMBARK_MAX stays strictly below INLAND_STUB_CELLS", () => {
  assert.ok(COAST_EMBARK_MAX < INLAND_STUB_CELLS);
});

test("the backdrop lattice lands a foreground sample exactly on a backdrop stride", () => {
  assert.equal((BACKDROP_SAMPLES - 1) % (FOREGROUND_SAMPLES - 1), 0);
});

test("every region band obeys lodWindowFor's size <= 0.98 precondition", () => {
  for (const band of LOD_BANDS) {
    if (band.isRegion) assert.ok(band.sizeUV <= 0.98, `band ${band.index} sizeUV ${band.sizeUV}`);
  }
});

test("POSTER_PRESETS stays width-ascending: the clamp envelope reads first and last", () => {
  for (let i = 1; i < POSTER_PRESETS.length; i++) {
    assert.ok(POSTER_PRESETS[i].width > POSTER_PRESETS[i - 1].width);
  }
});

test("the 24 Mpx budget clears every poster at x1 and clamps exactly Wall and Grand at x2", () => {
  const recipe = defaultRecipe(42);
  const aspect = recipe.gridH / recipe.gridW;
  const clampedAt2: string[] = [];
  for (const p of POSTER_PRESETS) {
    const h = Math.round(p.width * aspect);
    assert.equal(fitScaleToBudget(p.width, h, 1, MAX_PIXELS).clamped, false, `${p.key} at x1`);
    if (fitScaleToBudget(p.width, h, 2, MAX_PIXELS).clamped) clampedAt2.push(p.key);
  }
  assert.deepEqual(clampedAt2, ["wall", "grand"]);
});

test("the e2e RV4 tilt ceiling tracks MAX_TILT", () => {
  const m = src("scripts/e2e/suite-room-voyage-route.mjs").match(/maxTilt <= ([\d.]+)/);
  assert.ok(m, "RV4 ceiling not found in suite-room-voyage-route.mjs");
  const ceiling = Number(m[1]);
  assert.ok(ceiling > MAX_TILT && ceiling - MAX_TILT < 0.001, `ceiling ${ceiling}, MAX_TILT ${MAX_TILT}`);
});

// The margin mirrors accept either the duplicated literal (which must equal
// MARGIN_FRACTION) or the imported constant itself, so the clean fix stays green.
// The identifier form only counts if it really is transform.ts's constant: the file
// must import it from render/transform and must not rebind the name anywhere.
const marginMirror = (code: string, re: RegExp, where: string) => {
  const m = codeOnly(code).match(re);
  assert.ok(m, `margin expression not found in ${where}`);
  if (m[1] === "MARGIN_FRACTION") {
    assert.match(code, /import \{[^}]*\bMARGIN_FRACTION\b[^}]*\} from "[^"]*render\/transform(\.ts)?"/, `${where} must import MARGIN_FRACTION from render/transform`);
    assert.doesNotMatch(code, /\b(const|let|var)\s+MARGIN_FRACTION\b/, `${where} must not rebind MARGIN_FRACTION`);
  } else {
    assert.equal(Number(m[1]), MARGIN_FRACTION, where);
  }
};

test("seed-of-the-day's MARGIN mirrors renderMap's margin fraction", () => {
  const code = src("src/site/seed-of-the-day/app.ts");
  marginMirror(code, /const MARGIN = Math\.round\(1500 \* ([\d.]+|MARGIN_FRACTION)\)/, "seed-of-the-day/app.ts");
});

test("the voyage session's projection margin mirrors renderMap's margin fraction", () => {
  const code = src("src/site/living-chart/voyage-session.ts");
  marginMirror(code, /Math\.round\(wPx \* ([\d.]+|MARGIN_FRACTION)\)/, "voyage-session.ts");
});

test("every worker spawn under src/site keeps the static form Vite's build analysis requires", () => {
  let spawns = 0;
  for (const file of walk("src/site")) {
    const code = codeOnly(readFileSync(join(ROOT, file), "utf8"));
    const found = code.match(/new Worker\(/g) ?? [];
    const statics = code.match(/new Worker\(new URL\("\.\/[\w-]+\.ts", import\.meta\.url\), \{ type: "module" \}\)/g) ?? [];
    assert.equal(statics.length, found.length, `${file} spawns a worker in a non-static form`);
    spawns += found.length;
  }
  assert.ok(spawns >= 1, "expected at least one worker spawn under src/site");
});

test("every publicDir in the press config is false", () => {
  const code = codeOnly(src("scripts/build-app-bundles.ts"));
  const hits = code.match(/publicDir:\s*\S+/g) ?? [];
  assert.ok(hits.length >= 2, "expected both press configs to set publicDir");
  for (const hit of hits) assert.match(hit, /^publicDir: false[,)}\s]?$/);
});
