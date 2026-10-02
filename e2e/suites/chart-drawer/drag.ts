import type { DragKit } from "./kit.ts";
import { CARRY, DURATION, atRest, sameCam } from "./reads.ts";

export async function cd44CarryFiles({ evaluate, check, settle, release, bandPoint, carry, restSeeing, shutAndFold }: DragKit): Promise<void> {
  // Off first: CD3 left the ear's own survey on the table, and a carry of it would be refused as already.
  await evaluate(`document.querySelector("#cuttings .off").click()`);
  await shutAndFold("chart-drawer-carry-folded");
  const before = await settle(CARRY, atRest, "chart-drawer-carry-rest");
  const target = await bandPoint();
  const { mid, to } = await carry(target);
  await release(to.x, to.y);
  const landed = await restSeeing("chart-drawer-carried", "landingRuns");
  const duration = await evaluate(DURATION);
  check(
    "CD44 a REAL mouse carry from the dog-ear into the drawer's band files the survey: mid-carry the ghost is the thumbnail as a fixed blob img at pointer-events none, seated on body and never inside #map, hanging from the corner the reader took it by (its inline translate puts the pointer GRIP_INSET_PX inside its top-right corner, read from the seat and not from the rect, which is a rotated box's bounding box), the body carries the drag state with the cursor grabbing and nothing selected, and the drawer, SHUT at the press, opened with the drop cue as the sheet entered the band (D4); on release the cutting lands with its settle seen running and then retired, the address carries the table, the line is said, the ghost and the drag state are gone, and the camera is at rest where it was, which is the pan the ear's stopped mousedown keeps from d3 (Issue #523, ruled 2026-09-21)",
    before.cuttings === 0 && before.folded && !before.open &&
      !!mid.ghost && mid.ghost.tag === "IMG" && mid.ghost.src === "blob:" && mid.ghost.pos === "fixed" && mid.ghost.pe === "none" && !mid.ghost.inMap &&
      Math.abs(parseFloat(mid.ghost.translate) + mid.ghost.w - 10 - to.x) <= 1 && Math.abs(parseFloat(mid.ghost.translate.split(" ")[1]!) + 10 - to.y) <= 1 &&
      mid.ghost.rotate === "-6deg" && mid.ghost.z === "30" &&
      mid.drag && mid.cursor === "grabbing" && mid.sel === 0 && mid.open && mid.receiving &&
      landed.cuttings === 1 && landed.saw && !landed.landing && !landed.ghost && !landed.drag && !landed.receiving &&
      typeof landed.hashTable === "string" && landed.hashTable.startsWith("k-s.seed-42") && /lies on the table/.test(landed.status) &&
      sameCam(before.cam, landed.cam) && landed.folded && parseFloat(duration!) === 0.34,
    JSON.stringify({ before: { cuttings: before.cuttings, folded: before.folded, open: before.open, cam: before.cam }, mid, to, landed: { cuttings: landed.cuttings, saw: landed.saw, landing: landed.landing, ghost: landed.ghost, drag: landed.drag, hashTable: landed.hashTable, status: landed.status, cam: landed.cam, folded: landed.folded }, duration }),
  );
}

