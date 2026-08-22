// The story's beats (#402): the journal moments that carry an engraved prospect, a
// founding or a ruin with a settlement to draw. Pure; the stage and the tests share it.
import { eventIsPast } from "../../render/chronicle-scrubber.ts";
import type { HistoricalEvent } from "../../society/history.ts";

export interface StoryBeat {
  readonly index: number;
  readonly year: number;
  readonly kind: "founding" | "ruin";
}

export function storyBeats(events: ReadonlyArray<HistoricalEvent>): StoryBeat[] {
  const beats: StoryBeat[] = [];
  for (const e of events) {
    if ((e.kind === "founding" || e.kind === "ruin") && e.settlement !== undefined) {
      beats.push({ index: e.settlement, year: e.year, kind: e.kind });
    }
  }
  return beats;
}

export function latestBeatAt(beats: ReadonlyArray<StoryBeat>, year: number): StoryBeat | null {
  let latest: StoryBeat | null = null;
  for (const b of beats) {
    if (eventIsPast(b.year, year) && (latest === null || b.year >= latest.year)) latest = b;
  }
  return latest;
}
