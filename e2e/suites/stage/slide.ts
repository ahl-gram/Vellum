// The Explorer's slide-away, the follow and the seats (Issue #996): the head cluster and the chart folio stay home through the Glass's first press, follow the zoom by the log of depth to their thin lines at the depth the chart fills the screen, stand home or away at that depth alone under reduced motion, follow a fold, and leave every seat where it stands with them home.
import type { SuiteContext } from "../../types.ts";
import { rest, size } from "./stage.ts";
import type { Pieces } from "./slide-kit.ts";
import {
  fillOf,
  motionOn,
  near,
  openAt,
  PIECES_READ,
  poseAt,
  press,
  pressSelector,
  readsFor,
  SEED_42,
  settleSlid,
  travelsOf,
} from "./slide-kit.ts";

const FIRST_PRESS = 1.4;
const FILL_RANGE: Record<string, [number, number]> = { "1280x800": [1.5, 1.56], "1024x768": [1.9, 1.97] };

async function es1At(ctx: SuiteContext, w: number, h: number): Promise<{ faults: string[]; detail: string }> {
  const faults: string[] = [];
  const say = (m: string): number => faults.push(`${w}x${h}: ${m}`);
  await openAt(ctx, SEED_42, w, h, "ES1");
  const home = await ctx.evaluate(PIECES_READ);
  const fill = fillOf(home);
  const { up, down } = travelsOf(home);
  const [lo, hi] = FILL_RANGE[`${w}x${h}`]!;
  if (!(fill >= lo && fill <= hi)) say(`the fill depth ${fill.toFixed(4)} lies outside ${lo} to ${hi}`);
  if (home.head.ty !== 0 || home.folio.ty !== 0) say(`a piece is away at rest: ${home.head.ty}, ${home.folio.ty}`);
  await press(ctx, 1);
  const one = await ctx.evaluate(PIECES_READ);
  if (one.head.ty !== 0 || one.folio.ty !== 0) say(`the first press moved a piece: ${one.head.ty}, ${one.folio.ty}`);
  const from = Math.min(FIRST_PRESS, fill);
  const mid = await poseAt(ctx, Math.sqrt(from * fill));
  if (!near(mid.head.ty, up / 2, 1) || !near(mid.folio.ty, down / 2, 1))
    say(
      `half way (k ${mid.k.toFixed(3)}) the head stands ${mid.head.ty} of ${up} and the folio ${mid.folio.ty} of ${down}`,
    );
  const short = await poseAt(ctx, 0.99 * fill);
  if (!(short.head.ty >= up + 1)) say(`at 0.99 of the fill the head already stands ${short.head.ty} of ${up}`);
  const at = await poseAt(ctx, fill);
  if (!near(at.head.ty, up, 0.5) || !near(at.folio.ty, down, 0.5))
    say(`at the fill the head stands ${at.head.ty} of ${up} and the folio ${at.folio.ty} of ${down}`);
  const [cl, ct, cr, cb] = at.chart;
  if (!(cl <= 1 && ct <= 1 && cr >= at.slip.left - 1 && cb >= at.innerH - 1))
    say(
      `the painted chart ${JSON.stringify(at.chart)} does not cover [0, ${at.slip.left}] x [0, ${at.innerH}] at the fill`,
    );
  if (!(at.head.nav[1] <= 0)) say(`the nav stands on screen at the fill: bottom ${at.head.nav[1]}`);
  if (!(at.head.trail[0] >= 0 && at.head.trail[1] <= 60))
    say(`the trail is off its thin line: ${JSON.stringify(at.head.trail)}`);
  if (!(at.folio.title[1] >= at.innerH - 3 && at.folio.title[1] <= at.innerH))
    say(`the title's foot ${at.folio.title[1]} is not within 3 px of the page's foot ${at.innerH}`);
  if (at.folio.rest.some((t) => t < at.innerH)) say(`a folio line stays on screen: ${JSON.stringify(at.folio.rest)}`);
  return {
    faults,
    detail: `${w}x${h} fill ${fill.toFixed(4)}, travels ${up} and ${down}, half ${mid.head.ty} and ${mid.folio.ty}`,
  };
}

export async function es1Follow(ctx: SuiteContext): Promise<void> {
  const rows = await motionOn(ctx, async () => [await es1At(ctx, 1280, 800), await es1At(ctx, 1024, 768)]);
  const faults = rows.flatMap((r) => r.faults);
  ctx.check(
    "ES1 on the Explorer at 1280x800 and 1024x768, seed 42, the head cluster and the chart folio stay home through the Glass's first press and then follow the zoom by the log of depth, half way at the geometric mean of the first press's depth and the fill depth, short of their travel just under it, and at their thin lines exactly at the depth where the chart, magnified about its centre, covers the screen beside the Broadside, read off the chart's own painted box (Alex, 2026-10-22, Issue #989 rulings 1 to 4; Alex, 2026-10-23, Issue #996 step 6 rulings 1 and 7)",
    faults.length === 0,
    rows.map((r) => r.detail).join("; ") +
      (faults.length ? `; ${faults.length} faults: ${faults.slice(0, 6).join("; ")}` : ""),
  );
}

