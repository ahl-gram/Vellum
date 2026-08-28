import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// Landfall Sub 6a (#472): pulled all the way back, the page resumes. One World, Many Charts
// returns as plain server-rendered flow BELOW the landfall section, on the shell's deep. The
// scrolljacking contract's static half lives here: the shelf is reachable with no JS and no
// camera, and no authored sheet locks the document's scroll (the #461 body lock retired with
// this sub; the 2026-08-27 ratification comment on #472 records the call).

const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");
const liveCss = (p: string): string => read(p).replace(/\/\*[\s\S]*?\*\//g, "");

const astro = read("src/pages/index.astro");
const css = liveCss("public/index.css");

const PLATES = [
  { file: "charts/chart-42-topographic.svg", caption: "Topographic survey" },
  { file: "charts/chart-42-ink.svg", caption: "Pen &amp; ink" },
  { file: "charts/chart-42-nautical.svg", caption: "Nautical chart, with fathom soundings" },
] as const;

const shelfAt = astro.indexOf('<section class="lf-shelf"');
const shelf = astro.slice(shelfAt, astro.indexOf("</section>", shelfAt));

test("the shelf is a sibling below the landfall section, never a child (#472; the slips' geometry in landfall-prose holds only while nothing else flows in .landfall)", () => {
  const landfallAt = astro.indexOf('<section class="landfall"');
  const landfallClose = astro.indexOf("</section>", landfallAt);
  assert.ok(landfallAt >= 0 && landfallClose > landfallAt, "the landfall section closes");
  assert.ok(shelfAt > landfallClose, "the shelf opens after the landfall section closes");
});

test("the shelf carries the heading and the three survey plates with their captions", () => {
  assert.match(shelf, /<h2[^>]*>One World, Many Charts<\/h2>/);
  for (const p of PLATES) {
    assert.ok(shelf.includes(`<a href="${p.file}">`), `${p.file} is a plate link`);
    assert.ok(shelf.includes(`<figcaption>${p.caption}</figcaption>`), `${p.caption} captions its plate`);
    assert.ok(existsSync(resolve(REPO, "public", p.file)), `${p.file} is committed`);
  }
  assert.equal(shelf.match(/<figure>/g)?.length, 3, "three figures, nothing else on the shelf");
});

test("the plates keep their streaming manners (#329, revived with the markup it guarded): lazy, low priority, the .plate tip", () => {
  const imgs = [...shelf.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  assert.equal(imgs.length, 3, "three plate images");
  for (const img of imgs) {
    assert.match(img, /loading="lazy"/, "a megabyte plate below the fold never loads eagerly");
    assert.match(img, /fetchpriority="low"/, "a plate must not outrank a clicked room's HTML while it streams");
    assert.match(img, /class="plate"/, "the plate wears motion.css's lift, the tip-affordance KNOWN entry");
    assert.match(img, /width="1500" height="1158"/, "intrinsic size holds the shelf's layout while a lazy plate streams");
    assert.match(img, /alt="[^"]+"/, "every plate names its style");
  }
});

test("the shelf is plain flow: no hidden attribute, no noscript wrapper, no .cam gate in its dress", () => {
  assert.ok(shelfAt >= 0, "the shelf exists in index.astro");
  assert.ok(!/<[^>]*\bhidden\b[^>]*>/.test(shelf), "nothing on the shelf ships hidden");
  const noscriptAt = astro.indexOf("<noscript>");
  const noscriptClose = astro.indexOf("</noscript>");
  assert.ok(shelfAt < noscriptAt || shelfAt > noscriptClose, "the shelf lives outside the noscript doors");
  for (const rule of css.split("}")) {
    if (!rule.includes("lf-shelf")) continue;
    assert.ok(!rule.split("{")[0].includes(".cam"), "the shelf's dress never keys on the bundle's arrival");
  }
});

test("no authored sheet locks the document's scroll (#472 retired the #461 body lock; the class, not the instance)", () => {
  for (const sheet of ["public/index.css", "public/house.css", "public/motion.css"]) {
    for (const rule of liveCss(sheet).split("}")) {
      const [selector, decls] = rule.split("{");
      if (decls === undefined || !/(^|[^-\w])(body|html)(?![-\w])/.test(selector)) continue;
      assert.ok(
        !/overflow(?:-[xy])?\s*:\s*(?:hidden|clip)/.test(decls),
        `${sheet} locks scroll at the document level: ${rule.trim().slice(0, 80)}`,
      );
    }
  }
});
