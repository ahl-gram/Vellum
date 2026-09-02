import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { globSync } from "node:fs";
import { resolve } from "node:path";

// #487's guard, the #302 precedent's inverse (skeptic on PR #491, finding 2): the kit sheet is linked on every page, so a kit rule on a class HOME also authors leaks onto home unless the rule is scoped to a room. The blocking instance was `.stage`: home's landfall stage wears the class, and the kit's unscoped landing scaled it under the camera.
const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");

const classesIn = (astro: string): Set<string> =>
  new Set([...astro.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/)).filter((c) => c && !c.includes("{")));

const rulesIn = (css: string): string[] =>
  [...css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{[^{}]*\}/g)].map((m) => m[1].trim()).filter((s) => !s.startsWith("@") && !/^\d|^from$|^to$/.test(s));

const SCOPED = /(^|\s)body\.(?:chart-room|room)\b/;

const offendersIn = (css: string, home: Set<string>): string[] =>
  rulesIn(css).flatMap((selector) => selector.split(",").map((s) => s.trim())).filter((arm) => {
    const classes = [...arm.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]);
    return classes.length > 0 && classes.every((c) => home.has(c)) && !SCOPED.test(arm);
  });

/** #487 allows the kit to split ("or a few: slip, legend, chrome"): every atelier*.css on disk is a kit sheet and is swept. */
const kitSheets = (): string[] => readdirSync(resolve(REPO, "public")).filter((f) => /^atelier.*\.css$/.test(f)).map((f) => `public/${f}`);

/** The pages that do not wear the kit on purpose: home and every room not yet converted (no chartRoom, no open desk); the kit sheet is linked on all of them. */
const unconvertedPages = (): string[] =>
  globSync("src/pages/**/index.astro", { cwd: REPO }).filter((p) => { const src = read(p); return !/\bchartRoom\b/.test(src) && !src.includes('desk="open"'); });

test("every kit rule on a class an unconverted page wears is scoped to a room (#487, the #302 inverse)", () => {
  const sheets = kitSheets();
  const pages = unconvertedPages();
  assert.ok(sheets.includes("public/atelier.css"), "the kit's sheet is on disk");
  assert.deepEqual(pages, ["src/pages/index.astro"], "since #464 every room wears the kit, so home alone is swept (it wears .stage)");
  for (const page of pages) {
    const worn = classesIn(read(page));
    for (const sheet of sheets) {
      assert.deepEqual(offendersIn(read(sheet), worn), [], `${sheet} reaches a class ${page} wears; scope it to body.chart-room (or body.room)`);
    }
  }
});

test("the guard can see an unscoped collision: the offender loop itself reads a planted .stage rule, and not its scoped twin", () => {
  const home = classesIn(read("src/pages/index.astro"));
  assert.ok(home.has("stage"), "home's landfall stage still wears the class the collision was found on");
  assert.deepEqual(offendersIn(".stage { position: fixed; } body.chart-room .stage { inset: 0; } .folio-controls .control { width: 1px; } .stage .sheet { color: red; }", home), [".stage", ".stage .sheet"], "a bare rule and a compound of home classes both red; a compound with a kit-only class does not");
});
