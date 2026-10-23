// The slide-away in the seven other zoom rooms, the follow and the lines left (Issue #1034): SW1 and SW4 visit each room at 1280x800, SW2 and SW3 are the windows where the chart fills only at the Glass's third or fourth press.
import { makeSettle } from "../../support/settle.ts";
import type { SuiteContext } from "../../types.ts";
import { GLYPH_LINES } from "../stage/glyphs.ts";
import { FLOOR_PLAIN, grounds, rest, size, withStyle, worstOf } from "../stage/stage.ts";
import { motionOn, openAt, pressSelector, SEED_42 } from "../stage/slide-kit.ts";
import { BARE } from "../stage/zoomed.ts";
import { LENS } from "../print-room/print.ts";
import type { Room } from "./kit.ts";
import {
  awayFaults,
  fillOf,
  fillPressOf,
  homeFaults,
  openRoom,
  PIECES,
  pressGlass,
  ROOMS,
  still,
  travelsOf,
} from "./kit.ts";
import type { Pieces } from "./kit.ts";

const roomNamed = (id: string): Room => ROOMS.find((r) => r.id === id)!;

function thinLines(room: Room, a: Pieces): string[] {
  const faults: string[] = [];
  const say = (m: string): number => faults.push(`${room.id}: ${m}`);
  if (!(a.head.nav[1] <= 0)) say(`the nav stands on screen: bottom ${a.head.nav[1]}`);
  if (!(a.head.summary[0] >= 0 && a.head.summary[1] <= 48))
    say(`the chart of the atelier press is off the top line: ${JSON.stringify(a.head.summary)}`);
  if (room.id === "Prospect" && !(a.head.also && a.head.also[0] >= 0 && a.head.also[1] <= 48))
    say(`the Prospect's second line is not kept under the trail: ${JSON.stringify(a.head.also)}`);
  if (!(a.folio.title[1] >= a.innerH - 3 && a.folio.title[1] <= a.innerH))
    say(`the title's foot ${a.folio.title[1]} is not within 3 px of ${a.innerH}`);
  if (a.folio.rest.some((t) => t < a.innerH - 3)) say(`a folio line stays on screen: ${JSON.stringify(a.folio.rest)}`);
  if (room.id === "Reading Room" && !(a.stripTop !== null && a.stripTop < a.folio.title[0]))
    say(`the title is not under the strip: strip ${a.stripTop}, title ${a.folio.title[0]}`);
  return faults;
}

async function sw1Visit(ctx: SuiteContext, room: Room): Promise<{ faults: string[]; detail: string }> {
  const label = `SW1 ${room.id}`;
  const home = await openRoom(ctx, room, 1280, 800, label);
  const faults = homeFaults(home, `${label} at rest`);
  const fill = fillOf(home, room.fill);
  const n = fillPressOf(fill);
  if (n !== 2) faults.push(`${room.id}: the fill ${fill.toFixed(4)} lies at press ${n}, not the second (the witness)`);
  const travels = travelsOf(home);
  await motionOn(ctx, async () => {
    for (let i = 1; i < n; i++) await pressGlass(ctx, room.lens, `${label} press ${i}`);
    faults.push(...homeFaults(await still(ctx, `${label} before`), `${room.id} press ${n - 1}`));
    await pressGlass(ctx, room.lens, `${label} press ${n}`);
    const a = await still(ctx, `${label} fill`);
    faults.push(...awayFaults(a, travels, `${room.id} press ${n}`), ...thinLines(room, a));
  });
  return { faults, detail: `${room.id} fill ${fill.toFixed(4)} press ${n}, travels ${travels.up} and ${travels.down}` };
}

