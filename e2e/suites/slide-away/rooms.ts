// The slide-away beyond the Explorer, the follow (Issue #1034): SW1 visits the Prospect at 1280x800; SW2 and SW3 are the windows where the chart fills only at the Glass's third or fourth press.
import type { SuiteContext } from "../../types.ts";
import { rest, size } from "../stage/stage.ts";
import { motionOn } from "../stage/slide-kit.ts";
import { FOOT_WINDOW, THIN_LINES, thinFootFaults, thinTopFaults } from "../stage/thin-lines.ts";
import type { ThinLines } from "../stage/thin-lines.ts";
import { LENS } from "../print-room/print.ts";
import type { Room } from "./kit.ts";
import { awayFaults, fillOf, fillPressOf, homeFaults, openRoom, pressGlass, ROOMS, still, travelsOf } from "./kit.ts";
import type { Pieces } from "./kit.ts";

const roomNamed = (id: string): Room => ROOMS.find((r) => r.id === id)!;

function thinLines(room: Room, a: Pieces, t: ThinLines): string[] {
  const faults: string[] = [];
  const say = (m: string): number => faults.push(`${room.id}: ${m}`);
  if (!(a.head.nav[1] <= 0)) say(`the nav stands on screen: bottom ${a.head.nav[1]}`);
  for (const m of [...thinTopFaults(t), ...thinFootFaults(t)]) say(m);
  if (a.folio.rest.some((r) => r < a.innerH - FOOT_WINDOW))
    say(`a folio line stays on screen: ${JSON.stringify(a.folio.rest)}`);
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
  if (n < 2)
    faults.push(
      `${room.id}: the fill ${fill.toFixed(4)} lies at the first press, so no press stands before the one that fills (the witness)`,
    );
  const travels = travelsOf(home);
  await motionOn(ctx, async () => {
    for (let i = 1; i < n; i++) await pressGlass(ctx, room.lens, `${label} press ${i}`);
    faults.push(...homeFaults(await still(ctx, `${label} before`), `${room.id} press ${n - 1}`));
    await pressGlass(ctx, room.lens, `${label} press ${n}`);
    const a = await still(ctx, `${label} fill`);
    const t = await ctx.evaluate(THIN_LINES);
    faults.push(...awayFaults(a, travels, `${room.id} press ${n}`), ...thinLines(room, a, t));
  });
  return { faults, detail: `${room.id} fill ${fill.toFixed(4)} press ${n}, travels ${travels.up} and ${travels.down}` };
}

export async function sw1Rooms(ctx: SuiteContext): Promise<void> {
  const r = await sw1Visit(ctx, roomNamed("Prospect"));
  ctx.check(
    "SW1 on the Prospect at 1280x800, whose zoom room takes the slide-away from the binder `scripts/lint/shared-bindings.ts` holds every zoom room to (`bindZoomRoom`), the head cluster and the chart folio stay home until the Glass's press that fills the screen beside the slip and stand at their thin lines at it: the nav off screen, the chart of the atelier press on the top line, the Prospect's second line kept under the trail, the folio's title 2 px above the foot and its other lines below it (Alex, 2026-10-23, Issue #997 rulings 1 to 3 and 5; Issue #996; one room since Issue #1273)",
    r.faults.length === 0,
    r.detail + (r.faults.length ? `; ${r.faults.length} faults: ${r.faults.slice(0, 6).join("; ")}` : ""),
  );
}

type ThirdArm = { id: string; open: (ctx: SuiteContext) => Promise<Pieces>; lens: Room["lens"] };

// 2026-11-08: the Print Room at 1024x768 filled at 2.2320 (press 3) on the Mac harness browser and at 3.0106 (press 4) on lane D of CI runs 42264204026, 42262162471 and 42258912829, 0.272 and 1.051 past the second press's 1.96.
const ARMS: readonly ThirdArm[] = [
  {
    id: "the Print Room at 1024x768",
    open: (c) => openRoom(c, roomNamed("Print Room"), 1024, 768, "SW2 a"),
    lens: LENS,
  },
];

