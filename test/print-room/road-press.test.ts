import { before, test } from "node:test";
import assert from "node:assert/strict";
import {
  ROAD_CHOICE,
  ROAD_NONE,
  ROAD_PRESETS,
  caveatTail,
  pressesFor,
  pressingLabel,
  pressVerb,
  roadAtWidth,
  roadChoice,
  roadFilename,
  roadLine,
  roadOnOffer,
  roadPngFilename,
  roadTitle,
} from "../../src/site/print-room/road-press.ts";
import { CHART_PRESET, POSTER_PRESETS } from "../../src/site/print-room/poster-presets.ts";
import { plateLine } from "../../src/site/print-room/contents-markup.ts";
import { readSvgSize } from "../../src/site/shared/rasterize.ts";
import { RIBBON_W } from "../../src/itinerary/finished.ts";
import { defaultJourney, roadMask, roadReachable } from "../../src/itinerary/route.ts";
import { ribbonResultFor } from "../../src/site/explorer/ribbon-job.ts";
import { ribbonPlates } from "../../src/atlas/compose.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import type { World } from "../../src/world/types.ts";

const bare = { from: null, to: null, dress: "antique" } as const;

let w42: World;
let w1: World;
before(() => {
  w42 = generateWorld(defaultRecipe(42));
  w1 = generateWorld(defaultRecipe(1, { mapType: "archipelago", islands: 100 }));
});

test("the road's four presses are Ribbon 1060, Desk 2400, Wall 3300 and Grand 4200, the smallest the Ribbon room's own plate (Issue #433 rulings 2 and 4), outside the poster clamp", () => {
  assert.deepEqual(
    ROAD_PRESETS.map((p) => [p.key, p.label, p.width]),
    [
      ["ribbon", "Ribbon", 1060],
      ["desk", "Desk", 2400],
      ["wall", "Wall", 3300],
      ["grand", "Grand", 4200],
    ],
  );
  assert.equal(ROAD_PRESETS[0]!.width, RIBBON_W);
  assert.equal(pressesFor("road"), ROAD_PRESETS);
  assert.deepEqual(pressesFor("poster"), [CHART_PRESET, ...POSTER_PRESETS]);
  assert.equal(pressesFor("road").length, 4);
  assert.equal(pressesFor("poster").length, 4);
  assert.ok(!POSTER_PRESETS.some((p) => p.key === "ribbon"));
  assert.deepEqual(pressesFor("road").map(pressVerb), ["1060 px", "2400 px", "3300 px", "4200 px"]);
});

test("roadAtWidth leaves the plate byte for byte at its own 1060 and rewrites only the root's width and height above it", () => {
  const svg = ribbonResultFor(w42, bare).svg;
  assert.equal(roadAtWidth(svg, 1060), svg);
  const out = roadAtWidth(svg, 4200);
  const rootEnd = out.indexOf(">") + 1;
  assert.ok(out.slice(0, rootEnd).includes(' width="4200" height="2932.08" viewBox="0 0 1060 740"'));
  assert.equal(out.slice(out.indexOf(">")), svg.slice(svg.indexOf(">")));
  assert.deepEqual(readSvgSize(roadAtWidth(svg, 2400)), { width: 2400, height: 1675.47 });
  const fixture =
    '<svg xmlns="http://www.w3.org/2000/svg" width="1060" height="740" viewBox="0 0 1060 740"><rect width="10" height="20" stroke-width="2"/></svg>';
  assert.equal(
    roadAtWidth(fixture, 2120),
    '<svg xmlns="http://www.w3.org/2000/svg" width="2120" height="1480" viewBox="0 0 1060 740"><rect width="10" height="20" stroke-width="2"/></svg>',
  );
  assert.throws(() => roadAtWidth("<svg/>", 2400), /no viewBox/);
});

test("roadOnOffer offers the road only from a capital the roads leave, the atlas's own answer (engine-invariants: a ribbon result substitutes a refused departure)", () => {
  assert.equal(roadOnOffer(ribbonResultFor(w42, bare)), true);
  assert.notEqual(defaultJourney(w42), null);

  const noCap: World = {
    ...w42,
    settlements: w42.settlements.map((s) => (s.kind === "capital" ? { ...s, kind: "town" as const } : s)),
  };
  assert.equal(
    noCap.settlements.findIndex((s) => s.kind === "capital"),
    -1,
    "the witness: no settlement is a capital",
  );
  const res = ribbonResultFor(noCap, bare);
  assert.equal(res.fromIdx, 0, "the job set out from settlement 0");
  assert.notEqual(res.options[0]!.kind, "capital");
  assert.equal(roadOnOffer(res), false);
  assert.equal(defaultJourney(noCap), null);

  const capital = w1.settlements.findIndex((s) => s.kind === "capital");
  assert.equal(
    roadReachable(w1, roadMask(w1), capital).length,
    0,
    "the witness: the address's own world has a capital no road leaves",
  );
  assert.throws(() => ribbonResultFor(w1, bare), /no road leaves this place/);
  assert.equal(defaultJourney(w1), null);

  // The seed-42 capital is settlement 0, so only a departure away from index 0 tells the departure's own kind from the first option's.
  const kinds = (...k: string[]) => k.map((kind) => ({ kind }));
  assert.equal(roadOnOffer({ fromIdx: 1, options: kinds("town", "capital") }), true);
  assert.equal(roadOnOffer({ fromIdx: 0, options: kinds("capital", "town") }), true);
  assert.equal(roadOnOffer({ fromIdx: 1, options: kinds("capital", "town") }), false);
});

test("the head's road option opens once the road is drawn, stays closed while the answer is out, and says why when the capital has none", () => {
  assert.deepEqual(roadChoice("pending"), { text: ROAD_CHOICE, disabled: true });
  assert.deepEqual(roadChoice("drawn"), { text: "The road from the capital", disabled: false });
  assert.deepEqual(roadChoice("none"), { text: ROAD_NONE, disabled: true });
  assert.equal(ROAD_NONE, "The road from the capital: none for this world");
});

test("the road's names: its title the atlas's, its folio line the bound page's without the plate number, its files by seed, dress and width", () => {
  const res = ribbonResultFor(w42, bare);
  assert.equal(roadTitle(res.fromName, res.toName), ribbonPlates(w42, "antique")[0]!.title);
  assert.equal(
    plateLine("ribbon", roadTitle("Laukuwelua", "Homaitani")),
    "plate ix of the bound atlas · " + roadLine("Laukuwelua", "Homaitani"),
  );
  assert.equal(roadLine("Laukuwelua", "Homaitani"), "the road from Laukuwelua to Homaitani");
  assert.equal(roadFilename(42, "antique", 1060), "vellum-road-42-antique-1060.svg");
  assert.equal(roadPngFilename(42, "ink", 5863), "vellum-road-42-ink-5863.png");
});

test("the head and the caveat name what is pressed", () => {
  assert.equal(pressingLabel("poster"), "A poster plate");
  assert.equal(pressingLabel("road"), "The road from the capital");
  assert.equal(caveatTail("poster"), "The chart is pulled only as the engraving.");
  assert.equal(caveatTail("road"), "The road is pressed either way.");
});
