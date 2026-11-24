import test from "node:test";
import assert from "node:assert/strict";
import { svgDimensions } from "../../src/cli/raster.ts";
import { recipeOverrides } from "../../src/site/shared/founding.ts";
import { LADDERS } from "../../src/site/shared/primer/ladders.ts";
import { writtenHash } from "../../src/site/shared/written-address.ts";
import { chartFrame, picturedSteps } from "../../src/site/primer/pictures.ts";
import { foundWorld } from "../../src/world/founding/found.ts";
import { FOUNDING_VERSION } from "../../src/world/founding/lexicon.ts";
import { committedFounder, drawJob, jobOf } from "../../scripts/primer-pictures/draw.ts";
import { useCommittedGazetteer } from "../../test-support/founding-gazetteer.ts";

const DRESS = "style=ink&legend=0&arms=1&beasts=1";
const PLAIN = "style=antique&legend=1&arms=0&beasts=0";

test("PIC1 a picture's address gives the world and the dress the shared grammar reads from it", async () => {
  const job = await jobOf(
    "/explorer/#seed=42&type=archipelago&band=polar&land=300&coast=95&style=ink&theme=moisture&legend=0&arms=1&beasts=1",
    committedFounder(),
  );
  assert.deepEqual(job, {
    seed: 42,
    overrides: { mapType: "archipelago", band: "polar", landFraction: 0.3, coastWarp: 0.95 },
    render: { style: "ink", widthPx: 1500, legend: false, arms: true, beasts: true, theme: "moisture" },
  });
});

test("PIC2 a picture's address that carries a founding sentence draws the founded world", async () => {
  useCommittedGazetteer();
  const sentence = "a polar archipelago of twenty islands";
  const f = foundWorld(sentence, FOUNDING_VERSION);
  assert.equal(f.ok, true, "the sentence founds a world");
  const job = await jobOf(`/writing-room/${writtenHash(sentence, FOUNDING_VERSION)}&${PLAIN}`, committedFounder());
  assert.equal(job.seed, f.seed);
  assert.deepEqual(job.overrides, recipeOverrides(f));
});

test("PIC3 a picture's address that leaves its style, legend, arms or beasts to a default is refused by name", async () => {
  const founder = committedFounder();
  for (const key of ["style", "legend", "arms", "beasts"]) {
    const kept = DRESS.split("&").filter((kv) => !kv.startsWith(`${key}=`));
    await assert.rejects(
      jobOf(`/explorer/#seed=42&${kept.join("&")}`, founder),
      /leaves its style, legend, arms or beasts to a default/,
      key,
    );
  }
});

test("PIC4 every picture on the ladders makes a job", async () => {
  const pictured = picturedSteps(LADDERS);
  assert.ok(pictured.length > 0, "the ladders name no picture");
  const founder = committedFounder();
  for (const p of pictured) await assert.doesNotReject(jobOf(p.picture, founder), p.id);
});

test("PIC5 the chart's frame is the drawn chart's own root size", async () => {
  const job = await jobOf(`/explorer/#seed=42&${PLAIN}`, committedFounder());
  assert.deepEqual(svgDimensions(drawJob(job)), chartFrame());
});
