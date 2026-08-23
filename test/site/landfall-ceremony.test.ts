import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { SHEET, fitScale, centerFraction } from "../../src/site/home/camera.ts";
import {
  TARGET_FATHOMS,
  MIN_VEIL_MS,
  SOUNDING_TICK_MS,
  LANDFALL_HOLD_MS,
  FLIGHT_SECONDS,
  WIDE_FACTOR,
  LANDFALL_LABEL,
  ARRIVED_KEY,
  nextSounding,
  soundingLabel,
  wideView,
  landfallView,
  firstArrival,
  markArrival,
} from "../../src/site/home/ceremony.ts";
import { veilMarkup } from "../../src/site/home/veil.ts";

// Landfall Sub 2 (#457): the ceremony; the spec is the archived mockup (design/atelier-map, PR #466) and the 2026-08-23 ratified comment on #457.

const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");

test("the ceremony keeps the mockup's clock and the chart's own number (#457)", () => {
  assert.equal(TARGET_FATHOMS, 42, "the sounding counts to the seed itself");
  assert.equal(MIN_VEIL_MS, 2400, "the veil holds at least the mockup's minimum");
  assert.equal(SOUNDING_TICK_MS, 46, "the counter ticks at the mockup's cadence");
  assert.equal(LANDFALL_HOLD_MS, 500, "Landfall is read before the veil lifts");
  assert.equal(FLIGHT_SECONDS, 2.4, "the flight takes the mockup's 2.4 seconds");
  assert.equal(WIDE_FACTOR, 0.78, "the anchorage stands off at the mockup's 0.78 of fit");
});

test("the sounding counter climbs by the cast, up to four fathoms and never past 42 (#457)", () => {
  assert.equal(nextSounding(0, 0.99), 4, "a high cast gains four fathoms");
  assert.equal(nextSounding(0, 0.01), 1, "a low cast still gains one");
  assert.equal(nextSounding(10, 0.5), 12, "a middle cast gains its ceil");
  assert.equal(nextSounding(41, 0.99), TARGET_FATHOMS, "the last cast lands exactly on 42");
  assert.equal(nextSounding(TARGET_FATHOMS, 0.99), TARGET_FATHOMS, "42 fathom is the floor of the sound");
  for (const roll of [0.001, 0.25, 0.5, 0.75, 0.999]) {
    const step = nextSounding(20, roll) - 20;
    assert.ok(step >= 1 && step <= 4, `cast ${roll} steps ${step}, outside 1..4`);
  }
});

test("the status line speaks the mockup's words (#457)", () => {
  assert.equal(soundingLabel(0), "Sounding · 0 fathom");
  assert.equal(soundingLabel(42), "Sounding · 42 fathom");
  assert.equal(LANDFALL_LABEL, "Landfall");
});

test("the wide anchorage and the landfall view frame the isle as the mockup's camera does (#457)", () => {
  const view = { w: 1280, h: 800 };
  const fit = fitScale(view, SHEET);

  const wide = wideView(view, SHEET, fit);
  assert.ok(Math.abs(wide.s - fit * WIDE_FACTOR) < 1e-12, "the anchorage stands off at 0.78 of fit");
  const wc = centerFraction(wide, view, SHEET);
  assert.ok(Math.abs(wc.fx - 0.5) < 1e-9 && Math.abs(wc.fy - 0.5) < 1e-9, "the anchorage centers the sheet");

  const land = landfallView(view, SHEET, fit, 1280);
  assert.ok(Math.abs(land.s - fit * 1.72) < 1e-12, "the wide landfall closes to 1.72 of fit");
  const lc = centerFraction(land, view, SHEET);
  assert.ok(Math.abs(lc.fx - 0.51) < 1e-9, "landfall centers the capital's water, fx 0.51");
  assert.ok(Math.abs(lc.fy - 0.485) < 1e-9, "landfall centers the capital's water, fy 0.485");

  const narrow = landfallView(view, SHEET, fit, 899);
  assert.ok(Math.abs(narrow.s - fit * 1.6) < 1e-12, "under a 900px viewport the landfall stands further off, 1.6 of fit");
  const at900 = landfallView(view, SHEET, fit, 900);
  assert.ok(Math.abs(at900.s - fit * 1.72) < 1e-12, "a 900px viewport takes the wide framing, as the mockup's v.w < 900 does");
  const boxedWide = landfallView({ w: 880, h: 800 }, SHEET, fitScale({ w: 880, h: 800 }, SHEET), 928);
  assert.ok(
    Math.abs(boxedWide.s - fitScale({ w: 880, h: 800 }, SHEET) * 1.72) < 1e-12,
    "the breakpoint reads the VIEWPORT, not the stage box: a 928px viewport whose boxed stage is 880 still frames wide (the mockup decides on window.innerWidth; PR #467 skeptic finding 1)",
  );
});

