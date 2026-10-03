import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// The drawer is the SHELL's (Issue #483), so its dress lives once in the layout and every shelled page wears it; home keeps only what clears its own furniture (public/index.css), pinned in test/site/home-cluster.test.ts.

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
  return m[1]!;
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
  assert.match(drawer, /transition:\s*transform 0\.32s/, "the slide is a transform transition, and its DURATION is pinned here because nothing else can see it: the e2e settles poll the drawer to its rest, so they wait out a slow one and stay green (#529, proved by tripling this to 3s)");
  assert.match(drawer, /z-index:\s*-1/, "it paints beneath the cluster's own lettering and burger");
  assert.match(drawer, /width:\s*min\(16rem, 100vw\)/, "capped at the viewport: a box wider than the phone widens the layout viewport itself (the 736px incident)");
  assert.match(drawer, /padding:\s*0 1\.5rem 2rem var\(--chrome-x\)/, "no padding-top: the sticky cap is the reserve (a padding the cap was pulled into by a negative margin put the cap over the first doors)");
  const cap = rule(narrow, ".chrome .rooms::before");
  assert.match(cap, /position:\s*sticky;\s*top:\s*0;\s*z-index:\s*1/, "a sticky cap rides the drawer's scroll above the doors");
  assert.match(cap, /height:\s*calc\(var\(--band-h\) \+ 1rem\)/, "sized off the band token, so it clears the cluster at every width");
  const open = rule(narrow, ".rooms-reveal:checked ~ .rooms");
  assert.match(open, /transform:\s*none/, "checked, it slides home");
  assert.match(open, /transition:\s*transform 0\.32s/, "the same duration home as away, so the drawer cannot slow in one direction alone");
  assert.match(open, /visibility:\s*visible/, "and its doors become tabbable");
  const doors = rule(narrow, '.chrome .rooms a, .chrome .rooms [aria-current="page"]');
  assert.match(doors, /display:\s*block/, "the doors stack one per row, the current room's among them");
  assert.match(doors, /padding:\s*0\.85rem 0/, "each row is a 44px touch target at the drawer's face size (0.95rem face plus 0.85rem above and below measured 45px, e2e CL4)");
  // Measured 2026-08-28 at 390 on /faq/: in IM Fell English SC no lowercase descends, but the CAPITAL Q carries a drawn flourish, and "Q & A" is the one nav label that has one. At the drawer's 0.95rem face it descends 4.22px, so the drawer's own 0.3em override (4.56px) left 0.34px and the tail touched the stroke at device resolution. The shell keeps ONE offset instead.
  assert.ok(!narrow.includes("text-underline-offset"), "the drawer declares no offset of its own: the shell's single 0.45em clears the Q by 2.62px at the drawer's face size");
  assert.match(rule(topLevel, '.rooms [aria-current="page"]'), /text-underline-offset:\s*0\.45em/, "and that one offset is the shell's");
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

