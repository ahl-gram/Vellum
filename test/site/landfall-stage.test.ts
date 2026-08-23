import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { homeStage } from "../../src/site/home/stage-data.ts";
import {
  SHEET,
  MAX_SCALE,
  MIN_FIT_FACTOR,
  fitScale,
  camForCenter,
  clampCam,
  centerFraction,
  closeIn,
} from "../../src/site/home/camera.ts";
import { bearingLine, LEAGUES_PER_SHEET } from "../../src/site/home/coords.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { buildPlaceManifest } from "../../src/render/place-manifest.ts";

// Landfall Sub 1 (#455): the stage and the camera. The marks are SERVER-RENDERED from the
// engine's own place manifest, never a checked-in dump, and the camera is pure math over
// a cam {x, y, s} so every clamp and flight target is unit-testable without a browser.

const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");

const world = generateWorld(defaultRecipe(42));
const manifest = buildPlaceManifest(world, 1500);

test("homeStage derives every mark from the seed-42 place manifest (#455)", () => {
  const stage = homeStage();
  assert.equal(stage.sheetW, 1500, "the stage speaks the chart's native width");
  const tol = Math.abs(stage.sheetH - manifest.heightPx);
  assert.ok(tol < 1e-6, `sheetH quotes the manifest height (off by ${tol})`);
  assert.equal(stage.title, world.title.title);
  assert.equal(stage.dots.length, manifest.places.length, "every settlement is a mark");
  for (const [i, p] of manifest.places.entries()) {
    const d = stage.dots[i];
    assert.equal(d.name, p.name, `dot ${i} name`);
    assert.equal(d.nx, p.nx, `dot ${i} nx`);
    assert.equal(d.ny, p.ny, `dot ${i} ny`);
    assert.equal(d.ruined, p.ruined, `dot ${i} ruined`);
    assert.equal(d.capital, p.kind === "capital", `dot ${i} capital flag`);
  }
  assert.ok(stage.capital.capital, "the capital mark is flagged");
  const cap = manifest.places.find((p) => p.kind === "capital");
  assert.ok(cap !== undefined);
  assert.equal(stage.capital.name, cap.name);
});

test("the camera fit contains the sheet with the float margin (#455)", () => {
  const view = { w: 1280, h: 800 };
  const fit = fitScale(view, SHEET);
  const expected = Math.min(view.w / SHEET.w, view.h / SHEET.h) * 0.92;
  assert.ok(Math.abs(fit - expected) < 1e-12, `fit ${fit} vs ${expected}`);
});

test("camForCenter puts the asked fraction at the asked screen point (#455)", () => {
  const view = { w: 1280, h: 800 };
  const cam = camForCenter(0.51, 0.485, 1.2, view, SHEET);
  assert.ok(Math.abs(cam.x + 0.51 * SHEET.w * 1.2 - view.w / 2) < 1e-9, "fx lands at center x");
  assert.ok(Math.abs(cam.y + 0.485 * SHEET.h * 1.2 - view.h / 2) < 1e-9, "fy lands at center y");
  const off = camForCenter(0.25, 0.75, 2, view, SHEET, { x: 100, y: 700 });
  assert.ok(Math.abs(off.x + 0.25 * SHEET.w * 2 - 100) < 1e-9, "screen override x");
  assert.ok(Math.abs(off.y + 0.75 * SHEET.h * 2 - 700) < 1e-9, "screen override y");
  const back = centerFraction(cam, view, SHEET);
  assert.ok(Math.abs(back.fx - 0.51) < 1e-9, "centerFraction inverts camForCenter (fx)");
  assert.ok(Math.abs(back.fy - 0.485) < 1e-9, "centerFraction inverts camForCenter (fy)");
});

test("clampCam bounds scale and keeps the sheet center on screen, immutably (#455)", () => {
  const view = { w: 1280, h: 800 };
  const fit = fitScale(view, SHEET);
  const tooSmall = clampCam({ x: 0, y: 0, s: fit * 0.1 }, view, SHEET, fit);
  assert.ok(Math.abs(tooSmall.s - fit * MIN_FIT_FACTOR) < 1e-12, "scale floor");
  const tooBig = clampCam({ x: 0, y: 0, s: 99 }, view, SHEET, fit);
  assert.equal(tooBig.s, MAX_SCALE, "scale ceiling");
  const flungRight = clampCam({ x: 5000, y: 400, s: 1 }, view, SHEET, fit);
  const cx = flungRight.x + (SHEET.w * 1) / 2;
  assert.ok(cx <= view.w + 1e-9, `sheet center pulled back on screen (cx ${cx})`);
  const flungLeft = clampCam({ x: -9000, y: 400, s: 1 }, view, SHEET, fit);
  assert.ok(flungLeft.x + (SHEET.w * 1) / 2 >= -1e-9, "sheet center never exits left");
  const input = { x: 5000, y: 400, s: 1 };
  clampCam(input, view, SHEET, fit);
  assert.deepEqual(input, { x: 5000, y: 400, s: 1 }, "clampCam returns a new cam, never mutates");
});

test("closeIn opens the settlement dots past the ratified factor (#455)", () => {
  const fit = 0.6;
  assert.equal(closeIn(fit * 1.54, fit), false, "just under stays closed");
  assert.equal(closeIn(fit * 1.56, fit), true, "just past opens");
});

test("bearingLine speaks leagues and sixteen winds from the capital (#455)", () => {
  const capital = { name: "Laukuwelua", nx: 0.51, ny: 0.4094 };
  const aspect = SHEET.h / SHEET.w;
  assert.equal(bearingLine(0.51, 0.4094, capital, aspect), "at Laukuwelua, the capital");
  const east = bearingLine(0.51 + 10 / LEAGUES_PER_SHEET, 0.4094, capital, aspect);
  assert.equal(east, "10 leagues E of Laukuwelua");
  const north = bearingLine(0.51, 0.4094 - 10 / (LEAGUES_PER_SHEET * aspect), capital, aspect);
  assert.equal(north, "10 leagues N of Laukuwelua");
  const nearby = bearingLine(0.512, 0.41, capital, aspect);
  assert.equal(nearby, "at Laukuwelua, the capital", "inside the harbor rounds to home");
});

test("home mounts the stage, maps the manifest marks, and loads its bundle twin (#455)", () => {
  const astro = read("src/pages/index.astro");
  assert.match(astro, /homeStage/, "the frontmatter computes the stage at build");
  assert.match(astro, /class="landfall"/, "the stage section mounts");
  assert.match(astro, /stage\.dots\.map/, "marks render server-side from the manifest");
  assert.match(
    astro,
    /<script type="module" src="app\.bundle\.js" is:inline><\/script>/,
    "home loads its Vite twin, opted out of Astro's script pass",
  );
});

test("the press, the cleaner, and .gitignore all carry the home twin (#455)", async () => {
  const { BUNDLE_ENTRIES } = await import("../../scripts/build-app-bundles.ts");
  assert.ok(
    BUNDLE_ENTRIES.some((e) => e.entry === "src/site/home/app.ts" && e.twin === "app.bundle.js"),
    "BUNDLE_ENTRIES carries the home entry with its root twin",
  );
  assert.ok(read(".gitignore").split("\n").includes("public/app.bundle.js"), ".gitignore carries the root twin");
  assert.match(read("scripts/clean-public-generated.ts"), /^\s*"app\.bundle\.js",\s*$/m, "the cleaner sweeps the root twin");
});
