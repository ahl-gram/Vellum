import { resolve } from "node:path";
import type { SuiteContext } from "../../types.ts";
import { routesUnder } from "../corners/geometry.ts";
import { CHART_ROOM_FLOOR, DESK, open, REPO, rest, size, stageFaults } from "./stage.ts";
import type { Read, Stage } from "./stage.ts";

const WINDOWS: readonly (readonly [number, number])[] = [
  [1280, 720],
  [1024, 768],
  [1024, 600],
  [960, 800],
  [901, 800],
  [1024, 474],
  [932, 430],
];
const FOLDED_WINDOWS: readonly (readonly [number, number])[] = [
  [1024, 600],
  [901, 800],
];
// The day's seed on which the Print Room's Press came to rest over its folio at 932x430 folded (2026-10-06), read beside the suite's fixed day (Alex, 2026-10-05, on PR #784).
const COLLIDED_2026_10_06 = "/print-room/#seed=20261006";

async function deskReads(ctx: SuiteContext): Promise<{ reads: Read[] }> {
  await ctx.setTouch(false);
  const reads: Read[] = [];
  for (const page of [...routesUnder(resolve(REPO, "src/pages")), COLLIDED_2026_10_06]) {
    await size(ctx, DESK.w, DESK.h);
    const first = await open(ctx, page, DESK.w, DESK.h, DESK, "EA");
    if (!first) continue;
    reads.push({ page, size: `${DESK.w}x${DESK.h}`, s: first });
    for (const [w, h] of WINDOWS) {
      await size(ctx, w, h);
      const s = await rest(ctx, w, h, `EA ${page} ${w}x${h}`);
      if (s) reads.push({ page, size: `${w}x${h}`, s });
    }
    if (page === "/explorer/") {
      for (const [w, h] of FOLDED_WINDOWS) {
        await size(ctx, w, h);
        const s = await rest(ctx, w, h, `EA folded ${w}x${h}`);
        if (s) reads.push({ page, size: `${w}x${h} folded`, s });
      }
    }
  }
  return { reads };
}

export async function eaDesk(ctx: SuiteContext): Promise<void> {
  const { reads } = await deskReads(ctx);
  const rooms = [...new Set(reads.map((r) => r.page))];
  const missing = CHART_ROOM_FLOOR.filter((p) => !rooms.includes(p));
  const pick = (page: string, at: string): Stage | undefined => reads.find((r) => r.page === page && r.size === at)?.s;
  const faults = reads.flatMap(stageFaults);
  const control = reads.filter((r) => r.size === "1280x800" || r.size === "1280x720");
  const controlFaults = control
    .filter((r) => r.s.under || r.s.risen)
    .map((r) => `${r.page} at ${r.size}: ${r.s.under ? "floored" : "risen"}`);
  ctx.check(
    "EA2 on a short laptop window (1024x600) the Print Room floors to the whole room and the Explorer keeps more than half its own, the Press standing above the chart folio (210.5 wide on main), and at 1024x474 the Explorer and the Print Room floor (Issue #762, ruling 4a)",
    pick("/print-room/", "1024x600")?.under === true &&
      pick("/explorer/", "1024x600")?.under === false &&
      pick("/explorer/", "1024x600")?.risen === true &&
      pick("/explorer/", "1024x474")?.under === true &&
      pick("/print-room/", "1024x474")?.under === true,
    `print-room 1024x600 ${JSON.stringify(pick("/print-room/", "1024x600")?.sheet)} under ${pick("/print-room/", "1024x600")?.under}; explorer 1024x600 ${JSON.stringify(pick("/explorer/", "1024x600")?.sheet)} under ${pick("/explorer/", "1024x600")?.under} risen ${pick("/explorer/", "1024x600")?.risen}`,
  );
  ctx.check(
    "EA3 the control: at 1280x800 and 1280x720 no chart room floors its sheet or raises its Press, so a healthy window keeps the layout main ships (Issue #762)",
    missing.length === 0 && control.length >= 2 * CHART_ROOM_FLOOR.length && controlFaults.length === 0,
    `${control.length} control reads over ${rooms.length} rooms${missing.length ? `, missing ${missing.join(", ")}` : ""}; ${controlFaults.join("; ") || "none floored or risen"}`,
  );
  ctx.check(
    "EL1 in every chart room, resized while loaded from 1280x800 through 1280x720, 1024x768, 1024x600, 960x800, 901x800, 1024x474 and 932x430, and on the Explorer with the Broadside folded at 1024x600 and 901x800, the sheet keeps at least half its room (all of it when floored, inside the page, which below 1024 is the 1024 page), the Press never stacks down the page, and no chrome ink meets other chrome ink or lies under another piece's backing (Issue #762)",
    missing.length === 0 && reads.length >= CHART_ROOM_FLOOR.length * (WINDOWS.length + 1) && faults.length === 0,
    `${reads.length} reads over ${rooms.length} rooms; ${faults.length ? `${faults.length} faults: ${faults.slice(0, 6).join("; ")}` : "no faults"}`,
  );
}
