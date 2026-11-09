// Room instrument e2e (RS*, Issue #320 Sub 3): the S-suite's live-animation coverage re-hosted against .rf-* selectors and the room's own hooks; the Explorer-hosted S* originals stay green beside these until Sub 4 retires them by name.
import { scrubFacts, scopedHealth } from "../support/room.ts";
import type { SuiteContext } from "../types.ts";
import { instrumentKit } from "./room-instrument/kit.ts";
import { rs0Boots, rs3Parks, rs4AllShown, rs5Scrub, rs7Ruin } from "./room-instrument/scrub.ts";
import {
  rs8Sweeps,
  rs10Drag,
  rs11Forward,
  rs12Pause,
  rs14Glyphs,
  rs16Strip,
  rs17Story,
} from "./room-instrument/sweep.ts";
import { rs23OtherWorld, rs27NoReplay, rs28Cancel } from "./room-instrument/arrival.ts";
import { rs29Pace, rs30Rate } from "./room-instrument/pace.ts";
import { makeStep } from "../support/step.ts";

export async function run(ctx: SuiteContext): Promise<void> {
  const { evaluate } = ctx;
  const k = instrumentKit(ctx);
  const { setYear } = k;
  const gate = scopedHealth(ctx);
  const step = makeStep(ctx);

  await rs0Boots(k);
  const sm = await scrubFacts(evaluate, 42);
  await rs3Parks(k, sm);
  await rs4AllShown(k, sm);
  await rs5Scrub(k, sm);
  await rs7Ruin(k, sm);
  await rs8Sweeps(k, sm);
  await step("RS10", () => rs10Drag(k, sm));
  await rs11Forward(k, sm);
  await step("RS12", () => rs12Pause(k, sm));
  await setYear(sm.present);
  await rs14Glyphs(k);
  await rs16Strip(k);
  await rs17Story(k, sm);
  await rs23OtherWorld(k);
  await k.room.goto("#seed=42&style=antique&legend=1");
  await rs27NoReplay(k);
  await rs28Cancel(k);
  // Issue #493. The facts of the world ON SCREEN: RS23 and the counter reads above drew seed 9, and seed 42's years would clamp the bar to the present (a Play from the present reopens the whole story in the survey chamber, where the year is null by contract).
  const smNow = await scrubFacts(evaluate, await evaluate<number>(`window.__vellumReadingRoomState().seed`));
  await step("RS29", () => rs29Pace(k, smNow));
  await step("RS30", () => rs30Rate(k, smNow));
  gate.check("RS24 the room instrument run is clean (no console errors, no new 4xx)");
}