const seats = (p: Pieces): number[] => [parseFloat(p.legendBottom), p.sheetW, p.sheetH];

export async function es2HomeSeats(ctx: SuiteContext): Promise<void> {
  const faults: string[] = [];
  await openAt(ctx, SEED_42, 1024, 768, "ES2");
  const home = await ctx.evaluate(PIECES_READ);
  if (home.legendBottom === "") faults.push("the Press is not risen at 1024x768, so its seat reads no folio");
  const want = seats(home);
  await press(ctx, 3);
  const away = await settleSlid(ctx, "folio", "ES2 folio away");
  const agree = (p: Pieces): boolean => seats(p).every((v, i) => near(v, want[i]!, 0.5));
  if (!agree(away))
    faults.push(`with the folio away the seats read ${JSON.stringify(seats(away))}, not ${JSON.stringify(want)}`);
  await size(ctx, 1024, 740);
  await rest(ctx, 1024, 740, "ES2 shorter");
  await size(ctx, 1024, 768);
  await rest(ctx, 1024, 768, "ES2 back");
  const back = await ctx.evaluate(PIECES_READ);
  if (!(back.folio.ty > 0)) faults.push(`the folio came home through the resize: ${back.folio.ty}`);
  if (!agree(back))
    faults.push(
      `after a resize made while away the seats read ${JSON.stringify(seats(back))}, not ${JSON.stringify(want)}`,
    );
  ctx.check(
    "ES2 at 1024x768 with the chart folio slid down and the head cluster slid up, the risen Press's seat and the sheet's fit are the ones the room lays out with them home, and stay so through a resize made while they are away (Alex, 2026-10-23, Issue #996 step 6 ruling 3)",
    faults.length === 0,
    `rest ${JSON.stringify(want)}, away ${JSON.stringify(seats(away))}, after resize ${JSON.stringify(seats(back))}` +
      (faults.length ? `; ${faults.join("; ")}` : ""),
  );
}

export async function es7Reduced(ctx: SuiteContext): Promise<void> {
  const faults: string[] = [];
  await openAt(ctx, SEED_42, 1280, 800, "ES7");
  const home = await ctx.evaluate(PIECES_READ);
  const fill = fillOf(home);
  const { up, down } = travelsOf(home);
  await press(ctx, 1);
  const mid = await poseAt(ctx, Math.sqrt(FIRST_PRESS * fill));
  if (mid.head.ty !== 0 || mid.folio.ty !== 0)
    faults.push(`short of the fill a piece is away: ${mid.head.ty}, ${mid.folio.ty}`);
  const at = await poseAt(ctx, fill);
  if (!near(at.head.ty, up, 0.5) || !near(at.folio.ty, down, 0.5))
    faults.push(`at the fill the head stands ${at.head.ty} of ${up} and the folio ${at.folio.ty} of ${down}`);
  ctx.check(
    "ES7 under reduced motion the head cluster and the chart folio do not travel with the zoom: home short of the fill depth and at their thin lines from it (Alex, 2026-10-23, Issue #996 step 6 ruling 6)",
    faults.length === 0,
    `fill ${fill.toFixed(4)}, travels ${up} and ${down}` + (faults.length ? `; ${faults.join("; ")}` : ""),
  );
}

export async function es9Fold(ctx: SuiteContext): Promise<void> {
  const faults: string[] = [];
  const last = <T>(a: readonly T[]): T => a[a.length - 1]!;
  await motionOn(ctx, async () => {
    await openAt(ctx, SEED_42, 1280, 800, "ES9");
    const { up } = travelsOf(await ctx.evaluate(PIECES_READ));
    await press(ctx, 2);
    await settleSlid(ctx, "head", "ES9 head away");
    await pressSelector(ctx, ".slip-fold");
    const held = await readsFor(ctx, 1000);
    if (held.some((p) => !near(p.head.ty, up, 0.5)))
      faults.push(
        `folding past both fill depths moved the head: ${JSON.stringify(held.map((p) => p.head.ty.toFixed(1)))}`,
      );
    await pressSelector(ctx, ".slip-tab");
    await rest(ctx, 1280, 800, "ES9 unfolded");
    await poseAt(ctx, 1.65);
    await pressSelector(ctx, ".slip-fold");
    const part = last(await readsFor(ctx, 1000));
    if (!(part.head.ty >= up + 10 && part.head.ty <= -10))
      faults.push(`folding at 1.65 left the head at ${part.head.ty}, not part way between ${up} and 0`);
  });
  ctx.check(
    "ES9 folding the Broadside while the chart fills the screen past both its fill depths leaves the head cluster at its thin line throughout the fold, and folding it at a depth between them brings the head part way home (Alex, 2026-10-23, Issue #996 step 6 ruling 4)",
    faults.length === 0,
    faults.length
      ? faults.join("; ")
      : "the head held its thin line through the fold and came part way home between the fill depths",
  );
}
