import { test } from "node:test";
import assert from "node:assert/strict";
import { SHEET, fitScale, centerFraction } from "../../src/site/home/camera.ts";
import { homeStage } from "../../src/site/home/stage-data.ts";
import { homeStations, stationSpots, unclaimedDots } from "../../src/site/home/stations.ts";
import {
  STATION_FLIGHT_SECONDS,
  STATION_SCALE_FACTOR,
  revealLeft,
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

// Landfall Sub 3 (Issue #458): the stations, the cards, the legend, and the idle drift; the spec is the archived mockup (design/atelier-map, PR #466) and the ratified comments on Issue #458.

const normalize = (s: string) => s.replace(/\s+/g, " ").trim();

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

test("the slips are the sole home of the encounter copy, pinned verbatim (#459, was the Go Deeper diff)", () => {
  const copy: Record<string, string> = {
    explorer:
      "Draw your own: type a seed, pick a style and climate, and the world is drafted live in your browser. Nothing is uploaded.",
    "reading-room":
      "Sit with a world and watch it happen: the founding voyage sails its survey, then the years turn and settlements rise, prosper, and fall to ruin.",
    atlas:
      "A bound volume: the world chart in three styles, two regional close-up surveys of the same terrain, and a gazetteer of every settlement with travelers' notes.",
    gallery:
      "Twelve worlds from twelve seeds: archipelagos, islands, and continents, each with its own name, realms, and coastline.",
  };
  assert.deepEqual(
    Object.keys(copy).sort(),
    stations
      .map((s) => s.id)
      .slice()
      .sort(),
    "every station's copy is pinned",
  );
  for (const s of stations) {
    assert.equal(normalize(s.prose), copy[s.id], `${s.id}: the slip speaks the ratified copy, word for word`);
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
  const wide = stationFlightView(shallow, fit, anchor, view, SHEET);
  assert.ok(Math.abs(wide.s - fit * STATION_SCALE_FACTOR) < 1e-12, "a shallow camera dives to 2.6 of fit");
  assert.ok(
    Math.abs(anchor.nx * SHEET.w * wide.s + wide.x - view.w * 0.4) < 1e-9,
    "the anchor sits at 0.4 of the stage width, clear of the card at the right",
  );
  assert.ok(
    Math.abs(anchor.ny * SHEET.h * wide.s + wide.y - view.h / 2) < 1e-9,
    "the anchor rides the vertical center",
  );

  const deep = { x: 0, y: 0, s: fit * 4 };
  const held = stationFlightView(deep, fit, anchor, view, SHEET);
  assert.ok(Math.abs(held.s - fit * 4) < 1e-12, "a deeper camera keeps its depth, as the mockup's Math.max does");

  const c = centerFraction(wide, view, SHEET);
  assert.ok(c.fx > anchor.nx, "the framing pushes the anchor left of center, so the card never covers it");
});

test("UR1 an opened slip on a window narrower than the page takes the least sideways scroll that shows it whole, a margin clear (Alex, 2026-10-06, Issue #762; the slip measured at page 608 to 960)", () => {
  const near = (got: number, want: number, why: string) => {
    assert.ok(Math.abs(got - want) < 1e-9, `${why}: got ${got}, want ${want}`);
  };
  near(revealLeft(0, 640, 608, 960, 25.6), 345.6, "640: the slip's right edge comes in by the margin");
  near(revealLeft(0, 800, 608, 960, 25.6), 185.6, "800");
  near(revealLeft(0, 900, 608, 960, 25.6), 85.6, "900");
  near(revealLeft(0, 1024, 608, 960, 25.6), 0, "1024: already whole, no scroll");
  near(revealLeft(0, 560, 608, 960, 25.6), 425.6, "560");
  near(
    revealLeft(0, 380, 608, 960, 25.6),
    582.4,
    "380, narrower than the slip and its margins: the slip's left edge stands at the margin",
  );
  near(revealLeft(346, 640, 608, 960, 25.6), 346, "a slip already in the window leaves the scroll where it is");
  near(revealLeft(700, 640, 608, 960, 25.6), 582.4, "a slip left of the window brings its left edge in by the margin");
  near(revealLeft(0, 640, 10, 362, 25.6), 0, "never a scroll below 0");
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
  assert.equal(
    held.s,
    justUnder.s,
    "a breath that would cross 1.55 of fit pans without swelling, so the dots never pulse in and out",
  );
  assert.equal(held.x, 14, "the pan half of the breath survives");
  const clear = { x: 0, y: 0, s: fit * 1.55 * 0.9 };
  assert.ok(
    Math.abs(driftTarget(clear, fit).s - clear.s * 1.015) < 1e-12,
    "a camera clear of the threshold still swells",
  );
  const above = { x: 0, y: 0, s: fit * 1.6 };
  assert.ok(
    Math.abs(driftTarget(above, fit).s - above.s * 1.015) < 1e-12,
    "a camera already close-in swells too: 1.015 up cannot cross back down",
  );
});
