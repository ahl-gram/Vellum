// The Writing Room (Issue #393): a written link founds its world, a refusal leaves the last world standing, the vegetation plate opens on climate and is pressed on and off, and a sentence is lettered only when a word was recognised. MEASURED at 1024x768 on the built site; the expected world is computed in Node by foundWorld, integers and strings only.
import { scopedHealth } from "../support/room.ts";
import { makeStep } from "../support/step.ts";
import type { SuiteContext } from "../types.ts";
import { wr1Link, wr2Shape, wr3Refusal, wr4Plate, wr5Lettering } from "./writing-room/checks.ts";
import { writingKit } from "./writing-room/kit.ts";

export async function run(ctx: SuiteContext): Promise<void> {
  const step = makeStep(ctx);
  const gate = scopedHealth(ctx);
  const k = writingKit(ctx);
  await ctx.send("Emulation.setDeviceMetricsOverride", {
    width: 1024,
    height: 768,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await step("WR1", () => wr1Link(k));
  await step("WR2", () => wr2Shape(k));
  await step("WR3", () => wr3Refusal(k));
  await step("WR4", () => wr4Plate(k));
  await step("WR5", () => wr5Lettering(k));
  await ctx.send("Emulation.clearDeviceMetricsOverride");
  gate.check("WR0 the Writing Room logged no console error and fetched nothing that answered 4xx");
}
