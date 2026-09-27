import { makeRoom, makeBar } from "../room-support.ts";
import type { scrubFacts } from "../room-support.ts";
import type { SuiteContext } from "../types.ts";

export type InstrumentKit = ReturnType<typeof instrumentKit>;
export type Facts = Awaited<ReturnType<typeof scrubFacts>>;

export function instrumentKit(ctx: SuiteContext) {
  const room = makeRoom(ctx);
  const { setYear, yearNow, groupVis, roadsDisp, visibleGroups, clickPlay, playLabel, startSweepSamples, stopSweepSamples } = makeBar(ctx);
  return { ...ctx, room, setYear, yearNow, groupVis, roadsDisp, visibleGroups, clickPlay, playLabel, startSweepSamples, stopSweepSamples };
}
