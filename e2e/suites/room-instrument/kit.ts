import { makeRoom, makeBar } from "../../support/room.ts";
import type { scrubFacts } from "../../support/room.ts";
import type { SuiteContext } from "../../types.ts";

export type InstrumentKit = ReturnType<typeof instrumentKit>;
export type Facts = Awaited<ReturnType<typeof scrubFacts>>;

export function instrumentKit(ctx: SuiteContext) {
  const room = makeRoom(ctx);
  const { setYear, yearNow, groupVis, roadsDisp, visibleGroups, clickPlay, playLabel, startSweepSamples, stopSweepSamples } = makeBar(ctx);
  return { ...ctx, room, setYear, yearNow, groupVis, roadsDisp, visibleGroups, clickPlay, playLabel, startSweepSamples, stopSweepSamples };
}