async function thirdPress(ctx: SuiteContext, arm: ThirdArm): Promise<{ faults: string[]; detail: string }> {
  const home = await arm.open(ctx);
  const faults = homeFaults(home, `${arm.id} at rest`);
  const fill = fillOf(home, "sheet");
  const n = Number.isFinite(fill) ? fillPressOf(fill) : 0;
  const detail = `${arm.id} fill ${fill.toFixed(4)} press ${n}`;
  if (n < 3)
    return {
      faults: [
        ...faults,
        `${arm.id}: the fill ${fill.toFixed(4)} lies at press ${n}, not the third or later (the witness)`,
      ],
      detail,
    };
  const travels = travelsOf(home);
  await motionOn(ctx, async () => {
    for (let i = 1; i < n; i++) await pressGlass(ctx, arm.lens, `SW2 ${arm.id} ${i}`);
    faults.push(...homeFaults(await still(ctx, `SW2 ${arm.id} before`), `${arm.id} after press ${n - 1}`));
    await pressGlass(ctx, arm.lens, `SW2 ${arm.id} ${n}`);
    faults.push(...awayFaults(await still(ctx, `SW2 ${arm.id} fill`), travels, `${arm.id} after press ${n}`));
  });
  return { faults, detail };
}

export async function sw2ThirdPress(ctx: SuiteContext): Promise<void> {
  const arms: { faults: string[]; detail: string }[] = [];
  for (const arm of ARMS) arms.push(await thirdPress(ctx, arm));
  const faults = arms.flatMap((a) => a.faults);
  ctx.check(
    "SW2 where the chart fills the screen only at the Glass's third press or later, on the Print Room at 1024x768, the head cluster and the chart folio stand home after the press before the one that fills and at their thin lines after it: nothing moves until the press that fills (Alex, 2026-10-23, Issue #997 ruling 5)",
    faults.length === 0,
    arms.map((a) => a.detail).join("; ") + (faults.length ? `; ${faults.slice(0, 6).join("; ")}` : ""),
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
  const nPlain = fillPressOf(a);
  const nRoom = fillPressOf(b);
  if (!(nRoom > nPlain))
    faults.push(
      `the plain rule's fill ${a.toFixed(4)} and the room's ${b.toFixed(4)} lie at presses ${nPlain} and ${nRoom}, so no press stands past the plain rule's fill and short of the room's (the witness)`,
    );
  const travels = travelsOf(home);
  await motionOn(ctx, async () => {
    for (let i = 1; i < nRoom; i++) await pressGlass(ctx, room.lens, `SW3 press ${i}`);
    const before = await still(ctx, "SW3 before");
    faults.push(...homeFaults(before, `after press ${nRoom - 1}, past the plain rule's fill`));
    if (reaches(before))
      faults.push(
        `the chart already reaches the left, the top and the foot at the press before the room's fill: ${JSON.stringify(before.face)}`,
      );
    await size(ctx, 1024, 767);
    await rest(ctx, 1024, 767, "SW3 shorter");
    await size(ctx, 1024, 768);
    await rest(ctx, 1024, 768, "SW3 back");
    faults.push(...homeFaults(await still(ctx, "SW3 resized"), "after a resize made there"));
    await pressGlass(ctx, room.lens, `SW3 press ${nRoom}`);
    const at = await still(ctx, "SW3 fill");
    faults.push(...awayFaults(at, travels, `after press ${nRoom}, the room's fill`));
    if (!reaches(at))
      faults.push(
        `the chart does not reach the left, the top and the foot at the room's fill: ${JSON.stringify(at.face)}`,
      );
  });
  ctx.check(
    "SW3 on the Seed of the Day at 1024x768, whose Glass magnifies about the whole stage, the head cluster and the chart folio stand home through the press before the one where the room's own fill lies, a press already past the plain rule's fill, where the chart does not yet reach the left, the top and the foot, and through a resize made there, and at their thin lines at the room's own fill press, where it reaches all three (Alex, 2026-10-23, Issue #997 rulings 4 and 5)",
    faults.length === 0,
    `plain fill ${a.toFixed(4)} press ${nPlain}, the room's ${b.toFixed(4)} press ${nRoom}` +
      (faults.length ? `; ${faults.join("; ")}` : ""),
  );
}
