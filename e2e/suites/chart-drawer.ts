// The Chart Table's drawer (Issue #520 Sub 2 of Issue #401, direction D ruled at the Issue #518 sitting): the dog-ear on the committed survey, the drawer it fills, the cap, and since Issue #634 the table's two homes, the address deciding an arrival and the device a return. `chart-drawer` and never `drawer` (Issue #520 ruling 2).
import { forgetChartTouch } from "../support/chart-touch.ts";
import { makeSettle } from "../support/settle.ts";
import { makeStep } from "../support/step.ts";
import { makeMouse } from "../support/home.ts";
import { SAY_HOLD_MS } from "../../src/site/shared/announce.ts";
import type { SuiteContext } from "../types.ts";
import { drawerKit, dragKit, tableKit } from "./chart-drawer/kit.ts";
import type { DragKit } from "./chart-drawer/kit.ts";
import { DRESS, ONE } from "./chart-drawer/reads.ts";
import type { Edge, Read } from "./chart-drawer/reads.ts";
import {
  cd1DogEar,
  cd2Lays,
  cd2bRealPointer,
  cd23LineLeaves,
  cd3Refused,
  cd4Reload,
  cd5CuttingOff,
  cd7Cap,
  cd8Home,
  cd51NoTipKeyed,
  cd52LayWrites,
  cd63DeepestLays,
} from "./chart-drawer/desk.ts";
import { cd45SnapBack, cd46ReducedCarry, cd47FullCarry, cd53Ceremony } from "./chart-drawer/drag.ts";
import { cd54PortfolioLines, cd55WhereAuthored, cd56WorkerBlocked } from "./chart-drawer/room.ts";
import { cd57PressDress, cd58TurnFiles, cd59AbortedTurn } from "./chart-drawer/gestures.ts";
import { cd9NeverTogether, cd12SeatsHold, cd13TabClear, cd18RoadOn } from "./chart-drawer/surfaces.ts";
import {
  cd18bRoadCarries,
  cd19PortfolioDrafts,
  cd24PortfolioSays,
  bareArrived,
  cd20PlatePortfolio,
  cd21PortfolioGlass,
  cd62PlateReads,
  cd49bPrintRoomAddress,
  cd49PrintRoomRoad,
  cd50ScriptsOffHome,
} from "./chart-drawer/portfolio.ts";
import { cd48TouchHandle, na2DrawerBelowFloor } from "./chart-drawer/floor.ts";
import {
  cd25CardPress,
  cd27CardAtCap,
  cd28PagePress,
  cd34PageRefusals,
  cd31RoundTrip,
  cd32MixedFolio,
  cd60ProspectBroughtUp,
} from "./chart-drawer/prospect.ts";
import {
  cd36GoldPress,
  cd37BackCached,
  cd38BackRebuilt,
  cd39LinkBeatsDevice,
  cd40EmptySticks,
  cd41CachedReturn,
  cd61FolioHomes,
} from "./chart-drawer/homes.ts";

type Step = ReturnType<typeof makeStep>;

export async function run(ctx: SuiteContext): Promise<void> {
  const { send } = ctx;
  const settle = makeSettle(ctx);
  const step = makeStep(ctx);
  // Since Issue #634 the table has a second home on the DEVICE, and this suite fills it on nearly every group: every arrival below that carries no table key would otherwise inherit whatever the group before it laid, which is a bleed inside one suite and not only across a lane. So an arrival is bare unless it says otherwise, and the four checks that are ABOUT the device seed it themselves. about:blank has no storage of its own, so the clear rides on the site's origin.
  const k = drawerKit({ ...ctx, settle });
  const { clickEar, forget } = k;
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await step("CD1", () => cd1DogEar(k));
  await step("CD51", () => cd51NoTipKeyed(k));
  // The one value a step hands another: CD4 reloads the address CD2 wrote, so if CD2 never laid a sheet, CD4 fails as CD4 rather than passing against a table nobody filled. Several later checks read the page an earlier step left (CD52, CD53 and CD60 the sheets CD2 and CD32 laid, CD55 the bare Portfolio the CD62, CD21 step left, CD59 the page CD58 loaded).
  let laid: Read | null = null;
  await step("CD2, CD2b, CD2c", async () => {
    const earAt = await clickEar();
    laid = await cd2Lays(k);
    await cd2bRealPointer(k, earAt);
  });
  await step("CD52", () => cd52LayWrites(k));
  await step("CD53", () => cd53Ceremony(k));
  // A FLOOR, never a ceiling: a slow runner delays the clear and can only push this up, where a wall-clock ceiling on a runner-dependent measurement is RS30's own scar. 1s under the ruled hold covers the press, the read and the probe that stand between the announcement and the clock starting; the number moves with the constant, and the literal 8000 is pinned in test/site/announce.test.ts.
  const HOLD_FLOOR = SAY_HOLD_MS - 1000;
  await step("CD23", () => cd23LineLeaves(k, HOLD_FLOOR));
  await step("CD3", () => cd3Refused(k));
  // Issue #523 Sub 5: the desktop drag, the settle and the jolt, ruled 2026-09-21. The camera is d3's {x, y, k} and every Broadside fold schedules a room layout 340ms later that re-seats x/y (FOLD_SETTLE_MS in src/site/shared/slip.ts), so every drag check below holds the FOLD constant across its two reads (the Broadside already folded before the press), takes each read at REST (two reads 50ms apart agreeing, with no ghost and no settle in flight), and compares k exactly with x and y inside half a pixel: a no-change refit is a float round trip through the camera bridge, a d3 pan is the carry's own delta in the hundreds of px, and k alone (CD2c's read) cannot tell a pan at all.
  const { press, moveTo, release } = makeMouse(ctx);
  const kd = dragKit({ ...k, press, moveTo, release });
  await step("CD45", () => cd45SnapBack(kd));
  await step("CD46", () => cd46ReducedCarry(kd));
  await step("CD4", () => cd4Reload(kd, laid));
  await step("CD5", () => cd5CuttingOff(kd));
  await step("CD63", () => cd63DeepestLays(kd));
  const SIX = [
    "rung-1.lx-4.ly-4",
    "rung-1.lx-3.ly-3",
    "rung-2.lx-5.ly-5",
    "rung-2.lx-6.ly-6",
    "rung-3.lx-11.ly-11",
    "rung-3.lx-12.ly-12",
  ]
    .map((seat) => `k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.${seat}`)
    .join("_");
  await step("CD7, CD7b, CD7c", () => cd7Cap(kd, SIX));
  await step("CD47", () => cd47FullCarry(kd));
  await step("CD8", () => cd8Home(kd));
  await cd9Surfaces(kd, step, SIX);
  await cd25CapturesAndHomes(kd, step, SIX);
  // OUTSIDE every step, which is the whole point: `makeStep` swallows a throw from anywhere in a step's body, so a
  // clear that sits after a check inside one is skipped exactly when a check gave up early and leaks the key into
  // document-rooms and region-detail. suites/hunt.ts brackets its own key at start and end for the same reason.
  await forget();
}