test("a room's scrim is fixed with the chrome that is fixed, and starts below the band so the cluster stays lit (#483; Alex's 2026-08-28 call lifting #482 finding 4 for a room)", () => {
  const scrim = rule(narrow, "body.room:has(.rooms-reveal:checked)::after");
  assert.match(scrim, /content:\s*""/);
  assert.match(scrim, /position:\s*fixed/, "fixed with the drawer it dims behind");
  assert.match(scrim, /inset:\s*var\(--band-h\) 0 0/, "it starts below the reserved band, so the cluster it belongs to is never dimmed, and it is sized by inset and never by 100vw (a scrollbar overflows that)");
  assert.match(scrim, /z-index:\s*41/, "above anything a room paints with a z-index (the highest measured is 20) and under the raised chrome");
  assert.match(rule(narrow, "body.room:has(.rooms-reveal:checked) [popover]:popover-open"), /display:\s*none/, "and the one thing no z-index can reach: a shown popover renders in the TOP LAYER, above the wash, so a room's footnotes stand down with the drawer rather than sitting lit and opaque over a dimmed page while inert inside main");
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

type CssRule = { readonly media: readonly string[]; readonly selector: string; readonly body: string };
function cssRules(css: string, media: readonly string[] = []): CssRule[] {
  const out: CssRule[] = [];
  for (let i = 0, open = css.indexOf("{"); open >= 0; open = css.indexOf("{", i)) {
    let close = open + 1;
    for (let depth = 1; depth > 0 && close < css.length; close++) depth += css[close] === "{" ? 1 : css[close] === "}" ? -1 : 0;
    const prelude = css.slice(i, open).trim();
    const body = css.slice(open + 1, close - 1);
    if (prelude.startsWith("@media")) out.push(...cssRules(body, [...media, prelude]));
    else if (!prelude.startsWith("@")) out.push({ media, selector: prelude, body });
    i = close;
  }
  return out;
}

const shellRules = cssRules(layout.slice(styleAt + "<style is:global>".length, layout.indexOf("</style>", styleAt)));
const trailRules = shellRules.filter((r) => /\.(trail|also|where)\b/.test(r.selector));
const ruleAt = (selector: string, media: readonly string[]): string => {
  const found = shellRules.filter((r) => r.selector === selector && JSON.stringify(r.media) === JSON.stringify(media));
  assert.equal(found.length, 1, `exactly one rule ${selector} under ${JSON.stringify(media)}`);
  return found[0]!.body;
};

test("the trail is quiet by size and never by a dimmer ink: no rule that dresses it reaches for an ink under the floor on the deep (Issue #668)", () => {
  assert.ok(trailRules.length >= 10, `the reader found the trail's rules (${trailRules.length}), so the sweep below is not of nothing`);
  for (const r of trailRules) assert.doesNotMatch(r.body, /--ink-faded|--line-tan/, `${r.selector} wears an ink that reads under 4.5:1 on the deep`);
  const here = ruleAt('.trail [aria-current="page"], .trail .here', []);
  assert.match(here, /color:\s*var\(--parchment-bright\)/, "the page's own segment brightens");
  assert.match(here, /text-decoration:\s*underline/, "and is underlined, never colour alone");
});

test("the band buys the trail its ground where a band renders, keyed to what the cluster carries, declared on the root, its padding derived and on screen alone (Issue #668)", () => {
  assert.match(ruleAt(":root:has(.band):has(.trail)", []), /--band-h:\s*[\d.]+rem/, "the band's height on the root every reader of the token reads");
  assert.match(ruleAt(":root:has(.band):has(.trail)", ["@media (max-width: 720px)"]), /--band-h:\s*[\d.]+rem/, "and a phone's, on the root too");
  const padding = shellRules.filter((r) => r.selector === "body.room:has(.band):has(.trail)");
  assert.equal(padding.length, 2, "one padding for a wide screen and one for a phone");
  for (const r of padding) assert.ok(r.media.some((m) => /\bscreen\b/.test(m)), `${JSON.stringify(r.media)}: on paper the layout's own padding: 0 stands`);
  for (const media of [["@media screen"], ["@media screen and (max-width: 720px)"]]) {
    assert.match(ruleAt("body.room:has(.band):has(.trail)", media), /padding-top:\s*calc\(var\(--band-h\) \+ [\d.]+rem\)/, `${media[0]}: the padding derives from the token, never a literal beside it`);
  }
});

test("the drawer's cap grows only where a trail rides in it, and the cap every page wears is unchanged (Issue #668)", () => {
  assert.match(ruleAt("body:has(.rooms-reveal:checked) .chrome:has(.trail) .rooms::before", ["@media (max-width: 900px)"]), /height:\s*calc\(var\(--band-h\) \+ [\d.]+rem\)/);
  assert.match(rule(narrow, ".chrome .rooms::before"), /height:\s*calc\(var\(--band-h\) \+ 1rem\)/, "home's drawer, which carries no trail, keeps its cap");
});
