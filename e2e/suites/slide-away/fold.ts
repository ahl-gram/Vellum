// A fold of the side panel past the fill (Issue #1034, Alex's decisions 1 and 2): the head cluster and the chart folio creep part way back, as today's Explorer brings them, until the reader zooms past it, after which the folded room keeps its own rule.
import { makeSettle } from "../../support/settle.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import { pressAt } from "../print-room/kit.ts";
import { LENS, lensRest, ZOOM_IN } from "../print-room/print.ts";
import { rest } from "../stage/stage.ts";
import { motionOn, mouseTo, openAt, pressSelector, SEED_42 } from "../stage/slide-kit.ts";
import {
  awayFaults,
  fillOf,
  fillPressOf,
  homeFaults,
  openRoom,
  PIECES,
  pressDepths,
  pressGlass,
  ROOMS,
  still,
  travelsOf,
} from "./kit.ts";
import type { Pieces } from "./kit.ts";

type Arm = { readonly id: string; readonly open: (ctx: SuiteContext) => Promise<Pieces> };
type Aim = { x: number; y: number; hit: string | null };

const ZOOM_OUT = ZOOM_IN.replace("zoom-in", "zoom-out") as Payload<Aim | null>;
const EASING: Payload<boolean> = `!!document.querySelector("header.chrome.easing, .corner.bl.easing")`;
const GESTURE_POINT: Payload<{ x: number; y: number; ok: boolean }> = `(() => {
  const r = document.getElementById("map-viewport").getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, e = document.elementFromPoint(x, y);
  return { x, y, ok: !!e && !!e.closest("#map-viewport") && !e.closest("header.chrome, .corner") };
})()`;

const ARMS: readonly Arm[] = [
  {
    id: "the Print Room at 1280x800",
    open: (c) =>
      openRoom(
        c,
        ROOMS.find((r) => r.id === "Print Room")!,
        1280,
        800,
        "SW7 a",
      ),
  },
  {
    id: "the Explorer at 1366x768",
    open: async (c) => {
      await openAt(c, SEED_42, 1366, 768, "SW7 b");
      await rest(c, 1366, 768, "SW7 b");
      return c.evaluate(PIECES);
    },
  },
];

async function standOff(ctx: SuiteContext, label: string): Promise<void> {
  const at = await ctx.evaluate(ZOOM_OUT);
  if (!at || at.hit !== "zoom-out")
    throw new Error(`${label}: the Glass's out press is covered: ${JSON.stringify(at)}`);
  await pressAt(ctx, at.x, at.y);
  await lensRest(ctx, "still", label, LENS);
}

// Wiring: a sampling read across the glide and one ease, as gather samples, never a wait on the claim.
async function pressWatching(ctx: SuiteContext, id: "zoom-in" | "zoom-out", label: string): Promise<number> {
  const at = await ctx.evaluate(id === "zoom-in" ? ZOOM_IN : ZOOM_OUT);
  if (!at || at.hit !== id) throw new Error(`${label}: the Glass's ${id} press is covered: ${JSON.stringify(at)}`);
  await pressAt(ctx, at.x, at.y);
  let easing = 0;
  for (let i = 0; i < 30; i++) {
    if (await ctx.evaluate(EASING)) easing++;
    await ctx.sleep(30, "window: reads 30 ms apart across the glide and its ease");
  }
  await lensRest(ctx, "still", label, LENS);
  return easing;
}

type Folded = { b: Pieces; travels: { up: number; down: number }; faults: string[] };

