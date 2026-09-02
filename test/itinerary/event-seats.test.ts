import test from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import { buildRibbonInput } from "../../src/itinerary/input.ts";
import { eventSeat, layoutRibbon, stripFor } from "../../src/itinerary/dress/layout.ts";
import { ribbonResultFor } from "../../src/site/explorer/ribbon-job.ts";

const world = generateWorld(defaultRecipe(42));
const road = ribbonResultFor(world, { from: null, to: null, dress: "antique" });
const input = buildRibbonInput(world, road.fromIdx, road.toIdx)!;
const layout = layoutRibbon(input);
const last = layout.strips[layout.strips.length - 1]!;

test("stripFor picks the strip whose span holds the distance, the low end closed; the road's very end belongs to no strip, as on the plate", () => {
  assert.ok(layout.strips.length >= 3, "premise: the default road unrolls over several strips");
  const second = layout.strips[1]!;
  assert.equal(stripFor(layout, second.d0)?.index, 1, "a distance on a seam belongs to the strip it opens");
  assert.equal(stripFor(layout, second.d0 - 1e-9)?.index, 0);
  assert.equal(stripFor(layout, (second.d0 + second.d1) / 2)?.index, 1);
  assert.equal(stripFor(layout, 0)?.index, 0);
  assert.equal(stripFor(layout, last.d1), null, "the last strip's end is open: the plate draws no event there (skeptic on PR #500: a crossing at the road's very end was listed and never drawn)");
  assert.equal(eventSeat(layout, last.d1), null);
});

test("every drawn event of the default road seats inside its own strip's box, the departure low on the first strip and the arrival high on the last", () => {
  const events = input.events;
  assert.ok(events.length >= 4, "premise: the road has events to seat");
  for (const e of events) {
    const strip = stripFor(layout, e.dist);
    const p = eventSeat(layout, e.dist);
    assert.ok(strip !== null && p !== null, `${e.kind} at ${e.dist.toFixed(1)} is drawn on the default road`);
    assert.ok(p.sx >= strip.x0 - 1e-6 && p.sx <= strip.x0 + strip.w + 1e-6, `${e.kind} at ${e.dist.toFixed(1)} sits inside strip ${strip.index}'s width`);
    assert.ok(p.sy >= strip.y0 - 1e-6 && p.sy <= strip.y0 + strip.h + 1e-6, `${e.kind} at ${e.dist.toFixed(1)} sits inside strip ${strip.index}'s height`);
  }
  const first = events[0]!;
  const final = events[events.length - 1]!;
  assert.equal(first.dist, 0, "premise: the road begins at the departure");
  assert.ok(final.kind === "waypoint" && final.endpoint && final.index === input.toIdx, "premise: the last event is the arrival");
  assert.ok(input.totalCells - final.dist < 2, "premise: the arrival is seated within a cell or so of the road's end (the waypoint takes the first chain cell beside the town)");
  const dep = eventSeat(layout, first.dist)!;
  const arr = eventSeat(layout, final.dist)!;
  assert.ok(dep.sy > layout.strips[0]!.y0 + layout.strips[0]!.h / 2, "the departure is low on the first strip (the road reads up the scroll)");
  assert.ok(arr.sx > dep.sx, "the arrival stands on a later strip, to the right");
  assert.ok(arr.sy < last.y0 + last.h / 2, "and high on it");
});
