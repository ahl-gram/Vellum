import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

// #487's guard, the #302 precedent's inverse (skeptic on PR #491, finding 2): the kit sheet is linked on every page, so a kit rule on a class HOME also authors leaks onto home unless the rule is scoped to a room. The blocking instance was `.stage`: home's landfall stage wears the class, and the kit's unscoped landing scaled it under the camera.
const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");

const classesIn = (astro: string): Set<string> =>
  new Set([...astro.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/)).filter((c) => c && !c.includes("{")));

const rulesIn = (css: string): string[] =>
  [...css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{[^{}]*\}/g)].map((m) => m[1].trim()).filter((s) => !s.startsWith("@") && !/^\d|^from$|^to$/.test(s));

const SCOPED = /(^|\s)body\.(?:chart-room|room)\b/;

test("every kit rule on a class home authors is scoped to a room (#487, the #302 inverse)", () => {
  const home = classesIn(read("src/pages/index.astro"));
  const kit = read("public/atelier.css");
  const offenders: string[] = [];
  for (const selector of rulesIn(kit)) {
    for (const arm of selector.split(",").map((s) => s.trim())) {
      const classes = [...arm.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]);
      // An arm reaches home only when EVERY class it names is one home wears: .folio-controls .control cannot match a page with no .folio-controls, but a bare .stage matches home's.
      if (classes.length > 0 && classes.every((c) => home.has(c)) && !SCOPED.test(arm)) offenders.push(arm);
    }
  }
  assert.deepEqual(offenders, [], "a kit rule reaches a class home wears; scope it to body.chart-room (or body.room)");
});

test("the guard can see an unscoped collision (a planted .stage rule), and every kit sheet on disk is swept", () => {
  const home = classesIn(read("src/pages/index.astro"));
  assert.ok(home.has("stage"), "home's landfall stage still wears the class the collision was found on");
  const planted = rulesIn(".stage { position: fixed; }");
  assert.ok(planted.some((s) => !SCOPED.test(s) && /\.stage\b/.test(s)), "the scan reads a bare .stage rule as unscoped");
  const sheets = readdirSync(resolve(REPO, "public")).filter((f) => f === "atelier.css");
  assert.deepEqual(sheets, ["atelier.css"], "the kit is one sheet; a split kit joins this sweep");
});