async function foldPast(ctx: SuiteContext, arm: Arm): Promise<Folded> {
  const home = await arm.open(ctx);
  const fill = fillOf(home, "sheet");
  const travels = travelsOf(home);
  const faults: string[] = [];
  if (fillPressOf(fill) !== 2)
    faults.push(
      `${arm.id}: the open fill ${fill.toFixed(4)} lies at press ${fillPressOf(fill)}, not the second (the witness)`,
    );
  const kept = pressDepths(fillPressOf(fill) - 1);
  await pressGlass(ctx, LENS, `SW7 ${arm.id} 1`);
  await pressGlass(ctx, LENS, `SW7 ${arm.id} 2`);
  const a = await still(ctx, `SW7 ${arm.id} before the fold`);
  faults.push(...awayFaults(a, travels, `${arm.id} before the fold`));
  await pressSelector(ctx, ".slip-fold");
  const point = await ctx.evaluate(GESTURE_POINT);
  if (!point.ok) faults.push(`${arm.id}: the gesture box's centre lies under a piece: ${JSON.stringify(point)}`);
  await mouseTo(ctx, point.x, point.y);
  // Wiring, said at the call: the fold's class lands before the refit.
  await makeSettle(ctx)(
    PIECES,
    (d) => d.slip?.open === false && d.sheet[2] !== a.sheet[2],
    `SW7 ${arm.id} folded sheet`,
    60,
  );
  const b = await still(ctx, `SW7 ${arm.id} after the fold`);
  const folded = fillOf(b, "sheet");
  if (fillPressOf(folded) !== 3)
    faults.push(
      `${arm.id}: the folded fill ${folded.toFixed(4)} lies at press ${fillPressOf(folded)}, not the third (the witness)`,
    );
  const p = Math.log(b.k / kept) / Math.log(folded / kept);
  if (Math.abs(b.head.ty - p * travels.up) > 0.5 || Math.abs(b.folio.ty - p * travels.down) > 0.5)
    faults.push(
      `${arm.id}: after the fold the head stands ${b.head.ty} and the folio ${b.folio.ty}, not ${(p * travels.up).toFixed(2)} and ${(p * travels.down).toFixed(2)}`,
    );
  if (!(b.head.ty < -0.5 && b.head.ty > travels.up + 0.5 && b.folio.ty > 0.5 && b.folio.ty < travels.down - 0.5))
    faults.push(
      `${arm.id}: after the fold the pieces are not part way between home and their travels: ${b.head.ty}, ${b.folio.ty}`,
    );
  return { b, travels, faults };
}

async function sequenceOne(ctx: SuiteContext, arm: Arm, whole: boolean): Promise<string[]> {
  const { travels, faults } = await foldPast(ctx, arm);
  const at = (what: string): string => `${arm.id} ${what}`;
  const easing = await pressWatching(ctx, "zoom-in", `SW7 ${arm.id} past`);
  if (easing > 0) faults.push(at(`the pieces eased ${easing} reads behind the camera crossing the fill`));
  faults.push(...awayFaults(await still(ctx, `SW7 ${arm.id} c`), travels, at("after one more press")));
  await standOff(ctx, `SW7 ${arm.id} d`);
  faults.push(...homeFaults(await still(ctx, `SW7 ${arm.id} d`), at("back at the fold's depth")));
  if (!whole) return faults;
  await standOff(ctx, `SW7 ${arm.id} e`);
  faults.push(...homeFaults(await still(ctx, `SW7 ${arm.id} e`), at("at the first press")));
  await pressGlass(ctx, LENS, `SW7 ${arm.id} f`);
  faults.push(...homeFaults(await still(ctx, `SW7 ${arm.id} f`), at("at the folded room's second press")));
  await pressGlass(ctx, LENS, `SW7 ${arm.id} g`);
  faults.push(...awayFaults(await still(ctx, `SW7 ${arm.id} g`), travels, at("at the folded room's third press")));
  return faults;
}

async function sequenceTwo(ctx: SuiteContext, arm: Arm): Promise<string[]> {
  const { faults } = await foldPast(ctx, arm);
  const at = (what: string): string => `${arm.id} ${what}`;
  const easing = await pressWatching(ctx, "zoom-out", `SW7 ${arm.id} stand-off`);
  if (easing > 0) faults.push(at(`the pieces eased ${easing} reads behind a stand-off straight after the fold`));
  faults.push(...homeFaults(await still(ctx, `SW7 ${arm.id} e2`), at("at the first press after the stand-off")));
  await pressGlass(ctx, LENS, `SW7 ${arm.id} f2`);
  faults.push(...homeFaults(await still(ctx, `SW7 ${arm.id} f2`), at("at the folded room's second press")));
  return faults;
}

export async function sw7FoldPast(ctx: SuiteContext): Promise<void> {
  const faults: string[] = [];
  const [room, explorer] = ARMS as [Arm, Arm];
  await motionOn(ctx, async () => {
    faults.push(...(await sequenceOne(ctx, room, true)));
    faults.push(...(await sequenceOne(ctx, explorer, false)));
    faults.push(...(await sequenceTwo(ctx, room)));
  });
  ctx.check(
    'SW7 folding the side panel at the press that filled the screen, on the Print Room at 1280x800 and on the Explorer at 1366x768, where the folded room fills only at the next press, brings the head cluster and the chart folio part way back, to where the zoom\'s own start and the folded room\'s fill put them, and the next press carries them to their thin lines; once past the fill, or back at the first press, the folded room keeps its own rule, so at its second press both stand home (Alex, 2026-10-23, Issue #1034, "Creep a little way back, as today" and "Both bars home"; Issue #996 step 6 ruling 4; Issue #997 ruling 5)',
    faults.length === 0,
    faults.length
      ? `${faults.length} faults: ${faults.slice(0, 8).join("; ")}`
      : "creep, one more press, stand-off, and the folded room's own rule all as ruled",
  );
}
