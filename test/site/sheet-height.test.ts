import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { SHEET } from "../../src/site/home/camera.ts";
import { homeStage } from "../../src/site/home/stage-data.ts";

// #476 item 1: the 1157.931 sheet-height literals were hand-copied from the manifest derivation and nothing compared them back, so a chart aspect change would misplace every station with all tests green.

const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");

// Half the last hand-rounded decimal place: every carrier writes the height to 3 decimals.
const TOL = 5e-4;

test("the sheet-height literals match their derivation across every carrier (#476)", () => {
  const derived = homeStage().sheetH;
  assert.ok(Number.isFinite(derived) && derived > 0, "the manifest derivation yields a real height");
  assert.ok(
    Math.abs(SHEET.h - derived) < TOL,
    `camera SHEET.h ${SHEET.h} drifted from the derivation ${derived}`,
  );

  const carriers = [
    "public/index.css",
    "src/site/home/camera.ts",
    ...readdirSync(resolve(REPO, "scripts/e2e"))
      .filter((f) => f.endsWith(".mjs"))
      .map((f) => `scripts/e2e/${f}`),
  ];
  // The sweep is anchored to the derivation's integer part, so a re-derived height reds the witness below instead of matching nothing and passing vacuously. Blind spot, named: a literal carried OUTSIDE these roots escapes (false negative only; the scan never cries wolf).
  const litRe = new RegExp(String.raw`\b${Math.floor(derived)}\.\d+`, "g");
  const found = new Map<string, number[]>();
  for (const path of carriers) {
    const hits = [...read(path).matchAll(litRe)].map((m) => Number(m[0]));
    if (hits.length > 0) found.set(path, hits);
    for (const hit of hits) {
      assert.ok(Math.abs(hit - derived) < TOL, `${path} carries ${hit}, off the derivation ${derived}`);
    }
  }
  for (const witness of ["public/index.css", "src/site/home/camera.ts", "scripts/e2e/home-support.mjs"]) {
    assert.ok(found.has(witness), `the sweep no longer bites: no height literal found in ${witness}`);
  }
});

test("the sheet-width literals match the manifest's build width in every home carrier (#476, guard-prover round 1 hole)", () => {
  const w = homeStage().sheetW;
  assert.equal(SHEET.w, w, `camera SHEET.w ${SHEET.w} is not the width the manifest was built at (${w})`);
  // Presence-witness anchored to the current width: a re-chosen width reds every carrier still carrying the old one. Scoped to the HOME files because elsewhere bare 1500 means sleeps and unrelated render params; here every occurrence is the sheet width today, so a future non-sheet 1500 in these files reds as a false positive and earns a conscious exclusion (never a silent miss).
  const wRe = new RegExp(String.raw`\b${w}(?![\d.])`);
  for (const path of [
    "public/index.css",
    "scripts/e2e/home-support.mjs",
    "scripts/e2e/suite-home.mjs",
    "scripts/e2e/suite-landfall.mjs",
  ]) {
    assert.ok(wRe.test(read(path)), `no width literal ${w} found in ${path}: it drifted or was re-derived`);
  }
});
