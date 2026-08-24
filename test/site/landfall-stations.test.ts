import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { SHEET, fitScale, centerFraction } from "../../src/site/home/camera.ts";
import { homeStage } from "../../src/site/home/stage-data.ts";
import { homeStations, stationSpots, unclaimedDots } from "../../src/site/home/stations.ts";
import {
  STATION_FLIGHT_SECONDS,
  STATION_SCALE_FACTOR,
  stationFlightView,
} from "../../src/site/home/station-flight.ts";
import {
  IDLE_DELAY_MS,
  DRIFT_SECONDS,
  DRIFT_DX,
  DRIFT_DY,
  DRIFT_SCALE,
  driftTarget,
} from "../../src/site/home/drift.ts";

// Landfall Sub 3 (#458): the stations, the cards, the legend, and the idle drift; the spec is the archived mockup (design/atelier-map, PR #466) and the ratified comments on #458.

const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");
const normalize = (s: string) => s.replace(/\s+/g, " ").trim();
// A commented-out rule still matches a raw-text regex (guard-prover 2026-08-24: the .lf-card[hidden] escape), so the css sweeps read the sheet stripped.
const liveCss = (p: string): string => read(p).replace(/\/\*[\s\S]*?\*\//g, "");

const stage = homeStage();
const stations = homeStations();
const byId = new Map(stations.map((s) => [s.id, s]));

test("the four modes of encounter stand as stations, each at its ratified anchorage (#458)", () => {
  assert.deepEqual(
    stations.map((s) => s.id),
    ["explorer", "reading-room", "atlas", "gallery"],
    "the mockup's four stations, in its order",
  );

  const explorer = byId.get("explorer");
  assert.ok(explorer);
  assert.equal(explorer.nx, stage.capital.nx, "The Explorer moors at the capital");
  assert.equal(explorer.ny, stage.capital.ny);
  assert.equal(explorer.href, "explorer/");
  assert.equal(explorer.verb, "Make one");

  const lamahai = stage.dots.find((d) => d.name === "Lamahai");
  assert.ok(lamahai, "seed 42 must place Lamahai for the Reading Room anchorage");
  const readingRoom = byId.get("reading-room");
  assert.ok(readingRoom);
  assert.equal(readingRoom.nx, lamahai.nx, "The Reading Room moors off Lamahai");
  assert.equal(readingRoom.ny, lamahai.ny);
  assert.equal(readingRoom.href, "reading-room/");
  assert.equal(readingRoom.verb, "Watch one");

  const weki = stage.dots.find((d) => d.name === "Weki");
  assert.ok(weki, "seed 42 must place Weki for the Atlas anchorage");
  const atlas = byId.get("atlas");
  assert.ok(atlas);
  assert.equal(atlas.nx, weki.nx, "the Atlas moors at Weki");
  assert.equal(atlas.ny, weki.ny);
  assert.equal(atlas.href, "atlas/", "Read one points at the ATLAS, not the Reading Room (#458)");
  assert.equal(atlas.verb, "Read one");
  assert.ok(atlas.arms, "the Atlas card carries the arms");

  const gallery = byId.get("gallery");
  assert.ok(gallery);
  assert.equal(gallery.nx, 0.79, "the Gallery rides in open water SE, the mockup's mooring");
  assert.equal(gallery.ny, 0.73);
  assert.equal(gallery.href, "gallery/");
  assert.equal(gallery.verb, "Browse many");
  assert.ok(gallery.sea, "the Gallery is the one at-sea station, round not diamond");
  assert.ok(
    stations.every((s) => s.sea === (s.id === "gallery")),
    "no land station wears the at-sea glyph",
  );
  assert.ok(
    stations.every((s) => s.arms === (s.id === "atlas")),
    "only the Atlas slip carries arms",
  );
});

test("the station slips speak the mockup's words (#458)", () => {
  assert.equal(byId.get("explorer")?.name, "The Explorer");
  assert.equal(byId.get("reading-room")?.name, "The Reading Room");
  assert.equal(byId.get("atlas")?.name, "The Atlas of Rahai");
  assert.equal(byId.get("gallery")?.name, "A Gallery of Worlds");
  assert.equal(byId.get("atlas")?.legendName, "The Atlas", "the legend shortens only the Atlas");
  assert.ok(
    stations.every((s) => s.id === "atlas" || s.legendName === s.name),
    "every other legend entry keeps the full name",
  );
  assert.equal(byId.get("explorer")?.where, "at Laukuwelua, the capital");
  assert.equal(byId.get("reading-room")?.where, "off Lamahai, on the southern shore");
  assert.equal(byId.get("atlas")?.where, "at Weki, a seat of the west");
  assert.equal(byId.get("gallery")?.where, "in open water, beyond the survey");
});

test("the card copy is the Go Deeper copy, verbatim (#458)", () => {
  assert.ok(stations.length >= 3, "an empty roster would pass this sweep vacuously");
  const astro = read("src/pages/index.astro");
  const deeper = astro.slice(astro.indexOf("<h2>Go Deeper</h2>"));
  for (const s of stations) {
    const card = deeper.match(new RegExp(`<a class="card" href="${s.href}">([\\s\\S]*?)</a>`));
    assert.ok(card, `Go Deeper still holds the ${s.id} card this sub copies from`);
    const prose = card[1].match(/<p>([\s\S]*?)<\/p>/);
    assert.ok(prose, `the ${s.id} card carries prose`);
    assert.equal(normalize(s.prose), normalize(prose[1]), `${s.id}: the slip's prose is the card's, word for word`);
    const title = card[1].match(/<h3>([\s\S]*?)<\/h3>/);
    assert.ok(title, `the ${s.id} card carries a title`);
    assert.equal(s.name, normalize(title[1]).replace(/\s*→$/, ""), `${s.id}: the slip's title is the card's`);
    const verb = card[1].match(/<span class="card-verb">([\s\S]*?)<\/span>/);
    assert.ok(verb, `the ${s.id} card opens with its verb`);
    assert.equal(s.verb, normalize(verb[1]), `${s.id}: the slip's verb is the card's`);
  }
});

test("a station claims its dot: the overlay never doubles a mark the station replaces (#458)", () => {
  const spots = stationSpots(stations);
  assert.ok(spots.has(`${stage.capital.nx},${stage.capital.ny}`), "the capital's spot is claimed");
  assert.equal(spots.size, 4, "every station claims its spot, open water included");
  const left = unclaimedDots(stage.dots, stations);
  assert.equal(left.length, stage.dots.length - 3, "three real places host stations; the Gallery claims no dot");
  assert.ok(
    left.every((d) => !spots.has(`${d.nx},${d.ny}`)),
    "no surviving dot sits on a station spot",
  );
  const input = [...stage.dots];
  unclaimedDots(input, stations);
  assert.deepEqual(input, [...stage.dots], "unclaimedDots filters immutably");
});

test("the station flight frames the anchor beside the card, at the mockup's depth (#458)", () => {
  const view = { w: 1080, h: 620 };
  const fit = fitScale(view, SHEET);
  assert.equal(STATION_FLIGHT_SECONDS, 1.5, "the flight takes the mockup's 1.5 seconds");
  assert.equal(STATION_SCALE_FACTOR, 2.6, "the dive floor is the mockup's 2.6 of fit");

  const anchor = { nx: 0.3103, ny: 0.5906 };
  const shallow = { x: 0, y: 0, s: fit };
  const wide = stationFlightView(shallow, fit, anchor, view, SHEET, 1280);
  assert.ok(Math.abs(wide.s - fit * STATION_SCALE_FACTOR) < 1e-12, "a shallow camera dives to 2.6 of fit");
  assert.ok(
    Math.abs(anchor.nx * SHEET.w * wide.s + wide.x - view.w * 0.4) < 1e-9,
    "wide: the anchor sits at 0.4 of the stage width, clear of the card at the right",
  );
  assert.ok(
    Math.abs(anchor.ny * SHEET.h * wide.s + wide.y - view.h / 2) < 1e-9,
    "wide: the anchor rides the vertical center",
  );

  const deep = { x: 0, y: 0, s: fit * 4 };
  const held = stationFlightView(deep, fit, anchor, view, SHEET, 1280);
  assert.ok(Math.abs(held.s - fit * 4) < 1e-12, "a deeper camera keeps its depth, as the mockup's Math.max does");

  const narrow = stationFlightView(shallow, fit, anchor, view, SHEET, 900);
  assert.ok(
    Math.abs(anchor.nx * SHEET.w * narrow.s + narrow.x - view.w / 2) < 1e-9,
    "narrow: the anchor centers, the card lies below",
  );
  assert.ok(
    Math.abs(anchor.ny * SHEET.h * narrow.s + narrow.y - view.h * 0.36) < 1e-9,
    "narrow: the anchor rises to 0.36 of the stage height, clear of the bottom card",
  );
  const justWide = stationFlightView(shallow, fit, anchor, view, SHEET, 901);
  assert.ok(
    Math.abs(anchor.nx * SHEET.w * justWide.s + justWide.x - view.w * 0.4) < 1e-9,
    "the cut is the mockup's v.w <= 900: 901 frames wide, and it reads the VIEWPORT, not the stage box",
  );
  const c = centerFraction(wide, view, SHEET);
  assert.ok(c.fx > anchor.nx, "the wide framing pushes the anchor left of center, so the card never covers it");
});

test("the idle drift breathes at the mockup's numbers and never mutates the camera (#458)", () => {
  assert.equal(IDLE_DELAY_MS, 9000, "the sheet waits nine still seconds");
  assert.equal(DRIFT_SECONDS, 14, "one breath takes fourteen seconds");
  assert.equal(DRIFT_DX, 14);
  assert.equal(DRIFT_DY, -10);
  assert.equal(DRIFT_SCALE, 1.015);
  const fit = 1;
  const cam = { x: 100, y: 200, s: 2 };
  const target = driftTarget(cam, fit);
  assert.equal(target.x, 114, "the drift leans east by the mockup's 14px");
  assert.equal(target.y, 190, "and north by its 10px");
  assert.ok(Math.abs(target.s - 2.03) < 1e-12, "and swells by 1.015");
  assert.deepEqual(cam, { x: 100, y: 200, s: 2 }, "driftTarget returns a new cam, never mutates");
});

test("the drift never breathes the marks layer open: a camera parked under the close-in threshold keeps its scale (#458 skeptic finding 11)", () => {
  const fit = 1;
  const justUnder = { x: 0, y: 0, s: fit * 1.55 * 0.995 };
  const held = driftTarget(justUnder, fit);
  assert.equal(held.s, justUnder.s, "a breath that would cross 1.55 of fit pans without swelling, so the dots never pulse in and out");
  assert.equal(held.x, 14, "the pan half of the breath survives");
  const clear = { x: 0, y: 0, s: fit * 1.55 * 0.9 };
  assert.ok(Math.abs(driftTarget(clear, fit).s - clear.s * 1.015) < 1e-12, "a camera clear of the threshold still swells");
  const above = { x: 0, y: 0, s: fit * 1.6 };
  assert.ok(Math.abs(driftTarget(above, fit).s - above.s * 1.015) < 1e-12, "a camera already close-in swells too: 1.015 up cannot cross back down");
});

test("home mounts the stations outside the dot layer's aria shroud, with the legend and four slips (#458)", () => {
  const astro = read("src/pages/index.astro");
  assert.match(astro, /homeStations/, "the frontmatter reads the station roster at build");
  assert.match(astro, /unclaimedDots/, "the dot layer yields the spots the stations claim");
  const marks = astro.match(/<div class="lf-marks"[^>]*>/);
  assert.ok(marks && marks[0].includes('aria-hidden="true"'), "the decorative dots stay shrouded");
  const stationsAt = astro.indexOf('class="lf-stations"');
  assert.ok(stationsAt > -1, "the station layer mounts");
  const stationsTag = astro.slice(astro.lastIndexOf("<", stationsAt), astro.indexOf(">", stationsAt));
  assert.ok(!stationsTag.includes("aria-hidden"), "the stations are real controls, never shrouded");
  const stationsBlock = astro.slice(stationsAt, astro.indexOf("</div>", stationsAt));
  assert.match(stationsBlock, /<button[\s\S]{0,200}?class=\{`lf-station/, "each station is a button");
  assert.match(astro, /data-station=\{s\.id\}/, "the client finds a station's anchor on the button itself");
  assert.match(astro, /data-nx=\{String\(s\.nx\)\}/, "the anchor rides at full precision, never the styled percent");
  assert.match(astro, /class="lf-legend"/, "the legend strip stands at the stage foot");
  assert.match(astro, /class="lf-legend-btn"/, "the legend duplicates every station as a button");
  assert.match(astro, /class="lf-card"/, "the card slips mount");
  assert.match(astro, /class="lf-card-close"/, "each slip carries its close");
  assert.match(astro, /class="lf-card-arms"/, "the arms row mounts for the atlas slip");
  assert.match(astro, /arms-42-0\.svg[\s\S]*arms-42-1\.svg[\s\S]*arms-42-2\.svg/, "the three arms ride the atlas slip");
});

test("the hidden attribute is re-asserted where the slips could lose it (#458, the Sub 1 inert-hidden lesson)", () => {
  const css = liveCss("public/index.css");
  assert.match(css, /\.lf-card\[hidden\]\s*\{\s*display:\s*none/, "a hidden slip stays hidden whatever .lf-card declares");
});

test("the station dress is the mockup's: pulse, diamond glyph, at-sea round, reduced-motion still (#458)", () => {
  const css = liveCss("public/index.css");
  assert.match(css, /\.lf-station\b/, "the station wears its own dress");
  assert.match(css, /@keyframes lf-station-pulse/, "the pulse ring breathes");
  assert.match(css, /\.lf-station\.at-sea/, "the at-sea station drops the diamond");
  const legend = css.match(/\.lf-legend \{([^}]*)\}/);
  assert.ok(legend && /pointer-events:\s*none/.test(legend[1]), "the legend chrome passes clicks through to the station beneath (plate-reader: the head swallowed the Reading Room icon's click)");
  const legendBtn = css.match(/\.lf-legend-btn \{([^}]*)\}/);
  assert.ok(legendBtn && /pointer-events:\s*auto/.test(legendBtn[1]), "the legend's buttons take their clicks back");
  const reduced = css.match(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/g)?.join("\n") ?? "";
  assert.match(reduced, /\.lf-pulse[^{]*\{[^}]*animation:\s*none/, "reduced motion stills the pulse");
  const motion = read("public/motion.css").replace(/\/\*[\s\S]*?\*\//g, "");
  for (const state of ["", ":hover", ":active"]) {
    assert.match(
      motion,
      new RegExp(`button:not\\(\\.lf-station\\):not\\(\\.place-hit\\)${state.replace(":", "\\:")}`),
      `motion.css's button${state} dress must exclude .lf-station like .place-hit: the house lift replaces the anchor transform (17px drift, counter-scale lost), and the house transition lags the counter-scale a beat behind every zoom`,
    );
  }
});

test("app.ts flies the stations and breathes the drift; the pure modules stay clean of the DOM (#458)", () => {
  const app = read("src/site/home/app.ts");
  assert.match(app, /stationFlightView/, "station flights use the pure framing");
  assert.match(app, /driftTarget/, "the drift tween aims at the pure target");
  assert.match(app, /IDLE_DELAY_MS/, "the idle timer keeps the ratified delay");
  assert.match(app, /bindStations/, "the cards module owns the card DOM");
  for (const mod of ["drift.ts", "station-flight.ts", "stations.ts"]) {
    const src = read(`src/site/home/${mod}`);
    assert.ok(!/document|window/.test(src), `src/site/home/${mod} stays pure`);
  }
});
