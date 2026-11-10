import { MAP_WORDS } from "../../../src/site/shared/map-words.ts";
import { defaultRecipe } from "../../../src/world/generate.ts";
import { seedForDate } from "../../../src/world/seed-of-the-day.ts";
import { onDay } from "../../support/fixed-day.ts";
import { bounce } from "../../support/nav.ts";
import { makeSettle } from "../../support/settle.ts";
import type { SuiteContext } from "../../types.ts";

// 2026-11-09: defaultRecipe(20261204) draws a city-state, polar (Issue #1162); the hunt's own day, 2026-10-07, draws an island, temperate.
const CITY_DAY = Date.UTC(2026, 11, 4, 12);

const dayLine = (day: number): { type: string; want: string } => {
  const seed = seedForDate(new Date(day));
  const { mapType, band } = defaultRecipe(seed);
  return { type: mapType, want: `Chart № ${seed} · ${MAP_WORDS[mapType]}, ${band}` };
};

export async function h13Folio(ctx: SuiteContext, huntDay: number, page: string): Promise<void> {
  const settle = makeSettle({ evaluate: ctx.evaluate, sleep: ctx.sleep, tolerant: true });
  const read = `document.getElementById("folio-coords").textContent`;
  const written = (d: string): boolean => d.startsWith("Chart №");
  const island = dayLine(huntDay);
  const city = dayLine(CITY_DAY);
  const onHunt = await settle<string>(read, written, "the hunt day's chart line to be written", 200);
  let onCity = "";
  await onDay(ctx, CITY_DAY, async () => {
    await bounce(ctx.send, page);
    onCity = await settle<string>(read, written, "the city-state day's chart line to be written", 200);
  });
  ctx.check(
    "H13 Today's chart line is the shared map-type words for the day, on an island day and on a city-state day (the words' own spelling is test/site/map-words.test.ts's)",
    island.type === "island" && city.type === "citystate" && onHunt === island.want && onCity === city.want,
    `${island.type} day "${onHunt}" want "${island.want}"; ${city.type} day "${onCity}" want "${city.want}"`,
  );
}
