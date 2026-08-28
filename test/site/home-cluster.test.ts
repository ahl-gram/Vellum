import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Landfall Sub 6b (#480): the head cluster's cleanup on home. SPEC: the four screenshots on #480 and their captions; the measured baseline is on the PR.

const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");
const liveCss = (p: string): string => read(p).replace(/\/\*[\s\S]*?\*\//g, "");

const css = liveCss("public/index.css");
const layout = read("src/layouts/BaseLayout.astro");

function mediaBodies(sheet: string, query: string): string {
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
    if (depth !== 0) assert.fail(`unbalanced @media ${query} block`);
  }
  assert.ok(bodies.length > 0, `public/index.css carries an @media ${query} block`);
  return bodies.join("\n");
}

const rule = (sheet: string, selector: string): string => {
  const m = sheet.match(new RegExp(`(?:^|[}\\n])\\s*${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{([^}]*)\\}`));
  assert.ok(m, `a rule for ${selector} exists`);
  return m[1];
};

const narrow = mediaBodies(css, "(max-width: 900px)");
const topLevel = css.replace(/@media[^{]*\{[\s\S]*?\n\}/g, "");

test("the stage never yields its lettering to a drag: user-select none on the whole stage, so a pip drag selects nothing (#480, screenshot 4)", () => {
  // Measured 2026-08-28 (out/480/base-report.json): a mouse drag from a station name selected every place name on the sheet; the chart image alone was opted out.
  const stage = rule(topLevel, ".landfall .stage");
  assert.match(stage, /user-select:\s*none/, "the stage opts its lettering out of selection");
  assert.match(stage, /-webkit-user-select:\s*none/, "iOS Safari reads the prefixed form");
});

test("the cluster's wash is a soft pool sized by the cluster, not the 46rem slab (#480, screenshot 3)", () => {
  // Measured 2026-08-28: the slab was 736x272 with the nav ending at x=510, y=102, and both clipped edges were visible over the chart.
  const wash = rule(topLevel, "header.chrome::before");
  assert.doesNotMatch(wash, /radial-gradient|46rem|17rem|width:|height:/, "no fixed-size gradient box remains");
  const inset = wash.match(/inset:\s*(-?[\d.]+)rem\s+(-?[\d.]+)rem\s+(-?[\d.]+)rem\s+(-?[\d.]+)rem/);
  assert.ok(inset, "the wash is an inset around the cluster, so it follows the lettering");
  const [top, right, bottom, left] = inset.slice(1).map(Number);
  assert.ok(top <= -3 && left <= -3, `the top and left bleed off the viewport edge (top ${top}rem, left ${left}rem)`);
  assert.ok(right >= -3 && right <= -1.5 && bottom >= -3 && bottom <= -1.5, `the right and bottom reach 1.5 to 3rem past the lettering (right ${right}rem, bottom ${bottom}rem)`);
  assert.match(wash, /filter:\s*blur\((1[6-9]|2[0-8])px\)/, "the edge is a 16 to 28px blur, no clipped edge to see");
  const alpha = wash.match(/background:\s*rgb\(from var\(--chart-ink\) r g b \/ (0\.\d+)\)/);
  assert.ok(alpha && Number(alpha[1]) >= 0.8, "the pool is the chart ink at 0.8 or deeper (the 2026-08-26 plate read measured 1.17:1 for the cluster over the close-in chart with no wash)");
  assert.doesNotMatch(narrow, /header\.chrome::before/, "no corner re-anchor under 900: the inset follows the cluster wherever the shell puts it");
});

test("the chrome's corner offsets are tokens the wash and drawer can follow (#480)", () => {
  assert.match(layout, /--chrome-x:\s*1\.6rem;\s*--chrome-y:\s*1\.4rem;/, "the layout declares the desktop offsets once");
  assert.match(layout, /header\.chrome\s*\{[^}]*left:\s*var\(--chrome-x\);\s*top:\s*var\(--chrome-y\);/, "header.chrome consumes them");
  const phone = mediaBodies(layout, "(max-width: 720px)");
  assert.match(phone, /--chrome-x:\s*1rem;\s*--chrome-y:\s*0\.9rem;/, "the narrow shell overrides the tokens, not the properties");
  assert.doesNotMatch(phone, /header\.chrome\s*\{[^}]*left:/, "no literal left/top override survives under 720");
});

test("under 900 the rooms nav is a drawer: it slides in from the left beneath the cluster, and its doors stack (#480, screenshots 1 and 2)", () => {
  const drawer = rule(narrow, ".chrome .rooms");
  assert.match(drawer, /position:\s*absolute/, "the drawer rides the page with the cluster (#472's ruling: nothing fixed collides with the shelf)");
  assert.match(drawer, /left:\s*calc\(-1 \* var\(--chrome-x\)\);\s*top:\s*calc\(-1 \* var\(--chrome-y\)\)/, "it is anchored to the viewport corner through the tokens");
  assert.match(drawer, /transform:\s*translateX\(-100%\)/, "closed, it waits off the left edge");
  assert.match(drawer, /visibility:\s*hidden/, "closed, its doors are neither visible nor tabbable");
  assert.match(drawer, /transition:[^;]*transform/, "the slide is a transform transition");
  assert.match(drawer, /z-index:\s*-1/, "it paints beneath the cluster's own lettering and burger");
  assert.match(drawer, /width:\s*min\(16rem, 100vw\)/, "capped at the viewport: a box wider than the phone widens the layout viewport itself (the 736px incident)");
  assert.match(drawer, /padding:\s*0 1\.5rem 2rem var\(--chrome-x\)/, "no padding-top: the sticky cap is the reserve (a padding the cap was pulled into by a negative margin put the cap over the first doors)");
  const cap = rule(narrow, ".chrome .rooms::before");
  assert.match(cap, /position:\s*sticky;\s*top:\s*0;\s*z-index:\s*1/, "a sticky cap rides the drawer's scroll above the doors");
  assert.match(cap, /height:\s*calc\(var\(--band-h\) \+ 1rem\);/, "the cap is exactly the reserved band the cluster stands on, plus a breath");
  assert.doesNotMatch(cap, /margin/, "and never a negative margin: sticky clamps the box inside its containing block, which slid the cap down over the first three doors");
  assert.match(cap, /background:\s*var\(--chart-ink\)/, "opaque, so a scrolled door cannot show through beneath the lettering (plate finding G)");
  const open = rule(narrow, ".rooms-reveal:checked ~ .rooms");
  assert.match(open, /transform:\s*none/, "checked, it slides home");
  assert.match(open, /visibility:\s*visible/, "checked, its doors are live");
  assert.match(open, /pointer-events:\s*auto/, "checked, its ground takes the hand (the chrome passes it through otherwise)");
  assert.doesNotMatch(open, /display:\s*block|max-width/, "the old inline reveal (display flip, viewport max-width) is gone");
  assert.match(rule(narrow, ".chrome .rooms .sep"), /display:\s*none/, "the separators stand down in the stack");
  const doors = rule(narrow, '.chrome .rooms a, .chrome .rooms [aria-current="page"]');
  assert.match(doors, /display:\s*block/, "every door is its own row");
  assert.match(doors, /padding:\s*0\.85rem 0/, "each row is a 44px touch target at the drawer's face size (0.95rem face plus 0.85rem above and below measured 45px, e2e CL4)");
});

test("while the drawer is open the seed panel steps aside and a scrim stands behind the drawer (#480, screenshot 1)", () => {
  const aside = rule(narrow, "body:has(.rooms-reveal:checked) .lf-seed");
  assert.match(aside, /opacity:\s*0/, "the corner panel fades rather than sharing the corner with the doors");
  assert.match(aside, /pointer-events:\s*none/, "and cannot be tapped blind");
  const scrim = rule(narrow, "body:has(.rooms-reveal:checked)::after");
  assert.match(scrim, /position:\s*fixed;\s*inset:\s*0/, "the scrim covers the viewport, sized by fixed inset (100vw counts a classic scrollbar and overflows by its width)");
  const z = scrim.match(/z-index:\s*(\d+)/);
  assert.ok(z && Number(z[1]) < 10, "it sits beneath the chrome (z 10), so the burger and the drawer stay reachable");
  assert.match(scrim, /pointer-events:\s*auto/, "the stage beneath is not live while the drawer is");
});

test("the cluster yields the seed panel its corner under 900: the mockup's phone input and a cluster width cap (#480, screenshot 1)", () => {
  // Measured 2026-08-28 at 390: the tagline ended at x=172.5 and the panel began at x=153.2; a 360 Android is 30px narrower again.
  assert.match(rule(narrow, ".seed-controls .control"), /width:\s*4\.6rem/, "the mockup's own phone input width (design/atelier-map/stage.css), which Act I dropped");
  assert.match(rule(narrow, "body > header.chrome"), /max-width:\s*calc\(100vw - 15rem\)/, "the cluster wraps its tagline before it can reach the panel");
});