export async function cd45SnapBack({ evaluate, check, settle, clickAt, press, moveTo, release, carry, shutAndFold }: DragKit): Promise<void> {
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
  check(
    "CD45 a carry released over the chart files nothing: the ghost rode the pointer with the drawer still SHUT (D4: it opens only as the sheet enters the band), then snapped back and is gone, the table is bare and the address carries no key, the drawer is back as it was and the camera is at rest where it was; a jiggle released back on the ear files nothing either, since the click that follows a drag is swallowed; and a plain click straight after still files, so the swallow is scoped to its own gesture and never eats the next honest click (Issue #523, ruled 2026-09-21)",
    before.cuttings === 0 && !before.open && before.folded &&
      !!mid.ghost && mid.drag && !mid.open && !mid.receiving &&
      snapped.cuttings === 0 && !snapped.ghost && !snapped.drag && !snapped.open && snapped.hashTable === null && sameCam(before.cam, snapped.cam) &&
      jiggled.cuttings === 0 && !jiggled.ghost && !jiggled.open && sameCam(before.cam, jiggled.cam) &&
      clicked.cuttings === 1 && clicked.open,
    JSON.stringify({ before: { cuttings: before.cuttings, open: before.open, folded: before.folded, cam: before.cam }, mid: { ghost: !!mid.ghost, drag: mid.drag, open: mid.open, receiving: mid.receiving }, snapped: { cuttings: snapped.cuttings, ghost: snapped.ghost, drag: snapped.drag, open: snapped.open, hashTable: snapped.hashTable, cam: snapped.cam }, jiggled: { cuttings: jiggled.cuttings, ghost: jiggled.ghost, open: jiggled.open, cam: jiggled.cam }, clicked: { cuttings: clicked.cuttings, open: clicked.open } }),
  );
}

export async function cd46ReducedCarry({ evaluate, send, check, settle, release, bandPoint, carry }: DragKit): Promise<void> {
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  const reduced = await evaluate<boolean>(`matchMedia("(prefers-reduced-motion: reduce)").matches`);
  const target = await bandPoint();
  const { to } = await carry(target);
  await release(to.x, to.y);
  const landed = await settle(CARRY, (d, last) => d.cuttings === 1 && atRest(d, last), "chart-drawer-reduced-landed");
  const duration = await evaluate(DURATION);
  await send("Emulation.setEmulatedMedia", { features: [] });
  check(
    "CD46 under reduced motion a carry still files and the settle collapses to an instant place: the cutting lands, its class retires, and the settle's declared duration reads the blanket's near-zero against CD44's 0.34s in the same run, which is the same-run control that makes the emulation a measurement (Issue #523; motion.css's blanket)",
    reduced === true && landed.cuttings === 1 && !landed.landing && !landed.ghost && parseFloat(duration!) < 0.01,
    JSON.stringify({ reduced, cuttings: landed.cuttings, landing: landed.landing, ghost: landed.ghost, duration }),
  );
}

export async function cd47FullCarry({ check, settle, release, bandPoint, carry, restSeeing }: DragKit): Promise<void> {
  // The drawer is open and the Broadside folded from CD7's refusal, so the fold is constant across the carry.
  const before = await settle(CARRY, atRest, "chart-drawer-cap-rest");
  const target = await bandPoint();
  const { mid, to } = await carry(target);
  await release(to.x, to.y);
  const refusedCarry = await restSeeing("chart-drawer-cap-carried", "joltRuns");
  check(
    "CD47 a carry dropped on a FULL table is refused the way a click is: the six stay six, the cap's line is said, the sheets on the table jolt (seen running, then retired; D3 ruled 2026-09-21) while the drawer itself stays put, the ghost snaps back and is gone rather than stranded on the refusal, and the camera is at rest where it was (Issue #523)",
    before.cuttings === 6 && before.open && before.folded && !!mid.ghost && mid.receiving &&
      refusedCarry.cuttings === 6 && refusedCarry.status === "the table is full: six sheets lie on it" && refusedCarry.saw && !refusedCarry.jolt &&
      !refusedCarry.ghost && !refusedCarry.drag && refusedCarry.open && sameCam(before.cam, refusedCarry.cam),
    JSON.stringify({ before: { cuttings: before.cuttings, open: before.open, folded: before.folded, cam: before.cam }, mid: { ghost: !!mid.ghost, receiving: mid.receiving }, after: { cuttings: refusedCarry.cuttings, status: refusedCarry.status, saw: refusedCarry.saw, jolt: refusedCarry.jolt, ghost: refusedCarry.ghost, drag: refusedCarry.drag, open: refusedCarry.open, cam: refusedCarry.cam } }),
  );
}