test("arrival memory: once per sitting, and a blocked storage plays the ceremony every time (#457 ratified 1)", () => {
  const backing = new Map<string, string>();
  const fake = {
    getItem: (k: string) => backing.get(k) ?? null,
    setItem: (k: string, v: string) => void backing.set(k, v),
  } as Storage;

  assert.equal(firstArrival(() => fake), true, "an absent value is a first arrival");
  markArrival(() => fake);
  assert.equal(firstArrival(() => fake), false, "a marked sitting does not replay");
  assert.equal(backing.has(ARRIVED_KEY), true, "the mark is stored under the exported key");

  const denied = () => {
    throw new Error("storage disabled");
  };
  assert.equal(firstArrival(denied), true, "an unreadable storage is a first arrival");
  assert.doesNotThrow(() => markArrival(denied), "an unwritable storage is quietly a no-op");
});

test("the veil is the mockup's: wordmark, flourish tagline, self-drawing rose, status line (#457)", () => {
  const html = veilMarkup();
  assert.match(html, /class="veil-wordmark"[^>]*>Vellum</, "the wordmark reads Vellum");
  assert.match(
    html,
    /class="veil-tagline"[^>]*>an atelier of imaginary cartography</,
    "the tagline is the site's own flourish",
  );
  assert.match(html, /class="veil-rose"/, "the compass rose is aboard");
  assert.equal(html.match(/class="rose-ring/g)?.length, 2, "two rings draw themselves");
  assert.match(html, /class="rose-ring inner"/, "the inner ring is marked for its own dash length");
  assert.match(html, /class="rose-rays"/, "the rays fade in behind the rings");
  assert.match(html, /class="rose-needle"/, "the needle settles");
  assert.match(html, /class="rose-pin"/, "the pin caps the needle");
  assert.match(html, /role="status"/, "the sounding line is a live status region");
  assert.ok(html.includes(soundingLabel(0)), "the line opens at 0 fathom");
});

test("the veil is JS-injected: the page itself ships none of it (#457, the no-JS trap)", () => {
  const astro = read("src/pages/index.astro");
  assert.ok(!/veil/i.test(astro), "index.astro carries no veil markup; without JS there is nothing to trap behind");
});

test("app.ts sails the ceremony: anchorage on a first arrival, straight to landfall otherwise (#457)", () => {
  const app = read("src/site/home/app.ts");
  assert.match(app, /firstArrival/, "the once-per-sitting gate is consulted");
  assert.match(app, /wideView/, "a first arrival boots at the wide anchorage");
  assert.match(app, /landfallView/, "the flight has the landfall view to land on");
  assert.match(app, /playCeremony/, "the veil and counter are the ceremony module's");
  assert.match(app, /sessionStorage/, "the sitting is remembered in sessionStorage, not localStorage");
  assert.ok(!/localStorage/.test(app), "ratified: closing the browser resets the ceremony");
});

test("the veil's dress is in the home sheet: fixed over everything, lifting, reduced-motion still (#457)", () => {
  const css = read("public/index.css");
  const rule = (selector: RegExp): string => {
    const m = css.match(new RegExp(`(^|\\n)\\s*${selector.source}[^{]*\\{([^}]*)\\}`));
    return m ? m[2] : "";
  };
  const veil = rule(/\.veil /);
  assert.match(veil, /position:\s*fixed/, ".veil pins to the viewport");
  assert.match(veil, /inset:\s*0/, ".veil covers everything, running head included (ratified 3)");
  assert.match(veil, /z-index/, ".veil rides above the shell");
  assert.match(css, /@keyframes rose-draw/, "the rings draw by dashoffset");
  assert.match(css, /@keyframes needle-settle/, "the needle settles by keyframe");
  assert.match(css, /@keyframes veil-lift/, "the lift is animated");
  assert.match(css, /\.veil\.lifting/, "the lifting class plays the lift");
  const reduced = css.match(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/g)?.join("\n") ?? "";
  assert.match(reduced, /rose-ring[^{]*\{[^}]*animation:\s*none/, "reduced motion stills the rose");
  assert.match(reduced, /stroke-dashoffset:\s*0/, "reduced motion shows the rings drawn, not absent");
});
