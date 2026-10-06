import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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