async function sw4Visit(ctx: SuiteContext, room: Room): Promise<{ faults: string[]; detail: string }> {
  const a = await still(ctx, `SW4 ${room.id}`);
  const keep = ["cluster", ...(room.id === "Reading Room" ? [] : ["chart folio"])];
  const seen = await ctx.evaluate(GLYPH_LINES);
  const lines = seen.filter((g) => keep.includes(g.piece) && g.row >= 0 && g.row < a.innerH);
  const read = await grounds(ctx, lines);
  const bare = await withStyle(ctx, "sw-bare", BARE, () => grounds(ctx, lines));
  const faults: string[] = [];
  for (const p of keep) {
    if (!lines.some((g) => g.piece === p)) faults.push(`${room.id}: no ${p} line is on screen`);
    if (!(worstOf(bare, p) < FLOOR_PLAIN))
      faults.push(
        `${room.id}: the ${p} reads ${worstOf(bare, p).toFixed(2)} with the panels taken away, so the read cannot see them fail`,
      );
  }
  for (const g of read.filter((x) => x.ratio < FLOOR_PLAIN))
    faults.push(`${room.id}: ${g.piece} "${g.t}" reads ${g.ratio.toFixed(2)}`);
  return {
    faults,
    detail: `${room.id} worst ${worstOf(read).toFixed(2)}, bare ${keep.map((p) => `${p} ${worstOf(bare, p).toFixed(2)}`).join(" and ")} (${bare.map((g) => `${g.piece} ${g.t.slice(0, 12)} ${g.ratio.toFixed(2)}`).join(", ")})`,
  };
}

export async function sw1Rooms(ctx: SuiteContext): Promise<void> {
  const one: { faults: string[]; detail: string }[] = [];
  const four: { faults: string[]; detail: string }[] = [];
  for (const room of ROOMS) {
    one.push(await sw1Visit(ctx, room));
    four.push(await sw4Visit(ctx, room));
  }
  const f1 = one.flatMap((r) => r.faults);
  const f4 = four.flatMap((r) => r.faults);
  ctx.check(
    "SW1 in each of the seven other zoom rooms at 1280x800, the Print Room, the Portfolio, the Prospect, the Reading Room, the Ribbon, the Seed of the Day and the Specimen Book, the head cluster and the chart folio stay home until the Glass's press that fills the screen beside the slip and stand at their thin lines at it: the nav off screen, the chart of the atelier press on the top line, on the Prospect its second line kept under the trail, the folio's title 2 px above the foot and its other lines below it, on the Reading Room under the strip (Alex, 2026-10-23, Issue #997 rulings 1 to 3 and 5; Issue #996)",
    f1.length === 0,
    one.map((r) => r.detail).join("; ") + (f1.length ? `; ${f1.length} faults: ${f1.slice(0, 6).join("; ")}` : ""),
  );
  ctx.check(
    "SW4 in the same visits, every line of the head cluster and the chart folio left on screen at the press that fills reads at 4.5:1 or better on the zoomed panels, and in the same run with the panels taken away each piece reads under 4.5:1 (Alex, 2026-10-22, Issue #988 and Issue #989 ruling 3; Alex, 2026-10-23, Issue #997)",
    f4.length === 0,
    four.map((r) => r.detail).join("; ") + (f4.length ? `; ${f4.length} faults: ${f4.slice(0, 6).join("; ")}` : ""),
  );
}

type ThirdArm = { id: string; open: (ctx: SuiteContext) => Promise<Pieces>; lens: Room["lens"] };

const ARMS: readonly ThirdArm[] = [
  {
    id: "the Print Room at 1024x768",
    open: (c) => openRoom(c, roomNamed("Print Room"), 1024, 768, "SW2 a"),
    lens: LENS,
  },
  {
    id: "the Specimen Book at 1024x768",
    open: (c) => openRoom(c, roomNamed("Specimen Book"), 1024, 768, "SW2 b"),
    lens: LENS,
  },
  {
    id: "the Explorer at 1280x640 with the Broadside folded",
    open: async (c) => {
      await openAt(c, SEED_42, 1280, 640, "SW2 c");
      const open = await c.evaluate(PIECES);
      await pressSelector(c, ".slip-fold");
      // Wiring, said at the check: the fold's class lands before the refit, so the read waits for the sheet to have moved to its folded box.
      await makeSettle(c)(
        PIECES,
        (d) => d.slip?.open === false && d.sheet[2] !== open.sheet[2],
        "SW2 c folded sheet",
        60,
      );
      await rest(c, 1280, 640, "SW2 c folded");
      return c.evaluate(PIECES);
    },
    lens: LENS,
  },
];

