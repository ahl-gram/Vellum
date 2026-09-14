import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// #547: .sheet-tabs is rendered by src/layouts/Slip.astro at EVERY width and was dressed only inside the phone block, so the phone's two leaf tabs stood in the Broadside's head on the desktop from #540 until this rule. The resolved read is e2e CD22 (desktop) and CD14 (390); this is the fast lane and is blind to anything the cascade decides.

const REPO = resolve(import.meta.dirname, "..", "..");
const liveCss = (p: string): string => readFileSync(resolve(REPO, p), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

// Blind spot, named with its direction: the two anchors are exact text including the space before the brace, so a reformat to `.sheet-tabs{display:none}` reds this with a message saying the stand-down is missing when it is only respelled. That costs a false red and never a miss, which is the direction this sheet's scanners are asked to err in.
test("the Chart Table's sheet stands the leaf tabs down at every width its phone block does not reach, and declares it FIRST so equal specificity resolves by source order (#547)", () => {
  const css = liveCss("public/explorer/chart-drawer.css");
  const stood = css.indexOf(".sheet-tabs { display: none");
  const narrow = css.indexOf("@media (max-width: 900px)");
  const shown = css.indexOf(".sheet-tabs { display: flex");
  assert.notEqual(stood, -1, "the sheet carries a stand-down for the leaf tabs at all");
  assert.notEqual(narrow, -1, "and the phone block this one has to precede");
  assert.notEqual(shown, -1, "and the phone block still raises them");
  assert.ok(
    stood < narrow,
    "the stand-down is declared BEFORE the phone block: both arms are one class, so the later one wins and a stand-down written after it would take the tabs off the phone instead (the shape test/site/shell-drawer-css.test.ts pins for .rooms-reveal)",
  );
  // The block's own brace-matched close, never just "later in the file" (prover, 2026-09-13).
  let depth = 0;
  let close = -1;
  for (let i = css.indexOf("{", narrow); i < css.length && close < 0; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) close = i;
  }
  assert.ok(close > narrow, "the phone block closes, so the window below is a real one");
  assert.ok(
    shown > narrow && shown < close,
    "and the rule that raises them is INSIDE the phone block: moved out of it, it wins at every width and the tabs are back on the desktop with this test none the wiser",
  );
});
