import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Landfall Sub 6c (#483): the drawer is the SHELL's, so its dress lives once in the layout (#263) and every shelled page wears it. Home keeps only what clears home's own furniture (public/index.css); test/site/home-cluster.test.ts pins that half.

const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");
const liveCss = (p: string): string => read(p).replace(/\/\*[\s\S]*?\*\//g, "");

const layout = liveCss("src/layouts/BaseLayout.astro");
const home = liveCss("public/index.css");

function mediaBodies(sheet: string, query: string, where: string): string {
  const bodies: string[] = [];
  let at = sheet.indexOf(`@media ${query}`);
  while (at >= 0) {
    const open = sheet.indexOf("{", at);
    let depth = 0;
    for (let i = open; i < sheet.length; i++) {
      if (sheet[i] === "{") depth++;
      else if (sheet[i] === "}" && --depth === 0) {
        bodies.push(sheet.slice(open + 1, i));
        at = sheet.indexOf(`@media ${query}`, i);
        break;
      }
    }
    if (depth !== 0) assert.fail(`unbalanced @media ${query} block in ${where}`);
  }
  assert.ok(bodies.length > 0, `${where} carries an @media ${query} block`);
  return bodies.join("\n");
}

const rule = (sheet: string, selector: string): string => {
  const m = sheet.match(new RegExp(`(?:^|[}\\n])\\s*${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{([^}]*)\\}`));
  assert.ok(m, `a rule for ${selector} exists`);
  return m[1];
};

const narrow = mediaBodies(layout, "(max-width: 900px)", "BaseLayout");
const print = mediaBodies(layout, "print", "BaseLayout");
const styleAt = layout.indexOf("<style is:global>");
const topLevel = layout.slice(styleAt, layout.indexOf("</style>", styleAt)).replace(/@media[^{]*\{[\s\S]*?\n\}/g, "");

test("the drawer's dress is the shell's, so a room wears the same drawer as home (#483 ruling, option 1)", () => {
  const drawer = rule(narrow, ".chrome .rooms");
  assert.match(drawer, /position:\s*absolute/, "it is anchored inside the cluster, which rides the page on home and is fixed on a room (RH3)");
  assert.match(drawer, /left:\s*calc\(-1 \* var\(--chrome-x\)\);\s*top:\s*calc\(-1 \* var\(--chrome-y\)\)/, "anchored to the corner through the tokens");
  assert.match(drawer, /transform:\s*translateX\(-100%\)/, "closed, it waits off the left edge");
  assert.match(drawer, /visibility:\s*hidden/, "closed, its doors are neither visible nor tabbable");
  assert.match(drawer, /transition:[^;]*transform/, "the slide is a transform transition");
  assert.match(drawer, /z-index:\s*-1/, "it paints beneath the cluster's own lettering and burger");
  assert.match(drawer, /width:\s*min\(16rem, 100vw\)/, "capped at the viewport: a box wider than the phone widens the layout viewport itself (the 736px incident)");
  assert.match(drawer, /padding:\s*0 1\.5rem 2rem var\(--chrome-x\)/, "no padding-top: the sticky cap is the reserve (a padding the cap was pulled into by a negative margin put the cap over the first doors)");
  const cap = rule(narrow, ".chrome .rooms::before");
  assert.match(cap, /position:\s*sticky;\s*top:\s*0;\s*z-index:\s*1/, "a sticky cap rides the drawer's scroll above the doors");
  assert.match(cap, /height:\s*calc\(var\(--band-h\) \+ 1rem\)/, "sized off the band token, so it clears the cluster at every width");
  const open = rule(narrow, ".rooms-reveal:checked ~ .rooms");
  assert.match(open, /transform:\s*none/, "checked, it slides home");
  assert.match(open, /visibility:\s*visible/, "and its doors become tabbable");
  const doors = rule(narrow, '.chrome .rooms a, .chrome .rooms [aria-current="page"]');
  assert.match(doors, /display:\s*block/, "the doors stack one per row, the current room's among them");
  assert.match(doors, /padding:\s*0\.85rem 0/, "each row is a 44px touch target at the drawer's face size (0.95rem face plus 0.85rem above and below measured 45px, e2e CL4)");
  assert.match(rule(narrow, '.chrome .rooms [aria-current="page"]'), /text-underline-offset:\s*0\.3em/, "the current room's door keeps its underline clear of its own descenders at the drawer's face size");
  assert.match(rule(narrow, "body:has(.rooms-reveal:checked) > header.chrome"), /z-index:\s*45/, "the chrome rises above the scrim (41) and anything a page paints beneath it while the drawer is open, under the veil (50)");
});

test("the burger is a native checkbox, hidden until the nav folds down, so the doors survive scripts off everywhere (#461, #483)", () => {
  assert.match(rule(topLevel, ".rooms-reveal"), /display:\s*none/, "wide, there is no burger: the nav itself is the doors");
  const burger = rule(narrow, ".rooms-reveal");
  assert.match(burger, /appearance:\s*none/, "the checkbox wears the burger's face, not a checkbox");
  assert.match(burger, /display:\s*inline-block/, "and takes its place in the cluster's flow");
  assert.match(burger, /cursor:\s*pointer/);
  assert.match(rule(narrow, ".rooms-reveal:focus-visible"), /outline:/, "keyboard-operable with no bundle: the focus ring is the affordance");
  assert.ok(
    layout.indexOf(".rooms-reveal { display: none") < layout.indexOf("@media (max-width: 900px)"),
    "the wide stand-down is declared BEFORE the narrow block, so equal specificity resolves by source order the way it did in home's sheet",
  );
});

test("a room's scrim is fixed with the chrome that is fixed, and covers exactly what goes inert (#483; #482 skeptic round 2 findings 2 and 4)", () => {
  // Finding 4 banned a FIXED body scrim because home's drawer and burger scroll away from one. A room's chrome is fixed (RH3), so the drawer cannot ride away and the mirror defect is an ABSOLUTE scrim there. The ban is home's, and it still holds on home.
  const scrim = rule(narrow, "body.room:has(.rooms-reveal:checked)::after");
  assert.match(scrim, /content:\s*""/);
  assert.match(scrim, /position:\s*fixed/, "fixed with the drawer it dims behind");
  assert.match(scrim, /inset:\s*var\(--band-h\) 0 0/, "it starts below the reserved band, so the cluster it belongs to is never dimmed, and it is sized by inset and never by 100vw (a scrollbar overflows that)");
  assert.match(scrim, /z-index:\s*41/, "above anything a room paints (the highest measured is 20) and under the raised chrome");
  assert.match(scrim, /background:\s*rgb\(from var\(--chart-ink\) r g b \/ 0\.45\)/, "the same wash home's scrim carries");
  assert.match(scrim, /pointer-events:\s*auto/, "the page beneath is not live while the drawer is");
  assert.doesNotMatch(narrow, /body:has\(\.rooms-reveal:checked\)::after/, "never an unqualified body scrim: home's would be the fixed one finding 4 rejected");
  assert.match(rule(print, "body.room:has(.rooms-reveal:checked)::after"), /content:\s*none/, "print never stamps the scrim: paper widths match the narrow query and :checked is state (#454 decision 4)");
});

test("home's sheet keeps only what clears home's own furniture (#263, #483)", () => {
  const homeNarrow = mediaBodies(home, "(max-width: 900px)", "public/index.css");
  for (const moved of [".chrome .rooms {", ".chrome .rooms::before", ".rooms-reveal:checked ~ .rooms", ".rooms-reveal {"]) {
    assert.ok(!homeNarrow.includes(moved), `${moved} is the shell's now, declared once in the layout`);
  }
  assert.match(
    rule(homeNarrow, "body > header.chrome"),
    /max-width:\s*calc\(100vw - 15rem\)/,
    "the cluster's width cap STAYS home's: the 15rem is the clearance for home's seed panel, and on a room with no panel it would wrap the tagline for nothing",
  );
  for (const kept of ["body:has(.rooms-reveal:checked) .lf-seed", "body:has(.rooms-reveal:checked) .landfall::before"]) {
    assert.ok(homeNarrow.includes(kept), `${kept} clears home's own furniture, so it stays home's; test/site/home-cluster.test.ts pins its dress`);
  }
});
