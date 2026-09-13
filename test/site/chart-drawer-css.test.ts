import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// #547: .sheet-tabs is rendered by src/layouts/Slip.astro at EVERY width and was dressed only inside the phone block, so the phone's two leaf tabs stood in the Broadside's head on the desktop from #540 until this rule. The resolved read is e2e CD22 (desktop) and CD14 (390); this is the fast lane and is blind to anything the cascade decides.

const REPO = resolve(import.meta.dirname, "..", "..");
const liveCss = (p: string): string => readFileSync(resolve(REPO, p), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

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
  assert.ok(shown > narrow, "and the rule that raises them is inside the phone block, not beside the stand-down where it would win everywhere");
});
