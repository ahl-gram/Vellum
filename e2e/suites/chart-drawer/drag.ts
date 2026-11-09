import type { DragKit } from "./kit.ts";
import { CARRY, DURATION, atRest, sameCam } from "./reads.ts";
import type { Carry } from "./reads.ts";

function cd45FilesNothing(
  check: DragKit["check"],
  before: Carry,
  mid: Carry,
  snapped: Carry,
  jiggled: Carry,
  clicked: Carry,
): void {
  check(
    "CD45 a carry released over the chart files nothing: the ghost rode the pointer with the drawer still SHUT (D4: it opens only as the sheet enters the band), then snapped back and is gone, the table is bare and the address carries no key, the drawer is back as it was and the camera is at rest where it was; a jiggle released back on the ear files nothing either, since the click that follows a drag is swallowed; and a plain click straight after still files, so the swallow is scoped to its own gesture and never eats the next honest click (Issue #523, ruled 2026-09-21)",
    before.cuttings === 0 &&
      !before.open &&
      before.folded &&
      !!mid.ghost &&
      mid.drag &&
      !mid.open &&
      !mid.receiving &&
      snapped.cuttings === 0 &&
      !snapped.ghost &&
      !snapped.drag &&
      !snapped.open &&
      snapped.hashTable === null &&
      sameCam(before.cam, snapped.cam) &&
      jiggled.cuttings === 0 &&
      !jiggled.ghost &&
      !jiggled.open &&
      sameCam(before.cam, jiggled.cam) &&
      clicked.cuttings === 1 &&
      clicked.open,
    JSON.stringify({
      before: { cuttings: before.cuttings, open: before.open, folded: before.folded, cam: before.cam },
      mid: { ghost: !!mid.ghost, drag: mid.drag, open: mid.open, receiving: mid.receiving },
      snapped: {
        cuttings: snapped.cuttings,
        ghost: snapped.ghost,
        drag: snapped.drag,
        open: snapped.open,
        hashTable: snapped.hashTable,
        cam: snapped.cam,
      },
      jiggled: { cuttings: jiggled.cuttings, ghost: jiggled.ghost, open: jiggled.open, cam: jiggled.cam },
      clicked: { cuttings: clicked.cuttings, open: clicked.open },
    }),
  );
}

export async function cd45SnapBack({
  evaluate,
  check,
  settle,
  clickAt,
  press,
  moveTo,
  release,
  carry,
  shutAndFold,
}: DragKit): Promise<void> {
  await evaluate(`document.querySelector("#cuttings .off").click()`);
  await shutAndFold("chart-drawer-snap-folded");
  const before = await settle(CARRY, atRest, "chart-drawer-carry-shut-rest");
  const { from, mid, to } = await carry({ x: 640, y: 300 });
  await release(to.x, to.y);
  const snapped = await settle(CARRY, atRest, "chart-drawer-snapped");
  await press(from.x, from.y);
  await moveTo(from, { x: from.x - 10, y: from.y + 10 }, 4);
  await moveTo({ x: from.x - 10, y: from.y + 10 }, from, 4);
  await release(from.x, from.y);
  const jiggled = await settle(CARRY, atRest, "chart-drawer-jiggled");
  await clickAt(from.x, from.y);
  const clicked = await settle(CARRY, (d, last) => d.cuttings === 1 && atRest(d, last), "chart-drawer-plain-click");
  await evaluate(`document.querySelector("#cuttings .off").click()`);
  await shutAndFold("chart-drawer-after-snap-folded");
  cd45FilesNothing(check, before, mid, snapped, jiggled, clicked);
}

export async function cd46ReducedCarry({
  evaluate,
  send,
  check,
  settle,
  release,
  bandPoint,
  carry,
}: DragKit): Promise<void> {
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  const { reduced, landed, duration } = await (async () => {
    const matches = await evaluate<boolean>(`matchMedia("(prefers-reduced-motion: reduce)").matches`);
    const { to } = await carry(await bandPoint());
    await release(to.x, to.y);
    const rest = await settle(CARRY, (d, last) => d.cuttings === 1 && atRest(d, last), "chart-drawer-reduced-landed");
    return { reduced: matches, landed: rest, duration: await evaluate(DURATION) };
  })().finally(() => send("Emulation.setEmulatedMedia", { features: [] }));
  const full = await evaluate(DURATION);
  check(
    "CD46 under reduced motion a carry still files and the settle collapses to an instant place: the cutting lands, its class retires, and the settle's declared duration reads the blanket's near-zero against the 0.34s the same cutting reads once the emulation is cleared, which is the same-run control that makes the emulation a measurement (Issue #523; motion.css's blanket)",
    reduced === true &&
      landed.cuttings === 1 &&
      !landed.landing &&
      !landed.ghost &&
      parseFloat(duration!) < 0.01 &&
      parseFloat(full!) === 0.34,
    JSON.stringify({
      reduced,
      cuttings: landed.cuttings,
      landing: landed.landing,
      ghost: landed.ghost,
      duration,
      full,
    }),
  );
}