async function cd9Surfaces(kd: DragKit, step: Step, SIX: string): Promise<void> {
  const { send, go } = kd;
  // CD9 / CD11 / CD12 (Issue #543, Alex 2026-09-08): the Broadside and the Chart Table are never open together and nothing is lifted onto the chart, because covering the caption and the roads out while leaving the side panel standing made no sense to the reader.
  await step("CD9, CD11, CD12, CD22, CD43", async () => {
    const withOpen = await cd9NeverTogether(kd, SIX);
    await cd12SeatsHold(kd, SIX, withOpen);
  });
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  const edge: Record<string, Edge> = {};
  await step("CD13", () => cd13TabClear({ ...kd, edge }));
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  // CD18 / CD19 / CD20 (Issue #521 Sub 3): the road the table has carried disabled since Issue #520 turns on, and the Portfolio
  // drafts what it carries. The page reads the table from its OWN address once at load and never rewrites it.
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await step("CD18", async () => {
    await go(`${DRESS}&table=${SIX}`);
    await cd18RoadOn(kd);
  });
  await step("CD18b", () => cd18bRoadCarries(kd, SIX));
  await cd19PortfolioDrafts(kd);
  await cd24PortfolioSays(kd);
  await step("CD54", () => cd54PortfolioLines(kd));
  // BARE means bare on both homes since Issue #634: a Portfolio the address names no folio for now shows what the device holds (ruling 4), so the six this group just laid would arrive here as a full pile.
  await step("CD20", () => cd20PlatePortfolio(tableKit(kd)));
  await step("CD62, CD21", async () => {
    await bareArrived(kd);
    await cd62PlateReads(kd);
    await cd21PortfolioGlass(kd);
  });
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await step("CD55", () => cd55WhereAuthored(kd));
  await step("CD56", () => cd56WorkerBlocked(kd));
  await step("CD48", () => cd48TouchHandle(kd));
  await kd.evaluate(forgetChartTouch);
  await step("NA2", () => na2DrawerBelowFloor(kd));
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
}

async function cd25CapturesAndHomes(kd: DragKit, step: Step, SIX: string): Promise<void> {
  // Issue #522 Sub 4: the two capture points for a prospect, and the mixed folio they make.
  await step("CD25, CD26, CD30", () => cd25CardPress(kd));
  await step("CD57", () => cd57PressDress(kd));
  await step("CD27", () => cd27CardAtCap(kd, SIX));
  await step("CD58", () => cd58TurnFiles(kd));
  // CD58 installs the worker hold CD59 uses and files the two sheets it counts, so a CD58 stop takes CD59 with it.
  await step("CD59", () => cd59AbortedTurn(kd));
  await step("CD28, CD29, CD34, CD35, CD31", async () => {
    const two = await cd28PagePress(kd);
    await cd34PageRefusals(kd, SIX);
    await cd31RoundTrip(kd, two);
  });
  await step("CD32", () => cd32MixedFolio(kd));
  await step("CD60", () => cd60ProspectBroughtUp(kd));
  // Issue #634: the table's second home, and the four roads the two homes exist for. ONE and TWO are addresses rather than gestures because every check below is about WHERE the table came from, not about the handle that filed it.
  const TWO = `${ONE}_k-p.seed-42.style-antique.i-0.year-1059`;
  const kt = tableKit(kd);
  await step("CD49b", () => cd49bPrintRoomAddress(kt));
  await step("CD49", () => cd49PrintRoomRoad(kt));
  await step("CD50", () => cd50ScriptsOffHome(kt));
  await step("CD36", () => cd36GoldPress(kt));
  await step("CD37", () => cd37BackCached(kt));
  await step("CD38", () => cd38BackRebuilt(kt));
  await step("CD39", () => cd39LinkBeatsDevice(kt, TWO));
  await step("CD40", () => cd40EmptySticks(kt));
  await step("CD41, CD42", () => cd41CachedReturn(kt));
  await step("CD61", () => cd61FolioHomes(kt));
}