async function thirdPress(ctx: SuiteContext, arm: ThirdArm): Promise<string[]> {
  const home = await arm.open(ctx);
  const faults = homeFaults(home, `${arm.id} at rest`);
  const fill = fillOf(home, "sheet");
  if (fillPressOf(fill) !== 3)
    faults.push(
      `${arm.id}: the fill ${fill.toFixed(4)} lies at press ${fillPressOf(fill)}, not the third (the witness)`,
    );
  const travels = travelsOf(home);
  await motionOn(ctx, async () => {
    await pressGlass(ctx, arm.lens, `SW2 ${arm.id} 1`);
    await pressGlass(ctx, arm.lens, `SW2 ${arm.id} 2`);
    faults.push(...homeFaults(await still(ctx, `SW2 ${arm.id} second`), `${arm.id} after the second press`));
    await pressGlass(ctx, arm.lens, `SW2 ${arm.id} 3`);
    faults.push(...awayFaults(await still(ctx, `SW2 ${arm.id} third`), travels, `${arm.id} after the third press`));
  });
  return faults;
}

export async function sw2ThirdPress(ctx: SuiteContext): Promise<void> {
  const faults: string[] = [];
  for (const arm of ARMS) faults.push(...(await thirdPress(ctx, arm)));
  ctx.check(
    "SW2 where the chart fills the screen only at the Glass's third press, the Print Room and the Specimen Book at 1024x768 and the Explorer at 1280x640 with the Broadside folded, the head cluster and the chart folio stand home after the second press and at their thin lines after the third: nothing moves until the press that fills (Alex, 2026-10-23, Issue #997 ruling 5)",
    faults.length === 0,
    faults.length ? faults.slice(0, 6).join("; ") : "home after the second press and away after the third on all three",
  );
}

const reaches = (p: Pieces): boolean => {
  const f = p.face!;
  return f[0] <= 1 && f[1] <= 1 && f[3] >= p.innerH - 1;
};

export async function sw3Today(ctx: SuiteContext): Promise<void> {
  const room = roomNamed("Seed of the Day");
  const faults: string[] = [];
  const home = await openRoom(ctx, room, 1024, 768, "SW3");
  const a = fillOf(home, "sheet");
  const b = fillOf(home, "gesture");
  if (fillPressOf(a) !== 3 || fillPressOf(b) !== 4)
    faults.push(
      `the plain rule's fill ${a.toFixed(4)} and the room's ${b.toFixed(4)} lie at presses ${fillPressOf(a)} and ${fillPressOf(b)}, not 3 and 4 (the witness)`,
    );
  const travels = travelsOf(home);
  await motionOn(ctx, async () => {
    for (let i = 1; i <= 3; i++) await pressGlass(ctx, room.lens, `SW3 press ${i}`);
    const third = await still(ctx, "SW3 third");
    faults.push(...homeFaults(third, "after the third press"));
    if (reaches(third))
      faults.push(
        `the chart already reaches the left, the top and the foot at the third press: ${JSON.stringify(third.face)}`,
      );
    await size(ctx, 1024, 767);
    await rest(ctx, 1024, 767, "SW3 shorter");
    await size(ctx, 1024, 768);
    await rest(ctx, 1024, 768, "SW3 back");
    faults.push(...homeFaults(await still(ctx, "SW3 resized"), "after a resize made there"));
    await pressGlass(ctx, room.lens, "SW3 press 4");
    const fourth = await still(ctx, "SW3 fourth");
    faults.push(...awayFaults(fourth, travels, "after the fourth press"));
    if (!reaches(fourth))
      faults.push(
        `the chart does not reach the left, the top and the foot at the fourth press: ${JSON.stringify(fourth.face)}`,
      );
  });
  ctx.check(
    "SW3 on the Seed of the Day at 1024x768, whose Glass magnifies about the whole stage, the head cluster and the chart folio stand home through the Glass's third press, where the chart does not yet reach the left, the top and the foot, and through a resize made there, and at their thin lines at the fourth, where it reaches all three (Alex, 2026-10-23, Issue #997 rulings 4 and 5)",
    faults.length === 0,
    `plain fill ${a.toFixed(4)}, the room's ${b.toFixed(4)}` + (faults.length ? `; ${faults.join("; ")}` : ""),
  );
}
