import test from "node:test";
import assert from "node:assert/strict";
import { createRng } from "../../src/core/rng.ts";
import { ribbonSvgFor } from "../../src/itinerary/finished.ts";
import { layoutRibbon, stripPos, type StripLayout } from "../../src/itinerary/dress/layout.ts";
import { eventCaption } from "../../src/itinerary/prose.ts";
import { r1 } from "../../src/prospect/dress/context.ts";
import { plateCaptions, sweepJourneys, type PlateCaption } from "../../test-support/ribbon-captions.ts";

// Where the order of the slides, the across seat's height and the road's and numerals' reach decide a seat, the sweep holds named captions whose seat changes with each (found by mutating, Issue #511 pull request 2): they are pinned here at the seat the rule gives them today, so retuning the rule moves these and says so.
const journeys = sweepJourneys();

function plateOf(
  seed: number,
  from: string,
  to: string,
  dress: "antique" | "ink",
): { strips: ReadonlyArray<StripLayout>; caps: PlateCaption[] } {
  const j = journeys.find((x) => x.seed === seed && x.input.fromName === from && x.input.toName === to);
  assert.ok(j, `premise: the sweep holds seed ${seed} ${from} to ${to}`);
  const strips = layoutRibbon(j.input).strips;
  return { strips, caps: plateCaptions(ribbonSvgFor(j.input, dress), strips) };
}

function seatOf(caps: PlateCaption[], text: string): string {
  const line = caps.find((c) => c.lines.some((l) => l.text === text))?.lines[0];
  assert.ok(line, `premise: a caption holds "${text}"`);
  return `${line.anchor} ${line.x},${line.y}`;
}

test("a caption takes the first clear slide in the order up, then down: a side road's name and its town's, pinned", () => {
  const { caps } = plateOf(99, "Mialiscove", "Talea", "antique");
  assert.equal(seatOf(caps, "to Celthahaven"), "start 816,168.7");
  assert.equal(seatOf(caps, "TALEA"), "end 796,155.3");
});

test("an across seat takes the nearest clear slide: the slide of 4 comes before the slide of 8", () => {
  const reara = journeys.find((x) => x.seed === 99 && x.input.toName === "Reara");
  assert.ok(reara, "premise: the sweep holds Mialiscove to Reara");
  const strips = layoutRibbon(reara.input).strips;
  const e = reara.input.events.find((x) => x.kind === "branch" && x.toName === "Ceasairmere");
  assert.ok(e, "premise: the road to Reara passes the side road to Ceasairmere");
  const p = stripPos(strips.find((s) => e.dist >= s.d0 && e.dist < s.d1) as StripLayout, e.dist);
  const line = plateOf(99, "Mialiscove", "Reara", "antique").caps.find((c) => c.lines[0]?.text === "to Ceasairmere")
    ?.lines[0];
  assert.ok(line && line.anchor === "middle", "premise: it is set across the road");
  assert.equal(r1(line.box.y - (p.sy + 6)), 4, "the slide of 4 comes before the slide of 8");
});

const TAGS = new Set(["the capital", "a fair town", "a village", "a hamlet", "a place"]);

test("every caption set across the road stands on the slide grid below its town's top, a name 2.6 and a description 6 under its point", () => {
  let across = 0;
  const kinds = new Set<string>();
  for (const { input } of journeys) {
    const strips = layoutRibbon(input).strips;
    const rng = createRng(input.seed).fork(`ribbon-${input.fromIdx}-${input.toIdx}`);
    for (const dress of ["antique", "ink"] as const) {
      for (const cap of plateCaptions(ribbonSvgFor(input, dress), strips).filter(
        (c) => c.lines[0]?.anchor === "middle",
      )) {
        const words = cap.lines
          .filter((l) => !TAGS.has(l.text))
          .map((l) => l.text)
          .join(" ")
          .toLowerCase();
        const e = input.events.find((x) => {
          const s = strips.find((t) => x.dist >= t.d0 && x.dist < t.d1);
          return s === cap.strip && eventCaption(x, rng).toLowerCase() === words;
        });
        assert.ok(e, `premise: the ${dress} caption "${words}" belongs to an event of the road`);
        const p = stripPos(cap.strip, e.dist);
        const slide = (cap.lines[0]?.box.y ?? 0) - (p.sy + (e.kind === "waypoint" ? 2.6 : 6));
        assert.ok(
          Math.abs(slide - 4 * Math.round(slide / 4)) <= 0.15 && Math.abs(slide) <= 24.15,
          `"${words}" is ${slide.toFixed(2)} from its across top`,
        );
        across++;
        kinds.add(e.kind);
      }
    }
  }
  assert.ok(
    across >= 100 && kinds.has("waypoint") && kinds.has("summit"),
    `premise: the sweep sets ${across} across, of kinds ${[...kinds].join(", ")}`,
  );
});

test("a caption keeps the road's clearance at every half unit along it, pinned at two captions that sit just past it", () => {
  assert.equal(seatOf(plateOf(99, "Mialiscove", "Thiamarea", "ink").caps, "SELEA"), "start 783.4,437");
  assert.equal(seatOf(plateOf(99, "Mialiscove", "Seavelia", "ink").caps, "CELTHAHAVEN"), "end 796.2,201.4");
});

test("a caption keeps clear of the ink plate's fifth-league numerals at their seven-unit size, pinned at two captions beside them", () => {
  assert.equal(seatOf(plateOf(99, "Mialiscove", "Vesveleport", "ink").caps, "THIAMAREA"), "start 621.1,407.7");
  assert.equal(seatOf(plateOf(99, "Mialiscove", "Minmari", "ink").caps, "NIL"), "start 827.1,364.7");
});
