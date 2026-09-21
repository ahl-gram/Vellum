import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// #547: .sheet-tabs is rendered by src/layouts/Slip.astro at EVERY width and was dressed only inside the phone block, so the phone's two leaf tabs stood in the Broadside's head on the desktop from #540 until this rule. The resolved read is e2e CD22 (desktop) and CD14 (390); this is the fast lane and is blind to anything the cascade decides.

const REPO = resolve(import.meta.dirname, "..", "..");
const liveCss = (p: string): string => readFileSync(resolve(REPO, p), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

const blockClose = (css: string, open: number): number => {
  let depth = 0;
  for (let i = css.indexOf("{", open); i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) return i;
  }
  return -1;
};

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

test("the Chart Table's sheet stands the phone's TABLE LEAF down outside the phone block too, and the phone block raises it POSITIVELY, since a negative rule can raise nothing (#583)", () => {
  const css = liveCss("public/explorer/chart-drawer.css");
  const stood = css.indexOf(".table-leaf { display: none");
  const narrow = css.indexOf("@media (max-width: 900px)");
  const raised = css.indexOf("body.leaf-table .table-leaf { display: block");
  assert.notEqual(stood, -1, "the sheet carries a stand-down for the table leaf at all");
  assert.notEqual(narrow, -1, "and the phone block it has to sit outside");
  assert.notEqual(
    raised,
    -1,
    "and the phone block RAISES the leaf: measured on this branch, a top-level stand-down beside the old negative body:not(.leaf-table) rule leaves nothing matching once leaf-table is on, so the table never opens on a phone at all",
  );
  const close = blockClose(css, narrow);
  assert.ok(close > narrow, "the phone block closes, so the window below is a real one");
  assert.ok(
    stood < narrow || stood > close,
    "the stand-down is OUTSIDE the phone block, and this is deliberately NOT an order assertion: body.leaf-table .table-leaf is (0,2,1) against the stand-down's (0,1,0), so the raise wins wherever the stand-down sits, and pinning their order would pin statement order the cascade never consults (the defect deleted in 783b397, Issue #547's 2026-09-14 correction)",
  );
  assert.ok(
    raised > narrow && raised < close,
    "and the raise is INSIDE the phone block, so no width above 900 can show the leaf whatever body class is standing. No reader-reachable state distinguishes this today, since the class is set only by the leaf tabs and those are display:none at desktop; it guards the writer who sets leaf-table at desktop, which is the latent defect Issue #583 was filed about",
  );
  assert.equal(
    css.indexOf("body:not(.leaf-table) .table-leaf"),
    -1,
    "and the negative rule is gone: kept beside the stand-down it is dead, and kept instead of the raise it is the half-fix that takes the table off the phone",
  );
});

// The ceremony (Issue #523 Sub 5): the settle and the jolt are class-scoped keyframes that compose over the cutting's seat, never hover rules and never on the drawer root. The resolved reads are e2e CD44 to CD47; these are the fast lane, blind to the cascade.

const keyframesOf = (css: string, name: string): string | null => {
  const at = css.indexOf(`@keyframes ${name}`);
  if (at === -1) return null;
  const close = blockClose(css, at);
  return close === -1 ? null : css.slice(css.indexOf("{", at) + 1, close);
};

const rulesOf = (css: string): ReadonlyArray<readonly [string, string]> =>
  [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => [m[1]!.trim().replace(/\s+/g, " "), m[2]!] as const);

test("CC3 the settle is a keyframe on `transform`, composing over the cutting's individual-property seat and the ruled hover lift, on a class the host applies and never on :hover, timed by the motion tokens, with the shadow's rest shared with the static rule (Issue #523, D1 ruled 2026-09-21)", () => {
  const css = liveCss("public/explorer/chart-drawer.css");
  const land = keyframesOf(css, "cutting-land");
  assert.ok(land, "the settle's keyframes exist under the name the class rule animates");
  const steps = [...land.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => m[2]!);
  assert.ok(steps.length >= 2, "at least a from and a to");
  for (const step of steps) {
    assert.match(step, /\btransform\s*:/, "every step writes transform, which composes over the seat's rotate: and the lift's translate:/rotate:");
    assert.doesNotMatch(step, /(^|[\s;])(rotate|translate|scale)\s*:/, "no step writes an individual property: with a both fill that pins the seat at `to` and kills the ruled hover lift (Issue #520, 2026-09-08 ruling 2) for the class's life");
  }
  assert.match(steps.at(-1)!, /transform\s*:\s*none/, "the last step is the identity, or the both fill leaves the sheet where the settle ended");
  for (const [selector, body] of rulesOf(css)) {
    if (/rotate\(/.test(body)) assert.doesNotMatch(selector, /:hover/, `${selector} tips on hover; the settle's rotate is scoped to the landing class (Issue #289's sweep is the other side of this pin)`);
  }
  const landing = rulesOf(css).find(([s]) => s === ".cuttings li.landing");
  assert.ok(landing, "the class rule exists");
  assert.match(landing[1], /animation\s*:\s*cutting-land\s+var\(--paper-settle\)\s+var\(--ease-paper\)\s+both/, "timed by the shared tokens with a both fill, the motion.css idiom");
  const shadow = keyframesOf(css, "cutting-shadow");
  assert.ok(shadow, "the shadow flattens by its own keyframes on the img");
  assert.match(shadow, /to\s*\{[^}]*box-shadow\s*:\s*var\(--cutting-shadow\)/, "the shadow's rest is the TOKEN");
  const img = rulesOf(css).find(([s]) => s === ".cuttings img");
  assert.ok(img, "the static img rule exists");
  assert.match(img[1], /box-shadow\s*:\s*var\(--cutting-shadow\)/, "and the static rest reads the same token, so the both fill and the rest cannot drift apart");
});

test("CC4 the jolt is a keyframe on the cuttings list and never on the drawer root, whose animation shorthand carries the slide: a second animation there would restart the slide when the class left (Issue #523, D3 ruled 2026-09-21)", () => {
  const css = liveCss("public/explorer/chart-drawer.css");
  const jolt = rulesOf(css).find(([s]) => s === ".cuttings.jolt");
  assert.ok(jolt, "the jolt rule exists on the list");
  assert.match(jolt[1], /animation\s*:\s*cutting-jolt\b/);
  assert.ok(keyframesOf(css, "cutting-jolt"), "and its keyframes exist");
  const onRoot = rulesOf(css).filter(([s, body]) => s.split(",").some((arm) => /\.chart-drawer\b/.test(arm) && !/\.cuttings/.test(arm)) && /\banimation\s*:/.test(body));
  assert.deepEqual(onRoot.map(([s, body]) => [s, /chart-drawer-up/.test(body)]), [[".chart-drawer", true]], "exactly one animation reaches the drawer root, its own slide");
});
